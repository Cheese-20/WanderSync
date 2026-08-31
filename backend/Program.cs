//setup code 

using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using backend.Data;
using backend.Services;


var builder = WebApplication.CreateBuilder(args);
try
{
    Env.Load(Path.Combine(builder.Environment.ContentRootPath, ".env"));
}
catch (Exception)
{
    // .env parsing failed — fall through to appsettings.json
}


//  Grab the connection string from environment or configuration (appsettings.json or environment)
var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__WanderSyncDb");
if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("PLACEHOLDER"))
{  
     connectionString = builder.Configuration.GetConnectionString("WanderSyncDb");
}

builder.WebHost.UseUrls("http://localhost:5200");

// Port information for axios requests from the frontend (Vite) to the backend (ASP.NET Core)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowViteApp", policy =>
    {
        //Accepts any port as long as it is localhost
        policy.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost") 
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<WanderSyncDbContext>(options =>
    // Use Pomelo MySQL provider with explicit server version
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 35)),
        mySqlOptions => {
            mySqlOptions.CommandTimeout(120);
            mySqlOptions.EnableRetryOnFailure();
        })
);

builder.Services.AddControllers();

// Register background service for booking reminders
builder.Services.AddHostedService<BookingReminderService>();

var app = builder.Build();

app.UseCors("AllowViteApp");

// Ensure database tables exist
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<WanderSyncDbContext>();
        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS `User` (
                `userID` int NOT NULL AUTO_INCREMENT,
                `firstName` longtext NOT NULL,
                `lastName` longtext NOT NULL,
                `email` longtext NOT NULL,
                `cellNumber` longtext NOT NULL,
                `age` int NOT NULL,
                `hashedPword` longtext NOT NULL,
                `role` longtext NOT NULL,
                `accountStatus` longtext NOT NULL,
                PRIMARY KEY (`userID`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS `Profile` (
                `pID` int NOT NULL AUTO_INCREMENT,
                `userID` int NOT NULL,
                `profilePictureLink` longtext NOT NULL,
                `interests` longtext NOT NULL,
                `createdAt` datetime(6) NOT NULL,
                `description` longtext NOT NULL,
                `location` longtext NOT NULL,
                PRIMARY KEY (`pID`),
                UNIQUE KEY `IX_Profile_userID` (`userID`),
                CONSTRAINT `FK_Profile_User_userID` FOREIGN KEY (`userID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS `Matches` (
                `matchID` int NOT NULL AUTO_INCREMENT,
                `requesterID` int NOT NULL,
                `receiverID` int NOT NULL,
                `commonInterests` longtext NULL,
                `status` longtext NOT NULL,
                `dateMatched` datetime(6) NOT NULL,
                PRIMARY KEY (`matchID`),
                CONSTRAINT `FK_Matches_Requester` FOREIGN KEY (`requesterID`) REFERENCES `User` (`userID`) ON DELETE CASCADE,
                CONSTRAINT `FK_Matches_Receiver` FOREIGN KEY (`receiverID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS `Tours` (
                `tourID` int NOT NULL AUTO_INCREMENT,
                `guideID` int NOT NULL,
                `title` varchar(100) NOT NULL,
                `type` varchar(50) NOT NULL,
                `description` longtext NOT NULL,
                `date` datetime(6) NOT NULL,
                `maxPeople` int NOT NULL,
                PRIMARY KEY (`tourID`),
                CONSTRAINT `FK_Tours_Guide` FOREIGN KEY (`guideID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        context.Database.ExecuteSqlRaw("DROP TABLE IF EXISTS `Notifications`;");

        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS `Notifications` (
                `notificationID` int NOT NULL AUTO_INCREMENT,
                `userID` int NOT NULL,
                `type` longtext NOT NULL,
                `message` longtext NOT NULL,
                `isRead` tinyint(1) NOT NULL DEFAULT 0,
                `createdAt` datetime(6) NOT NULL,
                `scheduledFor` datetime(6) NULL,
                `relatedEntityID` int NULL,
                PRIMARY KEY (`notificationID`),
                CONSTRAINT `FK_Notifications_User` FOREIGN KEY (`userID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS `Posts` (
                `postID` int NOT NULL AUTO_INCREMENT,
                `userID` int NOT NULL,
                `content` longtext NOT NULL,
                `pictureURL` longtext NULL,
                `experienceType` varchar(50) NOT NULL,
                `createdAt` datetime(6) NOT NULL,
                `updatedAt` datetime(6) NOT NULL,
                PRIMARY KEY (`postID`),
                CONSTRAINT `FK_Posts_User` FOREIGN KEY (`userID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS `SpotVotes` (
                `voteID` int NOT NULL AUTO_INCREMENT,
                `spotID` int NOT NULL,
                `guideID` int NOT NULL,
                `voteType` varchar(50) NOT NULL,
                `votedAt` datetime(6) NOT NULL,
                PRIMARY KEY (`voteID`),
                CONSTRAINT `FK_SpotVotes_Spot` FOREIGN KEY (`spotID`) REFERENCES `curatedSpots` (`spotID`) ON DELETE CASCADE,
                CONSTRAINT `FK_SpotVotes_Guide` FOREIGN KEY (`guideID`) REFERENCES `User` (`userID`) ON DELETE CASCADE,
                UNIQUE KEY `IX_SpotVotes_UniqueVote` (`spotID`, `guideID`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS `GuideApplication` (
                `applicationID` int NOT NULL AUTO_INCREMENT,
                `IDno` bigint NOT NULL,
                `reason` longtext NULL,
                `loaction` varchar(100) NULL,
                `bio` varchar(250) NULL,
                `userID` int NOT NULL,
                PRIMARY KEY (`applicationID`),
                CONSTRAINT `FK_GuideApplication_User` FOREIGN KEY (`userID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        try { context.Database.ExecuteSqlRaw("ALTER TABLE `GuideApplication` ADD COLUMN `loaction` varchar(100) NULL;"); } catch { }
        try { context.Database.ExecuteSqlRaw("ALTER TABLE `GuideApplication` MODIFY COLUMN `IDno` bigint NOT NULL;"); } catch { }

        string[] profileColumnSqls = new[]
        {
            "ALTER TABLE `Tours` ADD COLUMN `location` longtext NULL;",
            "ALTER TABLE `Tours` ADD COLUMN `price` decimal(18,2) NOT NULL DEFAULT 0;",
            "ALTER TABLE `Tours` ADD COLUMN `pictureURL` longtext NULL;",
            // ADD COLUMN above is a no-op once the column exists, so it never corrects an
            // older narrow type. Widen it explicitly - cover photos are stored as base64 data URLs.
            "ALTER TABLE `Tours` MODIFY COLUMN `pictureURL` longtext NULL;",
            "ALTER TABLE `Tours` MODIFY COLUMN `location` longtext NULL;",
            "ALTER TABLE `Profile` ADD COLUMN `profilePictureLink` longtext NULL;",
            "ALTER TABLE `Profile` ADD COLUMN `interests` longtext NULL;",
            "ALTER TABLE `Profile` ADD COLUMN `createdAt` datetime(6) NULL;",
            "ALTER TABLE `Profile` ADD COLUMN `description` longtext NULL;",
            "ALTER TABLE `Profile` ADD COLUMN `location` longtext NULL;",
            "ALTER TABLE `Profile` ADD COLUMN `job` longtext NULL;",
            "ALTER TABLE `Posts` ADD COLUMN `pictureURL` longtext NULL;",
            "ALTER TABLE `Posts` MODIFY COLUMN `pictureURL` longtext NULL;",
            "ALTER TABLE `Posts` ADD COLUMN `experienceType` varchar(50) NOT NULL DEFAULT 'Individual';"
        };

        foreach (var sql in profileColumnSqls)
        {
            try { context.Database.ExecuteSqlRaw(sql); } catch { }
        }

        string[] notificationColumnSqls = new[]
        {
            "ALTER TABLE `Notifications` ADD COLUMN `userID` int NOT NULL DEFAULT 0;",
            "ALTER TABLE `Notifications` ADD COLUMN `type` longtext NULL;",
            "ALTER TABLE `Notifications` ADD COLUMN `message` longtext NULL;",
            "ALTER TABLE `Notifications` ADD COLUMN `isRead` tinyint(1) NOT NULL DEFAULT 0;",
            "ALTER TABLE `Notifications` ADD COLUMN `createdAt` datetime(6) NULL;",
            "ALTER TABLE `Notifications` ADD COLUMN `scheduledFor` datetime(6) NULL;",
            "ALTER TABLE `Notifications` ADD COLUMN `relatedEntityID` int NULL;"
        };

        foreach (var sql in notificationColumnSqls)
        {
            try { 
                context.Database.ExecuteSqlRaw(sql); 
                Console.WriteLine("SUCCESS: " + sql);
            } 
            catch (Exception ex) { 
                Console.WriteLine("FAIL: " + sql + " ERROR: " + ex.Message);
            }
        }

        string[] curatedSpotsColumnSqls = new[]
        {
            "ALTER TABLE `curatedSpots` ADD COLUMN `pictureURL` longtext NULL;",
            "ALTER TABLE `curatedSpots` ADD COLUMN `submittedByUserID` int NULL;",
            "ALTER TABLE `curatedSpots` ADD COLUMN `submittedAt` datetime(6) NULL;",
            "ALTER TABLE `curatedSpots` MODIFY COLUMN `isVerified` varchar(50) DEFAULT 'pending';"
        };

        foreach (var sql in curatedSpotsColumnSqls)
        {
            try { 
                context.Database.ExecuteSqlRaw(sql); 
                Console.WriteLine("SUCCESS: " + sql);
            } 
            catch (Exception ex) { 
                Console.WriteLine("FAIL: " + sql + " ERROR: " + ex.Message);
            }
        }

        string[] indexSqls = new[]
        {
            "CREATE INDEX `IX_Matches_Status` ON `Matches` (`status`);",
            "CREATE INDEX `IX_Message_MatchID` ON `Message` (`matchID`);",
            "CREATE INDEX `IX_Message_SentAt` ON `Message` (`sentAt`);"
        };
        
        foreach (var sql in indexSqls)
        {
            try { 
                context.Database.ExecuteSqlRaw(sql); 
                Console.WriteLine("SUCCESS: " + sql);
            } 
            catch (Exception ex) { 
                // Ignore if index already exists
                Console.WriteLine("FAIL (Expected if exists): " + sql + " ERROR: " + ex.Message);
            }
        }

        // Add 5 dummy verified spots for Local Favourites
        Console.WriteLine("INFO: Attempting to seed dummy local favourites...");
        try {
            var insertDummySpotsSql = @"
                INSERT IGNORE INTO `curatedSpots` (`spotID`, `activityName`, `activityType`, `location`, `description`, `isVerified`, `pictureURL`, `submittedAt`) 
                VALUES 
                (9001, 'Sunset Kayaking', 'Water Sports', 'V&A Waterfront', 'Enjoy a beautiful sunset kayaking experience with views of Table Mountain. Suitable for all skill levels.', 'approved', 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=600', NOW()),
                (9002, 'Hidden Rooftop Cafe', 'Dining', 'City Center', 'A secret cafe with the best coffee and panoramic views of the city. Try their signature pastries.', 'approved', 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=600', NOW()),
                (9003, 'Mountain Bike Trail', 'Adventure', 'Table Mountain', 'An exhilarating trail through the lower slopes of Table Mountain. Bike rentals available at the start.', 'approved', 'https://images.unsplash.com/photo-1574768395574-8b6a38612ff0?w=600', NOW()),
                (9004, 'Kalk Bay Harbor Walk', 'Culture', 'Kalk Bay', 'Explore the vibrant working harbor, see the local seals, and enjoy fresh fish and chips by the sea.', 'approved', 'https://images.unsplash.com/photo-1580509653855-66795f7004f1?w=600', NOW()),
                (9005, 'Boulders Beach Penguins', 'Nature', 'Simon''s Town', 'Get up close with the famous African penguin colony at Boulders Beach. A must-see for animal lovers.', 'approved', 'https://images.unsplash.com/photo-1586071853637-231cb489e27c?w=600', NOW());
            ";
            context.Database.ExecuteSqlRaw(insertDummySpotsSql);
            Console.WriteLine("SUCCESS: Inserted 5 dummy spots (or skipped if already exist)");
        } catch (Exception e) {
            Console.WriteLine("FAIL: Could not insert dummy spots. ERROR: " + e.Message);
        }

        // Add 5 dummy tours for "Tours happening lately" (with future dates)
        Console.WriteLine("INFO: Attempting to seed dummy tours...");
        try {
            // Use INSERT IGNORE with high IDs so they don't conflict with existing tours
            // and won't duplicate on restart. Using guideID=21 (existing Test Guide user).
            var insertDummyToursSql = @"
                INSERT IGNORE INTO `Tours` (`tourID`, `guideID`, `title`, `type`, `description`, `date`, `maxPeople`, `price`, `location`, `pictureURL`)
                VALUES
                (9001, 21, 'Table Mountain Sunrise Hike', 'Adventure', 'Start your day with a breathtaking sunrise hike up Table Mountain via the Platteklip Gorge route. Witness the golden hour painting Cape Town in warm light as you reach the summit. Suitable for intermediate fitness levels.', '2026-09-05 05:30:00', 12, 350.00, 'Cape Town', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600'),
                (9002, 21, 'Bo-Kaap Cultural Walking Tour', 'Cultural', 'Explore the vibrant streets of Bo-Kaap, one of Cape Town''s most iconic neighbourhoods. Learn about the rich Cape Malay heritage, sample traditional koeksisters, and capture stunning photos of the colourful houses.', '2026-09-12 10:00:00', 20, 200.00, 'Bo-Kaap, Cape Town', 'https://images.unsplash.com/photo-1588828195558-cf25e7e8d248?w=600'),
                (9003, 21, 'Cape Winelands Tasting Experience', 'Food & Wine', 'Journey through the picturesque Stellenbosch and Franschhoek wine valleys. Visit three award-winning estates for tastings of world-class wines paired with artisan cheeses and charcuterie.', '2026-09-20 09:00:00', 8, 750.00, 'Stellenbosch', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600'),
                (9004, 21, 'Shark Cage Diving Adventure', 'Adventure', 'Face your fears with an unforgettable shark cage diving experience in Gansbaai, the Great White Shark capital of the world. All equipment and safety briefings included. Lunch on board.', '2026-10-03 07:00:00', 10, 1800.00, 'Gansbaai', 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=600'),
                (9005, 21, 'Kirstenbosch Botanical Garden Tour', 'Nature', 'Discover the stunning biodiversity of Kirstenbosch National Botanical Garden. Walk the famous Tree Canopy Walkway, explore the fragrance garden, and learn about unique fynbos species from an expert botanist guide.', '2026-09-28 14:00:00', 15, 180.00, 'Newlands, Cape Town', 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=600');
            ";
            context.Database.ExecuteSqlRaw(insertDummyToursSql);
            Console.WriteLine("SUCCESS: Inserted 5 dummy tours (or skipped if already exist)");
        } catch (Exception e) {
            Console.WriteLine("FAIL: Could not insert dummy tours. ERROR: " + e.Message);
        }



        // Ensure Reviews table exists for guide ratings
        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS `Reviews` (
                `reviewID` int NOT NULL AUTO_INCREMENT,
                `reviewerID` int NOT NULL,
                `guideID` int NOT NULL,
                `rating` int NOT NULL,
                `comment` text NULL,
                `sentAt` datetime(6) NOT NULL,
                PRIMARY KEY (`reviewID`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        // Ensure Bookings table exists
        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS `Bookings` (
                `bookingID` int NOT NULL AUTO_INCREMENT,
                `userID` int NOT NULL,
                `tourID` int NOT NULL,
                `curatedSpotID` int NOT NULL DEFAULT 0,
                `numberOfGuests` int NOT NULL DEFAULT 1,
                `bookingType` longtext NOT NULL,
                `status` longtext NOT NULL,
                `bookingDate` datetime(6) NOT NULL,
                `timeOfBooking` longtext NOT NULL,
                PRIMARY KEY (`bookingID`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        // Backfill Bookings columns on databases created before they were added.
        // Both are required by backend.Models.Booking and selected by BookingsController,
        // so a missing column breaks the bookings queries (and the Rate Guide UI that depends on them).
        string[] bookingsColumnSqls = new[]
        {
            "ALTER TABLE `Bookings` ADD COLUMN `numberOfGuests` int NOT NULL DEFAULT 1;",
            "ALTER TABLE `Bookings` ADD COLUMN `curatedSpotID` int NOT NULL DEFAULT 0;",
            // Added nullable first so it succeeds on tables with existing rows,
            // then filled and tightened to match the non-nullable model property.
            "ALTER TABLE `Bookings` ADD COLUMN `timeOfBooking` longtext NULL;",
            "UPDATE `Bookings` SET `timeOfBooking` = '' WHERE `timeOfBooking` IS NULL;",
            "ALTER TABLE `Bookings` MODIFY COLUMN `timeOfBooking` longtext NOT NULL;"
        };

        foreach (var sql in bookingsColumnSqls)
        {
            try
            {
                context.Database.ExecuteSqlRaw(sql);
                Console.WriteLine("SUCCESS: " + sql);
            }
            catch (Exception ex)
            {
                Console.WriteLine("SKIP: " + sql + " REASON: " + ex.Message);
            }
        }
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred initializing the database tables.");
    }
}

// Configure the HTTP request pipeline
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        var message = error?.Error?.Message ?? "An unexpected error occurred.";
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(error?.Error, "Unhandled exception");
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new { message }));
    });
});

app.MapControllers();

app.Run();