using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        /// <summary>A private session is for a small party, not a group tour.</summary>
        private const int MaxOneOnOneGuests = 4;

        private readonly WanderSyncDbContext _context;

        public BookingsController(WanderSyncDbContext context)
        {
            _context = context;
        }

        // GET: api/bookings/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetUserBookings(int userId)
        {
            var bookings = await _context.Bookings
                .Where(b => b.userID == userId)
                .ToListAsync();

            return bookings;
        }

        // GET: api/bookings/guide/5
        [HttpGet("guide/{guideId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetGuideBookings(int guideId)
        {
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

            var bookings = await (from b in _context.Bookings
                                  join t in _context.Tours on b.tourID equals t.TourId
                                  join u in _context.Users on b.userID equals u.UserID
                                  join p in _context.Profiles on u.UserID equals p.UserID into profileGroup
                                  from p in profileGroup.DefaultIfEmpty()
                                  where t.GuideId == guideId && b.bookingDate >= sevenDaysAgo
                                  select new
                                  {
                                      BookingId = b.bookingID,
                                      TourTitle = t.Title,
                                      TourType = t.Type,
                                      TourDescription = t.Description,
                                      Price = t.Price,
                                      NumberOfGuests = b.numberOfGuests,
                                      Status = b.status,
                                      BookingDate = b.bookingDate,
                                      TimeOfBooking = b.timeOfBooking,
                                      UserName = u.FirstName + " " + u.LastName,
                                      UserAvatar = p != null ? p.ProfilePictureLink : null
                                  }).ToListAsync();

            return Ok(bookings);
        }

        /// <summary>
        /// POST: api/bookings
        /// Creates a new booking for a tour.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
        {
            if (request.UserID <= 0)
                return BadRequest(new { message = "Valid userID is required." });

            if (request.TourID <= 0)
                return BadRequest(new { message = "Valid tourID is required." });

            // Check user exists
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == request.UserID);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Check tour exists
            var tour = await _context.Tours.FirstOrDefaultAsync(t => t.TourId == request.TourID);
            if (tour == null)
                return NotFound(new { message = "Tour not found." });

            // Check if user already booked this tour
            var existingBooking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.userID == request.UserID && b.tourID == request.TourID && b.status != "Cancelled");
            if (existingBooking != null)
                return Conflict(new { message = "You have already booked this tour." });

            // Check capacity - sum active bookings guests for this tour
            var currentBookings = await _context.Bookings
                .Where(b => b.tourID == request.TourID && b.status.ToLower() == "accepted")
                .SumAsync(b => (int?)b.numberOfGuests) ?? 0;
            if (currentBookings + request.NumberOfGuests > tour.MaxPeople)
                return BadRequest(new { message = "Not enough spots remaining on this tour." });

            var booking = new Booking
            {
                userID = request.UserID,
                tourID = request.TourID,
                curatedSpotID = 0,
                bookingType = string.IsNullOrEmpty(request.BookingType) ? "Tour" : request.BookingType,
                status = "Pending", // Pending for guide approval
                bookingDate = request.BookingDate != default ? request.BookingDate : DateTime.UtcNow,
                timeOfBooking = request.TimeOfBooking ?? string.Empty,
                numberOfGuests = request.NumberOfGuests > 0 ? request.NumberOfGuests : 1
            };

            try
            {
                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                // Notify the guide
                var notification = new Notification
                {
                    UserID = tour.GuideId,
                    Type = "NewBooking",
                    Message = $"{user.FirstName} {user.LastName} sent a new booking request for {tour.Title}.",
                    RelatedEntityID = booking.bookingID,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Booking requested successfully! Waiting for guide to confirm.",
                    bookingId = booking.bookingID,
                    tourTitle = tour.Title,
                    date = booking.bookingDate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create booking. Please try again." });
            }
        }

        /// <summary>
        /// POST: api/bookings/one-on-one
        /// Requests a private one-on-one experience with a specific guide.
        ///
        /// There is no group tour to join here, so the request creates a private Tour row
        /// (capped at the requested party size and tagged <see cref="TourTypes.OneOnOne"/>)
        /// and books it. That keeps the guide dashboard, accept/decline, notifications,
        /// matching and the explorer's booking list working without schema changes.
        /// </summary>
        [HttpPost("one-on-one")]
        public async Task<IActionResult> CreateOneOnOneBooking([FromBody] CreateOneOnOneBookingRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Request body is required." });
            if (request.UserID <= 0)
                return BadRequest(new { message = "Valid userID is required." });
            if (request.GuideID <= 0)
                return BadRequest(new { message = "Valid guideID is required." });
            if (request.UserID == request.GuideID)
                return BadRequest(new { message = "You cannot book a one-on-one experience with yourself." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == request.UserID);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var guide = await _context.Users.FirstOrDefaultAsync(u => u.UserID == request.GuideID);
            if (guide == null || !string.Equals(guide.Role, "Guide", StringComparison.OrdinalIgnoreCase))
                return NotFound(new { message = "Local guide not found." });

            if (request.Date == default)
                return BadRequest(new { message = "Please choose a date for your experience." });
            if (request.Date.Date < DateTime.UtcNow.Date)
                return BadRequest(new { message = "Please choose a date that is not in the past." });

            var time = (request.TimeOfBooking ?? string.Empty).Trim();
            if (!TimeSpan.TryParse(time, out var startTime) || startTime < TimeSpan.Zero || startTime >= TimeSpan.FromDays(1))
                return BadRequest(new { message = "Please choose a start time." });

            var guests = request.NumberOfGuests <= 0 ? 1 : request.NumberOfGuests;
            if (guests > MaxOneOnOneGuests)
                return BadRequest(new { message = $"A one-on-one experience is for up to {MaxOneOnOneGuests} people. Book a group tour for a larger party." });

            // Guard against firing off the same request repeatedly while the guide decides.
            var alreadyRequested = await (from b in _context.Bookings
                                          join t in _context.Tours on b.tourID equals t.TourId
                                          where b.userID == request.UserID
                                             && t.GuideId == request.GuideID
                                             && t.Type == TourTypes.OneOnOne
                                             && b.status == "Pending"
                                             && b.bookingDate.Date == request.Date.Date
                                          select b.bookingID).AnyAsync();

            if (alreadyRequested)
                return Conflict(new { message = "You already have a pending one-on-one request with this guide for that date." });

            var focus = (request.Focus ?? string.Empty).Trim();
            if (focus.Length > 500) focus = focus.Substring(0, 500);

            // Use the guide's own area so the booking shows a sensible location.
            var guideProfile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserID == request.GuideID);

            var startsAt = request.Date.Date.Add(startTime);
            var title = $"1-on-1 with {guide.FirstName} {guide.LastName}";
            if (title.Length > 100) title = title.Substring(0, 100);

            var tour = new Tour
            {
                GuideId = request.GuideID,
                Title = title,
                Type = TourTypes.OneOnOne,
                Description = focus.Length > 0
                    ? focus
                    : "Private one-on-one experience requested by an explorer.",
                Date = startsAt,
                MaxPeople = guests,
                // No published rate exists for a private session: the guide agrees it in chat.
                Price = 0m,
                Location = string.IsNullOrWhiteSpace(guideProfile?.Location) ? null : guideProfile!.Location,
                PictureURL = null
            };

            // The tour only exists to carry this booking, so don't leave it behind if the
            // booking insert fails.
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Tours.Add(tour);
                await _context.SaveChangesAsync();

                var booking = new Booking
                {
                    userID = request.UserID,
                    tourID = tour.TourId,
                    curatedSpotID = 0,
                    bookingType = BookingTypes.OneOnOne,
                    status = "Pending",
                    bookingDate = startsAt,
                    timeOfBooking = time,
                    numberOfGuests = guests
                };
                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                var notification = new Notification
                {
                    UserID = request.GuideID,
                    Type = "NewBooking",
                    Message = $"{user.FirstName} {user.LastName} requested a 1-on-1 experience with you on {startsAt:dd MMM yyyy} at {time}.",
                    RelatedEntityID = booking.bookingID,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Your one-on-one request has been sent! The guide will confirm shortly.",
                    bookingId = booking.bookingID,
                    tourId = tour.TourId,
                    guideName = $"{guide.FirstName} {guide.LastName}",
                    date = startsAt,
                    timeOfBooking = time,
                    numberOfGuests = guests
                });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Failed to send your request. Please try again." });
            }
        }

        /// <summary>
        /// GET: api/bookings/user/{userId}/with-details
        /// Returns user's bookings with tour and guide details (for My Activities page).
        /// </summary>
        [HttpGet("user/{userId}/with-details")]
        public async Task<IActionResult> GetUserBookingsWithDetails(int userId)
        {
            try
            {
                var bookings = await _context.Bookings
                    .Where(b => b.userID == userId)
                    .Join(
                        _context.Tours,
                        booking => booking.tourID,
                        tour => tour.TourId,
                        (booking, tour) => new { booking, tour }
                    )
                    .Join(
                        _context.Users,
                        bt => bt.tour.GuideId,
                        guide => guide.UserID,
                        (bt, guide) => new
                        {
                            bookingId = bt.booking.bookingID,
                            tourId = bt.tour.TourId,
                            bookingType = bt.booking.bookingType,
                            tourTitle = bt.tour.Title,
                            tourType = bt.tour.Type,
                            tourDate = bt.tour.Date,
                            bookingDate = bt.booking.bookingDate,
                            status = bt.booking.status,
                            guideId = guide.UserID,
                            guideName = guide.FirstName + " " + guide.LastName,
                            pictureURL = bt.tour.PictureURL,
                            location = bt.tour.Location,
                            price = bt.tour.Price,
                            description = bt.tour.Description,
                            numberOfGuests = bt.booking.numberOfGuests,
                            timeOfBooking = bt.booking.timeOfBooking
                        }
                    )
                    .ToListAsync();

                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve bookings." });
            }
        }

        // PUT: api/bookings/5/accept
        [HttpPut("{id}/accept")]
        public async Task<IActionResult> AcceptBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound(new { message = "Booking not found." });

            var tour = await _context.Tours.FindAsync(booking.tourID);
            if (tour == null) return NotFound(new { message = "Tour not found." });

            var currentAcceptedBookings = await _context.Bookings
                .Where(b => b.tourID == booking.tourID && b.status.ToLower() == "accepted")
                .SumAsync(b => (int?)b.numberOfGuests) ?? 0;

            if (currentAcceptedBookings + booking.numberOfGuests > tour.MaxPeople)
            {
                return BadRequest(new { message = "Cannot accept this booking. The tour is at maximum capacity." });
            }

            booking.status = "Accepted";
            _context.Entry(booking).State = EntityState.Modified;
            
            // Notify the tourist
            var notification = new Notification
            {
                UserID = booking.userID,
                Type = "BookingAccepted",
                Message = $"Your booking for {tour?.Title ?? "a tour"} has been accepted!",
                RelatedEntityID = booking.bookingID,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);

            // Create a UserMatch if it doesn't exist
            if (tour != null)
            {
                var existingMatch = await _context.Matches.FirstOrDefaultAsync(m => 
                    (m.RequesterID == booking.userID && m.ReceiverID == tour.GuideId) ||
                    (m.RequesterID == tour.GuideId && m.ReceiverID == booking.userID));

                if (existingMatch == null)
                {
                    existingMatch = new UserMatch
                    {
                        RequesterID = booking.userID,
                        ReceiverID = tour.GuideId,
                        Status = "accepted",
                        DateMatched = DateTime.UtcNow
                    };
                    _context.Matches.Add(existingMatch);
                }
                else if (existingMatch.Status != "accepted")
                {
                    // If they previously rejected each other in the swipe UI, 
                    // force it to accepted so they can message for the tour!
                    existingMatch.Status = "accepted";
                    existingMatch.DateMatched = DateTime.UtcNow; // Refresh match date
                    _context.Entry(existingMatch).State = EntityState.Modified;
                }

                // Save to generate MatchID if it's a new match
                await _context.SaveChangesAsync();

                // Automated confirmation message (A200) from Guide to Explorer
                var automatedMessage = new Message
                {
                    MatchID = existingMatch.MatchID,
                    SenderID = tour.GuideId,
                    ReceiverID = booking.userID,
                    TextMessage = $"Hi! I've confirmed your booking for {tour.Title}. Looking forward to it!",
                    SentAt = DateTime.UtcNow
                };
                _context.Messages.Add(automatedMessage);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Booking accepted successfully!" });
        }

        // PUT: api/bookings/5/decline
        [HttpPut("{id}/decline")]
        public async Task<IActionResult> DeclineBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound(new { message = "Booking not found." });

            booking.status = "Declined";
            _context.Entry(booking).State = EntityState.Modified;

            var tour = await _context.Tours.FindAsync(booking.tourID);

            // Notify the tourist
            var notification = new Notification
            {
                UserID = booking.userID,
                Type = "BookingDeclined",
                Message = $"Your booking for {tour?.Title ?? "a tour"} was declined.",
                RelatedEntityID = booking.bookingID,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Booking declined successfully!" });
        }

        /// <summary>
        /// PUT: api/bookings/{id}/cancel
        /// Allows an explorer to cancel their own booking (Pending or Accepted only).
        /// </summary>
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id, [FromQuery] int userId)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            // Ensure the booking belongs to the requesting user
            if (booking.userID != userId)
                return Forbid();

            // Only allow cancellation of Pending or Accepted bookings
            var cancellableStatuses = new[] { "Pending", "Accepted" };
            if (!cancellableStatuses.Contains(booking.status, StringComparer.OrdinalIgnoreCase))
                return BadRequest(new { message = $"Booking cannot be cancelled — current status is '{booking.status}'." });

            booking.status = "Cancelled";
            _context.Entry(booking).State = EntityState.Modified;

            var tour = await _context.Tours.FindAsync(booking.tourID);

            // Notify the guide that the explorer cancelled
            if (tour != null)
            {
                var user = await _context.Users.FindAsync(userId);
                var notification = new Notification
                {
                    UserID = tour.GuideId,
                    Type = "BookingCancelled",
                    Message = $"{user?.FirstName} {user?.LastName} has cancelled their booking for {tour.Title}.",
                    RelatedEntityID = booking.bookingID,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Booking cancelled successfully." });
        }
    }

    public class CreateBookingRequest
    {
        public int UserID { get; set; }
        public int TourID { get; set; }
        public DateTime BookingDate { get; set; }
        public string TimeOfBooking { get; set; }
        public int NumberOfGuests { get; set; }
        public string BookingType { get; set; }
    }

    /// <summary>Request for a private experience with a specific guide (no existing tour).</summary>
    public class CreateOneOnOneBookingRequest
    {
        public int UserID { get; set; }
        public int GuideID { get; set; }
        public DateTime Date { get; set; }
        public string? TimeOfBooking { get; set; }
        public int NumberOfGuests { get; set; }

        /// <summary>What the explorer wants to do. Becomes the private tour's description.</summary>
        public string? Focus { get; set; }
    }
}
