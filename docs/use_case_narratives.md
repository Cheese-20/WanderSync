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

## Use Case 3: User Managing Profile
**Actor:** User (Explorer or Guide)

**Trigger:** The user navigates to their profile page and decides to edit their information.

**Preconditions:**
- The user is registered and logged into the application.

**Main Flow (How it is accomplished):**
1. The user navigates to the 'Profile' page (`/profile`).
2. The system fetches the user's current profile data from the backend and populates the form fields.
3. The user edits fields such as their profile picture, bio/description, interests, location, and job title.
4. The user submits the updated profile form.
5. The frontend sends a PUT or PATCH request to the backend API with the updated information.
6. The backend validates the data, updates the user's Profile record in the database, and responds with a success status.
7. The frontend displays a success message to the user and updates the local state to reflect the new profile details.

**Postconditions:**
- The user's profile information is updated in the database.
- The new information is immediately visible to other users (e.g., Explorers viewing Guides on the 'Match' page).

---

## Use Case 4.1: Send Message
**Actor:** Explorer and Guide

**Trigger:** A user decides to send a message to their match.

**Preconditions:**
- Both users are authenticated.
- A match status must be "accepted" in the Matches table.
- The user is currently in an active chat thread with the matched user.

**Main Flow (How it is accomplished):**
1. The user types a message in the chat input area on the 'Messages' page.
2. The user clicks the "Send" button.
3. The frontend sends a POST request containing the message content to the backend API.
4. The backend receives the request and saves the message to the database (collecting `mID`, `matchID`, `senderID`, `receiverID`, `textMessage`, and `sentAt`).
5. The frontend updates the local chat UI to display the newly sent message in the thread.

**Postconditions:**
- The message is securely stored in the database in the `Message` table as shown in the schema.

---

## Use Case 4.2: View Message
**Actor:** Explorer and Guide

**Trigger:** A user opens the "Messages" tab or selects a specific chat thread to view their conversation history.

**Preconditions:**
- The user is authenticated.
- The user has an existing accepted match and previous message history.

**Main Flow (How it is accomplished):**
1. The user navigates to the 'Messages' page (`/messages`).
2. The frontend fetches the user's active chat threads from the backend API.
3. The user selects a specific chat thread with their counterpart.
4. The frontend sends a GET request to the backend to fetch the message history for that specific match.
5. The backend queries the `Message` table for messages corresponding to the `matchID`.
6. The system loads and displays the conversation history in chronological order.

**Postconditions:**
- The user can successfully view all past sent and received messages for that match.

## Use Case 5: Delete Activity (D300)
**Actor:** Guide

**Trigger:** The Guide selects the delete option in the activity dashboard for a specific activity.

**Preconditions:**
- The Guide is registered and logged into the application.
- The Guide has at least one active activity listed.

**Main Flow (How it is accomplished):**
1. The Guide navigates to the 'Activity Dashboard'.
2. The Guide selects the Delete option on a specific activity listing.
3. The frontend system displays a warning confirmation dialog preventing accidental deletion.
4. The Guide confirms the deletion request.
5. The frontend sends a DELETE request to the backend API specifying the activity ID.
6. The backend validates the request, removes the activity from the database, and responds with a success status.
7. The frontend removes the listing from the platform and displays a "Deletion Successful" message.

**Postconditions:**
- The activity is permanently removed from the database and the list of activities.
- A confirmation message is displayed to the Guide.

---

## Use Case 6: Admin Login
**Actor:** Admin

**Trigger:** The Admin attempts to log into the application using their specific credentials.

**Preconditions:**
- The Admin must exist in the `Admin` database table.
- The `Admin` table stores `adminID`, `username` (starting with an 's', e.g., 's229274056'), and an unhashed `hashedPassword`.

**Main Flow (How it is accomplished):**
1. The Admin navigates to the login page (`/login`).
2. The Admin selects their desired role from the radio buttons (Admin, Explorer, or Local Guide).
3. The Admin enters either their 's' prefixed username (e.g. 's229274056') or their full email address (e.g. 's229274056@wandersync.com'), and their unhashed password.
4. The frontend sends a POST request to the backend API for authentication, including the selected role.
5. The backend strips the `@wandersync.com` suffix if present, recognizes the username pattern, and validates the credentials against the unhashed `hashedPassword` in the `Admin` table.
6. The backend responds with a success status, an authentication token, and assigns the user the role they requested.
7. The frontend receives the successful response and identifies the user's role.
8. The frontend redirects the Admin to the appropriate dashboard (e.g., dedicated Admin home page, Explorer home, or Guide home) based on the role they chose to log in as.

**Postconditions:**
- The Admin is authenticated and granted access to the chosen role's dashboard.
- The Admin can perform functions corresponding to the role they selected during login.

---

## Use Case 7: Send Notification
**Actor:** System (Triggered by Explorer or Guide actions)

**Trigger:** A user performs an action that requires alerting another user (e.g., sending a message, requesting a match, or accepting a match).

**Preconditions:**
- The recipient user exists in the database.
- The action triggering the notification (like a message insert or swipe) is valid and successfully processed by the backend.

**Main Flow (How it is accomplished):**
1. An actor performs a trigger action on the frontend (e.g., sending a chat message).
2. The frontend sends an API request to the corresponding backend controller (e.g., `MessageController.cs`).
3. The backend successfully processes the core action (saving the message).
4. The backend automatically constructs a new `Notification` entity for the recipient, specifying the `type` (e.g., "NewMessage"), `message` content, and `relatedEntityID`.
5. The backend saves the new `Notification` record into the database alongside the core action data within the same transaction/request scope.
6. The system returns a success response for the core action.

**Postconditions:**
- A new unread notification record exists in the database for the recipient.
- The recipient will receive this notification the next time they poll the API or refresh their UI.

---

## Use Case 8: View Notification
**Actor:** Explorer and Guide

**Trigger:** The user looks at their navigation bar or clicks the Notification bell icon.

**Preconditions:**
- The user is authenticated and logged into the application.
- The user has at least one unread notification in the database (to see the unread badge).

**Main Flow (How it is accomplished):**
1. The user logs in and the frontend `NavBar` component mounts.
2. The frontend automatically sends a GET request to the backend API (`/api/notification/{userId}`) to fetch all active notifications.
3. The backend returns a list of notifications, omitting any future scheduled notifications.
4. The frontend calculates the number of unread notifications and displays a red badge counter on the Notification bell icon.
5. The user clicks the bell icon, opening a dropdown list of their notifications.
6. The user clicks a specific notification to view it.
7. The frontend sends a PUT request to the backend (`/api/notification/read/{notificationId}`) to mark it as read.
8. The backend updates the `isRead` flag in the database to true and returns a success response.
9. The frontend navigates the user to the relevant page (e.g., `/messages` or `/match`) based on the notification type, and the unread badge counter decreases.

**Postconditions:**
- The selected notification is marked as read in the database.
- The user is navigated to the context of the notification.
- The unread badge counter is accurately updated on the frontend.

---

## Use Case 10: Delete Experience Post (D700)
**Actors:** User (Tourist), Admin

**Pre-Conditions:** User must be logged in and be the author, or an admin with moderating rights

**Triggers:** Clicking the Delete icon on the post.

**Post-Conditions:** The post will be removed from the system.

**Basic Flow of Events / Main Success Scenario:**
1. The actor clicks the Delete option on the specific experience post.
2. The system displays a confirmation pop up to prevent accidental deletion.
3. The actor confirms the deletion.
4. The system executes a Delete command in the database based on the PostID.
5. The system removes associated likes and comments linked to that post.
6. The system removes the post image from the server's image folder.
7. The system refreshes the actors feed and displays a Post Successfully Deleted message.
