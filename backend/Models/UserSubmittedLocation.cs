using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("UserSubmittedLocations")]
    public class UserSubmittedLocation
    {
        [Key]
        [Column("locationID")]
        public int LocationID { get; set; }

        [Column("userID")]
        public int UserID { get; set; }

        [Column("locationName")]
        public string LocationName { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("address")]
        public string Address { get; set; } = string.Empty;

        [Column("city")]
        public string City { get; set; } = string.Empty;

        [Column("country")]
        public string Country { get; set; } = string.Empty;

        [Column("latitude")]
        public double? Latitude { get; set; }

        [Column("longitude")]
        public double? Longitude { get; set; }

        [Column("category")]
        public string Category { get; set; } = string.Empty;

        [Column("imageURL")]
        public string? ImageURL { get; set; }

        /// <summary>
        /// Status of the location submission: Pending, Approved, Rejected
        /// </summary>
        [Column("status")]
        public string Status { get; set; } = "Pending";

        /// <summary>
        /// The admin ID who verified/rejected this location (null if still pending)
        /// </summary>
        [Column("verifiedByAdminID")]
        public int? VerifiedByAdminID { get; set; }

        /// <summary>
        /// Optional reason provided by admin when rejecting a location
        /// </summary>
        [Column("rejectionReason")]
        public string? RejectionReason { get; set; }

        [Column("submittedAt")]
        public DateTime SubmittedAt { get; set; }

        [Column("verifiedAt")]
        public DateTime? VerifiedAt { get; set; }
    }
}
