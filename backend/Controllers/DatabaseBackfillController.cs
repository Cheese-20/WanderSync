using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatabaseBackfillController : ControllerBase
    {
        private readonly WanderSyncDbContext _context;

        public DatabaseBackfillController(WanderSyncDbContext context)
        {
            _context = context;
        }

        [HttpPost("populate-all")]
        public async Task<IActionResult> PopulateAllDenormalizedData()
        {
            try
            {
                // 1. Bookings
                var bookings = await _context.Bookings.ToListAsync();
                foreach (var booking in bookings)
                {
                    var user = await _context.Users.FindAsync(booking.userID);
                    var tour = await _context.Tours.FindAsync(booking.tourID);
                    if (user != null)
                    {
                        booking.userName = user.FirstName;
                        booking.userSurname = user.LastName;
                    }
                    if (tour != null)
                    {
                        booking.tourName = tour.Title;
                        booking.tourLocation = tour.Location;
                    }
                }

                // 2. GuideApplications (Using LocalGuideApplications since GuideApplications is not in DbContext)
                var guideApps = await _context.LocalGuideApplications.ToListAsync();
                foreach (var app in guideApps)
                {
                    var user = await _context.Users.FindAsync(app.UserID);
                    if (user != null)
                    {
                        app.UserName = user.FirstName;
                        app.UserSurname = user.LastName;
                    }
                }

                // 3. UserMatches
                var matches = await _context.Matches.ToListAsync();
                foreach (var match in matches)
                {
                    var req = await _context.Users.FindAsync(match.RequesterID);
                    var rec = await _context.Users.FindAsync(match.ReceiverID);
                    if (req != null)
                    {
                        match.RequesterName = req.FirstName;
                        match.RequesterSurname = req.LastName;
                    }
                    if (rec != null)
                    {
                        match.ReceiverName = rec.FirstName;
                        match.ReceiverSurname = rec.LastName;
                    }
                }

                // 4. Messages
                var messages = await _context.Messages.ToListAsync();
                foreach (var msg in messages)
                {
                    var sender = await _context.Users.FindAsync(msg.SenderID);
                    var receiver = await _context.Users.FindAsync(msg.ReceiverID);
                    if (sender != null)
                    {
                        msg.SenderName = sender.FirstName;
                        msg.SenderSurname = sender.LastName;
                    }
                    if (receiver != null)
                    {
                        msg.ReceiverName = receiver.FirstName;
                        msg.ReceiverSurname = receiver.LastName;
                    }
                }

                // 6. Posts
                var posts = await _context.Posts.ToListAsync();
                foreach (var post in posts)
                {
                    var user = await _context.Users.FindAsync(post.UserID);
                    if (user != null)
                    {
                        post.UserName = user.FirstName;
                        post.UserSurname = user.LastName;
                    }
                }

                // 7. Profiles
                var profiles = await _context.Profiles.ToListAsync();
                foreach (var profile in profiles)
                {
                    var user = await _context.Users.FindAsync(profile.UserID);
                    if (user != null)
                    {
                        profile.UserName = user.FirstName;
                        profile.UserSurname = user.LastName;
                        profile.UserEmail = user.Email;
                    }
                }

                // 8. SpotVotes
                var spotVotes = await _context.SpotVotes.ToListAsync();
                foreach (var vote in spotVotes)
                {
                    var spot = await _context.Spots.FindAsync(vote.SpotID);
                    var guide = await _context.Users.FindAsync(vote.GuideID);
                    if (spot != null)
                    {
                        vote.SpotName = spot.ActivityName;
                        vote.SpotLocation = spot.Location;
                    }
                    if (guide != null)
                    {
                        vote.GuideName = guide.FirstName;
                        vote.GuideSurname = guide.LastName;
                    }
                }

                // 9. Tours
                var tours = await _context.Tours.ToListAsync();
                foreach (var tour in tours)
                {
                    var guide = await _context.Users.FindAsync(tour.GuideId);
                    if (guide != null)
                    {
                        tour.GuideName = guide.FirstName;
                        tour.GuideSurname = guide.LastName;
                    }
                }

                // Save changes
                await _context.SaveChangesAsync();

                return Ok(new { message = "Successfully backfilled denormalized data!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error during backfill", details = ex.Message });
            }
        }
    }
}
