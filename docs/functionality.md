# Functionality

## Core Features
1. **Authentication**
   - User registration (Explorer or Guide roles).
   - User login and session management (JWT/Local Storage).
2. **Dashboard / Home**
   - Distinct views for Guides (`GuideHome.jsx`) and Explorers (`ExplorerHome.jsx`).
3. **Discover**
   - Explore various travel spots, guides, and locations.
4. **Matching System**
   - `Match.jsx` handles matching explorers with suitable guides based on preferences.
   - Features a Tinder-style swiping card interface for intuitive accept/reject actions.
   - Sidebar displays pending match requests for quick review.
5. **Messaging**
   - Built-in chat (`Messages.jsx`) for communication between Explorers and Guides.
   - Enforces a strict business rule: Users can only communicate if their `status` in the `Matches` table is "accepted".
   - Displays contacts sidebar based on mutually accepted matches.
   - Messages are fetched dynamically, with the newest messages appearing at the top of the chat area.
6. **Profiles**
   - User profiles (`Profile.jsx`) allow users to manage personal information (Bio, Interests, Location, and Job Title) and role-specific details.
