using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("User")] // EF core look for the "User" table
    public class User
    {
        [Key] //  Primary Key
        [Column("userID")]
        public int UserID { get; set; }

        [Column("firstName")]
        public string FirstName { get; set; }

        [Column("lastName")]
        public string LastName { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("cellNumber")]
        public string CellNumber { get; set; }

        [Column("age")]
        public int Age { get; set; }

        [Column("hashedPword")]
        public string HashedPword { get; set; }

        [Column("role")]
        public string Role { get; set; }

        [Column("accountStatus")]
        public string AccountStatus { get; set; }
    }
}