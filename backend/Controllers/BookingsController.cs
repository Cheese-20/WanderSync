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

        // GET: api/bookings/guide/5
        [HttpGet("guide/{guideId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetGuideBookings(int guideId)
        {
            var bookings = await (from b in _context.Bookings
                                  join t in _context.Tours on b.tourID equals t.TourId
                                  join u in _context.Users on b.userID equals u.UserID
                                  join p in _context.Profiles on u.UserID equals p.UserID into profileGroup
                                  from p in profileGroup.DefaultIfEmpty()
                                  where t.GuideId == guideId
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

        // PUT: api/bookings/5/accept
        [HttpPut("{id}/accept")]
        public async Task<IActionResult> AcceptBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound(new { message = "Booking not found." });

            booking.status = "Accepted";
            _context.Entry(booking).State = EntityState.Modified;
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
            await _context.SaveChangesAsync();

            return Ok(new { message = "Booking declined successfully!" });
        }
    }
}
