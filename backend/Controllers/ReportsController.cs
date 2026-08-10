using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly WanderSyncDbContext _context;

        public ReportsController(WanderSyncDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitReport([FromBody] ReportDto dto)
        {
            if (dto.ReporterID <= 0 || dto.ReportedUserID <= 0)
                return BadRequest("Both reporterID and reportedUserID are required.");

            if (string.IsNullOrWhiteSpace(dto.Reason))
                return BadRequest("Please provide a reason for your report.");

            var report = new Report
            {
                ReporterID = dto.ReporterID,
                ReportedUserID = dto.ReportedUserID,
                Reason = dto.Reason,
                Status = "Pending",
                SentAt = DateTime.UtcNow
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Report submitted successfully.", reportID = report.ReportID });
        }
    }

    public class ReportDto
    {
        public int ReporterID { get; set; }
        public int ReportedUserID { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
