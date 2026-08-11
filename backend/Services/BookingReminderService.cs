using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Services
{
    public class BookingReminderService : BackgroundService
    {
        private readonly ILogger<BookingReminderService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(60); // Check every hour

        public BookingReminderService(ILogger<BookingReminderService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Booking Reminder Background Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckForUpcomingBookings();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing BookingReminderService.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private async Task CheckForUpcomingBookings()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<WanderSyncDbContext>();
                
                // Target bookings that are exactly 1 day away (between 24h and 48h to catch all, but let's just do next 24h for simplicity)
                var tomorrow = DateTime.UtcNow.AddDays(1);
                var today = DateTime.UtcNow;

                var upcomingBookings = await context.Bookings
                    .Where(b => b.status == "Accepted" && b.bookingDate >= today && b.bookingDate <= tomorrow.AddDays(1))
                    .ToListAsync();

                foreach (var booking in upcomingBookings)
                {
                    var tour = await context.Tours.FindAsync(booking.tourID);
                    if (tour == null) continue;

                    // Check if reminder was already sent for tourist
                    bool touristNotified = await context.Notifications.AnyAsync(n => 
                        n.UserID == booking.userID && 
                        n.Type == "BookingReminder" && 
                        n.RelatedEntityID == booking.bookingID);

                    if (!touristNotified)
                    {
                        context.Notifications.Add(new Notification
                        {
                            UserID = booking.userID,
                            Type = "BookingReminder",
                            Message = $"Reminder: You have an upcoming booking for {tour.Title} on {booking.bookingDate.ToShortDateString()} at {booking.timeOfBooking}.",
                            RelatedEntityID = booking.bookingID
                        });
                    }

                    // Check if reminder was already sent for guide
                    bool guideNotified = await context.Notifications.AnyAsync(n => 
                        n.UserID == tour.GuideId && 
                        n.Type == "BookingReminder" && 
                        n.RelatedEntityID == booking.bookingID);

                    if (!guideNotified)
                    {
                        context.Notifications.Add(new Notification
                        {
                            UserID = tour.GuideId,
                            Type = "BookingReminder",
                            Message = $"Reminder: You have a tour to guide for {tour.Title} on {booking.bookingDate.ToShortDateString()} at {booking.timeOfBooking}.",
                            RelatedEntityID = booking.bookingID
                        });
                    }
                }

                await context.SaveChangesAsync();
            }
        }
    }
}
