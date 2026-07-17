using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using backend.Data;


Env.Load();

var builder = WebApplication.CreateBuilder(args);

//  Grab the connection string from configuration (appsettings.json or environment)
var connectionString = builder.Configuration.GetConnectionString("WanderSyncDb");
if (string.IsNullOrEmpty(connectionString))
{  
     connectionString = "ConnectionStrings__WanderSyncDb";
}


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
    options.UseMySQL(connectionString) 
);

builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline
app.MapControllers();

app.Run();