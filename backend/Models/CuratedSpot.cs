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
        [MaxLength(200)]
        public string? ActivityName { get; set; }

        [Column("activityType")]
        [MaxLength(50)]
        public string? ActivityType { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("location")]
        public string? Location { get; set; }

        [Column("isVerified")]
        public string IsVerified { get; set; } = "pending";

        [Column("pictureURL")]
        public string? PictureURL { get; set; }

        [Column("submittedByUserID")]
        public int? SubmittedByUserID { get; set; }

        [Column("submittedAt")]
        public DateTime? SubmittedAt { get; set; }
    }
}
