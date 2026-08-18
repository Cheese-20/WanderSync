# Last Edited - Fixed numberOfGuests Bug in Tour Bookings

**Date:** 2026-08-18  
**Files Modified:**
- `backend/Controllers/BookingsController.cs`

## What Changed

Updated the `CreateBooking` API endpoint to correctly receive and save the `numberOfGuests` value when a user submits a booking request. Also fixed a bug where tour capacity checking was counting total bookings instead of total guests.

## Why It Changed

The user noticed that whenever someone made a booking for a tour, the number of guests on the Dashboard always showed as `0`, even if they selected multiple people during checkout. 

This happened because the backend's `CreateBookingRequest` model was completely missing the `NumberOfGuests` field, so it ignored the number sent by the frontend. Additionally, the backend was creating the new `Booking` database record using the C# default integer value (0) for `numberOfGuests`.

## How It Works

1. Added `public int NumberOfGuests { get; set; }` to the `CreateBookingRequest` class.
2. Updated the `Booking` creation logic to map `numberOfGuests = request.NumberOfGuests`.
3. Improved the capacity check (`currentBookings`) to use `.SumAsync(b => b.numberOfGuests)` instead of `.CountAsync()`, preventing tours from being overbooked if multiple users book with several guests each!
