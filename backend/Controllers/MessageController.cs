using System;
using System.Linq;
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
    public class MessageController : ControllerBase
    {
        private readonly ILogger<MessageController> _logger;
        private readonly WanderSyncDbContext _context;

        public MessageController(ILogger<MessageController> logger, WanderSyncDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet("all-matches")]
        public async Task<IActionResult> GetAllMatches()
        {
            var list = new System.Collections.Generic.List<object>();
            using var command = _context.Database.GetDbConnection().CreateCommand();
            command.CommandText = "SELECT matchID, requesterID, receiverID, status FROM Matches";
            await _context.Database.OpenConnectionAsync();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new { matchID = reader.GetInt32(0), requesterID = reader.GetInt32(1), receiverID = reader.GetInt32(2), status = reader.GetString(3) });
            }
            return Ok(list);
        }

        [HttpGet("contacts/{userId}")]
        public async Task<IActionResult> GetContacts(int userId)
        {
            try
            {
                var contacts = new System.Collections.Generic.List<object>();
                using var command = _context.Database.GetDbConnection().CreateCommand();
                command.CommandTimeout = 120; // Increase timeout to prevent crashing on large base64 profile pictures
                command.CommandText = @"
                    SELECT 
                        u.userID, 
                        u.firstName, 
                        u.lastName, 
                        CONCAT('http://localhost:5200/api/profile/', u.userID, '/picture') as profilePictureLink,
                        p.job,
                        m.matchID,
                        u.role
                    FROM Matches m
                    JOIN User u ON u.userID = m.receiverID
                    LEFT JOIN Profile p ON p.userID = u.userID
                    WHERE m.requesterID = @userId AND LOWER(m.status) = 'accepted'
                    
                    UNION ALL
                    
                    SELECT 
                        u.userID, 
                        u.firstName, 
                        u.lastName, 
                        CONCAT('http://localhost:5200/api/profile/', u.userID, '/picture') as profilePictureLink,
                        p.job,
                        m.matchID,
                        u.role
                    FROM Matches m
                    JOIN User u ON u.userID = m.requesterID
                    LEFT JOIN Profile p ON p.userID = u.userID
                    WHERE m.receiverID = @userId AND LOWER(m.status) = 'accepted'
                ";
                
                var param = command.CreateParameter();
                param.ParameterName = "@userId";
                param.Value = userId;
                command.Parameters.Add(param);

                await _context.Database.OpenConnectionAsync();
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    contacts.Add(new {
                        userID = reader.GetInt32(0),
                        firstName = reader.GetString(1),
                        lastName = reader.GetString(2),
                        profilePictureLink = reader.GetString(3),
                        job = reader.IsDBNull(4) ? null : reader.GetString(4),
                        matchID = reader.GetInt32(5),
                        role = reader.GetString(6)
                    });
                }
                
                return Ok(contacts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching contacts for user {userId}", userId);
                return StatusCode(500, "Internal server error fetching contacts.");
            }
        }

        [HttpGet("chat/{matchId}")]
        public async Task<IActionResult> GetChat(int matchId, [FromQuery] int? afterId)
        {
            try
            {
                // Get messages directly, ordered by newest first (bypass Match validation for speed)
                var query = _context.Messages
                    .AsNoTracking()
                    .Where(m => m.MatchID == matchId);
                
                if (afterId.HasValue)
                {
                    query = query.Where(m => m.MID > afterId.Value);
                }

                var messages = await query
                    .OrderBy(m => m.SentAt)
                    .Select(m => new {
                        mID = m.MID,
                        senderID = m.SenderID,
                        receiverID = m.ReceiverID,
                        textMessage = m.TextMessage,
                        sentAt = m.SentAt
                    })
                    .ToListAsync();

                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching chat {matchId}", matchId);
                return StatusCode(500, "Internal server error fetching chat.");
            }
        }

        public class MessageRequest
        {
            public int MatchID { get; set; }
            public int SenderID { get; set; }
            public int ReceiverID { get; set; }
            public string TextMessage { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] MessageRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.TextMessage))
                {
                    return BadRequest("Message cannot be empty.");
                }

                // Verify match is accepted
                var match = await _context.Matches.FirstOrDefaultAsync(m => m.MatchID == request.MatchID);
                if (match == null || match.Status != "accepted")
                {
                    return BadRequest("You can only message accepted matches.");
                }

                var msg = new Message
                {
                    MatchID = request.MatchID,
                    SenderID = request.SenderID,
                    ReceiverID = request.ReceiverID,
                    TextMessage = request.TextMessage,
                    SentAt = DateTime.UtcNow
                };

                _context.Messages.Add(msg);

                var sender = await _context.Users.FirstOrDefaultAsync(u => u.UserID == request.SenderID);
                var senderName = sender != null ? sender.FirstName : "Someone";

                var notification = new Notification {
                    UserID = request.ReceiverID,
                    Type = "NewMessage",
                    Message = $"You have a new message from {senderName}.",
                    RelatedEntityID = request.MatchID,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);

                await _context.SaveChangesAsync();

                return Ok(new { 
                    mID = msg.MID,
                    senderID = msg.SenderID,
                    receiverID = msg.ReceiverID,
                    textMessage = msg.TextMessage,
                    sentAt = msg.SentAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message.");
                return StatusCode(500, "Internal server error sending message.");
            }
        }
    }
}
