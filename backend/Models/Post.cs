using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Posts")]
    public class Post
    {
        [Key]
        [Column("postID")]
        public int PostID { get; set; }

        [Column("userID")]
        public int UserID { get; set; }

        [Column("content")]
        public string Content { get; set; }

        [Column("pictureURL")]
        public string PictureURL { get; set; }

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; }

        [Column("updatedAt")]
        public DateTime UpdatedAt { get; set; }

        [Column("experienceType")]
        public string ExperienceType { get; set; }

        [Column("userName")]
        [MaxLength(100)]
        public string? UserName { get; set; }

        [Column("userSurname")]
        [MaxLength(100)]
        public string? UserSurname { get; set; }

        /// <summary>
        /// JSON array of user IDs who are tagged as co-contributors on a Group post.
        /// e.g. "[1, 5, 12]". Tagged users may edit this post.
        /// </summary>
        [Column("taggedUsers")]
        public string? TaggedUsers { get; set; }

        /// <summary>
        /// JSON array of user IDs who clicked "I Was There" on a Group post.
        /// e.g. "[3, 7]". These users attended but were not the original poster.
        /// </summary>
        [Column("alsoAttended")]
        public string? AlsoAttended { get; set; }
    }
}
