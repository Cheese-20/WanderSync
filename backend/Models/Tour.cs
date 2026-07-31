using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Tours")]
    public class Tour
    {
        [Key]
        [Column("tourID")]
        public int TourId { get; set; }
        
        [Column("guideID")]
        public int GuideId { get; set; }
        
        [Column("title")]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;
        
        [Column("type")]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;
        
        [Column("description")]
        public string Description { get; set; } = string.Empty;
        
        [Column("date")]
        public DateTime Date { get; set; }
        
        [Column("maxPeople")]
        public int MaxPeople { get; set; }
    }
}
