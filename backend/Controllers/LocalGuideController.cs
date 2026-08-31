using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/local-guide")]
    public class LocalGuideController : ControllerBase
    {
        private readonly ILogger<LocalGuideController> _logger;
        private readonly WanderSyncDbContext _context;

        private const int MinGuideAge = 16;
        private const int IdNumberLength = 13;

        public LocalGuideController(ILogger<LocalGuideController> logger, WanderSyncDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        /// <summary>
        /// A South African ID encodes the date of birth in its first six digits (YYMMDD).
        /// Returns null when those digits aren't a real calendar date.
        /// </summary>
        private static DateTime? ParseIdDateOfBirth(string digits, DateTime today)
        {
            if (digits.Length != IdNumberLength) return null;
            if (!int.TryParse(digits.Substring(0, 2), out var yy)) return null;
            if (!int.TryParse(digits.Substring(2, 2), out var month)) return null;
            if (!int.TryParse(digits.Substring(4, 2), out var day)) return null;
            if (month < 1 || month > 12 || day < 1) return null;

            // Two digit years are ambiguous: resolve them into the most recent past century.
            var currentTwoDigitYear = today.Year % 100;
            var year = yy > currentTwoDigitYear ? 1900 + yy : 2000 + yy;

            if (day > DateTime.DaysInMonth(year, month)) return null;
            return new DateTime(year, month, day);
        }

        private static int CalculateAge(DateTime dateOfBirth, DateTime today)
        {
            var age = today.Year - dateOfBirth.Year;
            if (today.Month < dateOfBirth.Month ||
                (today.Month == dateOfBirth.Month && today.Day < dateOfBirth.Day))
            {
                age--;
            }
            return age;
        }

        /// <summary>
        /// Returns null when the ID number is acceptable, otherwise the reason it isn't.
        /// Mirrors the client-side check in src/utils/saId.js, which is bypassable.
        /// </summary>
        private static string? DescribeInvalidIdNumber(string? idNumber, DateTime today)
        {
            var digits = (idNumber ?? string.Empty).Trim();

            if (digits.Length == 0)
                return "ID number is required.";
            if (!digits.All(char.IsDigit))
                return "ID number must contain digits only.";
            if (digits.Length != IdNumberLength)
                return $"ID number must be exactly {IdNumberLength} digits.";

            var dateOfBirth = ParseIdDateOfBirth(digits, today);
            if (dateOfBirth == null)
                return "That is not a valid ID number. The first 6 digits must be a real date of birth (YYMMDD).";

            if (CalculateAge(dateOfBirth.Value, today) < MinGuideAge)
                return $"You must be older than {MinGuideAge} to become a Local Guide.";

            return null;
        }

        /// <summary>
        /// POST /api/local-guide/apply
        /// Submits a local guide application.
        /// </summary>
        [HttpPost("apply")]
        public async Task<IActionResult> Apply([FromBody] GuideApplicationRequest request)
        {
            _logger.LogInformation("Local guide application received for userId={UserId}", request.UserID);

            if (request.UserID <= 0)
                return BadRequest(new { message = "Valid userID is required." });

            // ID number must be exactly 13 digits and belong to someone old enough to guide.
            var idProblem = DescribeInvalidIdNumber(request.IDno, DateTime.Today);
            if (idProblem != null)
            {
                _logger.LogWarning("Local guide application rejected for userId={UserId}: {Reason}", request.UserID, idProblem);
                return BadRequest(new { message = idProblem });
            }

            // Check user exists
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == request.UserID);
            if (user == null)
                return NotFound(new { message = "User not found." });

            if (string.Equals(user.Role, "Guide", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "You are already a verified Local Guide." });

            // Check for duplicate application
            var existing = await _context.LocalGuideApplications
                .FirstOrDefaultAsync(a => a.UserID == request.UserID);
            if (existing != null)
                return Conflict(new { message = "You already have a pending application." });

            var application = new LocalGuideApplication
            {
                // Stored as a number because the column is a bigint; a leading zero is
                // restored on read (see AdminController.GetGuideApplications).
                IDno = long.Parse(request.IDno!.Trim()),
                Reason = request.Reason ?? string.Empty,
                Location = request.Location ?? string.Empty,
                Bio = string.IsNullOrEmpty(request.Bio) ? string.Empty : request.Bio.Length > 250 ? request.Bio.Substring(0, 250) : request.Bio,
                UserID = request.UserID
            };

            try
            {
                _context.LocalGuideApplications.Add(application);
                await _context.SaveChangesAsync();

                // Update user role to PendingGuide
                user.Role = "PendingGuide";
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Application submitted successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving local guide application.");
                return StatusCode(500, new { message = "Failed to save application. Please try again." });
            }
        }

        /// <summary>
        /// GET /api/local-guide/application/status/{userId}
        /// Reports the account's current role and whether an application is still awaiting review.
        /// Lets the client refresh a role that changed after login (e.g. an admin approval).
        /// </summary>
        [HttpGet("application/status/{userId:int}")]
        public async Task<IActionResult> GetApplicationStatus(int userId)
        {
            try
            {
                var user = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.UserID == userId);

                if (user == null)
                    return NotFound(new { message = "User not found." });

                var hasPendingApplication = await _context.LocalGuideApplications
                    .AnyAsync(a => a.UserID == userId);

                return Ok(new { role = user.Role, hasPendingApplication });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching application status for userId={UserId}", userId);
                return StatusCode(500, new { message = "Failed to load application status." });
            }
        }

        /// <summary>
        /// DELETE /api/local-guide/application/{userId}
        /// Withdraws an application that an admin hasn't approved yet and returns the
        /// account to Explorer. Approved guides cannot use this.
        /// </summary>
        [HttpDelete("application/{userId:int}")]
        public async Task<IActionResult> WithdrawApplication(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // An approval deletes the application row and sets the role to Guide, so this
            // is what "already validated by the admin" looks like.
            if (string.Equals(user.Role, "Guide", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Your application has already been approved, so it can no longer be cancelled." });

            var application = await _context.LocalGuideApplications
                .FirstOrDefaultAsync(a => a.UserID == userId);

            if (application == null)
                return NotFound(new { message = "You do not have an application awaiting review." });

            try
            {
                _context.LocalGuideApplications.Remove(application);
                user.Role = "Explorer";
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Guide application withdrawn for userId={UserId}", userId);
                return Ok(new { message = "Application cancelled.", role = user.Role });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error withdrawing guide application for userId={UserId}", userId);
                return StatusCode(500, new { message = "Failed to cancel your application. Please try again." });
            }
        }

        /// <summary>
        /// GET /api/local-guide/list
        /// Returns all approved local guides with their profile information.
        /// </summary>
        [HttpGet("list")]
        public async Task<IActionResult> GetAllGuides()
        {
            try
            {
                var guides = await _context.Users
                    .Where(u => u.Role == "Guide")
                    .Join(
                        _context.Profiles,
                        user => user.UserID,
                        profile => profile.UserID,
                        (user, profile) => new
                        {
                            guideId = user.UserID,
                            firstName = user.FirstName,
                            lastName = user.LastName,
                            email = user.Email,
                            profilePictureLink = profile.ProfilePictureLink,
                            location = profile.Location,
                            description = profile.Description,
                            job = profile.Job,
                            interests = profile.Interests
                        }
                    )
                    .ToListAsync();

                var guidesWithoutProfiles = await _context.Users
                    .Where(u => u.Role == "Guide" && !_context.Profiles.Any(p => p.UserID == u.UserID))
                    .Select(u => new
                    {
                        guideId = u.UserID,
                        firstName = u.FirstName,
                        lastName = u.LastName,
                        email = u.Email,
                        profilePictureLink = (string?)null,
                        location = (string?)null,
                        description = (string?)null,
                        job = (string?)null,
                        interests = (string?)null
                    })
                    .ToListAsync();

                var allGuides = guides.Concat(guidesWithoutProfiles).ToList();
                return Ok(allGuides);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching local guides list.");
                return StatusCode(500, new { message = "Failed to retrieve guides." });
            }
        }

        /// <summary>
        /// GET /api/local-guide/search?query=...
        /// Searches for local guides by name, location, or interests.
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> SearchGuides([FromQuery] string? query)
        {
            try
            {
                var guidesQuery = _context.Users
                    .Where(u => u.Role == "Guide")
                    .Join(
                        _context.Profiles,
                        user => user.UserID,
                        profile => profile.UserID,
                        (user, profile) => new
                        {
                            user,
                            profile
                        }
                    );

                if (!string.IsNullOrWhiteSpace(query))
                {
                    var searchTerm = query.Trim().ToLower();
                    guidesQuery = guidesQuery.Where(g =>
                        (g.user.FirstName != null && g.user.FirstName.ToLower().Contains(searchTerm)) ||
                        (g.user.LastName != null && g.user.LastName.ToLower().Contains(searchTerm)) ||
                        (g.profile.Location != null && g.profile.Location.ToLower().Contains(searchTerm)) ||
                        (g.profile.Interests != null && g.profile.Interests.ToLower().Contains(searchTerm)) ||
                        (g.profile.Description != null && g.profile.Description.ToLower().Contains(searchTerm))
                    );
                }

                var results = await guidesQuery
                    .Select(g => new
                    {
                        guideId = g.user.UserID,
                        firstName = g.user.FirstName,
                        lastName = g.user.LastName,
                        email = g.user.Email,
                        profilePictureLink = g.profile.ProfilePictureLink,
                        location = g.profile.Location,
                        description = g.profile.Description,
                        job = g.profile.Job,
                        interests = g.profile.Interests
                    })
                    .ToListAsync();

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching local guides with query={Query}", query);
                return StatusCode(500, new { message = "Failed to search guides." });
            }
        }

        /// <summary>
        /// GET /api/local-guide/{guideId}
        /// Returns a single guide's full profile details along with their tours.
        /// </summary>
        [HttpGet("{guideId:int}")]
        public async Task<IActionResult> GetGuideDetails(int guideId)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == guideId && u.Role == "Guide");
                if (user == null)
                    return NotFound(new { message = "Guide not found." });

                var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserID == guideId);

                // Only the guide's published tours: private one-on-one rows and custom
                // itineraries belong to a single explorer and aren't open for booking.
                var tours = await _context.Tours
                    .Where(t => t.GuideId == guideId && !TourTypes.Private.Contains(t.Type))
                    .Select(t => new
                    {
                        tourId = t.TourId,
                        title = t.Title,
                        type = t.Type,
                        description = t.Description,
                        date = t.Date,
                        maxPeople = t.MaxPeople
                    })
                    .ToListAsync();

                // Get average rating for this guide
                var ratings = await _context.GuideRatings
                    .Where(r => r.GuideId == guideId)
                    .ToListAsync();

                var averageRating = ratings.Any() ? Math.Round(ratings.Average(r => r.Score), 1) : 0;
                var totalRatings = ratings.Count;

                var guideDetails = new
                {
                    guideId = user.UserID,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    profilePictureLink = profile?.ProfilePictureLink,
                    location = profile?.Location,
                    description = profile?.Description,
                    job = profile?.Job,
                    interests = profile?.Interests,
                    tours = tours,
                    averageRating = averageRating,
                    totalRatings = totalRatings
                };

                return Ok(guideDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching guide details for guideId={GuideId}", guideId);
                return StatusCode(500, new { message = "Failed to retrieve guide details." });
            }
        }

        /// <summary>
        /// POST /api/local-guide/{guideId}/rate
        /// Submits a rating for a local guide. User must have booked a tour with the guide.
        /// </summary>
        [HttpPost("{guideId:int}/rate")]
        public async Task<IActionResult> RateGuide(int guideId, [FromBody] RateGuideRequest request)
        {
            if (request.UserID <= 0)
                return BadRequest(new { message = "Valid userID is required." });

            if (request.Score < 1 || request.Score > 5)
                return BadRequest(new { message = "Score must be between 1 and 5." });

            // Verify guide exists
            var guide = await _context.Users.FirstOrDefaultAsync(u => u.UserID == guideId && u.Role == "Guide");
            if (guide == null)
                return NotFound(new { message = "Guide not found." });

            var reviewer = await _context.Users.FirstOrDefaultAsync(u => u.UserID == request.UserID);
            if (reviewer == null)
                return NotFound(new { message = "Reviewer not found." });

            // Verify user has a confirmed booking with this guide that occurred more than 30 minutes ago
            var thirtyMinsAgo = DateTime.UtcNow.AddMinutes(-30);
            var hasBooking = await _context.Bookings
                .Join(
                    _context.Tours,
                    b => b.tourID,
                    t => t.TourId,
                    (b, t) => new { b, t }
                )
                .AnyAsync(bt => bt.b.userID == request.UserID 
                             && bt.t.GuideId == guideId 
                             && (bt.b.status == "Confirmed" || bt.b.status == "Accepted")
                             && bt.t.Date <= thirtyMinsAgo);

            if (!hasBooking)
                return BadRequest(new { message = "You can only review a guide if you have a confirmed booking that occurred more than 30 minutes ago." });

            // Check if user already rated this guide
            var existingRating = await _context.GuideRatings
                .FirstOrDefaultAsync(r => r.UserId == request.UserID && r.GuideId == guideId);

            try
            {
                if (existingRating != null)
                {
                    // Update existing rating
                    existingRating.Score = request.Score;
                    existingRating.Comment = request.Comment ?? string.Empty;
                    existingRating.CreatedAt = DateTime.UtcNow;
                    existingRating.GuideName = guide.FirstName;
                    existingRating.GuideSurname = guide.LastName;
                    existingRating.ReviewerName = reviewer.FirstName;
                    existingRating.ReviewerSurname = reviewer.LastName;
                    _context.GuideRatings.Update(existingRating);
                }
                else
                {
                    // Create new rating
                    var rating = new GuideRating
                    {
                        UserId = request.UserID,
                        GuideId = guideId,
                        Score = request.Score,
                        Comment = request.Comment ?? string.Empty,
                        CreatedAt = DateTime.UtcNow,
                        GuideName = guide.FirstName,
                        GuideSurname = guide.LastName,
                        ReviewerName = reviewer.FirstName,
                        ReviewerSurname = reviewer.LastName
                    };
                    _context.GuideRatings.Add(rating);
                }

                await _context.SaveChangesAsync();

                // Calculate new average
                var newAverage = await _context.GuideRatings
                    .Where(r => r.GuideId == guideId)
                    .AverageAsync(r => r.Score);

                return Ok(new
                {
                    message = "Rating submitted successfully!",
                    averageRating = Math.Round(newAverage, 1)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving rating for guideId={GuideId}", guideId);
                return StatusCode(500, new { message = $"Failed to save rating: {ex.InnerException?.Message ?? ex.Message}" });
            }
        }

        /// <summary>
        /// GET /api/local-guide/{guideId}/ratings
        /// Returns all ratings for a specific guide.
        /// </summary>
        [HttpGet("{guideId:int}/ratings")]
        public async Task<IActionResult> GetGuideRatings(int guideId)
        {
            try
            {
                var ratings = await _context.GuideRatings
                    .Where(r => r.GuideId == guideId)
                    .Join(
                        _context.Users,
                        rating => rating.UserId,
                        user => user.UserID,
                        (rating, user) => new
                        {
                            ratingId = rating.RatingId,
                            userId = rating.UserId,
                            userName = user.FirstName + " " + user.LastName,
                            score = rating.Score,
                            comment = rating.Comment,
                            createdAt = rating.CreatedAt
                        }
                    )
                    .OrderByDescending(r => r.createdAt)
                    .ToListAsync();

                var average = ratings.Any() ? Math.Round(ratings.Average(r => (double)r.score), 1) : 0;

                return Ok(new
                {
                    averageRating = average,
                    totalRatings = ratings.Count,
                    ratings = ratings
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching ratings for guideId={GuideId}", guideId);
                return StatusCode(500, new { message = "Failed to retrieve ratings." });
            }
        }

        /// <summary>
        /// GET /api/local-guide/{guideId}/reviews
        /// Returns all reviews from the Reviews table for a specific guide.
        /// </summary>
        [HttpGet("{guideId:int}/reviews")]
        public async Task<IActionResult> GetGuideReviews(int guideId)
        {
            try
            {
                var reviews = await _context.GuideRatings
                    .Where(r => r.GuideId == guideId)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching reviews for guideId={GuideId}", guideId);
                return StatusCode(500, new { message = "Failed to retrieve reviews." });
            }
        }

        /// <summary>
        /// GET /api/local-guide/by-location?location=...
        /// Returns guides filtered by location (case-insensitive partial match).
        /// </summary>
        [HttpGet("by-location")]
        public async Task<IActionResult> GetGuidesByLocation([FromQuery] string? location)
        {
            try
            {
                var guidesQuery = _context.Users
                    .Where(u => u.Role == "Guide")
                    .Join(
                        _context.Profiles,
                        user => user.UserID,
                        profile => profile.UserID,
                        (user, profile) => new { user, profile }
                    );

                if (!string.IsNullOrWhiteSpace(location))
                {
                    var loc = location.Trim().ToLower();
                    guidesQuery = guidesQuery.Where(g =>
                        g.profile.Location != null && g.profile.Location.ToLower().Contains(loc));
                }

                var results = await guidesQuery
                    .Select(g => new
                    {
                        guideId = g.user.UserID,
                        firstName = g.user.FirstName,
                        lastName = g.user.LastName,
                        email = g.user.Email,
                        profilePictureLink = g.profile.ProfilePictureLink,
                        location = g.profile.Location,
                        description = g.profile.Description,
                        job = g.profile.Job,
                        interests = g.profile.Interests
                    })
                    .ToListAsync();

                // Add average rating for each guide
                var guideIds = results.Select(g => g.guideId).ToList();
                var allRatings = await _context.GuideRatings
                    .Where(r => guideIds.Contains(r.GuideId))
                    .GroupBy(r => r.GuideId)
                    .Select(g => new
                    {
                        guideId = g.Key,
                        averageRating = Math.Round(g.Average(r => (double)r.Score), 1),
                        totalRatings = g.Count()
                    })
                    .ToListAsync();

                var guidesWithRatings = results.Select(g =>
                {
                    var rating = allRatings.FirstOrDefault(r => r.guideId == g.guideId);
                    return new
                    {
                        g.guideId,
                        g.firstName,
                        g.lastName,
                        g.email,
                        g.profilePictureLink,
                        g.location,
                        g.description,
                        g.job,
                        g.interests,
                        averageRating = rating?.averageRating ?? 0,
                        totalRatings = rating?.totalRatings ?? 0
                    };
                }).ToList();

                return Ok(guidesWithRatings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching guides by location={Location}", location);
                return StatusCode(500, new { message = "Failed to retrieve guides." });
            }
        }

        /// <summary>
        /// GET /api/local-guide/{guideId}/assigned-tourists
        /// Returns a list of tourists that have an accepted match with this guide.
        /// </summary>
        [HttpGet("{guideId:int}/assigned-tourists")]
        public async Task<IActionResult> GetAssignedTourists(int guideId)
        {
            try
            {
                var matches = await _context.Matches
                    .Where(m => (m.RequesterID == guideId || m.ReceiverID == guideId) && m.Status == "accepted")
                    .ToListAsync();

                var touristIds = matches
                    .Select(m => m.RequesterID == guideId ? m.ReceiverID : m.RequesterID)
                    .Distinct()
                    .ToList();

                var tourists = await _context.Users
                    .Where(u => touristIds.Contains(u.UserID) && u.Role != "Guide")
                    .Select(u => new
                    {
                        userId = u.UserID,
                        firstName = u.FirstName,
                        lastName = u.LastName,
                        email = u.Email
                    })
                    .ToListAsync();

                return Ok(tourists);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching assigned tourists for guideId={GuideId}", guideId);
                return StatusCode(500, new { message = "Failed to retrieve assigned tourists." });
            }
        }

        /// <summary>
        /// GET /api/local-guide/{guideId}/itinerary/{touristId}
        /// Gets the active itinerary for the assigned tourist, or creates one if it doesn't exist.
        /// </summary>
        [HttpGet("{guideId:int}/itinerary/{touristId:int}")]
        public async Task<IActionResult> GetItinerary(int guideId, int touristId)
        {
            try
            {
                // Verify match exists
                var isMatched = await _context.Matches
                    .AnyAsync(m => (m.RequesterID == guideId && m.ReceiverID == touristId || m.RequesterID == touristId && m.ReceiverID == guideId) && m.Status == "accepted");

                if (!isMatched)
                    return BadRequest(new { message = "You are not matched with this tourist." });

                // Find a tour representing the itinerary (Type = "CustomItinerary")
                var booking = await _context.Bookings
                    .Join(_context.Tours, b => b.tourID, t => t.TourId, (b, t) => new { b, t })
                    .Where(bt => bt.b.userID == touristId && bt.t.GuideId == guideId && bt.t.Type == "CustomItinerary")
                    .FirstOrDefaultAsync();

                if (booking == null)
                {
                    // Create an empty itinerary
                    var newTour = new Tour
                    {
                        GuideId = guideId,
                        Title = "Custom Trip Itinerary",
                        Type = "CustomItinerary",
                        Description = "[]", // Empty JSON array for timeline
                        Date = DateTime.UtcNow.Date,
                        MaxPeople = 1,
                        Price = 0,
                        Location = "Various"
                    };

                    _context.Tours.Add(newTour);
                    await _context.SaveChangesAsync();

                    var newBooking = new Booking
                    {
                        userID = touristId,
                        tourID = newTour.TourId,
                        numberOfGuests = 1,
                        bookingType = "Itinerary",
                        status = "Confirmed",
                        bookingDate = DateTime.UtcNow.Date,
                        timeOfBooking = DateTime.UtcNow.ToString("HH:mm")
                    };

                    _context.Bookings.Add(newBooking);
                    await _context.SaveChangesAsync();

                    return Ok(new
                    {
                        tourId = newTour.TourId,
                        timeline = "[]"
                    });
                }

                // Return existing timeline
                return Ok(new
                {
                    tourId = booking.t.TourId,
                    timeline = string.IsNullOrEmpty(booking.t.Description) ? "[]" : booking.t.Description
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching itinerary for guideId={GuideId}, touristId={TouristId}", guideId, touristId);
                return StatusCode(500, new { message = "Failed to retrieve itinerary." });
            }
        }

        /// <summary>
        /// PUT /api/local-guide/itinerary/{tourId:int}
        /// Updates the itinerary timeline and notifies the tourist.
        /// </summary>
        [HttpPut("itinerary/{tourId:int}")]
        public async Task<IActionResult> UpdateItinerary(int tourId, [FromBody] UpdateItineraryRequest request)
        {
            try
            {
                var tour = await _context.Tours.FirstOrDefaultAsync(t => t.TourId == tourId && t.Type == "CustomItinerary");
                if (tour == null)
                    return NotFound(new { message = "Itinerary not found." });

                tour.Description = request.TimelineJson ?? "[]";
                _context.Tours.Update(tour);

                // Notify tourist
                var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.tourID == tourId);
                if (booking != null)
                {
                    var notification = new Notification
                    {
                        UserID = booking.userID,
                        Message = "Your local guide has updated your itinerary schedule. Please check the dashboard for changes.",
                        IsRead = false,
                        Type = "ItineraryUpdate",
                        RelatedEntityID = tourId,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Notifications.Add(notification);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Itinerary updated successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating itinerary tourId={TourId}", tourId);
                return StatusCode(500, new { message = "Failed to update itinerary." });
            }
        }

        /// <summary>
        /// GET /api/local-guide/{guideId}/stats
        /// Returns stats for the guide (confirmed bookings this month and average rating).
        /// </summary>
        [HttpGet("{guideId}/stats")]
        public async Task<IActionResult> GetGuideStats(int guideId)
        {
            try
            {
                // 1. Confirmed bookings this month
                var now = DateTime.UtcNow;
                var startOfMonth = new DateTime(now.Year, now.Month, 1);
                
                var bookingsCount = await _context.Bookings
                    .Join(_context.Tours,
                        b => b.tourID,
                        t => t.TourId,
                        (b, t) => new { Booking = b, Tour = t })
                    .Where(x => x.Tour.GuideId == guideId && x.Booking.status == "Accepted" && x.Booking.bookingDate >= startOfMonth)
                    .CountAsync();

                // 2. Average rating
                var ratings = await _context.GuideRatings
                    .Where(r => r.GuideId == guideId)
                    .Select(r => r.Score)
                    .ToListAsync();
                
                double averageRating = ratings.Any() ? Math.Round(ratings.Average(r => (double)r), 1) : 0.0;

                return Ok(new
                {
                    bookingsThisMonth = bookingsCount,
                    averageRating = averageRating
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching stats for guide {GuideId}", guideId);
                return StatusCode(500, "An error occurred while fetching guide stats.");
            }
        }
    }

    // ===== Request DTOs =====

    public class GuideApplicationRequest
    {
        public int UserID { get; set; }

        // Received as a string so a leading zero survives validation: IDs for anyone born
        // in the 2000s start with 0, which a numeric type would silently drop to 12 digits.
        public string? IDno { get; set; }

        public string? Reason { get; set; }
        public string? Location { get; set; }
        public string? Bio { get; set; }
    }

    public class RateGuideRequest
    {
        public int UserID { get; set; }
        public int Score { get; set; }
        public string? Comment { get; set; }
    }

    public class UpdateItineraryRequest
    {
        public string? TimelineJson { get; set; }
    }
}
