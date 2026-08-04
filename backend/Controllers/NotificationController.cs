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
    public class NotificationController : ControllerBase
    {
        private readonly ILogger<NotificationController> _logger;
        private readonly WanderSyncDbContext _context;

        public NotificationController(ILogger<NotificationController> logger, WanderSyncDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetNotifications(int userId)
        {
            try
            {
                var now = DateTime.UtcNow;
                var notifications = await _context.Notifications
                    .Where(n => n.UserID == userId && (n.ScheduledFor == null || n.ScheduledFor <= now))
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching notifications for user {userId}", userId);
                return StatusCode(500, "Internal server error fetching notifications.");
            }
        }

        [HttpPut("read/{notificationId}")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            try
            {
                var notification = await _context.Notifications.FindAsync(notificationId);
                if (notification == null)
                {
                    return NotFound("Notification not found.");
                }

                notification.IsRead = true;
                _context.Notifications.Update(notification);
                await _context.SaveChangesAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {notificationId} as read.", notificationId);
                return StatusCode(500, "Internal server error marking notification.");
            }
        }
    }
}
