using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CuratedSpotsController : ControllerBase
    {
        private readonly WanderSyncDbContext _context;

        public CuratedSpotsController(WanderSyncDbContext context)
        {
            _context = context;
        }

        // GET: api/CuratedSpots
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CuratedSpot>>> GetCuratedSpots()
        {
            return await _context.CuratedSpots.ToListAsync();
        }

        // POST: api/CuratedSpots
        [HttpPost]
        public async Task<ActionResult<CuratedSpot>> PostCuratedSpot(CuratedSpot spot)
        {
            spot.IsVerified = false; // Default to pending for new submissions

            _context.CuratedSpots.Add(spot);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCuratedSpots), new { id = spot.SpotID }, spot);
        }
    }
}
