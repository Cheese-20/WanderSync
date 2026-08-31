using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Matches")]
    public class UserMatch
    {
        [Key]
        [Column("matchID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MatchID { get; set; }

        [Column("requesterID")]
        public int RequesterID { get; set; }

        [Column("receiverID")]
        public int ReceiverID { get; set; }

        [Column("commonInterests")]
        public string? CommonInterests { get; set; }

        [Column("status")]
        public string Status { get; set; } = string.Empty; // "pending", "accepted", "rejected"

        [Column("dateMatched")]
        public DateTime DateMatched { get; set; }

        [Column("requesterName")] // In DB this was requester or similar, I'll keep it as requesterName for now unless it errors. Wait, the error was "m.receiverName", meaning receiverName definitely failed. I will change it to recieverN.
        [MaxLength(100)]
        public string? RequesterName { get; set; }

        [Column("requesterSurname")]
        [MaxLength(100)]
        public string? RequesterSurname { get; set; }

        [Column("recieverName")]
        [MaxLength(100)]
        public string? ReceiverName { get; set; }

        [Column("recieverSurname")]
        [MaxLength(100)]
        public string? ReceiverSurname { get; set; }

        // Navigation properties
        [ForeignKey("RequesterID")]
        public User? Requester { get; set; }

        [ForeignKey("ReceiverID")]
        public User? Receiver { get; set; }
    }
}
