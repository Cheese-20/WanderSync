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
            var profiles = await _context.Profiles
                .Where(p => p.CreatedAt >= since)
                .Join(_context.Users,
                    profile => profile.UserID,
                    user => user.UserID,
                    (profile, user) => new
                    {
                        user.UserID,
                        user.FirstName,
                        user.LastName,
                        user.Email,
                        user.Role,
                        profile.Location,
                        profile.CreatedAt
                    })
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(new { reportType = "New Profiles Created", period = $"Last {days} days", count = profiles.Count, data = profiles });
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
            var activeUsers = await _context.Users
                .Where(u => u.AccountStatus == "Active")
                .Select(u => new
                {
                    u.UserID,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.Role,
                    u.AccountStatus
                })
                .ToListAsync();

            return Ok(new { reportType = "Active Users", count = activeUsers.Count, data = activeUsers });
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

        // ========== ANALYTICS REPORTS ==========
        //
        // The three reports below are written as raw SQL rather than LINQ because they rely
        // on window functions (RANK, LAG, DENSE_RANK, running totals), which EF Core cannot
        // translate. They are deliberately kept in this controller instead of being
        // registered as keyless entity types on WanderSyncDbContext, so that a merge which
        // rewrites the DbContext cannot silently break them.
        //
        // No user-supplied string ever reaches these queries. The only inputs are integers,
        // which are parsed and clamped in C# before being interpolated. MySQL drivers are
        // inconsistent about accepting placeholders inside LIMIT and INTERVAL, so clamped
        // integers are substituted directly.

        /// <summary>
        /// Guide performance leaderboard.
        ///
        /// Replaces the previous "top guides" report, which returned an arbitrary ten guides
        /// with no ordering and never read the Reviews table despite being labelled
        /// "Top Rated".
        ///
        /// Ranking uses a Bayesian (shrunk) mean rather than a raw average. A guide with a
        /// single five star review would otherwise outrank a guide averaging 4.6 over thirty
        /// reviews. Each guide's average is pulled toward the platform mean in proportion to
        /// how few reviews they have, using a confidence constant of 3.
        /// </summary>
        [HttpGet("reports/guide-leaderboard")]
        public async Task<IActionResult> GetGuideLeaderboard([FromQuery] int limit = 20)
        {
            var take = Math.Clamp(limit, 1, 100);
            const decimal confidence = 3m; // reviews needed before a guide's own average dominates

            var sql = $@"
WITH review_stats AS (
    SELECT guideID,
           COUNT(*)                                     AS reviewCount,
           AVG(rating)                                  AS avgRating,
           SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) AS positiveReviews,
           MAX(sentAt)                                  AS lastReviewAt
    FROM Reviews
    GROUP BY guideID
),
tour_stats AS (
    SELECT guideID,
           COUNT(*)       AS tourCount,
           AVG(price)     AS avgPrice,
           SUM(maxPeople) AS totalCapacity
    FROM Tours
    GROUP BY guideID
),
booking_stats AS (
    SELECT t.guideID,
           COUNT(b.bookingID)                           AS bookingCount,
           COUNT(DISTINCT b.userID)                     AS uniqueTravellers,
           COALESCE(SUM(b.numberOfGuests), 0)           AS totalGuests,
           COALESCE(SUM(b.numberOfGuests * t.price), 0) AS grossRevenue,
           -- Real status values in this database are Accepted, Confirmed, Pending,
           -- Declined and Cancelled. Declined and Cancelled both count as lost business.
           SUM(CASE WHEN LOWER(b.status) IN ('accepted', 'confirmed')
                    THEN 1 ELSE 0 END)                  AS acceptedBookings,
           SUM(CASE WHEN LOWER(b.status) = 'pending'
                    THEN 1 ELSE 0 END)                  AS pendingBookings,
           SUM(CASE WHEN LOWER(b.status) IN ('cancelled', 'declined')
                    THEN 1 ELSE 0 END)                  AS lostBookings,
           -- Revenue actually realised, as opposed to gross demand.
           COALESCE(SUM(CASE WHEN LOWER(b.status) IN ('accepted', 'confirmed')
                             THEN b.numberOfGuests * t.price ELSE 0 END), 0)
                                                        AS confirmedRevenue,
           MAX(b.bookingDate)                           AS lastBookingAt
    FROM Bookings b
    JOIN Tours t ON t.tourID = b.tourID
    GROUP BY t.guideID
),
global_mean AS (
    SELECT COALESCE(AVG(rating), 0) AS meanRating FROM Reviews
),
metrics AS (
    SELECT u.userID, u.firstName, u.lastName, u.email, u.accountStatus,
           p.location,
           COALESCE(ts.tourCount, 0)              AS tourCount,
           ROUND(COALESCE(ts.avgPrice, 0), 2)     AS avgPrice,
           COALESCE(ts.totalCapacity, 0)          AS totalCapacity,
           COALESCE(bs.bookingCount, 0)           AS bookingCount,
           COALESCE(bs.uniqueTravellers, 0)       AS uniqueTravellers,
           COALESCE(bs.totalGuests, 0)            AS totalGuests,
           ROUND(COALESCE(bs.grossRevenue, 0), 2) AS grossRevenue,
           ROUND(COALESCE(bs.confirmedRevenue, 0), 2) AS confirmedRevenue,
           COALESCE(bs.acceptedBookings, 0)       AS acceptedBookings,
           COALESCE(bs.pendingBookings, 0)        AS pendingBookings,
           COALESCE(bs.lostBookings, 0)           AS lostBookings,
           ROUND(100.0 * COALESCE(bs.acceptedBookings, 0)
                 / NULLIF(bs.bookingCount, 0), 1) AS acceptanceRate,
           ROUND(100.0 * COALESCE(bs.lostBookings, 0)
                 / NULLIF(bs.bookingCount, 0), 1) AS lostRate,
           bs.lastBookingAt,
           COALESCE(rs.reviewCount, 0)            AS reviewCount,
           ROUND(rs.avgRating, 2)                 AS avgRating,
           COALESCE(rs.positiveReviews, 0)        AS positiveReviews,
           rs.lastReviewAt,
           ROUND(
                 (COALESCE(rs.reviewCount, 0) / (COALESCE(rs.reviewCount, 0) + {confidence}))
                     * COALESCE(rs.avgRating, gm.meanRating)
               + ({confidence} / (COALESCE(rs.reviewCount, 0) + {confidence}))
                     * gm.meanRating
           , 3)                                   AS weightedRating,
           (SELECT COUNT(*) FROM Reports r
             WHERE r.reportedUserID = u.userID
               AND LOWER(r.status) = 'pending')    AS pendingReports
    FROM User u
    LEFT JOIN Profile      p  ON p.userID   = u.userID
    LEFT JOIN review_stats  rs ON rs.guideID = u.userID
    LEFT JOIN tour_stats    ts ON ts.guideID = u.userID
    LEFT JOIN booking_stats bs ON bs.guideID = u.userID
    CROSS JOIN global_mean gm
    WHERE LOWER(u.role) = 'guide'
)
SELECT m.*,
       RANK() OVER (ORDER BY m.weightedRating DESC,
                             m.grossRevenue   DESC,
                             m.totalGuests    DESC)                       AS rankPosition,
       ROUND(100.0 * m.grossRevenue
             / NULLIF(SUM(m.grossRevenue) OVER (), 0), 1)                 AS revenueSharePct,
       ROUND(AVG(m.weightedRating) OVER (), 3)                            AS platformAvgRating,
       SUM(m.bookingCount) OVER ()                                        AS platformBookings
FROM metrics m
ORDER BY rankPosition, m.lastName
LIMIT {take};";

            var data = await QueryRawAsync(sql);

            return Ok(new
            {
                reportType = "Guide Performance Leaderboard",
                method = "Bayesian weighted rating (confidence constant 3) ranked by RANK() window function",
                count = data.Count,
                data
            });
        }

        /// <summary>
        /// Executes a read-only query and returns rows as column name / value maps.
        ///
        /// The shape returned by the leaderboard query is wide and changes with the SQL, so
        /// mapping it onto a fixed DTO would mean maintaining the column list in two places.
        /// The connection belongs to the DbContext and so is deliberately not disposed here.
        /// </summary>
        private async Task<List<Dictionary<string, object?>>> QueryRawAsync(string sql)
        {
            var rows = new List<Dictionary<string, object?>>();
            var connection = _context.Database.GetDbConnection();

            if (connection.State != System.Data.ConnectionState.Open)
                await connection.OpenAsync();

            await using var command = connection.CreateCommand();
            command.CommandText = sql;
            command.CommandTimeout = 120;

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var row = new Dictionary<string, object?>(reader.FieldCount);
                for (var i = 0; i < reader.FieldCount; i++)
                {
                    var value = reader.GetValue(i);
                    row[reader.GetName(i)] = value is DBNull ? null : value;
                }
                rows.Add(row);
            }

            return rows;
        }

        // ========== APPLICATIONS ==========

        [HttpGet("applications")]
        public async Task<IActionResult> GetGuideApplications()
        {
            var rows = await _context.LocalGuideApplications
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

            // The IDno column is a bigint, so IDs starting with 0 (anyone born in the 2000s)
            // lose that digit in storage. Pad it back so admins always see all 13 digits.
            var applications = rows.Select(a => new
            {
                a.ApplicationID,
                a.UserID,
                a.userName,
                a.email,
                IDno = a.IDno.ToString().PadLeft(13, '0'),
                a.Reason,
                a.Location,
                a.Bio
            }).ToList();

            return Ok(applications);
        }

        [HttpPatch("applications/{id}/approve")]
        public async Task<IActionResult> ApproveApplication(int id)
        {
            var application = await _context.LocalGuideApplications
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.ApplicationID == id);

            if (application == null)
                return NotFound("Application not found.");

            // Update the user's role to Guide
            application.User.Role = "Guide";

            // The Reviews table has a foreign key on guideID pointing at TravelGuide(userID),
            // so the guide subtype row has to be created here or reviews for this guide
            // will fail to insert later on.
            var isAlreadyTravelGuide = await _context.TravelGuides
                .AnyAsync(g => g.UserID == application.UserID);
            if (!isAlreadyTravelGuide)
                _context.TravelGuides.Add(new TravelGuide { UserID = application.UserID });

            // Create a notification for the applicant about their successful application
            var notification = new Notification
            {
                UserID = application.UserID,
                Type = "ApplicationApproved",
                Message = "Congratulations! Your application to become a local guide has been accepted. You are now registered as a local guide.",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(notification);

            // Remove the application after approval
            _context.LocalGuideApplications.Remove(application);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Application approved. User role updated to Guide. Applicant has been notified." });
        }

        [HttpDelete("applications/{id}/reject")]
        public async Task<IActionResult> RejectApplication(int id)
        {
            var application = await _context.LocalGuideApplications
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.ApplicationID == id);

            if (application == null)
                return NotFound("Application not found.");

            // Create a notification for the applicant about their unsuccessful application
            var notification = new Notification
            {
                UserID = application.UserID,
                Type = "ApplicationRejected",
                Message = "We regret to inform you that your application to become a local guide has been unsuccessful.",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(notification);

            // Permanently delete the application
            _context.LocalGuideApplications.Remove(application);

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
                Type = "AccountSuspended",
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

        // Spot moderation reads the real curatedSpots table via the CuratedSpots DbSet.
        // The Spot entity maps to a `Spots` table that does not exist in this database, so
        // it cannot be used here. The submitter name is joined from Users manually because
        // CuratedSpot has no navigation property.
        [HttpGet("reported-spots")]
        public async Task<IActionResult> GetReportedSpots()
        {
            var reportedSpotIds = await _context.SpotReports
                .Select(sr => sr.SpotID)
                .Distinct()
                .ToListAsync();

            var spots = await (from s in _context.CuratedSpots
                               where reportedSpotIds.Contains(s.SpotID)
                               join u in _context.Users on s.SubmittedByUserID equals u.UserID into ug
                               from u in ug.DefaultIfEmpty()
                               select new
                               {
                                   s.SpotID,
                                   s.ActivityName,
                                   s.ActivityType,
                                   s.Location,
                                   s.IsVerified,
                                   s.PictureURL,
                                   s.SubmittedAt,
                                   submittedByName = u != null ? u.FirstName + " " + u.LastName : "Unknown",
                                   reportCount = _context.SpotReports.Count(sr => sr.SpotID == s.SpotID)
                               })
                               .OrderByDescending(s => s.reportCount)
                               .ToListAsync();

            return Ok(spots);
        }

        [HttpGet("reported-spots/{id}")]
        public async Task<IActionResult> GetReportedSpotDetail(int id)
        {
            var spot = await _context.CuratedSpots.FirstOrDefaultAsync(s => s.SpotID == id);

            if (spot == null)
                return NotFound("Spot not found.");

            var submittedByName = "Unknown";
            if (spot.SubmittedByUserID.HasValue)
            {
                var submitter = await _context.Users.FindAsync(spot.SubmittedByUserID.Value);
                if (submitter != null)
                    submittedByName = submitter.FirstName + " " + submitter.LastName;
            }

            var reportCount = await _context.SpotReports.CountAsync(sr => sr.SpotID == id);
            var reports = await (from sr in _context.SpotReports
                                 where sr.SpotID == id
                                 join u in _context.Users on sr.ReporterID equals u.UserID into rg
                                 from u in rg.DefaultIfEmpty()
                                 orderby sr.SentAt descending
                                 select new
                                 {
                                     sr.SpotReportID,
                                     reporterName = u != null ? u.FirstName + " " + u.LastName : "Unknown",
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
                submittedByName,
                spot.SubmittedAt,
                reportCount,
                reports
            });
        }

        [HttpPatch("reported-spots/{id}/flag")]
        public async Task<IActionResult> FlagSpot(int id)
        {
            var spot = await _context.CuratedSpots.FirstOrDefaultAsync(s => s.SpotID == id);

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
            var spot = await _context.CuratedSpots.FirstOrDefaultAsync(s => s.SpotID == id);

            if (spot == null)
                return NotFound("Spot not found.");

            var reportCount = await _context.SpotReports.CountAsync(sr => sr.SpotID == id);

            if (reportCount <= 5)
                return BadRequest("A spot must have more than 5 reports to be deleted.");

            // The FK from SpotReports to curatedSpots is ON DELETE CASCADE, so the child
            // reports are removed automatically when the spot row goes.
            _context.CuratedSpots.Remove(spot);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Spot has been permanently deleted.", spotID = id });
        }
    }
}
