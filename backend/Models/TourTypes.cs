namespace backend.Models
{
    /// <summary>
    /// Tour type values that carry meaning in code.
    ///
    /// A one-on-one booking reuses the existing Tour + Booking machinery by creating a
    /// private Tour row for that single request. Those rows must never show up in the
    /// public "browse tours" listings, so they are tagged with a known type and filtered out.
    /// </summary>
    public static class TourTypes
    {
        /// <summary>A private experience requested by one explorer with one guide.</summary>
        public const string OneOnOne = "OneOnOne";

        /// <summary>A guide-built itinerary for a single matched tourist.</summary>
        public const string CustomItinerary = "CustomItinerary";

        /// <summary>Types that back a single explorer and are not open for anyone to book.</summary>
        public static readonly string[] Private = { OneOnOne, CustomItinerary };
    }

    /// <summary>Values used for Booking.bookingType.</summary>
    public static class BookingTypes
    {
        public const string Tour = "Tour";
        public const string OneOnOne = "One-on-One";
        public const string Itinerary = "Itinerary";
    }
}
