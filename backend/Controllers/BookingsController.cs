using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

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

            // Check capacity - count active bookings for this tour
            var currentBookings = await _context.Bookings
                .CountAsync(b => b.tourID == request.TourID && b.status != "Cancelled");
            if (currentBookings >= tour.MaxPeople)
                return BadRequest(new { message = "This tour is fully booked." });

            var booking = new Booking
            {
                userID = request.UserID,
                tourID = request.TourID,
                curatedSpotID = 0,
                bookingType = "Tour",
                status = "Confirmed",
                bookingDate = request.BookingDate != default ? request.BookingDate : DateTime.UtcNow
            };

            try
            {
                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                // Send notification to the guide
                var notification = new Notification
                {
                    UserID = tour.GuideId,
                    Type = "NewBooking",
                    Message = $"{user.FirstName} {user.LastName} booked your tour: {tour.Title}",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Booking confirmed successfully!",
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
                    .Where(b => b.userID == userId && b.bookingType == "Tour")
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
                            tourTitle = bt.tour.Title,
                            tourType = bt.tour.Type,
                            tourDate = bt.tour.Date,
                            bookingDate = bt.booking.bookingDate,
                            status = bt.booking.status,
                            guideId = guide.UserID,
                            guideName = guide.FirstName + " " + guide.LastName
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
    }

    public class CreateBookingRequest
    {
        public int UserID { get; set; }
        public int TourID { get; set; }
        public DateTime BookingDate { get; set; }
    }
}
