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

        // GET: api/Tours
        // Returns all tours with guide information
        [HttpGet]
        public async Task<IActionResult> GetAllTours()
        {
            var tours = await _context.Tours
                .Join(
                    _context.Users,
                    tour => tour.GuideId,
                    user => user.UserID,
                    (tour, user) => new
                    {
                        tourId = tour.TourId,
                        guideId = tour.GuideId,
                        title = tour.Title,
                        type = tour.Type,
                        description = tour.Description,
                        date = tour.Date,
                        maxPeople = tour.MaxPeople,
                        guideName = user.FirstName + " " + user.LastName
                    }
                )
                .ToListAsync();

            return Ok(tours);
        }

        // GET: api/Tours/guide/5
        [HttpGet("guide/{guideId}")]
        public async Task<ActionResult<IEnumerable<Tour>>> GetToursByGuide(int guideId)
        {
            return await _context.Tours.Where(t => t.GuideId == guideId).ToListAsync();
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
        public async Task<ActionResult<IEnumerable<Tour>>> GetAllTours()
        {
            return await _context.Tours.ToListAsync();
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
}
