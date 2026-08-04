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

        [HttpGet("contacts/{userId}")]
        public async Task<IActionResult> GetContacts(int userId)
        {
            try
            {
                // We want to find all matches where the user is either the requester or receiver AND status is 'accepted'
                var matches = await _context.Matches
                    .Where(m => (m.RequesterID == userId || m.ReceiverID == userId) && m.Status == "accepted")
                    .ToListAsync();

                var contactIds = matches.Select(m => m.RequesterID == userId ? m.ReceiverID : m.RequesterID).ToList();

                var users = await (from u in _context.Users
                                   join p in _context.Profiles on u.UserID equals p.UserID into profiles
                                   from p in profiles.DefaultIfEmpty()
                                   where contactIds.Contains(u.UserID)
                                   select new
                                   {
                                       u.UserID,
                                       u.FirstName,
                                       u.LastName,
                                       ProfilePictureLink = p != null ? p.ProfilePictureLink : null,
                                       Job = p != null ? p.Job : null
                                   }).ToListAsync();

                var contacts = users.Select(u => new
                {
                    userID = u.UserID,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    profilePictureLink = u.ProfilePictureLink ?? "https://via.placeholder.com/150",
                    job = u.Job,
                    matchID = matches.First(m => (m.RequesterID == userId && m.ReceiverID == u.UserID) || 
                                                 (m.ReceiverID == userId && m.RequesterID == u.UserID)).MatchID
                }).ToList();

                return Ok(contacts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching contacts for user {userId}", userId);
                return StatusCode(500, "Internal server error fetching contacts.");
            }
        }

        [HttpGet("chat/{matchId}")]
        public async Task<IActionResult> GetChat(int matchId)
        {
            try
            {
                // Verify the match is accepted
                var match = await _context.Matches.FirstOrDefaultAsync(m => m.MatchID == matchId);
                if (match == null || match.Status != "accepted")
                {
                    return BadRequest("Invalid or unaccepted match.");
                }

                // Get messages, ordered by newest first
                var messages = await _context.Messages
                    .Where(m => m.MatchID == matchId)
                    .OrderByDescending(m => m.SentAt)
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

                var notification = new Notification {
                    UserID = request.ReceiverID,
                    Type = "NewMessage",
                    Message = "You have a new message.",
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
