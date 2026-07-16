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
        private readonly ILogger<AuthController> _logger;
        private readonly WanderSyncDbContext _context;

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
                CellNumber = model.PhoneNumber, // Maps the React 'PhoneNumber' to MySQL 'cellNumber'
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
    }
    }