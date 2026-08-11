# Local Guide Use Cases

## Use Case 1: View Local Guide

**Actors:** User, System

**Pre-Conditions:** User must be registered and logged in to the system.

**Triggers:** User clicks "Explore" in the main navigation bar.

**Post-Conditions:** System displays the local guide's full profile information.

**Basic Flow of Events / Main Success Scenario:**

1. User clicks "Explore" in the main navigation bar.
2. The system retrieves and displays all verified local guides in the "Verified Guides" section (name, profile picture, location, bio).
3. The user can also view available experiences/tours listed above the guides section.
4. The user clicks on a specific guide card to view their full profile (`/guide/:guideId`).
5. The system displays the guide's full details: name, job, location, email, average rating, about section, interests, available tours/itineraries, and reviews from other users.
6. The user can optionally proceed to book a tour or contact the guide via the "Message Guide" button.

**Implementation:**

| Layer | File | Details |
|-------|------|---------|
| Frontend | `src/pages/ExplorePage.jsx` | Main explore page with search, tour cards, and verified guide cards |
| Frontend | `src/pages/GuideDetail.jsx` | Full guide profile with tours, ratings, reviews, book/message actions |
| Backend | `LocalGuideController.cs` → `GET /api/local-guide/list` | Returns all approved guides (with or without profiles) |
| Backend | `LocalGuideController.cs` → `GET /api/local-guide/{guideId}` | Returns guide details + tours + average rating |
| Backend | `LocalGuideController.cs` → `GET /api/local-guide/{guideId}/ratings` | Returns all reviews for a guide |

---

## Use Case 2: Browse/Search Local Guide

**Actors:** User

**Pre-Conditions:** Must be logged in to the WanderSync system.

**Triggers:** The user types a search query in the search bar on the Explore page.

**Post-Conditions:** Matching local guides are shown at the top of the list; all other guides remain visible below.

**Basic Flow of Events / Main Success Scenario:**

1. The user navigates to the Explore page (via "Explore" in the navigation bar).
2. The system displays all verified guides and available experiences.
3. The user enters a search term (name, location, or interest) in the search bar and clicks the search icon or presses Enter.
4. The system filters guides client-side: matching guides are moved to the top of the list, remaining guides stay visible below.
5. The user clicks on any guide card to see their full profile, itineraries, rating, and other information.
6. The user can clear the search (click the X button) to reset the guide order.

**Implementation:**

| Layer | File | Details |
|-------|------|---------|
| Frontend | `src/pages/ExplorePage.jsx` | Search bar with client-side filtering; matches sorted to top, others remain |
| Backend | `LocalGuideController.cs` → `GET /api/local-guide/list` | Returns all guides for initial load |
| Backend | `LocalGuideController.cs` → `GET /api/local-guide/search?query=...` | Server-side search by name, location, interests (available but not used in current flow) |

---

## Use Case 3: Rate Local Guide

**Actors:** User

**Pre-Conditions:** Must have booked at least one itinerary/tour with the local guide.

**Triggers:** User clicks "View My Activities & Rate Guides" at the bottom of the Explore page, then clicks "Rate Guide" next to a guide.

**Post-Conditions:** Local guide rating is saved to the Reviews table and their average rating is updated.

**Basic Flow of Events / Main Success Scenario:**

1. User clicks "View My Activities & Rate Guides" at the bottom of the Explore page.
2. The system navigates to the My Activities page (`/my-activities`).
3. The system displays all past bookings grouped by the guide who provided the tour, showing each tour's title, type, date, and booking status.
4. The user clicks the "Rate Guide" button next to the guide they want to rate.
5. The system opens an inline rating form with:
   - Star selection (1–5 stars, interactive clickable stars)
   - Optional comment field (max 500 characters)
6. The user selects their star rating and optionally writes a comment.
7. The user clicks "Submit Rating".
8. The system validates that the user has a confirmed booking with this guide, then saves the rating to the database.
9. A success message is displayed and the form closes automatically after 2 seconds.
10. If the user has already rated this guide, the existing rating is updated with the new score and comment.

**Implementation:**

| Layer | File | Details |
|-------|------|---------|
| Frontend | `src/pages/MyActivities.jsx` | Past bookings grouped by guide, inline rating form with stars + comment |
| Frontend | `src/pages/ExplorePage.jsx` | "View My Activities & Rate Guides" button at bottom links to `/my-activities` |
| Backend | `LocalGuideController.cs` → `POST /api/local-guide/{guideId}/rate` | Validates booking exists, creates/updates rating |
| Backend | `LocalGuideController.cs` → `GET /api/local-guide/{guideId}/ratings` | Returns all ratings + average for a guide |
| Backend | `BookingsController.cs` → `GET /api/bookings/user/{userId}/with-details` | Returns user bookings with tour + guide info |
| Database | `Reviews` table | Columns: reviewID, reviewerID, guideID, rating (1-5), comment, sentAt |

---

## Use Case 4: Book Local Guide

**Actors:** User

**Pre-Conditions:** Must be logged in to the WanderSync system.

**Triggers:** User clicks "Book" on a tour card (from Explore page) or "Book Tour" on the guide's detail page.

**Post-Conditions:** Tour is booked, booking count is updated, guide is notified.

**Basic Flow of Events / Main Success Scenario:**

1. User can book from two entry points:
   - **Explore page**: Clicks "Book" button on any experience/tour card in the "Available experiences" section.
   - **Guide Detail page**: Navigates to a guide's profile, views their tours, and clicks "Book Tour" on a specific tour.
2. The system validates:
   - The user is logged in (redirects to login if not).
   - The tour exists and has available capacity (not fully booked).
   - The user hasn't already booked this same tour.
3. The system creates the booking with status "Confirmed" and records the booking date.
4. The system sends a notification to the guide about the new booking (type: "NewBooking").
5. The system displays a confirmation message to the user (alert on Explore page, inline message on Guide Detail page).
6. The booking appears in the user's "My Activities" page grouped under the guide.

**Implementation:**

| Layer | File | Details |
|-------|------|---------|
| Frontend | `src/pages/ExplorePage.jsx` | "Book" button on each experience card |
| Frontend | `src/pages/GuideDetail.jsx` | "Book Tour" button per tour card with inline success/error messages |
| Backend | `BookingsController.cs` → `POST /api/bookings` | Creates booking with capacity check, duplicate prevention, guide notification |
| Backend | `BookingsController.cs` → `GET /api/bookings/user/{userId}/with-details` | Returns bookings with tour + guide info for My Activities |
| Database | `Bookings` table | Columns: bookingID, userID, tourID, curatedSpotID, bookingType, status, bookingDate |

---

## Navigation & Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/explore` | ExplorePage.jsx | Search guides, view available experiences, view verified guides, book tours |
| `/guide/:guideId` | GuideDetail.jsx | View full guide profile, tours, ratings/reviews, book tours, message guide |
| `/my-activities` | MyActivities.jsx | View past bookings grouped by guide, rate guides |
| `/discover` | Discover.jsx | Alternative browse page with location-based filtering |

**Navigation bar links:** Explore, Match, Messages, My Activities, Profile

**Access to My Activities:** Via "View My Activities & Rate Guides" button at the bottom of the Explore page.

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/local-guide/list` | All approved guides (with or without profiles) |
| GET | `/api/local-guide/{guideId}` | Guide details + tours + average rating |
| GET | `/api/local-guide/by-location?location=` | Guides filtered by location |
| GET | `/api/local-guide/search?query=` | Search guides by name/location/interests |
| GET | `/api/local-guide/{guideId}/ratings` | All ratings + average for a guide |
| POST | `/api/local-guide/{guideId}/rate` | Submit/update a rating (requires prior booking) |
| GET | `/api/tours` | All tours with guide names |
| POST | `/api/bookings` | Create a new tour booking |
| GET | `/api/bookings/user/{userId}/with-details` | User bookings with tour + guide info |
