using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("SpotRatings")]
    public class SpotRating
    {
        [Key]
        [Column("ratingID")]
        public int RatingID { get; set; }

        [Column("spotID")]
        public int SpotID { get; set; }

        [Column("userID")]
        public int UserID { get; set; }

        [Column("ratingScore")]
        public int RatingScore { get; set; }

        [Column("reviewText")]
        public string? ReviewText { get; set; }

        [Column("submittedAt")]
        public DateTime SubmittedAt { get; set; }

        [ForeignKey("SpotID")]
        public Spot Spot { get; set; }

        [ForeignKey("UserID")]
        public User User { get; set; }
    }
}
