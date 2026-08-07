//setup code 

using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using backend.Data;


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
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 35)))
);

builder.Services.AddControllers();

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


        string[] profileColumnSqls = new[]
        {
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