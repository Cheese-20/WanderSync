namespace backend.Models
{
    public class Booking
    {
        public int bookingID { get; set; }
        public int userID { get; set; }
        public int tourID { get; set; }
        public int curatedSpotID { get; set; }
        public int numberOfGuests { get; set; }
        public string bookingType { get; set; } = string.Empty;
        public string status { get; set; } = "Pending";
        public DateTime bookingDate { get; set; }
        public string timeOfBooking { get; set; } = string.Empty;

        // Denormalized fields
        [System.ComponentModel.DataAnnotations.Schema.Column("userName")]
        public string? userName { get; set; }
        
        public string? userSurname { get; set; }
        
        [System.ComponentModel.DataAnnotations.Schema.Column("tourName")]
        public string? tourName { get; set; }
        
        public string? tourLocation { get; set; }
    }
}