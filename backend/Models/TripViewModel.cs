// TripViewModel defines the shape of data passed from the backend to frontend views.
// In a full MVC backend, models like this help keep the shape of API responses explicit and testable.
namespace WanderSync.Backend.Models
{
    public class TripViewModel
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Destination { get; set; }
        public string DateLabel { get; set; }
        public string LeadGuide { get; set; }
        public string[] Participants { get; set; }
    }
}
