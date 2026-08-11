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
    [Route("api/user-submitted-locations")]
    public class UserSubmittedLocationsController : ControllerBase
    {
        private readonly ILogger<UserSubmittedLocationsController> _logger;
        private readonly WanderSyncDbContext _context;

        public UserSubmittedLocationsController(ILogger<UserSubmittedLocationsController> logger, WanderSyncDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        /// <summary>
        /// POST /api/user-submitted-locations
        /// Allows a user to submit a new location for review.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> SubmitLocation([FromBody] SubmitLocationRequest request)
        {
            if (request.UserID <= 0)
                return BadRequest(new { message = "Valid userID is required." });

            if (string.IsNullOrWhiteSpace(request.LocationName))
                return BadRequest(new { message = "Location name is required." });

            if (string.IsNullOrWhiteSpace(request.Country))
                return BadRequest(new { message = "Country is required." });

            // Verify user exists
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == request.UserID);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var location = new UserSubmittedLocation
            {
                UserID = request.UserID,
                LocationName = request.LocationName,
                Description = request.Description ?? string.Empty,
                Address = request.Address ?? string.Empty,
                City = request.City ?? string.Empty,
                Country = request.Country,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                Category = request.Category ?? string.Empty,
                ImageURL = request.ImageURL,
                Status = "Pending",
                SubmittedAt = DateTime.UtcNow
            };

            try
            {
                _context.UserSubmittedLocations.Add(location);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Location '{LocationName}' submitted by user {UserID}", request.LocationName, request.UserID);
                return Ok(new { message = "Location submitted successfully and is pending admin verification.", locationID = location.LocationID });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving user submitted location.");
                return StatusCode(500, new { message = "Failed to submit location. Please try again." });
            }
        }

        /// <summary>
        /// GET /api/user-submitted-locations
        /// Returns all submitted locations. Optionally filter by status.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllLocations([FromQuery] string? status = null)
        {
            var query = _context.UserSubmittedLocations.AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(l => l.Status == status);

            var locations = await query
                .Join(_context.Users,
                      loc => loc.UserID,
                      u => u.UserID,
                      (loc, u) => new
                      {
                          locationID = loc.LocationID,
                          userID = loc.UserID,
                          submittedBy = u.FirstName + " " + u.LastName,
                          locationName = loc.LocationName,
                          description = loc.Description,
                          address = loc.Address,
                          city = loc.City,
                          country = loc.Country,
                          latitude = loc.Latitude,
                          longitude = loc.Longitude,
                          category = loc.Category,
                          imageURL = loc.ImageURL,
                          status = loc.Status,
                          rejectionReason = loc.RejectionReason,
                          submittedAt = loc.SubmittedAt,
                          verifiedAt = loc.VerifiedAt
                      })
                .OrderByDescending(l => l.submittedAt)
                .ToListAsync();

            return Ok(locations);
        }

        /// <summary>
        /// GET /api/user-submitted-locations/{id}
        /// Returns a single submitted location by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLocationById(int id)
        {
            var location = await _context.UserSubmittedLocations.FindAsync(id);
            if (location == null)
                return NotFound(new { message = "Location not found." });

            return Ok(location);
        }

        /// <summary>
        /// PUT /api/user-submitted-locations/{id}/verify
        /// Admin-only endpoint to approve or reject a user-submitted location.
        /// </summary>
        [HttpPut("{id}/verify")]
        public async Task<IActionResult> VerifyLocation(int id, [FromBody] VerifyLocationRequest request)
        {
            // Validate admin ID is provided
            if (request.AdminID <= 0)
                return BadRequest(new { message = "Valid adminID is required." });

            // Verify the requester is an actual admin
            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.AdminID == request.AdminID);
            if (admin == null)
            {
                _logger.LogWarning("Unauthorized verification attempt by non-admin ID {AdminID}", request.AdminID);
                return Unauthorized(new { message = "Only admins can verify locations." });
            }

            // Validate status value
            if (string.IsNullOrWhiteSpace(request.Status) ||
                (request.Status != "Approved" && request.Status != "Rejected"))
            {
                return BadRequest(new { message = "Status must be 'Approved' or 'Rejected'." });
            }

            // Find the location
            var location = await _context.UserSubmittedLocations.FindAsync(id);
            if (location == null)
                return NotFound(new { message = "Location not found." });

            if (location.Status != "Pending")
                return BadRequest(new { message = $"Location has already been {location.Status.ToLower()}." });

            // Update verification fields
            location.Status = request.Status;
            location.VerifiedByAdminID = request.AdminID;
            location.VerifiedAt = DateTime.UtcNow;

            if (request.Status == "Rejected")
            {
                location.RejectionReason = request.RejectionReason ?? "No reason provided.";
            }

            try
            {
                _context.UserSubmittedLocations.Update(location);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Location {LocationID} {Status} by admin {AdminID}",
                    id, request.Status, request.AdminID);

                return Ok(new
                {
                    message = $"Location has been {request.Status.ToLower()} successfully.",
                    locationID = location.LocationID,
                    status = location.Status,
                    verifiedByAdminID = location.VerifiedByAdminID,
                    verifiedAt = location.VerifiedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying location {LocationID}", id);
                return StatusCode(500, new { message = "Failed to verify location. Please try again." });
            }
        }

        /// <summary>
        /// DELETE /api/user-submitted-locations/{id}
        /// Admin-only endpoint to delete a submitted location.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocation(int id, [FromQuery] int adminID)
        {
            // Verify the requester is an admin
            if (adminID <= 0)
                return BadRequest(new { message = "Valid adminID query parameter is required." });

            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.AdminID == adminID);
            if (admin == null)
            {
                _logger.LogWarning("Unauthorized delete attempt by non-admin ID {AdminID}", adminID);
                return Unauthorized(new { message = "Only admins can delete locations." });
            }

            var location = await _context.UserSubmittedLocations.FindAsync(id);
            if (location == null)
                return NotFound(new { message = "Location not found." });

            try
            {
                _context.UserSubmittedLocations.Remove(location);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Location {LocationID} deleted by admin {AdminID}", id, adminID);
                return Ok(new { message = "Location deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting location {LocationID}", id);
                return StatusCode(500, new { message = "Failed to delete location. Please try again." });
            }
        }
    }

    // Request DTOs

    public class SubmitLocationRequest
    {
        public int UserID { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string Country { get; set; } = string.Empty;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? Category { get; set; }
        public string? ImageURL { get; set; }
    }

    public class VerifyLocationRequest
    {
        public int AdminID { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? RejectionReason { get; set; }
    }
}
