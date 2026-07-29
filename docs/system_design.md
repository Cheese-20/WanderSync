# System Design

## Architecture Overview
WanderSync is built using a modern stack:
- **Frontend**: React, Vite, React Router, TailwindCSS/Vanilla CSS (depending on implementation).
- **Backend**: .NET (C#) using standard web API patterns.
- **Database**: SQL Server/PostgreSQL/SQLite depending on environment.

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
