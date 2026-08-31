# Last Edited - Guide Detail Book Tour Logic

## [2026-08-31]
- **Enhancement (Frontend UI)**: Replaced the instant booking logic on the Guide Detail page with the same interactive booking modal used on the Explorer Home page.
  - **Files modified**: `src/pages/GuideDetail.jsx`
  - **Why it changed**: The user requested that the "Book Tour" buttons under a local guide's "Available Tours & Itineraries" use the exact same logic as the "Join" button on the home page.
  - **How it works**: Added state variables for the booking modal (`isBookingModalOpen`, `selectedTour`, `guestCount`, `bookingStatus`). Fetches the user's `requestedTourIds` on load so that already requested tours are disabled with a "Requested" label. Clicking a tour now opens a modal asking for the number of guests before submitting the booking request.

# Last Edited - Dummy Reviews Added

## [2026-08-31]
- **Enhancement (Seed Data)**: Added dummy reviews for the test guide.
  - **Files modified**: `backend/Program.cs`
  - **Why it changed**: The user requested some dummy reviews to test the reviews display on the frontend.
  - **How it works**: Added an `INSERT IGNORE INTO` SQL command for the `Reviews` table in `Program.cs` that inserts 3 dummy reviews targeting the test guide (guideID: 21).

# Last Edited - Tour Capacity Logic Fix

## [2026-08-31]
- **Bug Fix (Backend Capacity Check)**: Fixed an issue where the system was reserving spots on a tour as soon as a user submitted a request, blocking other users.
  - **Files modified**: `backend/Controllers/BookingsController.cs`
  - **Why it changed**: The user noticed that pending requests were incorrectly updating the tour's capacity limit before the guide had a chance to approve them.
  - **How it works**: Updated the `POST /api/bookings` capacity check to strictly sum `b.status.ToLower() == "accepted"` instead of `b.status != "Cancelled"`. Also added a matching capacity check to the `PUT /api/bookings/{id}/accept` endpoint so that the guide cannot approve a request if it would cause the tour to exceed its maximum capacity.

# Last Edited - Spot Voting Bug Fix (Reverted to Typo)

## [2026-08-31]
- **Bug Fix (Backend)**: Re-added the missing database columns to the `SpotVotes` table in `Program.cs`, but kept the `spotLoaction` column name as requested by the user.
  - **Files modified**: `backend/Models/SpotVote.cs`, `backend/Program.cs`
  - **Why it changed**: The user requested that the column remain spelled as `spotLoaction` to match how it is officially registered in their database.
  - **How it works**: Reverted the spelling in `SpotVote.cs` to `[Column("spotLoaction")]` and used `spotLoaction` in the `ALTER TABLE` statement in `Program.cs`.

# Last Edited - Spot Voting Bug Fix

## [2026-08-31]
- **Bug Fix (Backend)**: Fixed a database schema error ("Unknown column 's.spotLoaction'") that was causing votes on local spots to fail with a 500 server error.
  - **Files modified**: `backend/Models/SpotVote.cs`, `backend/Program.cs`
  - **Why it changed**: An earlier update to the `SpotVote` model mapped a property to a misspelled column name (`spotLoaction`) and neglected to add the actual columns to the runtime database initialization in `Program.cs`. This caused Entity Framework to crash whenever it tried to read or write to `SpotVotes`.
  - **How it works**: Corrected the column mapping attribute in the model to `spotLocation`, appended `ALTER TABLE` statements to `Program.cs` to safely add the missing columns to the `SpotVotes` table at startup, and restarted the backend.

# Last Edited - NavBar Brand Color

## [2026-08-31]
- **UI Tweaks (NavBar)**: Updated the "WanderSync" brand text in the top navigation bar to match the mint green color (`#a6d8b6`).
  - **Files modified**: `src/styles/nav.css`
  - **Why it changed**: The user requested that the navigation text color perfectly match the "Create a post" button's background color.
  - **How it works**: Altered the `.ws-brand` CSS class color property from `#1a8f66` to `#a6d8b6`.

# Last Edited - Carousel Button Colors

## [2026-08-31]
- **UI Tweaks**: Updated carousel navigation arrow buttons to match the "Create a post" mint green button color.
  - **Files modified**: `src/pages/ExplorerHome.jsx`, `src/pages/GuideHome.jsx`
  - **Why it changed**: The user requested that these buttons use the same cohesive mint green color theme (`#a6d8b6`) instead of the default blue (`#007bff`).
  - **How it works**: Swapped out the `#007bff` background color string for `#a6d8b6` in the inline styles of the arrow buttons across the Explore and Guide home pages.

# Last Edited - Messages Loading Spinner

## [2026-08-31]
- **UI Enhancement (Messages)**: Added a loading spinner when a user selects a contact and messages are being fetched.
  - **Files modified**: `src/pages/Messages.jsx`
  - **Why it changed**: Fetching messages takes a moment, and without an indicator, it looks like the chat history is empty during the delay. The user requested we bring this visual feedback in.
  - **How it works**: Added `loadingMessages` state, toggled exclusively during the *initial* chat load (ignoring background polling) to display a pulsing WanderSync logo.

# Last Edited - Optimize Match Page Fetching

## [2026-08-31]
- **Performance Fix (Match Page)**: Optimized fetching for profiles, matches, and pending requests to reduce payload size.
  - **Files modified**: `backend/Controllers/ProfileController.cs`
  - **Why it changed**: The Match page ("Find Your Travel Buddy") was experiencing the same performance issue as messages—fetching massive Base64 profile pictures natively in JSON arrays.
  - **How it works**: Updated `GetMatches`, `GetPendingRequests`, `GetProfile`, and `GetPublicProfile` in the backend to return the lightweight `/api/profile/{userId}/picture` endpoint URL instead of the heavy raw Base64 image data.

# Last Edited - Remove Hardcoded Bookings

## [2026-08-31]
- **UI Cleanup (Dashboard)**: Removed the hardcoded bookings placeholder section from the Local Guide dashboard overview.
  - **Files modified**: `src/pages/Dashboard.jsx`
  - **Why it changed**: The user requested the removal of the dummy "Sunrise photo walk" booking cards since real bookings are handled in the "Bookings" tab.
  - **How it works**: Simply deleted the JSX block rendering the hardcoded `.booking-item` elements under the Overview tab section.

# Last Edited - Optimize Message and Contact Fetching

## [2026-08-31]
- **Performance Fix (Messages)**: Optimized contacts loading and chat polling to significantly reduce payload size and backend load.
  - **Files modified**: `backend/Controllers/ProfileController.cs`, `backend/Controllers/MessageController.cs`, `src/pages/Messages.jsx`
  - **Why it changed**: 
    - `GetContacts` was returning full Base64 image strings in the JSON array, causing massive payloads and latency.
    - Chat polling was fetching the entire chat history every 5 seconds, resulting in O(N^2) data transfer for long chats.
  - **How it works**:
    - Added `GET /api/profile/{userId}/picture` to dynamically decode Base64 profile pictures and serve them as standard image files (or redirect if URL).
    - Updated `GetContacts` SQL query to construct and return the picture endpoint URL instead of the raw Base64 data.
    - Added an `afterId` parameter to `GetChat` for incremental polling.
    - Modified `Messages.jsx` to pass the highest `mID` during polling, appending only new messages to the existing list.

# Last Edited - Refine Explore Page Styles

## [2026-08-31]
- **Style Fix (Explore Page)**: Reverted the animated gradient background on the Explore Page back to its original static background.
  - **Files modified**: `src/styles/explorer.css`
  - **Why it changed**: The user requested that the animated background colour be reverted because it was distracting, and to limit the new glassmorphic hover animations specifically to the "Live from Community" cards and "Manage Itineraries".
  - **How it works**: Removed the `.explorer-page` background gradient animation and restricted the hover/transition effects in `explorer.css` exclusively to the `.community-post-card` class, ensuring the tour and spot cards remain unchanged.

# Last Edited - Restored Manage Itinerary UI in GuideHome

## [2026-08-31]
- **Feature (Denormalization & Data Backfill)**: Updated all Entity Framework models to map directly to the newly added denormalized "foreign key" columns in the database, and created a backfill script.
  - **Models Updated**: `Booking`, `LocalGuideApplication`, `UserMatch`, `Message`, `Notification`, `Post`, `Profile`, `SpotVote`, and `Tour`.
  - **Backfill Script**: Created `DatabaseBackfillController.cs` featuring a `POST /api/backfill/populate-all` endpoint. When triggered, it scans the entire database, looks up related users/tours/spots by ID, and auto-populates all the new string columns (e.g. `UserName`, `UserSurname`, `SpotLocation`, etc.) for every record.
  - **Why**: The user manually modified the MySQL schema to add these fields for faster data retrieval (without SQL JOINs). We needed to map the C# Entity Framework to these columns exactly (including keeping typos like `location` vs `loaction` accounted for) and provide a way to inject data into all the existing empty records.
- **Bug Fix (Database Connection)**: Added `EnableRetryOnFailure()` to the Entity Framework `UseMySql` configuration in `backend/Program.cs`.
  - **Why**: The application occasionally threw transient connection errors during startup or heavy load ("Login Failed: An exception has been raised that is likely due to a transient failure").
  - **How it works**: By adding `EnableRetryOnFailure()`, Entity Framework Core will automatically retry failed database operations (like opening connections or executing commands) before throwing an exception, improving the application's resilience against temporary database unreachability or network blips.
- **Merge (LocalGuide and Admin-2)**: Resolved merge conflicts when integrating `LocalGuide` and `Admin-2` branches into `main`.
  - **Program.cs**: Reconciled database migrations for `Bookings`. Enforced `timeOfBooking` as `NOT NULL` and maintained the robust backfilling logic from `LocalGuide` branch.
  - **GuideDetail.jsx**: Preserved both the "Submit Review" form (from `LocalGuide`) and the "One-on-One Request" form (from `Admin-2`) so users can utilize both features.
  - **dist/index.html**: Resolved build asset conflict by taking our current version and performing a fresh production build (`npm run build`).
  - **Why**: Both branches implemented features touching the same files. We need both the guide rating capabilities and the one-on-one booking/admin approval features without losing functionality.

## [2026-08-19]
- **UI Redesign (Manage Itinerary)**: Full redesign of `ManageItinerary.jsx` and `manage-itinerary.css`.
  - **Overview tab**: Read-only summary of all activities in order, showing type badge (colour-coded), location, time range, duration, and notes. Empty state guides the user to the builder.
  - **Itinerary Builder tab**: Replaced the old drag-and-drop sidebar with a structured form (name, type dropdown with 8 emoji types, location, start time, duration, notes). Activities auto-sort by time. Inline time conflict detection prevents overlapping bookings. Each timeline card is editable inline with a ✕ remove button. Timeline connector colour matches the activity type.
  - **Locations tab**: Ordered list of all activities that have a location, showing sequence number, address, and time range — useful for the tourist to follow the route.
  - **Stats bar**: Live stats always visible — number of activities, total duration, start time, end time.
  - **Save & Notify button**: Prominent button in the header, saves to backend and notifies the tourist.
  - **Why**: The old page had broken `<Layout>` wrapper (blank page), placeholder tabs with no function, and a confusing drag-and-drop sidebar. This replaces it with a clear, step-by-step UI that tells the guide exactly what to do at each step.

- **Bug Fix (Explore Page Submit Spot button)**: Fixed case sensitivity issue preventing the "Submit New Spot" button from rendering for guides.
  - **Root cause**: The UI checked `userRole.includes('guide')` but roles in the database might be capitalized (e.g., `Guide`).
  - **Fix**: Standardized the role string by calling `.toLowerCase()` before checking.

- **UI Redesign (Submit Spot Modal)**: Full redesign of the submit spot modal in `ExplorePage.jsx` and added new CSS to `explore.css`.
  - **Look & Feel**: Added a backdrop blur overlay (`backdrop-filter: blur(6px)`) and a glassmorphic card with a gradient header matching the WanderSync brand colours. Also updated the trigger button (`✨ Submit New Spot`) with a matching green gradient, rounded pill shape, drop shadow, and a lift-on-hover effect.
  - **Usability**: Replaced the free-text `Activity Type` input with a predefined `<select>` dropdown (using the exact same 8 categories as the Manage Itinerary page).
  - **Icons**: Added intuitive emojis to all input fields and the submit button to make the form feel modern and "cool".
  - **Animations**: Added smooth `fadeIn` and `slideUp` keyframe animations when the modal opens.

- **Bug Fix (Submit Spot Modal Error)**: Fixed the `"An error occurred while saving the record. Please try again."` error when submitting a new spot.
  - **Root cause**: The frontend payload was sending `isVerified: false` (a boolean). The backend C# model `CuratedSpot` defines `IsVerified` as a `string` (default `"pending"`). The mismatch caused ASP.NET Core model validation to fail and reject the request with a `400 Bad Request`. Additionally, the frontend was completely omitting the `submittedByUserID` field, which meant spots weren't linked to the guides who submitted them.
  - **Fix**: Changed the payload to send `isVerified: "pending"`, and added code to extract the current user's ID from `localStorage` to include `submittedByUserID` and `submittedAt` in the payload.

- **Feature (Conversational Spot Wizard & Upvotes)**: Converted the spot submission form into a conversational wizard and added a community upvoting feature.
  - **Conversational UI (`ExplorePage.jsx`)**: The modal is now a 3-step wizard ("What's the spot called?" -> "Where is it?" -> "Activity Type & Description") utilizing smooth CSS sliding animations.
  - **Spot Image Upload**: Step 3 of the wizard now includes a sleek, clickable drag-and-drop style upload zone. When an image is uploaded, it is converted to a base64 string and shows a preview with a nice overlay remove button.
  - **Upvoting API (`SpotController.cs`)**: Added `POST /api/spots/{id}/upvote` which inserts a new `SpotVote` (type `"upvote"`) and automatically creates a `Notification` for the original spot submitter.
  - **Upvote UI (`GuideHome.jsx` & `ExplorerHome.jsx`)**: Verified spots in the "Local Favourites" section now display an interactive Upvote button showing the live `UpvotesCount` fetched from the backend.

- **Bug Fix (Prevent Self-Approval)**: Added validation so guides cannot approve spots they submitted themselves.
  - **API Changes (`SpotController.cs`)**: 
    - Updated `GetPendingSpotsForGuide` to hide spots where `s.SubmittedByUserID == guideId`.
    - Added a check in `VoteOnSpot` to return `BadRequest("You cannot vote on your own spot.")` if the original submitter attempts to bypass the UI and vote directly.

- **Feature (Detailed View Bookings)**: Completely redesigned the Explorer "My Activities" page for a richer viewing experience.
  - **API Changes (`BookingsController.cs`)**: 
    - Updated `GET /api/bookings/user/{userId}/with-details` to return BOTH "Tour" and "Itinerary" bookings (removed hardcoded filter).
    - Added `pictureURL`, `location`, `price`, `description`, `numberOfGuests`, `timeOfBooking`, and `bookingType` fields.
  - **UI Changes (`MyActivities.jsx`, `Profile.jsx`, & `discover.css`)**: Completely overhauled the booking cards to feature an ultra-premium glassmorphic aesthetic. The entire `.detailed-booking-card` now uses `backdrop-filter: blur(20px)` with a translucent, glowing gradient border. Details items are styled as sleek glass pills with hover micro-animations, the image features a smooth scale effect on hover, and the booking type tag (`TOUR` / `ITINERARY`) is now a glowing neon gradient. For **Custom Itineraries**, the timeline is cleanly parsed and rendered as a vertical timeline with pulsing glowing dots and floating glass nodes. This rich, visually stunning view is synchronized across both the "My Activities" page and the "Bookings" tab in the user's Profile.

- **Documentation (Use Case Narratives Update)**: 
  - **File (`docs/use_case_narratives.md`)**: Rewrote **Use Case 12: Report Spot (D900)** to describe the exact intended user flow (clicking a report icon, opening a modal, selecting a reason, and seeing a success message) rather than the current backend-only implementation status. This ensures the document correctly serves as a requirements/design specification.
  - **UI Changes (`ExplorePage.jsx`)**: Removed the `userRole.includes('guide')` restriction on the "Submit New Spot" button. Now any logged-in user can submit a spot for verification.
  - **Root cause**: The page was wrapped in `<Layout>` which is a router outlet layout component (`<Outlet />`). This component ignores any children passed to it directly — it only renders content from nested route definitions. So the entire page body was silently discarded.
  - **Fix**: Replaced `<Layout>children</Layout>` with `<><NavBar /><div className="manage-itinerary-page">...</div></>`, matching the pattern used by every other page in the app (`ExplorerHome.jsx`, `GuideHome.jsx`, etc).
  - **Additional**: Improved remove-item button label from `...` to `✕` for clarity, and improved duration placeholder text to `e.g. 1h or 30m`.
- **Feature (Manage Itinerary entry point)**: Re-added the **"Manage Tourist Itineraries"** section to `GuideHome.jsx` (had been removed in main branch merge commit `8cd6772`). Now renders a card per matched tourist with a **Manage Itinerary** button navigating to `/manage-itinerary/:touristId`.
  - **Why it was missing**: The section was silently removed during the `main` branch merge (commit `8cd6772: UI: remove Assigned Tourists section`). The backend fetch and state (`assignedTourists`) were still present but nothing was rendered on screen.
  - **Fix**: Added a new `<section>` between "Local Favourites" and "Community Feed" that maps over `assignedTourists` and renders a card per tourist with their name, email, and a **"Manage Itinerary"** button.
  - **How it works**: Clicking the button navigates to `/manage-itinerary/{tourist.userId}`, which loads `ManageItinerary.jsx` and fetches the tourist's itinerary via the `GET /api/local-guide/{guideId}/itinerary/{touristId}` endpoint. The route is protected by `AuthWrapper` in `App.jsx`.
  - **Styling note**: Synced import from `useLocation` → `useNavigate` in `ExplorerHome.jsx` to match the main branch (navigate is actively used on line 35).
- **Bug Fix (Syntax)**: Fixed missing closing `</>` fragment tag in `GuideHome.jsx` caused by the auto-merge from main (line 581).

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

## What Changed

Added dynamic statistics (Bookings this month and Average Rating) to the Local Guide Dashboard, replacing hardcoded values.

## Why It Changed

The user requested that the "18 bookings" and "4.9 rating" displayed on the Local Guide dashboard be calculated dynamically from the database. The previous implementation simply hardcoded these numbers into the UI.

## How It Works

1. Created a new API endpoint `GET /api/local-guide/{guideId}/stats` in `LocalGuideController.cs`.
2. The endpoint calculates:
   - **Bookings this month**: Joins the `Bookings` and `Tours` tables to count how many "Accepted" bookings belong to the specific guide's tours in the current month.
   - **Average Rating**: Queries the `GuideRatings` (mapped to the `Reviews` table) to average the `Score` for the specific guide, rounded to 1 decimal place.
3. Updated the frontend `Dashboard.jsx` to fetch from this endpoint and render `{stats.bookingsThisMonth}` and `{stats.averageRating}` dynamically instead of hardcoded numbers.

## What Changed

Added a strict rule to the Guide rating API endpoint that requires users to have a confirmed booking that occurred more than 30 minutes in the past before they are allowed to leave a review.

## Why It Changed

The user requested that reviewers must actually have experienced the tour they are reviewing (i.e. the booking is confirmed and time has passed) to prevent fraudulent or premature reviews. 

## How It Works

1. Modified the `POST /api/local-guide/{guideId}/rate` endpoint in `LocalGuideController.cs`.
2. Changed the `hasBooking` query to join `Bookings` and `Tours`.
3. Added the conditions `(b.status == "Confirmed" || b.status == "Accepted")` to ensure the booking was not declined or pending.
4. Added the condition `t.Date <= DateTime.UtcNow.AddMinutes(-30)` to ensure that at least 30 minutes have elapsed since the start time of the booked tour/experience.

## What Changed

On the Guide Profile page, the "Add Review" button is now greyed out and disabled if the user has no bookings with the specific guide.

## Why It Changed

To improve user experience and provide immediate feedback, the button is visually disabled so users don't have to fill out the review form only to be rejected by the backend rule implemented previously.

## How It Works

1. Added `checkReviewEligibility` function to `GuideDetail.jsx` which runs on component mount.
2. The function queries `GET /api/bookings/user/{userId}/with-details` and checks if the user has any bookings that match the current `guideId`.
3. Based on the result, it updates the `canReview` state.
4. If `canReview` is false, the "Add Review" button is styled grey with a `not-allowed` cursor, but is kept clickable (the `disabled` attribute was removed).
5. The `onClick` handler checks `canReview` and shows a custom popup modal centered on the screen (with the logo and centered text) if the user is ineligible, stopping the form from opening. Styles were added to `discover.css`.

## What Changed

Removed the "Every Guide is Verified" banner/section from the Explore page.

## Why It Changed

The user requested its removal.

## How It Works

Deleted the `<section className="explore-trust-section">...</section>` block from `ExplorePage.jsx`.
