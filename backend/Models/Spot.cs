using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Spots")]
    public class Spot
    {
        [Key]
        [Column("spotID")]
        public int SpotID { get; set; }

        [Column("activityName")]
        [MaxLength(100)]
        public string ActivityName { get; set; } = string.Empty;

        [Column("activityType")]
        [MaxLength(50)]
        public string? ActivityType { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("location")]
        [MaxLength(255)]
        public string? Location { get; set; }

        [Column("isVerified")]
        [MaxLength(50)]
        public string? IsVerified { get; set; }

        [Column("pictureURL")]
        public string? PictureURL { get; set; }

        [Column("submittedByUserID")]
        public int SubmittedByUserID { get; set; }

        [Column("submittedAt")]
        public DateTime? SubmittedAt { get; set; }

        [ForeignKey("SubmittedByUserID")]
        public User SubmittedByUser { get; set; }
    }
}
