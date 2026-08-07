using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("GuideApplication")]
    public class LocalGuideApplication
    {
        [Key]
        [Column("applicationID")]
        public int ApplicationID { get; set; }

        [Column("IDno")]
        public int IDno { get; set; }

        [Column("reason")]
        public string? Reason { get; set; }

        [Column("loaction")]
        [StringLength(100)]
        public string? Location { get; set; }

        [Column("bio")]
        [StringLength(250)]
        public string? Bio { get; set; }

        [Column("userID")]
        public int UserID { get; set; }

        [ForeignKey("UserID")]
        public User? User { get; set; }
    }
}
