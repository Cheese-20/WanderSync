# WanderSync Business Rules

This document outlines the core business logic and system rules that govern the WanderSync application.

## 1. Authentication & Roles
- **Distinct Roles:** Every user must register strictly as either an `Explorer` or a `Local Guide`.
- **Strict Role Validation:** A user registered as an Explorer cannot log in using the Local Guide portal (and vice versa). The system must return a 401 Unauthorized if role validation fails.
- **Admin Access:** Administrator credentials are kept in a separate `Admin` table. Admin usernames must be prefixed with an 's' (e.g., `s229274056`). 

## 2. Matchmaking & Connectivity
- **Swipe Discovery:** Explorers discover Guides via a swipe interface. Swiping right creates a `pending` match; swiping left creates a `rejected` match.
- **Mutual Acceptance:** Two users can only communicate if their corresponding record in the `Matches` table has a status of `accepted`.
- **Booking-Driven Matching:** If a Local Guide accepts a tour booking from an Explorer, the system must **automatically generate** an `accepted` match between them (or override an existing `pending`/`rejected` match to `accepted`). This guarantees they can communicate about the upcoming tour without needing to manually match in the swipe queue.

## 3. Messaging
- **Match Requirement:** Messages can only be sent and received between two users who share an `accepted` match status.
- **Instant Delivery:** Messages are delivered immediately and processed using optimistic UI updates on the frontend.
- **Notifications:** Receiving a new message automatically triggers a `NewMessage` notification for the recipient.

## 4. Tour Bookings
- **Strict Scheduling:** When an Explorer requests to book a tour, the requested `bookingDate` and `timeOfBooking` in the payload must **exactly match** the scheduled Date and Time of the Tour as originally defined by the Local Guide.
- **Booking Lifecycle:** 
  - A new booking starts as `Pending`.
  - The Local Guide can either `Accept` or `Decline` the booking from their Dashboard.
  - An `Accepted` booking finalizes the arrangement and triggers the Booking-Driven Matching rule.
- **Booking Retention & Visibility:** All bookings are permanently retained in the database for record-keeping. However, any booking whose scheduled date is strictly **older than 7 days** from the current date is automatically filtered out and hidden from the Local Guide's Dashboard to keep the UI clean.
- **Earnings Calculation:** Guide earnings for a booking are calculated dynamically as `Tour.Price * Booking.numberOfGuests`.

## 5. Automated Notifications Lifecycle
- **New Bookings:** When an Explorer creates a booking, a `NewBooking` notification is immediately dispatched to the Guide.
- **Booking Resolutions:** When a Guide accepts or declines a booking, a `BookingAccepted` or `BookingDeclined` notification is immediately dispatched to the Explorer.
- **Scheduled Reminders:** Exactly **24 hours** before an `Accepted` tour is scheduled to occur, the background reminder service must automatically generate a `BookingReminder` notification for both the Explorer and the Local Guide.
- **Match Requests:** Receiving a right-swipe triggers a `MatchRequest` notification.

## 6. Community Experiences (Posts)
- **Image Limits:** Users can attach up to 7 images per experience post.
- **Ownership:** Users can only edit or delete their own posts (unless an Admin overrides).

## 7. Curated Spots (Verification)
- **Threshold Rule:** A user-submitted curated spot starts as `pending`. It strictly requires **5 unique approvals (upvotes)** from authenticated Local Guides before its status is upgraded to `Verified`.
- **One Vote Per Guide:** A Local Guide can only cast one vote (Approve or Reject) per curated spot.
