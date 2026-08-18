# Last Edited - Fixed numberOfGuests Bug in Tour Bookings

## [2026-08-18]
- **Bug Fix (Bookings)**: Fixed `numberOfGuests` bug in Tour Bookings. Updated `CreateBooking` API in `backend/Controllers/BookingsController.cs` to correctly receive and save the `numberOfGuests` value when a user submits a booking request. Improved capacity check to sum `numberOfGuests` instead of counting bookings.
- **Feature (Report Spot)**: Implemented Use Case D900 (Report Spot).
  - **Backend**: Added `SpotReportRequest` DTO and a new `POST /api/spots/{id}/report` endpoint in `SpotController.cs`. This endpoint stores spot reports in the `SpotReports` table.
  - **Frontend**: Updated `ExplorerHome.jsx` and `GuideHome.jsx` to include a "Report" button in the `LocalSpotModal` (Verified Local Favourites view).
  - **Frontend**: Implemented a new `ReportSpotModal` that captures the reason (via dropdown) and optional comments from the user. Submitting the form calls the backend API and provides success feedback.
  - **Why**: Allows users to flag inappropriate or non-existent spots for admin review, ensuring content quality and safety on the platform.

## [2026-08-14]
- **Feature (Manage Itinerary)**: Implemented Use Case D800 (Manage Itinerary).
  - **Backend**: Added `GET /api/local-guide/{guideId}/assigned-tourists` to fetch accepted tourist matches in `LocalGuideController.cs`.
  - **Backend**: Added `GET /api/local-guide/{guideId}/itinerary/{touristId}` to get or create a "CustomItinerary" `Tour` record. The itinerary timeline is serialized as a JSON string and saved in `Tour.Description`.
  - **Backend**: Added `PUT /api/local-guide/itinerary/{tourId}` to update the serialized JSON timeline.
  - **Backend**: Configured the PUT endpoint to generate a notification for the tourist upon schedule updates, using the `Notifications` table.
  - **Frontend**: Updated `GuideHome.jsx` to fetch and display assigned tourists. Added a "Manage Itinerary" modal with an interactive timeline builder (add, remove, reorder activities/transit).
  - **Frontend (UI Overhaul)**: Completely redesigned the Manage Itinerary feature into a dedicated, full-page layout (`ManageItinerary.jsx`) based on user mockups. Replaced the modal with a light-themed, dual-column view featuring a drag-and-drop sidebar for pre-saved activities, and an interactive, card-based vertical timeline for precise itinerary management.
  - **Documentation**: Formally documented the detailed flow for "Use Case 11: Manage Itinerary (D800)" in `docs/use_case_narratives.md`, outlining the basic flow (calendar selection, timeline modification, validation) and alternative flows (validation failures, network loss).
  - **Frontend (Validation & Offline Mode)**: Implemented strict validation sweeps across the itinerary timeline array prior to saving, preventing missing fields (title, time, duration) and dynamically calculating time-duration intersections to prevent overlapping schedules. Introduced `localStorage` caching and a fallback offline banner triggered upon encountering `ERR_NETWORK` during the save process.
  - **Why**: Allows Local Guides to plan and edit personalized trips for matched tourists without requiring any new database tables, meeting project constraints while delivering full functionality. Meets the extended D800 requirements for error handling and connection resilience.
  - **How**: We repurposed the `Tour` table to represent an itinerary (setting `Type` = "CustomItinerary") and used the `Description` field to store a JSON array of activities. A `Booking` record automatically links the tourist to this itinerary tour.

## [2026-08-11]
- **Feature (Recommend New Location)**: Implemented Use Case D500 (Recommend new location / Submit New Spot).
  - **Backend**: Created the `Spot.cs` model and added it to the `WanderSyncDbContext`.
  - **Backend**: Created `SpotsController.cs` with a `POST /api/Spots` endpoint to accept new spot submissions and default their status to 'Pending'.
  - **Backend**: Updated `Program.cs` to execute a raw SQL query creating the `Curated_spots` table on startup, matching the requested database schema.
  - **Backend**: Switched `Spot` model to `CuratedSpot` with fields `ActivityName`, `ActivityType`, `Description`, `Location`, and `IsVerified`.
  - **Frontend**: Updated `ExplorePage.jsx` form and API calls to match the new `Curated_spots` schema and `/api/CuratedSpots` endpoint.
  - **Frontend (Fix)**: Reverted `ActivityType` field to a text input (instead of checkboxes) to allow arbitrary genres like Jazz, Adventure, Festival.
  - **Why**: This implements the core functionality for Local Guides to recommend new locations for approval, bringing in essential crowdsourcing data to WanderSync while enforcing quality control via the `isVerified` flag.
- **Bug Fix (Build Failure / Merge Conflict)**: Resolved severe compilation errors caused by a corrupted `git pull` merge from the `Spot-Verification` branch.
  - **Backend**: Manually removed duplicated and malformed code blocks in `BookingsController.cs` and `AuthController.cs` that were spliced mid-function by git.
  - **Backend**: Removed a duplicated `GetAllTours` method from `ToursController.cs`.
  - **Backend**: Updated `CuratedSpot.cs` to include missing fields (`SubmittedAt`, `SubmittedByUserID`, `PictureURL`) required by the teammate's `SpotController.cs` for the pending verification dashboard.
  - **Backend**: Fixed C# syntax errors (missing brackets and semicolons) in the Entity Framework snapshot `WanderSyncDbContextModelSnapshot.cs`.
  - **Frontend (Fix)**: Resolved a cascade of severe JSX compilation errors in `AuthForm.jsx`, `ExplorePage.jsx`, `Match.jsx`, `ExplorerHome.jsx`, `GuideHome.jsx`, and `CreatePostModal.jsx` caused by git merge conflicts. Reconstructed orphaned loops, deleted duplicate fragments, and closed missing conditional rendering blocks to restore the React build.
## [2026-08-07]
- **Refactor (UI Styling)**: Removed all inline `style={{...}}` properties across the frontend and replaced them with CSS classes.
  - Created `admin.css` to hold styling for `AdminHome.jsx`.
  - Added new classes to `explorer.css`, `match.css`, `messages.css`, and `profile.css`.
  - Refactored `CreatePostModal.jsx`, `ExplorerHome.jsx`, `Match.jsx`, `Messages.jsx`, and `Profile.jsx` to use external CSS instead of inline React styles.
## [2026-08-10]
- **Database & Backend**: Updated the `Tour` model to include `Location` and `PictureURL`. Added raw SQL to `Program.cs` to auto-migrate the database on startup. Upgraded `ToursController.cs` to return a `TourDto` containing the dynamically calculated `CurrentGuests` (via `Bookings` table) and the `GuideName` (via `Users` table join). **Updated `CurrentGuests` logic to strictly count only `Accepted` bookings.** Added a database seed script in `Program.cs` to auto-generate 3 new mock future tours if all existing tours are in the past.
- **Backend (CuratedSpots)**: Added `Rating` column to `CuratedSpot` model and `curatedSpots` database table. Created a new endpoint `GET /api/spots/approved` in `SpotController.cs` to fetch highly rated, verified spots. Added a database seed script in `Program.cs` to auto-generate mock Local Favourites data.
- **UI (ExplorerHome Layout)**: Restructured the layout of the Discover page based on user feedback. The layout is now ordered: 1. Happening Lately (Tours), 2. Local Favourites (Spots), 3. Live from Community (Feed). Replaced the hero text with a clean section header.
- **UI (Local Favourites)**: Implemented the Local Favourites UI section with a scrollable grid of `.spot-card` components. Designed the cards to match the Figma mockup, including hero images, a mint green "Verified" badge, typography for spot categories, and a dynamic star rating.
- **UI (ExplorerHome)**: Overhauled the tour cards to include a hero image thumbnail, replaced standard emojis with professional vector SVGs (Map Pin, Calendar, Group), and implemented logic to automatically gray out and disable the "Book Now" button if the tour reaches its maximum guest capacity. Added a JavaScript array filter so that any event where the date and time have passed is no longer shown on the display. Reordered the internal card layout to show Date & Guide Name on the left, and Suburb, Guest Count, & Join button on the right. 
  - **Booking Flow & Modal**: Designed and integrated a custom "Request to Join" modal with the WanderSync logo and a dynamic Guest Count input. Created new button states ("Requested", "Joined", "Full") so users can't request a booking twice. Implemented a 5-second polling interval to auto-refresh tour data so that "amount of people going" updates in real-time as soon as a guide approves a pending request!
  - **Refinements**: Unified all buttons on the Discover page (both the generic primary buttons and the tour card buttons) to strictly use the WanderSync mint green brand color (`#a4ddbc`). Increased the size of the new vector SVG icons from 16px to 22px for better visibility, and updated the location fallback string to standard suburbs (e.g. Summerstrand). Also decreased the maximum width of the tour cards to 280px so they don't stretch excessively on wider screens.
- **UI (ExplorerHome)**: Redesigned the "Happening Today" tour cards in `ExplorerHome.jsx`. Replaced basic inline styling with modern `.tour-card` CSS, featuring gradient top-borders, glassmorphism badges, dynamic hover elevation, and a pill-shaped button using the primary mint green gradient for a premium feel.
- **Bug Fix**: Fixed a syntax error in `backend/Program.cs` caused by malformed raw SQL string interpolation.
- **Environment**: Ran `npm install` to install missing frontend dependencies (Vite was missing).
- **UI (Matches)**: Added a loading state overlay with a spinner to `Match.jsx` while profiles are being fetched to improve UX.
- **Backend Optimization**: Optimized the `GetMatches` raw SQL query in `ProfileController.cs` by adding a `LIMIT 20` clause. This significantly speeds up the data fetch by preventing thousands of unneeded rows from being sent to the frontend at once.

## What Changed

Updated the `CreateBooking` API endpoint to correctly receive and save the `numberOfGuests` value when a user submits a booking request. Also fixed a bug where tour capacity checking was counting total bookings instead of total guests.

## Why It Changed

The user noticed that whenever someone made a booking for a tour, the number of guests on the Dashboard always showed as `0`, even if they selected multiple people during checkout. 

This happened because the backend's `CreateBookingRequest` model was completely missing the `NumberOfGuests` field, so it ignored the number sent by the frontend. Additionally, the backend was creating the new `Booking` database record using the C# default integer value (0) for `numberOfGuests`.

## How It Works

1. Added `public int NumberOfGuests { get; set; }` to the `CreateBookingRequest` class.
2. Updated the `Booking` creation logic to map `numberOfGuests = request.NumberOfGuests`.
3. Improved the capacity check (`currentBookings`) to use `.SumAsync(b => b.numberOfGuests)` instead of `.CountAsync()`, preventing tours from being overbooked if multiple users book with several guests each!
