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

        // Navigation properties
        [ForeignKey("RequesterID")]
        public User? Requester { get; set; }

        [ForeignKey("ReceiverID")]
        public User? Receiver { get; set; }
    }
}
