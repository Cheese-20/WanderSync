using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using BCrypt.Net;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Added "api/" prefix which is standard for separating frontend from backend routes
    public class AuthController : ControllerBase 
    {
        private const int MinAge = 12;
        private const int MaxAge = 150;
        private const int MinPasswordLength = 8;

        private readonly ILogger<AuthController> _logger;
        private readonly WanderSyncDbContext _context;

        /// <summary>
        /// Returns null when the password is strong enough, otherwise advice naming
        /// the requirements it fails to meet.
        /// </summary>
        private static string? DescribeWeakPassword(string? password)
        {
            var value = password ?? string.Empty;
            var missing = new List<string>();

            if (value.Length < MinPasswordLength) missing.Add($"at least {MinPasswordLength} characters");
            if (!value.Any(char.IsUpper)) missing.Add("one uppercase letter");
            if (!value.Any(c => !char.IsLetterOrDigit(c))) missing.Add("one special character");

            if (missing.Count == 0) return null;

            return $"Please use a strong password with at least {MinPasswordLength} characters, "
                 + $"one uppercase letter and one special character. Yours is missing: {string.Join(", ", missing)}.";
        }

        // Inject BOTH the logger and your database context here
        public AuthController(ILogger<AuthController> logger, WanderSyncDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            _logger.LogInformation($"Attempting to register user: {model.Email}");

            // 1. Validate Passwords Match
            if (model.Password != model.ConfirmPassword)
            {
                _logger.LogWarning("Registration failed: Passwords do not match.");
                return BadRequest("Passwords do not match.");
            }

            // 1a. Validate age range (mirrors the client-side check, which is bypassable)
            if (model.Age < MinAge || model.Age > MaxAge)
            {
                _logger.LogWarning($"Registration failed: age {model.Age} outside {MinAge}-{MaxAge}.");
                return BadRequest(model.Age < MinAge
                    ? $"You must be at least {MinAge} years old to create an account."
                    : $"Please enter a valid age between {MinAge} and {MaxAge}.");
            }

            // 1b. Validate password strength
            var passwordProblem = DescribeWeakPassword(model.Password);
            if (passwordProblem != null)
            {
                _logger.LogWarning("Registration failed: password does not meet strength requirements.");
                return BadRequest(passwordProblem);
            }

            // 2. Check for existing email in MySQL
            if (_context.Users.Any(u => u.Email == model.Email))
            {
                _logger.LogWarning($"Registration failed: Email {model.Email} already in use.");
                return BadRequest("An account with this email already exists.");
            }

            // 3. Hash the password
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);

            // 4. Map the incoming data to your User entity
            var newUser = new User 
            {
                FirstName = model.Name,
                LastName = model.Surname,
                Email = model.Email,
                CellNumber = model.PhoneNumber, 
                Age = model.Age,
                HashedPword = passwordHash,     // Maps the hashed password to MySQL 'hashedPword'
                Role = "Explorer",                  // Default role for new signups
                AccountStatus = "Active"        // Default status for new signups
            };

            // 5. Save to database
            try
            {
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"User {model.Email} registered successfully.");
                return Ok(new { message = "User registered successfully!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while saving the user to the database.");
                return StatusCode(500, "Internal server error during registration.");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            _logger.LogInformation($"Attempting login for {model.Email}");

            if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest("Email and password are required.");
            }

            string providedUsername = model.Email;
            
            // Normalize email to username if it ends with @wandersync.com
            if (providedUsername.EndsWith("@wandersync.com", StringComparison.OrdinalIgnoreCase))
            {
                providedUsername = providedUsername.Substring(0, providedUsername.IndexOf("@"));
            }

            if (providedUsername.StartsWith("s", StringComparison.OrdinalIgnoreCase) && !providedUsername.Contains("@"))
            {
                var adminQueryUsername = providedUsername + "@wandersync.com";
                var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Username == adminQueryUsername);
                if (admin != null)
                {
                    _logger.LogInformation($"Admin DB password: '{admin.HashedPassword}', Provided: '{model.Password}'");
                    // Admin passwords are not hashed according to schema requirements
                    if (admin.HashedPassword == model.Password)
                    {
                        var returnedRole = "admin";
                        var adminToken = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{admin.Username}:{Guid.NewGuid()}"));
                        return Ok(new
                        {
                            message = "Login successful",
                            token = adminToken,
                            user = new
                            {
                                id = admin.AdminID,
                                email = admin.Username,
                                name = "Admin",
                                surname = "User",
                                role = returnedRole
                            }
                        });
                    }
                    else
                    {
                        return Unauthorized("Invalid email or password.");
                    }
                }
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            bool passwordMatches = BCrypt.Net.BCrypt.Verify(model.Password, user.HashedPword);
            if (!passwordMatches)
            {
                return Unauthorized("Invalid email or password.");
            }

            if (string.Equals(model.Role, "guide", StringComparison.OrdinalIgnoreCase) && 
                !string.Equals(user.Role, "guide", StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized(new { message = "There is no record of you being a local guide please try again later or login as an explorer" });
            }

            var token = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{user.Email}:{Guid.NewGuid()}") );

            return Ok(new
            {
                message = "Login successful",
                token,
                user = new
                {
                    id = user.UserID,
                    email = user.Email,
                    name = user.FirstName,
                    surname = user.LastName,
                    role = user.Role
                }
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest model)
        {
            _logger.LogInformation($"Password reset attempt for {model.Email}");

            if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.NewPassword))
            {
                return BadRequest(new { message = "Email and new password are required." });
            }

            if (model.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "Password must be at least 6 characters." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
            {
                return NotFound(new { message = "No account found with that email." });
            }

            user.HashedPword = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);

            try
            {
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Password reset successful for {model.Email}");
                return Ok(new { message = "Password reset successfully! You can now sign in." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password.");
                return StatusCode(500, new { message = "Failed to reset password. Please try again." });
            }
        }

        /// <summary>
        /// DELETE /api/auth/account/{userId}
        /// Permanently deletes the user account and all associated data (cascaded by DB).
        /// Requires the user's current password as a final confirmation guard.
        /// </summary>
        [HttpDelete("account/{userId}")]
        public async Task<IActionResult> DeleteAccount(int userId, [FromBody] DeleteAccountRequest request)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound(new { message = "Account not found." });

                // Re-verify password as a server-side safeguard against accidental deletion
                if (string.IsNullOrWhiteSpace(request.Password) ||
                    !BCrypt.Net.BCrypt.Verify(request.Password, user.HashedPword))
                {
                    return Unauthorized(new { message = "Incorrect password. Account was not deleted." });
                }

                // Removing the User row cascades to all child tables:
                // Profile, Posts, Bookings, Matches, Notifications, Messages,
                // GuideApplication, SpotVotes, AccountReports, etc.
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Account {UserId} permanently deleted.", userId);
                return Ok(new { message = "Your account has been permanently deleted." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting account {UserId}.", userId);
                return StatusCode(500, new { message = "An error occurred while deleting your account. Please try again." });
            }
        }
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class DeleteAccountRequest
    {
        public string Password { get; set; } = string.Empty;
    }
}