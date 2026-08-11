namespace backend.Models
{
    public class Booking
    {
        public int bookingID { get; set; }
        public int userID { get; set; }
        public int tourID { get; set; }
        public int numberOfGuests { get; set; }
        public string bookingType { get; set; } = string.Empty;
        public string status { get; set; } = "Pending";
        public DateTime bookingDate { get; set; }
        public string timeOfBooking { get; set; } = string.Empty;
    }
}