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

        public LocalGuideController(ILogger<LocalGuideController> logger, WanderSyncDbContext context)
        {
            _logger = logger;
            _context = context;
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

            // Check user exists
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == request.UserID);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Check for duplicate application
            var existing = await _context.LocalGuideApplications
                .FirstOrDefaultAsync(a => a.UserID == request.UserID);
            if (existing != null)
                return Conflict(new { message = "You already have a pending application." });

            var application = new LocalGuideApplication
            {
                IDno = request.IDno,
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

                var tours = await _context.Tours
                    .Where(t => t.GuideId == guideId)
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

            // Verify user has booked a tour with this guide
            var hasBooking = await _context.Bookings
                .Join(
                    _context.Tours,
                    b => b.tourID,
                    t => t.TourId,
                    (b, t) => new { b, t }
                )
                .AnyAsync(bt => bt.b.userID == request.UserID && bt.t.GuideId == guideId);

            if (!hasBooking)
                return BadRequest(new { message = "You must have booked a tour with this guide before rating." });

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
                        CreatedAt = DateTime.UtcNow
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
    }

    // ===== Request DTOs =====

    public class GuideApplicationRequest
    {
        public int UserID { get; set; }
        public long IDno { get; set; }
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
}
