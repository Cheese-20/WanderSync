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

        // POST: api/bookings
        [HttpPost]
        public async Task<ActionResult<Booking>> CreateBooking(Booking booking)
        {
            booking.status = "Pending";
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Notify the guide
            var tour = await _context.Tours.FindAsync(booking.tourID);
            if (tour != null)
            {
                var notification = new Notification
                {
                    UserID = tour.GuideId,
                    Type = "NewBooking",
                    Message = $"You have a new booking request for {tour.Title}.",
                    RelatedEntityID = booking.bookingID
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction("GetUserBookings", new { userId = booking.userID }, booking);
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
                RelatedEntityID = booking.bookingID
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
                RelatedEntityID = booking.bookingID
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Booking declined successfully!" });
        }
    }
}
