# Last Edited
*Keep track of recent changes and updates in the project.*

## [2026-08-04]
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
