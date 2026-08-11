# Last Edited
*Keep track of recent changes and updates in the project.*

## [2026-08-11]
- **Feature (Recommend New Location)**: Implemented Use Case D500 (Recommend new location / Submit New Spot).
  - **Backend**: Created the `Spot.cs` model and added it to the `WanderSyncDbContext`.
  - **Backend**: Created `SpotsController.cs` with a `POST /api/Spots` endpoint to accept new spot submissions and default their status to 'Pending'.
  - **Backend**: Updated `Program.cs` to execute a raw SQL query creating the `Curated_spots` table on startup, matching the requested database schema.
  - **Backend**: Switched `Spot` model to `CuratedSpot` with fields `ActivityName`, `ActivityType`, `Description`, `Location`, and `IsVerified`.
  - **Frontend**: Updated `ExplorePage.jsx` form and API calls to match the new `Curated_spots` schema and `/api/CuratedSpots` endpoint.
  - **Frontend (Fix)**: Reverted `ActivityType` field to a text input (instead of checkboxes) to allow arbitrary genres like Jazz, Adventure, Festival.
  - **Why**: This implements the core functionality for Local Guides to recommend new locations for approval, bringing in essential crowdsourcing data to WanderSync while enforcing quality control via the `isVerified` flag.


## [2026-08-07]
- **Refactor (UI Styling)**: Removed all inline `style={{...}}` properties across the frontend and replaced them with CSS classes.
  - Created `admin.css` to hold styling for `AdminHome.jsx`.
  - Added new classes to `explorer.css`, `match.css`, `messages.css`, and `profile.css`.
  - Refactored `CreatePostModal.jsx`, `ExplorerHome.jsx`, `Match.jsx`, `Messages.jsx`, and `Profile.jsx` to use external CSS instead of inline React styles.

## [2026-08-06]
- **Feature (Multiple Images)**: Added support for uploading up to 7 images per post.
  - Updated `CreatePostModal.jsx` to allow multiple image selection and preview generation.
  - Serialized the images array into JSON and saved it to the existing `longtext` `pictureURL` column to prevent backend migrations.
  - Updated `ExplorerHome.jsx` to parse and render multiple images as a horizontal carousel.
- **Feature (Edit Experience Post)**: Implemented Use Case D600 (Edit experience post).
  - Added `UpdatePost` (PUT) endpoint in `PostsController.cs` to handle post modifications.
  - Updated `CreatePostModal.jsx` to support an edit mode with pre-populated fields.
  - Modified `ExplorerHome.jsx` to show an edit icon for the user's own posts and update the post list without refreshing.
  - Documented Use Case D600 in `docs/use_case_narratives.md`.
- **Feature (Delete Experience Post)**: Implemented Use Case D700 (Delete experience post).
  - Added `DeletePost` (DELETE) endpoint in `PostsController.cs` to handle post deletion.
  - Added a trash icon on the user's posts in `ExplorerHome.jsx`.
  - Implemented `handleDeleteClick` with a confirmation dialog, API deletion logic, and feed refresh.
  - Documented Use Case D700 in `docs/use_case_narratives.md`.

## [2026-08-04]
- **Backend / Bug Fix**: Fixed a critical database schema issue where sending messages failed due to an outdated `Notifications` table from a previous iteration of the project. The old table lacked the `userID` and `message` columns. Updated `Program.cs` to execute `DROP TABLE IF EXISTS Notifications` before recreating it, ensuring the schema perfectly matches the current Entity Framework `Notification.cs` model. Tests confirm this resolves the 500 server error and messages now send successfully.
- **UI / Feature**: Implemented Optimistic UI updates in `Messages.jsx`. When a user sends a message, it is immediately appended to the chat interface and the input box is cleared, preventing double-submissions and providing instant visual feedback. The message is then silently replaced by the confirmed server response in the background.
- **Documentation**: Updated `docs/use_case_narratives.md` to formally include "Use Case 7: Send Notification" and "Use Case 8: View Notification". This documents the recently built Notification system, detailing how notifications are inserted by the system upon user actions, and how actors interact with the UI to view and mark them as read.
- **Backend / Feature**: Implemented Phases 2 and 3 of the Notification system. Created `NotificationController.cs` to handle fetching and marking notifications as read.
- **Backend / Feature**: Integrated notifications into the core workflows. `MessageController.cs` now triggers a "NewMessage" notification that includes the sender's first name (e.g., "You have a new message from John."), and `ProfileController.cs` triggers "MatchRequest" and "MatchAccepted" notifications dynamically.
- **Backend / Optimization**: Eliminated the N+1 database query problem and optimized MySQL index utilization in `MessageController.cs` and `ProfileController.cs`. Previously, EF Core was translating LINQ queries into multiple sequential SQL queries, and the subsequent Raw SQL rewrite still suffered from a full-table scan due to an `OR` clause in the `WHERE` statement (`m.requesterID = x OR m.receiverID = x`). Rewrote the queries using `UNION ALL` and `NOT EXISTS` to perfectly align with MySQL's B-Tree indexing on foreign keys, guaranteeing exactly one network roundtrip with near-instant execution speed.
- **UI / Bugfix**: Fixed an issue in `Messages.jsx` where message timestamps were displaying in UTC instead of the user's local timezone. When EF Core reads `datetime` fields from MySQL, it drops the UTC 'Z' indicator. The frontend now forces the 'Z' indicator before parsing the date, allowing the browser to correctly convert the UTC server time into the device's exact local time.
- **UI / Feature**: Added a Notification Bell to `NavBar.jsx` with an unread badge counter. Clicking the bell opens a sleek dropdown list of notifications. Clicking a notification marks it as read in the database and navigates the user to the relevant page (Messages or Match).
- **Backend / Feature**: Implemented the first phase of the new Notification system. Created the `Notification.cs` model mapping to a new `Notifications` database table. Added the DbSet to `WanderSyncDbContext.cs` and executed the raw SQL generation inside `Program.cs`. The table structure includes a `scheduledFor` column to support future delayed notifications (e.g. reminders), along with standard fields like `type`, `message`, and `isRead`.
- **Backend / Feature**: Refactored the `Swipe` logic in `ProfileController.cs` to strictly enforce a single-record architecture for match requests between any two users, avoiding duplicate row insertions. It now checks for an existing match row (regardless of who the requester is) and strictly updates its status (`pending`, `accepted`, `rejected`) rather than creating a new reverse row.
- **UI / Bug Fix**: Fixed a bug in `Match.jsx` where the frontend would loop back to hardcoded mock profiles (Bob Joe, Sarah Smith) when the backend returned an empty list of matches. Removed the `getMockMatches` fallback entirely so users correctly see the "No more matches available right now!" empty state.
- **UI / Refactor**: Relocated the Logout button from the main navigation bar (`NavBar.jsx`) to the `Profile.jsx` page. It now sits next to the "Bookings" tab and shares the same styling as the "Delete Profile" button for visual consistency.
- **Git / Merge**: Executed `git pull` again as requested. The codebase remains up to date.
- **UI / Refactor**: Enforced navigation consistency across all pages. Created a central `Layout.jsx` wrapper for all protected routes in `App.jsx`, replacing the manual `<NavBar />` imports on each page.
- **Feature**: Removed the "Discover" page and its route. Added a global "Logout" button to the `NavBar` so it's accessible everywhere, effectively unifying the layout used by Admin, Guide, and Explorer roles.
- **Environment**: Stopped the background C# backend server process to free up port 5200. This resolves the `Address already in use` error and allows the server to be run interactively in the terminal.
- **Git / Merge**: Executed `git pull` again as requested. The codebase remains up to date with no new changes from the remote.
- **Git / Merge**: Executed `git pull` to fetch the latest code from the remote repository again. The codebase was already up to date. This ensures the local repository has the latest remote updates before starting new work.
- **Git / Merge**: Executed `git pull` to fetch the latest code from the remote repository. The codebase was already up to date. This ensures the local repository has the latest remote updates before starting new work.

## [2026-08-03]
- **Git / Merge**: Pulled the latest code from the remote `main` branch into the local `Messages` branch using `git pull origin main`. This updates the local environment with recent merged features and fixes to keep the codebase up-to-date.
- **Documentation**: Updated `docs/use_case_narratives.md` to split the overarching "Messaging" use case into two separate, detailed narratives: "Send Message" and "View Message". This provides a clearer, step-by-step documentation flow for how each specific action is accomplished and validated within the application architecture.
## [2026-08-03]
- **Feature (Post Experience)**: Implemented the Post Experience Use Case (D100). Added `Post` backend model, `PostsController`, and updated `WanderSyncDbContext`.
- **UI (Explorer Home)**: Created `CreatePostModal.jsx` for the Post Experience flow and updated `ExplorerHome.jsx` to fetch and display the feed. Added styles to `explorer.css`.
- **Database / Backend**: Appended raw SQL to `Program.cs` to auto-create the `Posts` table on startup.

## [2026-07-30]
- **Feature (Activities)**: Implemented the Edit Activity Use Case. Added `Tour` backend model, `ToursController`, and updated `WanderSyncDbContext`.
- **UI (Activities)**: Created `Activities.jsx` and `EditActivity.jsx` to list guide tours and edit them. Updated routing in `App.jsx` and linked from `GuideHome.jsx`.
- **Database / Backend**: Appended raw SQL to `Program.cs` to auto-create the `Tours` table on startup to bypass EF migrations.

## [2026-07-28]
- **General**: Created `docs` folder.
- **Documentation**: Added initial documentation: `system_design.md`, `functionality.md`, `use_case_narratives.md`, and `last_edited.md`.
- **Refactor**: Moved `AuthForm.jsx` from `src/` to `src/pages/` to maintain better folder structure. Updated import path in `App.jsx`.
- **Documentation**: Expanded `use_case_narratives.md` to include preconditions, postconditions, and main flows.
- **Feature (Match Page)**: Redesigned `Match.jsx` to include Tinder-style swiping cards, added `match.css` for styling, and created a Pending Requests sidebar.
- **Backend**: Added `GetMatches` endpoint to `ProfileController.cs` to fetch users for the Match page.
- **Documentation**: Added Triggers to `use_case_narratives.md`.
- **Database / Backend**: Added `Job` column to `Profile` model and generated EF migrations. Mapped `Job` across all Profile API requests.
- **UI Tweaks**: Centered header in `Match.jsx` and updated Match Card to read `Job` from API. Updated `Profile.jsx` so users can edit their Job role.
- **Bug Fix**: Updated `Program.cs` to execute raw SQL (`ALTER TABLE Profile ADD COLUMN job`) on startup to fix 500 Internal Server Errors, bypassing EF migrations.
- **Feature (Match Tracking)**: Implemented `UserMatch` database model and tracking. Swiping right creates a "pending" match, or "accepted" if the other user already swiped right. Refactored pending requests sidebar to pull dynamically from the backend instead of using mock data.
- **Feature (Messages)**: Created `Message` table and `MessageController.cs`. Users can now send messages strictly to mutually accepted matches. Redesigned `Messages.jsx` to feature a sidebar of active connections and a chat window sorted with the newest messages appearing at the top.
- **Git / Merge**: Merged remote `viewBookings` branch into `Match` and resolved `WanderSyncDbContext` conflicts to integrate new bookings models.
- **Bug Fix**: Fixed matching queue logic in `ProfileController.cs` to properly filter out profiles that the current user has already interacted with (pending, accepted, or rejected).
- **Bug Fix**: Rewrote LINQ queries in `ProfileController.cs` (pending requests) and `MessageController.cs` (messaging contacts) to use safe `LEFT JOIN`s on `UserID` instead of traversing navigation properties, fixing an issue where requests and contacts wouldn't load if users had incomplete profiles.
