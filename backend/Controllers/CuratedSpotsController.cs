using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CuratedSpotsController : ControllerBase
    {
        private readonly WanderSyncDbContext _context;

        public CuratedSpotsController(WanderSyncDbContext context)
        {
            _context = context;
        }

        // GET: api/CuratedSpots
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CuratedSpot>>> GetCuratedSpots()
        {
            return await _context.CuratedSpots.ToListAsync();
        }

        // POST: api/CuratedSpots
        [HttpPost]
        public async Task<ActionResult<CuratedSpot>> PostCuratedSpot(CuratedSpot spot)
        {
            spot.IsVerified = "pending"; // Default to pending for new submissions

            if (spot.SubmittedByUserID.HasValue)
            {
                var user = await _context.Users.FindAsync(spot.SubmittedByUserID.Value);
                if (user != null)
                {
                    spot.SubmittedByName = $"{user.FirstName} {user.LastName}";
                }
            }

            _context.CuratedSpots.Add(spot);
            await _context.SaveChangesAsync();

            if (spot.SubmittedByUserID.HasValue)
            {
                var notification = new Notification
                {
                    UserID = spot.SubmittedByUserID.Value,
                    Type = "SpotSubmitted",
                    Message = $"Your new spot '{spot.ActivityName}' has been successfully submitted and is now pending verification by local guides.",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetCuratedSpots), new { id = spot.SpotID }, spot);
        }
    }
}
