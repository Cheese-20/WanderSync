using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Tour
    {
        [Key]
        public int TourId { get; set; }
        
        public int GuideId { get; set; }
        
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public DateTime Date { get; set; }
        
        public int MaxPeople { get; set; }
    }
}
