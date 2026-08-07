using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;

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

        [HttpGet]
        public async Task<IActionResult> GetPosts()
        {
            var posts = await _context.Posts
                .Join(_context.Users, 
                      p => p.UserID, 
                      u => u.UserID, 
                      (p, u) => new {
                          postID = p.PostID,
                          userID = p.UserID,
                          content = p.Content,
                          pictureURL = p.PictureURL,
                          createdAt = p.CreatedAt,
                          updatedAt = p.UpdatedAt,
                          experienceType = p.ExperienceType,
                          firstName = u.FirstName,
                          lastName = u.LastName
                      })
                .OrderByDescending(p => p.createdAt)
                .ToListAsync();
            return Ok(posts);
        }

        [HttpPost]
        public async Task<ActionResult<Post>> CreatePost(Post post)
        {
            post.CreatedAt = DateTime.UtcNow;
            post.UpdatedAt = DateTime.UtcNow;

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPosts), new { id = post.PostID }, post);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(int id, Post updatedPost)
        {
            if (id != updatedPost.PostID)
            {
                return BadRequest();
            }

            var existingPost = await _context.Posts.FindAsync(id);
            if (existingPost == null)
            {
                return NotFound();
            }

            existingPost.Content = updatedPost.Content;
            existingPost.ExperienceType = updatedPost.ExperienceType;
            if (updatedPost.PictureURL != null) 
            {
                existingPost.PictureURL = updatedPost.PictureURL;
            }
            existingPost.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PostExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            // Return the updated post so frontend can easily use it
            return Ok(existingPost);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                return NotFound();
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PostExists(int id)
        {
            return _context.Posts.Any(e => e.PostID == id);
        }
    }
}
