using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("SpotReports")]
    public class SpotReport
    {
        [Key]
        [Column("spotReportID")]
        public int SpotReportID { get; set; }

        [Column("spotID")]
        public int SpotID { get; set; }

        [Column("reporterID")]
        public int ReporterID { get; set; }

        [Column("reason")]
        public string Reason { get; set; } = string.Empty;

        [Column("sentAt")]
        public DateTime? SentAt { get; set; }

        [ForeignKey("SpotID")]
        public Spot Spot { get; set; }

        [ForeignKey("ReporterID")]
        public User Reporter { get; set; }
    }
}
