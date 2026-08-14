using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Reviews")]
    public class GuideRating
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("reviewID")]
        public int RatingId { get; set; }

        [Column("reviewerID")]
        public int UserId { get; set; }

        [Column("guideID")]
        public int GuideId { get; set; }

        [Column("rating")]
        [Range(1, 5)]
        public int Score { get; set; }

        [Column("comment")]
        public string? Comment { get; set; }

        [Column("sentAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
