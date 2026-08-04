using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Notifications")]
    public class Notification
    {
        [Key]
        [Column("notificationID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int NotificationID { get; set; }

        [Column("userID")]
        public int UserID { get; set; }

        [Column("type")]
        public string Type { get; set; } = string.Empty;

        [Column("message")]
        public string Message { get; set; } = string.Empty;

        [Column("isRead")]
        public bool IsRead { get; set; } = false;

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("scheduledFor")]
        public DateTime? ScheduledFor { get; set; }

        [Column("relatedEntityID")]
        public int? RelatedEntityID { get; set; }
    }
}
