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

        // FK to curatedSpots (ON DELETE CASCADE) so votes are removed with their spot
        // instead of being left orphaned.
        [ForeignKey("SpotID")]
        public CuratedSpot? CuratedSpot { get; set; }
    }
}
