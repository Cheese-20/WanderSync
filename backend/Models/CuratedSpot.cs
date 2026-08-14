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
        public string ActivityName { get; set; } = string.Empty;

        [Column("activityType")]
        [MaxLength(50)]
        public string ActivityType { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("location")]
        public string Location { get; set; } = string.Empty;

        [Column("isVerified")]
        public string IsVerified { get; set; } = "pending";
    }
}
