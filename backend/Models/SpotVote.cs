using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class SpotVote
    {
        [Key]
        [Column("voteID")]
        public int VoteID { get; set; }

        [Column("spotID")]
        public int SpotID { get; set; }

        [Column("guideID")]
        public int GuideID { get; set; }

        [Column("voteType")]
        public string VoteType { get; set; } = string.Empty; // 'approve' or 'reject'
        
        [Column("votedAt")]
        public DateTime VotedAt { get; set; } = DateTime.UtcNow;

        [Column("spotName")]
        [MaxLength(100)]
        public string? SpotName { get; set; }

        [Column("spotLocation")]
        [MaxLength(100)]
        public string? SpotLocation { get; set; }

        [Column("guideName")]
        [MaxLength(100)]
        public string? GuideName { get; set; }

        [Column("guideSurname")]
        [MaxLength(100)]
        public string? GuideSurname { get; set; }
    }
}
