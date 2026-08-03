# Last Edited
*Keep track of recent changes and updates in the project.*

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
