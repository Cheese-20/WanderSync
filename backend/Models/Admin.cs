using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Admin")]
    public class Admin
    {
        [Key]
        [Column("adminID")]
        public int AdminID { get; set; }
        
        [Column("username")]
        public string Username { get; set; } = string.Empty;
        
        [Column("hashedPassword")]
        public string HashedPassword { get; set; } = string.Empty;
    }
}

