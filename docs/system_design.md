# System Design

## Architecture Overview
WanderSync is built using a modern stack:
- **Frontend**: React, Vite, React Router, TailwindCSS/Vanilla CSS (depending on implementation).
- **Backend**: .NET (C#) using standard web API patterns.
- **Database**: MySQL cloud database. The schema is initialized and maintained manually via raw SQL in `Program.cs`.

## Key Components
- **Client Application (`/src`)**: Holds all user-facing interfaces.
  - `pages/`: Independent full-page components (e.g., `Discover.jsx`, `Match.jsx`, `ExplorePage.jsx`, `GuideHome.jsx`).
  - `components/`: Reusable UI elements (e.g., Navbars, Buttons, Modal forms).
- **Backend API (`/backend`)**: Provides the data and authentication layer for the frontend.

## Data Flow
1. User interacts with UI in the browser.
2. React components execute API requests to the .NET backend.
3. Backend processes logic, communicates with DB, and responds with JSON.
4. UI state is updated, triggering a re-render.

## Database Schema
The database uses raw SQL queries to initialize structure. Current tables include:
- **User**: Stores primary authentication and account details (`userID`, `firstName`, `lastName`, `email`, `cellNumber`, `age`, `hashedPword`, `role`, `accountStatus`).
- **Profile**: Stores user-specific extended data linked to a `User` (`pID`, `userID`, `profilePictureLink`, `interests`, `createdAt`, `description`, `location`, `job`).
- **Matches**: Stores swipe interactions (`matchID`, `requesterID`, `receiverID`, `commonInterests`, `status`, `dateMatched`). Status handles "pending", "accepted", and "rejected" states.
- **Message**: Stores chat data (`mID`, `matchID`, `senderID`, `receiverID`, `textMessage`, `sentAt`). Links back to Matches to enforce the rule that users must have an "accepted" match to chat.
