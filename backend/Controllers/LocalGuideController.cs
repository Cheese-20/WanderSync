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
    [Route("api/local-guide")]
    public class LocalGuideController : ControllerBase
    {
        private readonly ILogger<LocalGuideController> _logger;
        private readonly WanderSyncDbContext _context;

        public LocalGuideController(ILogger<LocalGuideController> logger, WanderSyncDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        /// <summary>
        /// POST /api/local-guide/apply
        /// Accepts multipart/form-data with application fields + file uploads.
        /// For now stores the application in the LocalGuideApplication table.
        /// </summary>
        [HttpPost("apply")]
        public async Task<IActionResult> Apply([FromForm] LocalGuideApplicationRequest request)
        {
            _logger.LogInformation("Local guide application received for userId={UserId}", request.UserId);

            if (request.UserId <= 0)
                return BadRequest(new { message = "Valid userId is required." });

            // Check user exists
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == request.UserId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Check for duplicate pending application
            var existing = await _context.LocalGuideApplications
                .FirstOrDefaultAsync(a => a.UserId == request.UserId && a.Status == "Pending");
            if (existing != null)
                return Conflict(new { message = "You already have a pending application. Please wait for a review." });

            // Save file bytes (in production you would store to cloud storage and save the URL)
            byte[]? profileImageBytes = null;
            byte[]? idCopyBytes = null;

            if (request.ProfileImage != null)
            {
                using var ms = new System.IO.MemoryStream();
                await request.ProfileImage.CopyToAsync(ms);
                profileImageBytes = ms.ToArray();
            }

            if (request.IdCopy != null)
            {
                using var ms = new System.IO.MemoryStream();
                await request.IdCopy.CopyToAsync(ms);
                idCopyBytes = ms.ToArray();
            }

            var application = new LocalGuideApplication
            {
                UserId = request.UserId,
                FirstName = request.FirstName?.Trim() ?? string.Empty,
                LastName = request.LastName?.Trim() ?? string.Empty,
                Email = request.Email?.Trim() ?? string.Empty,
                PhoneNumber = request.PhoneNumber?.Trim() ?? string.Empty,
                Age = request.Age,
                IdNumber = request.IdNumber?.Trim() ?? string.Empty,
                Location = request.Location?.Trim() ?? string.Empty,
                Experience = request.Experience?.Trim() ?? string.Empty,
                Reason = request.Reason?.Trim() ?? string.Empty,
                ActivityCount = request.ActivityCount,
                ProfileImageData = profileImageBytes,
                IdCopyData = idCopyBytes,
                Status = "Pending",
                SubmittedAt = DateTime.UtcNow
            };

            try
            {
                _context.LocalGuideApplications.Add(application);
                await _context.SaveChangesAsync();

                // Optionally mark user role as "PendingGuide"
                user.Role = "PendingGuide";
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Application submitted successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving local guide application.");
                return StatusCode(500, new { message = "Failed to save application. Please try again." });
            }
        }
    }

    /// <summary>
    /// GET /api/user/activities/count/{userId}
    /// Returns the number of activities the user has participated in.
    /// </summary>
    [ApiController]
    [Route("api/user")]
    public class UserActivityController : ControllerBase
    {
        private readonly ILogger<UserActivityController> _logger;
        private readonly WanderSyncDbContext _context;

        public UserActivityController(ILogger<UserActivityController> logger, WanderSyncDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet("activities/count/{userId}")]
        public async Task<IActionResult> GetActivityCount(int userId)
        {
            if (userId <= 0)
                return BadRequest(new { message = "Valid userId is required." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // TODO: Replace with real activity participation count query
            // e.g. var count = await _context.ActivityParticipants.CountAsync(p => p.UserId == userId);
            var count = 0;

            return Ok(new { activityCount = count });
        }
    }

    // ===== Request / Model DTOs =====

    public class LocalGuideApplicationRequest
    {
        public int UserId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public int Age { get; set; }
        public string? IdNumber { get; set; }
        public string? Location { get; set; }
        public string? Experience { get; set; }
        public string? Reason { get; set; }
        public int ActivityCount { get; set; }
        public IFormFile? ProfileImage { get; set; }
        public IFormFile? IdCopy { get; set; }
    }
}
