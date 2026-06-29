using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

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
    }
}