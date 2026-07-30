using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class WanderSyncDbContext : DbContext
    {
        // This constructor passes the configuration down to the base Entity Framework class
        public WanderSyncDbContext(DbContextOptions<WanderSyncDbContext> options) 
            : base(options) 
        { 
        }

        //To add database tables below
        //Generic of DbSet is the model class that represents the table in the database

        public DbSet<User> Users { get; set; }
        public DbSet<Booking> Bookings { get; set; }
    }
}