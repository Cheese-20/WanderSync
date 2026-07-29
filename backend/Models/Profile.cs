using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
    [Table("Profile")]
    [Index(nameof(UserID), IsUnique = true)]
    public class Profile
    {
        [Key]
        [Column("pID")]
        public int PID { get; set; }

        [Column("userID")]
        public int UserID { get; set; }

        [Column("profilePictureLink")]
        public string? ProfilePictureLink { get; set; }

        [Column("interests")]
        public string? Interests { get; set; }

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("location")]
        public string? Location { get; set; }

        [ForeignKey("UserID")]
        public User User { get; set; }
    }
}
