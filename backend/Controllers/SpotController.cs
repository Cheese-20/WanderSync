using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpotController : ControllerBase
    {
        private readonly WanderSyncDbContext _context;

        public SpotController(WanderSyncDbContext context)
        {
            _context = context;
        }

        // GET: api/spots/pending/{guideId}
        [HttpGet("pending/{guideId}")]
        public async Task<IActionResult> GetPendingSpotsForGuide(int guideId)
        {
            // Get all pending spots that the guide hasn't voted on yet
            var spots = await _context.CuratedSpots
                .Where(s => s.IsVerified == "pending" && 
                            !_context.SpotVotes.Any(v => v.SpotID == s.SpotID && v.GuideID == guideId))
                .Select(s => new {
                    spotID = s.SpotID,
                    activityName = s.ActivityName,
                    activityType = s.ActivityType,
                    description = s.Description,
                    location = s.Location
                })
                .ToListAsync();

            return Ok(spots);
        }

        // GET: api/spots/verified
        [HttpGet("verified")]
        public async Task<IActionResult> GetVerifiedSpots()
        {
            var spots = await _context.CuratedSpots
                .Where(s => s.IsVerified == "approved")
                .Select(s => new {
                    spotID = s.SpotID,
                    activityName = s.ActivityName,
                    activityType = s.ActivityType,
                    description = s.Description,
                    location = s.Location
                })
                .ToListAsync();

            return Ok(spots);
        }

        public class VoteRequest
        {
            public int GuideId { get; set; }
            public string VoteType { get; set; } = string.Empty; // "approve" or "reject"
        }

        // POST: api/spots/{id}/vote
        [HttpPost("{id}/vote")]
        public async Task<IActionResult> VoteOnSpot(int id, [FromBody] VoteRequest request)
        {
            if (request.VoteType != "approve" && request.VoteType != "reject")
                return BadRequest("Invalid vote type.");

            var spot = await _context.CuratedSpots.FindAsync(id);
            if (spot == null)
                return NotFound("Spot not found.");

            if (spot.IsVerified != "pending")
                return BadRequest("Spot is no longer pending.");

            var existingVote = await _context.SpotVotes
                .FirstOrDefaultAsync(v => v.SpotID == id && v.GuideID == request.GuideId);

            if (existingVote != null)
                return BadRequest("You have already voted on this spot.");

            // Record vote
            var vote = new SpotVote
            {
                SpotID = id,
                GuideID = request.GuideId,
                VoteType = request.VoteType,
                VotedAt = DateTime.UtcNow
            };
            _context.SpotVotes.Add(vote);
            await _context.SaveChangesAsync();

            // Check if we reached threshold (5 votes)
            var totalApprovals = await _context.SpotVotes.CountAsync(v => v.SpotID == id && v.VoteType == "approve");
            var totalRejects = await _context.SpotVotes.CountAsync(v => v.SpotID == id && v.VoteType == "reject");

            if (totalApprovals >= 5)
            {
                spot.IsVerified = "approved";
            }
            else if (totalRejects >= 5)
            {
                // Can stay false or be deleted
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Vote recorded successfully.", status = spot.IsVerified });
        }

        // POST: api/spots
        // Utility endpoint to submit a spot for verification testing
        [HttpPost]
        public async Task<IActionResult> CreateSpot([FromBody] CuratedSpot spot)
        {
            spot.IsVerified = "pending";
            
            _context.CuratedSpots.Add(spot);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPendingSpotsForGuide), new { guideId = 0 }, spot);
        }
    }
}
