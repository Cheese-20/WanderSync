using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("curatedSpots")]
    public class CuratedSpot
    {
        [Key]
        [Column("spotID")]
        public int SpotID { get; set; }

        [Column("activityName")]
        public string ActivityName { get; set; } = string.Empty;
        
        [Column("activityType")]
        public string? ActivityType { get; set; }
        
        [Column("description")]
        public string? Description { get; set; }
        
        [Column("location")]
        public string? Location { get; set; }

        [Column("pictureURL")]
        public string? PictureURL { get; set; }
        
        [Column("submittedByUserID")]
        public int? SubmittedByUserID { get; set; }

        [Column("submittedAt")]
        public DateTime? SubmittedAt { get; set; }

        // pending, approved, rejected
        [Column("isVerified")]
        public string? IsVerified { get; set; } = "pending";
    }
}
