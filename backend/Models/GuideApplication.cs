using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("GuideApplication")]
    public class GuideApplication
    {
        [Key]
        [Column("applicationID")]
        public int ApplicationID { get; set; }

        [Column("IDno")]
        public int IDno { get; set; }

        [Column("reason")]
        public string? Reason { get; set; }

        [Column("loacation")]
        [MaxLength(100)]
        public string? Location { get; set; }

        [Column("bio")]
        [MaxLength(250)]
        public string? Bio { get; set; }

        [Column("userID")]
        public int UserID { get; set; }

        [ForeignKey("UserID")]
        public User User { get; set; }
    }
}
