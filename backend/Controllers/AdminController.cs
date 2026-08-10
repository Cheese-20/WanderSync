using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly WanderSyncDbContext _context;

        public AdminController(WanderSyncDbContext context)
        {
            _context = context;
        }

        // ========== OVERVIEW REPORTS ==========

        [HttpGet("reports/new-profiles")]
        public async Task<IActionResult> GetNewProfilesCount([FromQuery] int days = 30)
        {
            var since = DateTime.UtcNow.AddDays(-days);
            var count = await _context.Profiles
                .Where(p => p.CreatedAt >= since)
                .CountAsync();

            return Ok(new { reportType = "New Profiles Created", period = $"Last {days} days", count });
        }

        [HttpGet("reports/reported-accounts")]
        public async Task<IActionResult> GetReportedAccountsCount()
        {
            var count = await _context.Reports.CountAsync();
            var pending = await _context.Reports.Where(r => r.Status == "Pending").CountAsync();

            return Ok(new { reportType = "Reported Accounts", total = count, pending });
        }

        [HttpGet("reports/active-users")]
        public async Task<IActionResult> GetActiveUsersCount()
        {
            var count = await _context.Users
                .Where(u => u.AccountStatus == "Active")
                .CountAsync();

            return Ok(new { reportType = "Active Users", count });
        }

        [HttpGet("reports/top-experiences")]
        public async Task<IActionResult> GetTopRatedExperiences()
        {
            var topExperiences = await _context.Tours
                .OrderByDescending(t => t.TourId)
                .Take(10)
                .Select(t => new
                {
                    t.TourId,
                    t.Title,
                    t.Type,
                    t.Description,
                    t.Date,
                    t.GuideId
                })
                .ToListAsync();

            return Ok(new { reportType = "Top Rated Experiences", data = topExperiences });
        }

        [HttpGet("reports/top-guides")]
        public async Task<IActionResult> GetTopRatedGuides()
        {
            var topGuides = await _context.Users
                .Where(u => u.Role == "Guide")
                .Join(_context.Profiles,
                    user => user.UserID,
                    profile => profile.UserID,
                    (user, profile) => new
                    {
                        user.UserID,
                        user.FirstName,
                        user.LastName,
                        user.Email,
                        profile.Location,
                        profile.Description
                    })
                .Take(10)
                .ToListAsync();

            return Ok(new { reportType = "Top Rated Local Guides", data = topGuides });
        }

        // ========== APPLICATIONS ==========

        [HttpGet("applications")]
        public async Task<IActionResult> GetGuideApplications()
        {
            var applications = await _context.GuideApplications
                .Include(a => a.User)
                .OrderByDescending(a => a.ApplicationID)
                .Select(a => new
                {
                    a.ApplicationID,
                    a.UserID,
                    userName = a.User.FirstName + " " + a.User.LastName,
                    email = a.User.Email,
                    a.IDno,
                    a.Reason,
                    a.Location,
                    a.Bio
                })
                .ToListAsync();

            return Ok(applications);
        }

        [HttpPatch("applications/{id}/approve")]
        public async Task<IActionResult> ApproveApplication(int id)
        {
            var application = await _context.GuideApplications
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.ApplicationID == id);

            if (application == null)
                return NotFound("Application not found.");

            // Update the user's role to Guide
            application.User.Role = "Guide";

            // Create a notification for the applicant about their successful application
            var notification = new Notification
            {
                UserID = application.UserID,
                Title = "Application Successful",
                Message = "Congratulations! Your application to become a local guide has been accepted. You are now registered as a local guide.",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(notification);

            // Remove the application after approval
            _context.GuideApplications.Remove(application);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Application approved. User role updated to Guide. Applicant has been notified." });
        }

        [HttpDelete("applications/{id}/reject")]
        public async Task<IActionResult> RejectApplication(int id)
        {
            var application = await _context.GuideApplications
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.ApplicationID == id);

            if (application == null)
                return NotFound("Application not found.");

            // Create a notification for the applicant about their unsuccessful application
            var notification = new Notification
            {
                UserID = application.UserID,
                Title = "Application Unsuccessful",
                Message = "We regret to inform you that your application to become a local guide has been unsuccessful.",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(notification);

            // Permanently delete the application
            _context.GuideApplications.Remove(application);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Application rejected and permanently deleted. Applicant has been notified." });
        }

        // ========== REPORTED ACCOUNTS ==========

        [HttpGet("reported-accounts")]
        public async Task<IActionResult> GetReportedAccounts()
        {
            var reports = await _context.Reports
                .Include(r => r.ReportedUser)
                .Include(r => r.Reporter)
                .OrderByDescending(r => r.SentAt)
                .Select(r => new
                {
                    r.ReportID,
                    r.ReportedUserID,
                    reportedUserName = r.ReportedUser.FirstName + " " + r.ReportedUser.LastName,
                    reportedUserEmail = r.ReportedUser.Email,
                    r.ReporterID,
                    reporterName = r.Reporter.FirstName + " " + r.Reporter.LastName,
                    r.Reason,
                    r.Status,
                    r.SentAt
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpPatch("reported-accounts/{id}/suspend")]
        public async Task<IActionResult> SuspendUser(int id)
        {
            var report = await _context.Reports
                .Include(r => r.ReportedUser)
                .FirstOrDefaultAsync(r => r.ReportID == id);

            if (report == null)
                return NotFound("Report not found.");

            // Suspend the user's account for 2 weeks
            report.ReportedUser.AccountStatus = "Suspended";
            report.ReportedUser.SuspendedUntil = DateTime.UtcNow.AddDays(14);

            // Update the report status to Resolved
            report.Status = "Resolved";

            // Notify the suspended user
            var notification = new Notification
            {
                UserID = report.ReportedUserID,
                Title = "Account Suspended",
                Message = "Your account has been suspended for 2 weeks due to a violation of our community guidelines. You will be able to log in again after " + DateTime.UtcNow.AddDays(14).ToString("dd MMMM yyyy") + ".",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            return Ok(new { message = "User account suspended for 2 weeks.", suspendedUntil = report.ReportedUser.SuspendedUntil });
        }

        [HttpDelete("reported-accounts/{id}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            var report = await _context.Reports
                .FirstOrDefaultAsync(r => r.ReportID == id);

            if (report == null)
                return NotFound("Report not found.");

            // Permanently delete the report
            _context.Reports.Remove(report);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Report deleted permanently." });
        }

        // ========== REPORTED SPOTS ==========

        [HttpGet("reported-spots")]
        public async Task<IActionResult> GetReportedSpots()
        {
            var reportedSpotIds = await _context.SpotReports
                .Select(sr => sr.SpotID)
                .Distinct()
                .ToListAsync();

            var spots = await _context.Spots
                .Where(s => reportedSpotIds.Contains(s.SpotID))
                .Include(s => s.SubmittedByUser)
                .Select(s => new
                {
                    s.SpotID,
                    s.ActivityName,
                    s.ActivityType,
                    s.Location,
                    s.IsVerified,
                    s.PictureURL,
                    s.SubmittedAt,
                    submittedByName = s.SubmittedByUser.FirstName + " " + s.SubmittedByUser.LastName,
                    reportCount = _context.SpotReports.Count(sr => sr.SpotID == s.SpotID)
                })
                .OrderByDescending(s => s.reportCount)
                .ToListAsync();

            return Ok(spots);
        }

        [HttpGet("reported-spots/{id}")]
        public async Task<IActionResult> GetReportedSpotDetail(int id)
        {
            var spot = await _context.Spots
                .Include(s => s.SubmittedByUser)
                .FirstOrDefaultAsync(s => s.SpotID == id);

            if (spot == null)
                return NotFound("Spot not found.");

            var reportCount = await _context.SpotReports.CountAsync(sr => sr.SpotID == id);
            var reports = await _context.SpotReports
                .Where(sr => sr.SpotID == id)
                .Include(sr => sr.Reporter)
                .OrderByDescending(sr => sr.SentAt)
                .Select(sr => new
                {
                    sr.SpotReportID,
                    reporterName = sr.Reporter.FirstName + " " + sr.Reporter.LastName,
                    sr.Reason,
                    sr.SentAt
                })
                .ToListAsync();

            return Ok(new
            {
                spot.SpotID,
                spot.ActivityName,
                spot.ActivityType,
                spot.Description,
                spot.Location,
                spot.IsVerified,
                spot.PictureURL,
                spot.SubmittedByUserID,
                submittedByName = spot.SubmittedByUser.FirstName + " " + spot.SubmittedByUser.LastName,
                spot.SubmittedAt,
                reportCount,
                reports
            });
        }

        [HttpPatch("reported-spots/{id}/flag")]
        public async Task<IActionResult> FlagSpot(int id)
        {
            var spot = await _context.Spots.FirstOrDefaultAsync(s => s.SpotID == id);

            if (spot == null)
                return NotFound("Spot not found.");

            var reportCount = await _context.SpotReports.CountAsync(sr => sr.SpotID == id);

            if (reportCount < 3)
                return BadRequest("A spot must have at least 3 reports to be flagged.");

            spot.IsVerified = "Flagged";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Spot has been flagged.", spotID = id, reportCount });
        }

        [HttpDelete("reported-spots/{id}")]
        public async Task<IActionResult> DeleteSpot(int id)
        {
            var spot = await _context.Spots.FirstOrDefaultAsync(s => s.SpotID == id);

            if (spot == null)
                return NotFound("Spot not found.");

            var reportCount = await _context.SpotReports.CountAsync(sr => sr.SpotID == id);

            if (reportCount <= 5)
                return BadRequest("A spot must have more than 5 reports to be deleted.");

            // Remove all reports for this spot
            var spotReports = await _context.SpotReports.Where(sr => sr.SpotID == id).ToListAsync();
            _context.SpotReports.RemoveRange(spotReports);

            // Remove the spot
            _context.Spots.Remove(spot);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Spot has been permanently deleted.", spotID = id });
        }
    }
}
