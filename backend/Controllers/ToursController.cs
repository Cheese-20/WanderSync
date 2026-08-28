using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ToursController : ControllerBase
    {
        private readonly WanderSyncDbContext _context;

        public ToursController(WanderSyncDbContext context)
        {
            _context = context;
        }



        // GET: api/Tours/guide/5
        [HttpGet("guide/{guideId}")]
        public async Task<ActionResult<IEnumerable<Tour>>> GetToursByGuide(int guideId)
        {
            // Private rows (one-on-one requests, custom itineraries) exist only to carry a
            // single booking, so they are not part of the guide's published experiences.
            return await _context.Tours
                .Where(t => t.GuideId == guideId && !TourTypes.Private.Contains(t.Type))
                .ToListAsync();
        }

        // GET: api/Tours/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Tour>> GetTour(int id)
        {
            var tour = await _context.Tours.FindAsync(id);

            if (tour == null)
            {
                return NotFound();
            }

            return tour;
        }

        // GET: api/tours
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAllTours()
        {
            var toursWithGuides = await _context.Tours
                // Exclude private rows: nobody else can book someone's one-on-one session.
                .Where(t => !TourTypes.Private.Contains(t.Type))
                .Join(_context.Users, 
                      t => t.GuideId, 
                      u => u.UserID, 
                      (t, u) => new { t, u })
                .GroupJoin(_context.Bookings,
                           tu => tu.t.TourId,
                           b => b.tourID,
                           (tu, bookings) => new {
                               tourId = tu.t.TourId, 
                               title = tu.t.Title, 
                               description = tu.t.Description, 
                               date = tu.t.Date, 
                               price = tu.t.Price, 
                               maxPeople = tu.t.MaxPeople, 
                               type = tu.t.Type, 
                               pictureURL = tu.t.PictureURL, 
                               location = tu.t.Location,
                               guideID = tu.t.GuideId,
                               guideName = tu.u.FirstName + " " + tu.u.LastName,
                               confirmedBookingsCount = bookings.Where(b => b.status.ToLower() == "accepted").Sum(b => (int?)b.numberOfGuests) ?? 0
                           })
                .ToListAsync();
            return Ok(toursWithGuides);
        }

        // POST: api/Tours
        [HttpPost]
        public async Task<IActionResult> CreateTour([FromBody] CreateTourRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Request body is required." });
            }

            if (request.GuideID <= 0)
            {
                return BadRequest(new { message = "Valid guideID is required." });
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest(new { message = "Title is required." });
            }

            if (request.Title.Trim().Length > 100)
            {
                return BadRequest(new { message = "Title must be 100 characters or fewer." });
            }

            if (string.IsNullOrWhiteSpace(request.Type))
            {
                return BadRequest(new { message = "Type is required." });
            }

            if (request.Type.Trim().Length > 50)
            {
                return BadRequest(new { message = "Type must be 50 characters or fewer." });
            }

            if (string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest(new { message = "Description is required." });
            }

            if (request.Date == default)
            {
                return BadRequest(new { message = "Date is required." });
            }

            if (request.Date.Date < DateTime.UtcNow.Date)
            {
                return BadRequest(new { message = "Date cannot be in the past." });
            }

            if (request.MaxPeople < 1)
            {
                return BadRequest(new { message = "Max people must be at least 1." });
            }

            if (request.Price < 0)
            {
                return BadRequest(new { message = "Price cannot be negative." });
            }

            // Only an approved guide may create an activity
            var guide = await _context.Users
                .FirstOrDefaultAsync(u => u.UserID == request.GuideID && u.Role == "Guide");

            if (guide == null)
            {
                return BadRequest(new { message = "Only registered local guides can add an activity." });
            }

            try
            {
                var tour = new Tour
                {
                    GuideId = request.GuideID,
                    Title = request.Title.Trim(),
                    Type = request.Type.Trim(),
                    Description = request.Description.Trim(),
                    Date = request.Date,
                    MaxPeople = request.MaxPeople,
                    Price = request.Price,
                    PictureURL = string.IsNullOrWhiteSpace(request.PictureURL) ? null : request.PictureURL,
                    Location = string.IsNullOrWhiteSpace(request.Location) ? null : request.Location.Trim()
                };

                _context.Tours.Add(tour);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Activity added successfully!",
                    tourId = tour.TourId,
                    guideID = tour.GuideId,
                    title = tour.Title,
                    type = tour.Type,
                    description = tour.Description,
                    date = tour.Date,
                    maxPeople = tour.MaxPeople,
                    price = tour.Price,
                    pictureURL = tour.PictureURL,
                    location = tour.Location
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = $"Failed to add activity: {ex.InnerException?.Message ?? ex.Message}"
                });
            }
        }

        // PUT: api/Tours/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTour(int id, Tour tour)
        {
            if (id != tour.TourId)
            {
                return BadRequest();
            }

            _context.Entry(tour).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TourExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Activity updated successfully!" });
        }

        // DELETE: api/Tours/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTour(int id)
        {
            var tour = await _context.Tours.FindAsync(id);
            if (tour == null)
            {
                return NotFound();
            }

            _context.Tours.Remove(tour);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Activity deleted successfully!" });
        }

        private bool TourExists(int id)
        {
            return _context.Tours.Any(e => e.TourId == id);
        }
    }

    public class CreateTourRequest
    {
        public int GuideID { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int MaxPeople { get; set; }
        public decimal Price { get; set; }
        public string? PictureURL { get; set; }
        public string? Location { get; set; }
    }
}
