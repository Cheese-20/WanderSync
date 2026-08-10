using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Reports")]
    public class Report
    {
        [Key]
        [Column("reportID")]
        public int ReportID { get; set; }

        [Column("reporterID")]
        public int ReporterID { get; set; }

        [Column("reportedUserID")]
        public int ReportedUserID { get; set; }

        [Column("reason")]
        public string Reason { get; set; } = string.Empty;

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";

        [Column("sentAt")]
        public DateTime? SentAt { get; set; }

        [ForeignKey("ReportedUserID")]
        public User ReportedUser { get; set; }

        [ForeignKey("ReporterID")]
        public User Reporter { get; set; }
    }
}
