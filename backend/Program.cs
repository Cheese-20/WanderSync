//setup code 

using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using backend.Data;


Env.Load();
var builder = WebApplication.CreateBuilder(args);

// 1. Grab the connection string from appsettings.json
var connectionString = builder.Configuration.GetConnectionString("WanderSyncDbContext");

// 2. Register the DbContext to use Pomelo MySQL
builder.Services.AddDbContext<WanderSyncDbContext>(options =>
    options.UseMySql(
        connectionString, 
        ServerVersion.AutoDetect(connectionString)
    ));

builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline
app.MapControllers();

app.Run();