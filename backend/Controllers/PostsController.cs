using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;
using System.Text.Json;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly WanderSyncDbContext _context;

        public PostsController(WanderSyncDbContext context)
        {
            _context = context;
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        /// <summary>Returns the list of tagged user IDs from a post's TaggedUsers JSON string.</summary>
        private static List<int> ParseIds(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new List<int>();
            try { return JsonSerializer.Deserialize<List<int>>(json) ?? new List<int>(); }
            catch { return new List<int>(); }
        }

        /// <summary>
        /// Returns true if the requesting user has edit rights on the post.
        /// Individual posts → author only.
        /// Group posts → author OR any tagged user.
        /// </summary>
        private static bool CanEdit(Post post, int userId)
        {
            if (post.UserID == userId) return true;
            if (string.Equals(post.ExperienceType, "Group", StringComparison.OrdinalIgnoreCase))
            {
                return ParseIds(post.TaggedUsers).Contains(userId);
            }
            return false;
        }

        // ── Endpoints ──────────────────────────────────────────────────────────

        /// <summary>GET /api/posts — returns all posts with author info and tagged/alsoAttended arrays.</summary>
        [HttpGet]
        public async Task<IActionResult> GetPosts()
        {
            var posts = await _context.Posts
                .Join(_context.Users,
                      p => p.UserID,
                      u => u.UserID,
                      (p, u) => new { p, u })
                .GroupJoin(_context.Profiles,
                           pu => pu.u.UserID,
                           pr => pr.UserID,
                           (pu, prs) => new { pu.p, pu.u, prs })
                .SelectMany(
                    x => x.prs.DefaultIfEmpty(),
                    (x, profile) => new {
                          postID       = x.p.PostID,
                          userID       = x.p.UserID,
                          content      = x.p.Content,
                          pictureURL   = x.p.PictureURL,
                          createdAt    = x.p.CreatedAt,
                          updatedAt    = x.p.UpdatedAt,
                          experienceType = x.p.ExperienceType,
                          taggedUsers  = x.p.TaggedUsers,
                          alsoAttended = x.p.AlsoAttended,
                          firstName    = x.u.FirstName,
                          lastName     = x.u.LastName,
                          userAvatar   = profile != null ? profile.ProfilePictureLink : null
                    }
                )
                .OrderByDescending(p => p.createdAt)
                .ToListAsync();
            return Ok(posts);
        }

        /// <summary>
        /// GET /api/posts/matches/{userId}
        /// Returns accepted matches for a user — used to populate the Group tag picker.
        /// </summary>
        [HttpGet("matches/{userId}")]
        public async Task<IActionResult> GetMatchesForUser(int userId)
        {
            var matches = await _context.Matches
                .Where(m => (m.RequesterID == userId || m.ReceiverID == userId)
                         && m.Status.ToLower() == "accepted")
                .Join(_context.Users,
                      m => m.RequesterID == userId ? m.ReceiverID : m.RequesterID,
                      u => u.UserID,
                      (m, u) => new { u.UserID, u.FirstName, u.LastName })
                .GroupJoin(_context.Profiles,
                           mu => mu.UserID,
                           pr => pr.UserID,
                           (mu, prs) => new { mu, prs })
                .SelectMany(x => x.prs.DefaultIfEmpty(),
                            (x, profile) => new {
                                userId    = x.mu.UserID,
                                firstName = x.mu.FirstName,
                                lastName  = x.mu.LastName,
                                avatar    = profile != null ? profile.ProfilePictureLink : null
                            })
                .Distinct()
                .ToListAsync();

            return Ok(matches);
        }

        /// <summary>POST /api/posts — create a new post.</summary>
        [HttpPost]
        public async Task<ActionResult<Post>> CreatePost(Post post)
        {
            post.CreatedAt = DateTime.UtcNow;
            post.UpdatedAt = DateTime.UtcNow;

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPosts), new { id = post.PostID }, post);
        }

        /// <summary>
        /// PUT /api/posts/{id} — update a post.
        /// Requires userId in body. Only the author (Individual) or the author / tagged users (Group) can edit.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] PostUpdateRequest req)
        {
            var existingPost = await _context.Posts.FindAsync(id);
            if (existingPost == null) return NotFound();

            if (!CanEdit(existingPost, req.UserID))
                return StatusCode(403, new { message = "You do not have permission to edit this post." });

            existingPost.Content       = req.Content;
            existingPost.ExperienceType = req.ExperienceType ?? existingPost.ExperienceType;
            if (req.PictureURL != null)
                existingPost.PictureURL = req.PictureURL;
            if (req.TaggedUsers != null)
                existingPost.TaggedUsers = req.TaggedUsers;
            existingPost.UpdatedAt = DateTime.UtcNow;

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!PostExists(id)) return NotFound();
                throw;
            }

            return Ok(existingPost);
        }

        /// <summary>
        /// PUT /api/posts/{id}/also-attended — lets a matched user mark themselves as "I Was There".
        /// Only works on Group posts. Prevents duplicates and prevents the author from adding themselves.
        /// </summary>
        [HttpPut("{id}/also-attended")]
        public async Task<IActionResult> MarkAlsoAttended(int id, [FromBody] AlsoAttendedRequest req)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound();

            if (!string.Equals(post.ExperienceType, "Group", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Only Group posts support 'I Was There'." });

            if (post.UserID == req.UserID)
                return BadRequest(new { message = "You are the author of this post." });

            // Verify the user is a match of the author
            bool isMatch = await _context.Matches.AnyAsync(m =>
                m.Status.ToLower() == "accepted" &&
                ((m.RequesterID == post.UserID && m.ReceiverID == req.UserID) ||
                 (m.ReceiverID  == post.UserID && m.RequesterID == req.UserID)));

            if (!isMatch)
                return StatusCode(403, new { message = "You must be matched with the author to use this feature." });

            var attended = ParseIds(post.AlsoAttended);
            if (attended.Contains(req.UserID))
                return BadRequest(new { message = "You have already marked yourself as attended." });

            attended.Add(req.UserID);
            post.AlsoAttended = JsonSerializer.Serialize(attended);
            post.UpdatedAt    = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { alsoAttended = post.AlsoAttended });
        }

        /// <summary>DELETE /api/posts/{id} — only the original author can delete.</summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id, [FromQuery] int userId)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound();

            if (post.UserID != userId)
                return StatusCode(403, new { message = "Only the original author can delete this post." });

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PostExists(int id) => _context.Posts.Any(e => e.PostID == id);
    }

    // ── Request DTOs ───────────────────────────────────────────────────────────

    public class PostUpdateRequest
    {
        public int    UserID         { get; set; }
        public string Content        { get; set; } = string.Empty;
        public string? ExperienceType { get; set; }
        public string? PictureURL    { get; set; }
        public string? TaggedUsers   { get; set; }
    }

    public class AlsoAttendedRequest
    {
        public int UserID { get; set; }
    }
}
