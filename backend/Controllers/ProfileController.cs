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
                var matches = await _context.Profiles
                    .Include(p => p.User)
                    .Where(p => p.UserID != currentUserId)
                    .Select(p => new
                    {
                        pID = p.PID,
                        userID = p.UserID,
                        firstName = p.User.FirstName,
                        lastName = p.User.LastName,
                        age = p.User.Age,
                        profilePictureLink = p.ProfilePictureLink,
                        interests = p.Interests,
                        description = p.Description,
                        location = p.Location
                    })
                    .ToListAsync();

                return Ok(matches);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching matches");
                return StatusCode(500, "Internal server error while fetching matches.");
            }
        }
    }
}
