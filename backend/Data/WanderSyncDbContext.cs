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
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<UserMatch> Matches { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Tour> Tours { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Spot> Spots { get; set; }
        public DbSet<SpotReport> SpotReports { get; set; }
        public DbSet<CuratedSpot> CuratedSpots { get; set; }
        public DbSet<SpotVote> SpotVotes { get; set; }
        public DbSet<LocalGuideApplication> LocalGuideApplications { get; set; }
        public DbSet<UserSubmittedLocation> UserSubmittedLocations { get; set; }
        public DbSet<GuideRating> GuideRatings { get; set; }
        public DbSet<SpotRating> SpotRatings { get; set; }
        public DbSet<Admin> Admins { get; set; }
    }
}