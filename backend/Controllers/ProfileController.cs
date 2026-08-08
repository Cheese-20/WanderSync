using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly ILogger<ProfileController> _logger;
        private readonly WanderSyncDbContext _context;

        public ProfileController(ILogger<ProfileController> logger, WanderSyncDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public class ProfileRequest
        {
            public int UserID { get; set; }
            public string? ProfilePictureLink { get; set; }
            public string? Interests { get; set; }
            public string? Description { get; set; }
            public string? Location { get; set; }
            public string? Job { get; set; }
            public string? CreatedAt { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> SaveProfile([FromBody] ProfileRequest request)
        {
            if (request.UserID <= 0)
            {
                return BadRequest("Valid userID is required.");
            }

            if (string.IsNullOrEmpty(request.ProfilePictureLink))
            {
                return BadRequest("Profile picture is required.");
            }

            var existingProfile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserID == request.UserID);
            DateTime createdAt;
            if (!string.IsNullOrEmpty(request.CreatedAt) && DateTime.TryParseExact(request.CreatedAt, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out var parsedDate))
            {
                createdAt = parsedDate.Date;
            }
            else if (!string.IsNullOrEmpty(request.CreatedAt) && DateTime.TryParse(request.CreatedAt, out parsedDate))
            {
                createdAt = parsedDate.Date;
            }
            else
            {
                createdAt = DateTime.UtcNow.Date;
            }

            try
            {
                if (existingProfile != null)
                {
                    existingProfile.ProfilePictureLink = request.ProfilePictureLink;
                    existingProfile.Interests = request.Interests ?? string.Empty;
                    existingProfile.Description = request.Description ?? string.Empty;
                    existingProfile.Location = request.Location ?? string.Empty;
                    existingProfile.Job = request.Job ?? string.Empty;
                    existingProfile.CreatedAt = createdAt;
                    _context.Profiles.Update(existingProfile);
                }
                else
                {
                    var profile = new Profile
                    {
                        UserID = request.UserID,
                        ProfilePictureLink = request.ProfilePictureLink,
                        Interests = request.Interests ?? string.Empty,
                        Description = request.Description ?? string.Empty,
                        Location = request.Location ?? string.Empty,
                        Job = request.Job ?? string.Empty,
                        CreatedAt = createdAt
                    };
                    _context.Profiles.Add(profile);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Profile saved successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving profile.");
                return StatusCode(500, "Internal server error while saving profile.");
            }
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            if (userId <= 0)
            {
                return BadRequest("Valid userID is required.");
            }

            try
            {
                var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserID == userId);
                if (profile == null)
                {
                    return NotFound(new { message = "Profile not found for user." });
                }

                return Ok(new
                {
                    pID = profile.PID,
                    userID = profile.UserID,
                    profilePictureLink = profile.ProfilePictureLink,
                    interests = profile.Interests,
                    description = profile.Description,
                    location = profile.Location,
                    job = profile.Job,
                    createdAt = profile.CreatedAt.ToString("yyyy-MM-dd")
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching profile for userID {userId}", userId);
                return StatusCode(500, "Internal server error while fetching profile.");
            }
        }

        [HttpGet("matches/{currentUserId}")]
        public async Task<IActionResult> GetMatches(int currentUserId)
        {
            try
            {
                var matches = new System.Collections.Generic.List<object>();
                using var command = _context.Database.GetDbConnection().CreateCommand();
                command.CommandText = @"
                    SELECT 
                        p.pID, 
                        p.userID, 
                        u.firstName, 
                        u.lastName, 
                        u.age, 
                        IFNULL(p.profilePictureLink, 'https://via.placeholder.com/150'), 
                        p.interests, 
                        p.description, 
                        p.location, 
                        p.job
                    FROM Profile p
                    JOIN User u ON p.userID = u.userID
                    WHERE p.userID != @userId
                      AND NOT EXISTS (
                          SELECT 1 FROM Matches m 
                          WHERE m.requesterID = @userId AND m.receiverID = p.userID
                      )
                      AND NOT EXISTS (
                          SELECT 1 FROM Matches m 
                          WHERE m.receiverID = @userId AND m.requesterID = p.userID
                      )
                ";

                var param = command.CreateParameter();
                param.ParameterName = "@userId";
                param.Value = currentUserId;
                command.Parameters.Add(param);

                await _context.Database.OpenConnectionAsync();
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    matches.Add(new {
                        pID = reader.GetInt32(0),
                        userID = reader.GetInt32(1),
                        firstName = reader.GetString(2),
                        lastName = reader.GetString(3),
                        age = reader.GetInt32(4),
                        profilePictureLink = reader.GetString(5),
                        interests = reader.IsDBNull(6) ? null : reader.GetString(6),
                        description = reader.IsDBNull(7) ? null : reader.GetString(7),
                        location = reader.IsDBNull(8) ? null : reader.GetString(8),
                        job = reader.IsDBNull(9) ? null : reader.GetString(9)
                    });
                }

                return Ok(matches);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching matches");
                return StatusCode(500, "Internal server error while fetching matches.");
            }
        }

        public class SwipeRequest
        {
            public int RequesterID { get; set; }
            public int ReceiverID { get; set; }
            public string Status { get; set; } = string.Empty;
            public string? CommonInterests { get; set; }
        }

        [HttpPost("swipe")]
        public async Task<IActionResult> Swipe([FromBody] SwipeRequest request)
        {
            try
            {
                var existingMatch = await _context.Matches
                    .FirstOrDefaultAsync(m => (m.RequesterID == request.RequesterID && m.ReceiverID == request.ReceiverID) ||
                                              (m.RequesterID == request.ReceiverID && m.ReceiverID == request.RequesterID));

                if (existingMatch == null)
                {
                    var match = new backend.Models.UserMatch {
                        RequesterID = request.RequesterID,
                        ReceiverID = request.ReceiverID,
                        CommonInterests = request.CommonInterests,
                        Status = request.Status == "accepted" ? "pending" : "rejected",
                        DateMatched = DateTime.UtcNow
                    };
                    _context.Matches.Add(match);
                    
                    if (request.Status == "accepted")
                    {
                        var notification = new backend.Models.Notification {
                            UserID = request.ReceiverID,
                            Type = "MatchRequest",
                            Message = "You have a new match request!",
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.Notifications.Add(notification);
                    }
                }
                else
                {
                    if (request.Status == "accepted" && existingMatch.Status == "pending")
                    {
                        existingMatch.Status = "accepted";

                        var notification = new backend.Models.Notification {
                            UserID = existingMatch.RequesterID,
                            Type = "MatchAccepted",
                            Message = "Your match request was accepted!",
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.Notifications.Add(notification);

                        // Add automated chat message
                        var welcomeMessage = new backend.Models.Message {
                            MatchID = existingMatch.MatchID,
                            SenderID = request.ReceiverID,
                            ReceiverID = existingMatch.RequesterID,
                            TextMessage = "It's a match! Say hi!",
                            SentAt = DateTime.UtcNow
                        };
                        _context.Messages.Add(welcomeMessage);
                    }
                    else if (request.Status == "rejected")
                    {
                        existingMatch.Status = "rejected";
                    }
                    _context.Matches.Update(existingMatch);
                }

                await _context.SaveChangesAsync();
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing swipe");
                return StatusCode(500, "Internal server error while processing swipe.");
            }
        }

        [HttpGet("pending/{userId}")]
        public async Task<IActionResult> GetPendingRequests(int userId)
        {
            try
            {
                var pending = await (from m in _context.Matches
                                     join u in _context.Users on m.RequesterID equals u.UserID
                                     join p in _context.Profiles on u.UserID equals p.UserID into profiles
                                     from p in profiles.DefaultIfEmpty()
                                     where m.ReceiverID == userId && m.Status == "pending"
                                     select new {
                                         id = m.RequesterID,
                                         name = u.FirstName,
                                         image = p != null && p.ProfilePictureLink != null ? p.ProfilePictureLink : "https://via.placeholder.com/150",
                                         commonInterests = m.CommonInterests
                                     }).ToListAsync();
                return Ok(pending);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching pending requests");
                return StatusCode(500, "Internal server error while fetching pending requests.");
            }
        }
    }
}
