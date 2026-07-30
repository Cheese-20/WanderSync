# Use Case Narratives

## Use Case 1: User Registration
**Actor:** New User (Explorer or Guide)

**Trigger:** The user opens the application for the first time or clicks "Sign Up".

**Preconditions:** 
- The user has accessed the WanderSync web application but is not currently authenticated.

**Main Flow (How it is accomplished):**
1. The user navigates to the login/registration page (`/login`).
2. The user switches to the "Sign Up" form via the UI toggle.
3. The user fills in required fields: Name, Surname, Email, Phone Number, Age, Password, and selects a Role (Explorer or Guide).
4. The user submits the registration form.
5. The frontend (`AuthForm.jsx`) sends a POST request to the backend API with the user's details.
6. The backend validates the inputs, hashes the password, and creates a new user record in the database.
7. The backend responds with a success status and optionally logs the user in immediately (returning a session/JWT token).
8. The frontend stores the authentication state and redirects the user to their respective dashboard (`ExplorerHome` or `GuideHome`).

**Postconditions:**
- A new user account is successfully created in the system.
- The user is logged into the application and redirected to their role-specific dashboard.

---

## Use Case 2: Explorer Matching with a Guide
**Actor:** Explorer

**Trigger:** The Explorer clicks on the "Match" tab in the navigation menu to find a guide.

**Preconditions:**
- The Explorer is registered and logged into the application.
- There are active Guide profiles in the database with matching criteria.

**Main Flow (How it is accomplished):**
1. The Explorer navigates to the 'Match' page (`/match`).
2. The frontend sends a GET request to the backend API (`/api/profile/matches/{currentUserId}`) to fetch a list of available Profiles.
3. The backend queries the database, excluding the current user, and returns the list of profiles.
4. The Explorer views the first profile on a Tinder-style swipe card, detailing their image, bio, and shared interests.
5. The Explorer evaluates the profile and either clicks "X" to reject (swipes left) or the "Heart" to accept (swipes right).
6. If accepted, the system creates a pending request.
7. Pending requests are visible in the sidebar section. Once both users accept, a new chat session is established in the database.
8. The Explorer can navigate to the 'Messages' page to communicate with matched guides.

**Postconditions:**
- A connection or chat channel is successfully established between the Explorer and the Guide.
- The Guide may receive a notification (if implemented) about the new connection.

---

## Use Case 3: Guide Managing Profile
**Actor:** Guide

**Trigger:** The Guide navigates to their profile page and decides to edit their information.

**Preconditions:**
- The Guide is registered and logged into the application.

**Main Flow (How it is accomplished):**
1. The Guide navigates to the 'Profile' page (`/profile`).
2. The system fetches the Guide's current profile data from the backend and populates the form fields.
3. The Guide edits fields such as their bio, availability, hourly rate, and areas of expertise.
4. The Guide submits the updated profile form.
5. The frontend sends a PUT or PATCH request to the backend API with the updated information.
6. The backend validates the data, updates the Guide's record in the database, and responds with a success status.
7. The frontend displays a success message to the Guide and updates the local state to reflect the new profile details.

**Postconditions:**
- The Guide's profile information is updated in the database.
- The new information is immediately visible to Explorers on the 'Discover' and 'Match' pages.

---

## Use Case 4: Messaging
**Actor:** Explorer and Guide

**Trigger:** A user clicks on a chat notification or opens the "Messages" tab to communicate with a match.

**Preconditions:**
- Both users are authenticated.
- The Explorer and Guide have previously connected or matched.

**Main Flow (How it is accomplished):**
1. Either user navigates to the 'Messages' page (`/messages`).
2. The frontend fetches the user's active chat threads from the backend API.
3. The user selects a specific chat thread with their counterpart.
4. The system loads the conversation history.
5. The user types a message in the chat input and clicks "Send".
6. The frontend sends a POST request (or emits a WebSocket event) containing the message content and recipient ID to the backend.
7. The backend saves the message to the database and broadcasts the message to the recipient in real-time (or queues it for when they next poll/load the page).
8. The frontend updates the chat UI to display the newly sent message.

**Postconditions:**
- The message is securely stored in the database.
- The recipient receives the message in their chat interface.
