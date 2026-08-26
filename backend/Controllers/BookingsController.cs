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
                .Where(b => b.tourID == request.TourID && b.status != "Cancelled")
                .SumAsync(b => (int?)b.numberOfGuests) ?? 0;
            if (currentBookings + request.NumberOfGuests > tour.MaxPeople)
                return BadRequest(new { message = "Not enough spots remaining on this tour." });

            var booking = new Booking
            {
                userID = request.UserID,
                tourID = request.TourID,
                bookingType = "Tour",
                status = "Pending", // Set to pending to allow guide to accept/decline
                bookingDate = request.BookingDate != default ? request.BookingDate : DateTime.UtcNow,
                numberOfGuests = request.NumberOfGuests
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

            booking.status = "Accepted";
            _context.Entry(booking).State = EntityState.Modified;

            var tour = await _context.Tours.FindAsync(booking.tourID);
            
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
    }

    public class CreateBookingRequest
    {
        public int UserID { get; set; }
        public int TourID { get; set; }
        public DateTime BookingDate { get; set; }
        public int NumberOfGuests { get; set; }
    }
}
