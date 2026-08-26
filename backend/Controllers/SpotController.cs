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
    public class SpotsController : ControllerBase
    {
        private readonly WanderSyncDbContext _context;

        public SpotsController(WanderSyncDbContext context)
        {
            _context = context;
        }

        // GET: api/spots/pending/{guideId}
        [HttpGet("pending/{guideId}")]
        public async Task<IActionResult> GetPendingSpotsForGuide(int guideId)
        {
            // Get all pending spots that the guide hasn't voted on yet
            var spots = await (from s in _context.CuratedSpots
                               where s.IsVerified == "pending" && 
                                     s.SubmittedByUserID != guideId &&
                                     !_context.SpotVotes.Any(v => v.SpotID == s.SpotID && v.GuideID == guideId)
                               join u in _context.Users on s.SubmittedByUserID equals u.UserID into userGroup
                               from u in userGroup.DefaultIfEmpty()
                               join p in _context.Profiles on s.SubmittedByUserID equals p.UserID into profileGroup
                               from p in profileGroup.DefaultIfEmpty()
                               select new {
                                   spotID = s.SpotID,
                                   activityName = s.ActivityName,
                                   activityType = s.ActivityType,
                                   description = s.Description,
                                   location = s.Location,
                                   pictureURL = s.PictureURL,
                                   submitterName = u != null ? u.FirstName + " " + u.LastName : "Unknown",
                                   submitterAvatar = p != null ? p.ProfilePictureLink : null,
                                   submittedAt = s.SubmittedAt
                               }).ToListAsync();

            return Ok(spots);
        }

        // GET: api/spots/verified
        [HttpGet("verified")]
        public async Task<IActionResult> GetVerifiedSpots([FromQuery] int? userId = null)
        {
            var spots = await (from s in _context.CuratedSpots
                               where s.IsVerified == "approved"
                               join u in _context.Users on s.SubmittedByUserID equals u.UserID into userGroup
                               from u in userGroup.DefaultIfEmpty()
                               join p in _context.Profiles on s.SubmittedByUserID equals p.UserID into profileGroup
                               from p in profileGroup.DefaultIfEmpty()
                               let upvotesCount = _context.SpotVotes.Count(v => v.SpotID == s.SpotID && v.VoteType == "upvote")
                               let hasUpvoted = userId.HasValue ? _context.SpotVotes.Any(v => v.SpotID == s.SpotID && v.VoteType == "upvote" && v.GuideID == userId.Value) : false
                               let averageRating = _context.SpotRatings.Where(r => r.SpotID == s.SpotID).Average(r => (double?)r.RatingScore) ?? 0.0
                               let totalRatings = _context.SpotRatings.Count(r => r.SpotID == s.SpotID)
                               let hasRated = userId.HasValue ? _context.SpotRatings.Any(r => r.SpotID == s.SpotID && r.UserID == userId.Value) : false
                               select new {
                                   spotID = s.SpotID,
                                   activityName = s.ActivityName,
                                   activityType = s.ActivityType,
                                   description = s.Description,
                                   location = s.Location,
                                   pictureURL = s.PictureURL,
                                   submitterName = u != null ? u.FirstName + " " + u.LastName : "Unknown",
                                   submitterAvatar = p != null ? p.ProfilePictureLink : null,
                                   submittedAt = s.SubmittedAt,
                                   upvotesCount = upvotesCount,
                                   hasUpvoted = hasUpvoted,
                                   averageRating = averageRating,
                                   totalRatings = totalRatings,
                                   hasRated = hasRated
                               }).ToListAsync();

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

            if (spot.SubmittedByUserID == request.GuideId)
                return BadRequest("You cannot vote on your own spot.");

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

        public class UpvoteRequest
        {
            public int GuideId { get; set; }
        }

        // POST: api/spots/{id}/upvote
        [HttpPost("{id}/upvote")]
        public async Task<IActionResult> UpvoteSpot(int id, [FromBody] UpvoteRequest request)
        {
            var spot = await _context.CuratedSpots.FindAsync(id);
            if (spot == null)
                return NotFound("Spot not found.");

            if (spot.IsVerified != "approved")
                return BadRequest("Spot is not verified yet.");

            var existingVote = await _context.SpotVotes
                .FirstOrDefaultAsync(v => v.SpotID == id && v.GuideID == request.GuideId && v.VoteType == "upvote");

            if (existingVote != null)
                return BadRequest("You have already upvoted this spot.");

            // Record upvote
            var vote = new SpotVote
            {
                SpotID = id,
                GuideID = request.GuideId,
                VoteType = "upvote",
                VotedAt = DateTime.UtcNow
            };
            _context.SpotVotes.Add(vote);

            // Create notification if submitted by another user
            if (spot.SubmittedByUserID.HasValue && spot.SubmittedByUserID.Value != request.GuideId)
            {
                var upvoter = await _context.Users.FindAsync(request.GuideId);
                var upvoterName = upvoter != null ? $"{upvoter.FirstName} {upvoter.LastName}" : "A fellow guide";
                var notification = new Notification
                {
                    UserID = spot.SubmittedByUserID.Value,
                    Message = $"{upvoterName} found your spot '{spot.ActivityName}' helpful and upvoted it!",
                    IsRead = false,
                    Type = "Upvote",
                    RelatedEntityID = spot.SpotID,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Spot upvoted successfully." });
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
        // POST: api/spots/{id}/report
        [HttpPost("{id}/report")]
        public async Task<IActionResult> ReportSpot(int id, [FromBody] SpotReportRequest request)
        {
            var report = new SpotReport
            {
                SpotID = id,
                ReporterID = request.ReporterId,
                Reason = request.Reason,
                SentAt = DateTime.UtcNow
            };

            _context.SpotReports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Spot reported successfully." });
        }

        // POST: api/spots/{id}/rate
        [HttpPost("{id}/rate")]
        public async Task<IActionResult> RateSpot(int id, [FromBody] RateRequest request)
        {
            if (request.RatingScore < 1 || request.RatingScore > 5)
                return BadRequest("Rating score must be between 1 and 5.");

            var spot = await _context.CuratedSpots.FindAsync(id);
            if (spot == null)
                return NotFound("Spot not found.");

            // Check for duplicate rating (D1000 precondition)
            var existingRating = await _context.SpotRatings
                .FirstOrDefaultAsync(r => r.SpotID == id && r.UserID == request.UserId);

            if (existingRating != null)
                return BadRequest("You have already rated this spot.");

            // Add rating
            var newRating = new SpotRating
            {
                SpotID = id,
                UserID = request.UserId,
                RatingScore = request.RatingScore,
                ReviewText = request.ReviewText,
                SubmittedAt = DateTime.UtcNow
            };

            _context.SpotRatings.Add(newRating);
            await _context.SaveChangesAsync();

            // Recalculate average
            var averageRating = await _context.SpotRatings
                .Where(r => r.SpotID == id)
                .AverageAsync(r => (double)r.RatingScore);
                
            var totalRatings = await _context.SpotRatings
                .Where(r => r.SpotID == id)
                .CountAsync();

            return Ok(new { message = "Rating submitted successfully.", averageRating, totalRatings });
        }
    }

    public class SpotReportRequest
    {
        public int ReporterId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class RateRequest
    {
        public int UserId { get; set; }
        public int RatingScore { get; set; }
        public string? ReviewText { get; set; }
    }
}
