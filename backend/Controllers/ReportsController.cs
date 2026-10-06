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
            int reporterId = dto.ReporterID > 0 ? dto.ReporterID : dto.ReporterId;
            int reportedUserId = dto.ReportedUserID > 0 ? dto.ReportedUserID : dto.ReportedUserId;

            if (reporterId <= 0 || reportedUserId <= 0)
                return BadRequest("Both reporterID and reportedUserID are required.");

            if (string.IsNullOrWhiteSpace(dto.Reason))
                return BadRequest("Please provide a reason for your report.");

            var report = new Report
            {
                ReporterID = reporterId,
                ReportedUserID = reportedUserId,
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
        public int ReporterId { get; set; }
        public int ReportedUserID { get; set; }
        public int ReportedUserId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
