using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("LocalGuideApplication")]
    public class LocalGuideApplication
    {
        [Key]
        [Column("appID")]
        public int AppID { get; set; }

        [Column("userID")]
        public int UserId { get; set; }

        [Column("firstName")]
        public string FirstName { get; set; } = string.Empty;

        [Column("lastName")]
        public string LastName { get; set; } = string.Empty;

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("phoneNumber")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Column("age")]
        public int Age { get; set; }

        [Column("idNumber")]
        public string IdNumber { get; set; } = string.Empty;

        [Column("location")]
        public string Location { get; set; } = string.Empty;

        [Column("experience")]
        public string Experience { get; set; } = string.Empty;

        [Column("reason")]
        public string Reason { get; set; } = string.Empty;

        [Column("activityCount")]
        public int ActivityCount { get; set; }

        /// <summary>Raw bytes of the uploaded profile image (use cloud storage URL in production).</summary>
        [Column("profileImageData")]
        public byte[]? ProfileImageData { get; set; }

        /// <summary>Raw bytes of the uploaded ID copy (use cloud storage URL in production).</summary>
        [Column("idCopyData")]
        public byte[]? IdCopyData { get; set; }

        /// <summary>Pending | Approved | Rejected</summary>
        [Column("status")]
        public string Status { get; set; } = "Pending";

        [Column("submittedAt")]
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
