namespace backend.Models
{
    public class Booking
    {
        public int bookingID { get; set; }
        public int userID { get; set; }
        public int tourID { get; set; }
        public int curatedSpotID { get; set; }
        public string bookingType { get; set; }
        public string status { get; set; }
        public DateTime bookingDate { get; set; }
    }
}