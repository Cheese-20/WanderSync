using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Message")]
    public class Message
    {
        [Key]
        [Column("mID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MID { get; set; }

        [Column("matchID")]
        public int MatchID { get; set; }

        [Column("senderID")]
        public int SenderID { get; set; }

        [Column("receiverID")]
        public int ReceiverID { get; set; }

        [Column("textMessage")]
        public string TextMessage { get; set; } = string.Empty;

        [Column("sentAt")]
        public DateTime SentAt { get; set; }

        [Column("senderName")]
        [MaxLength(100)]
        public string? SenderName { get; set; }

        [Column("senderSurname")]
        [MaxLength(100)]
        public string? SenderSurname { get; set; }

        [Column("recieverName")]
        [MaxLength(100)]
        public string? ReceiverName { get; set; }

        [Column("recieverSurname")]
        [MaxLength(100)]
        public string? ReceiverSurname { get; set; }

        [Column("statusMatch")]
        [MaxLength(100)]
        public string? StatusMatch { get; set; }
    }
}
