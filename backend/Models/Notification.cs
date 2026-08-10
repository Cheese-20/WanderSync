using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Notification")]
    public class Notification
    {
        [Key]
        [Column("notificationID")]
        public int NotificationID { get; set; }

        [Column("userID")]
        public int UserID { get; set; }

        [Column("title")]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Column("message")]
        public string Message { get; set; } = string.Empty;

        [Column("isRead")]
        public bool IsRead { get; set; } = false;

        [Column("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserID")]
        public User User { get; set; }
    }
}
