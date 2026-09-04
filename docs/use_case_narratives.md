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
- The new information is immediately visible to other users (e.g., Explorers viewing Guides on the 'Discover' and 'Match' pages).

---

## Use Case 4: Messaging
**Actor:** Explorer and Guide

**Trigger:** A user clicks on a chat notification or opens the "Messages" tab to communicate with a match.

**Preconditions:**
- Both users are authenticated.
- A new chat will start if the status is "accepted" in the Matches table between the Explorer and Guide.

**Main Flow (How it is accomplished):**
1. Either user navigates to the 'Messages' page (`/messages`).
2. The frontend fetches the user's active chat threads from the backend API.
3. The user selects a specific chat thread with their counterpart.
4. The system loads the conversation history.
5. The user types a message in the chat input and clicks "Send".
6. The frontend sends a POST request containing the message content to the backend.
7. The backend saves the message to the database (collecting `mID`, `matchID`, `senderID`, `receiverID`, `textMessage`, and `sentAt`).
8. The frontend updates the chat UI to display the newly sent message at the top.

**Postconditions:**
- The message is securely stored in the database in the `Message` table as shown in the schema.
- The recipient receives the message in their chat interface.

---

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

## Use Case 6: Admin Home Page
**Actor:** Administrator

**Trigger:** The Admin logs into the system and is redirected to the Admin Home Page (`/admin`).

**Preconditions:**
- The Admin is registered with an administrator role and is authenticated.
- The system has user activity data, guide applications, and reported accounts available for review.

**Main Flow (How it is accomplished):**

### Tab 1: Overview (Default View)
1. Upon login, the Admin is presented with the Admin Home Page which displays three tabs at the top: "Overview", "Applications", and "Reports".
2. The "Overview" tab is selected by default.
3. The Admin views a dashboard with options to generate various system activity reports, including:
   - **Number of new profiles created** – Displays the count of user profiles created within a selected time period.
   - **Reported accounts** – Displays the total number of accounts that have been reported by other users.
   - **Number of active users** – Displays the count of users who have logged in or performed activity within a defined period.
   - **Top rated experiences** – Displays a ranked list of the highest-rated tour experiences based on user reviews.
   - **Top rated local guides** – Displays a ranked list of the highest-rated guides based on Explorer feedback.
4. The Admin selects a report type to generate.
5. The frontend sends a GET request to the backend API (e.g., `/api/admin/reports/{reportType}`) with any filter parameters.
6. The backend queries the database, aggregates the requested data, and returns the report results.
7. The frontend renders the report data in a visual format (e.g., cards, charts, or tables).

### Tab 2: Applications
1. The Admin clicks the "Applications" tab.
2. The frontend sends a GET request to the backend API (`/api/admin/applications`) to retrieve a list of users who have applied to become local guides.
3. The backend queries the database for pending guide applications and returns the list.
4. The Admin views the list of applicants, including details such as the applicant's name, email, date of application, and relevant qualifications or experience.
5. The Admin can review each application and take action (e.g., approve or reject the application).
6. Upon approval or rejection, the frontend sends a PUT/PATCH request to the backend API to update the application status.
7. The backend updates the applicant's role or application status in the database and responds with a success status.

### Tab 3: Reports
1. The Admin clicks the "Reports" tab.
2. The frontend sends a GET request to the backend API (`/api/admin/reported-accounts`) to retrieve a list of reported user accounts.
3. The backend queries the database for accounts that have been flagged or reported by other users and returns the list.
4. The Admin views the list of reported accounts, including details such as the reported user's name, the reason for reporting, the reporting user, and the date of the report.
5. The Admin can review each reported account and take action (e.g., issue a warning, suspend the account, or dismiss the report).
6. Upon taking action, the frontend sends a PUT/PATCH request to the backend API to update the account status.
7. The backend updates the reported account's status in the database and responds with a success status.

**Postconditions:**
- The Admin has a comprehensive view of system activity through the Overview dashboard reports.
- Guide applications are reviewed and processed (approved or rejected), with applicant roles updated accordingly.
- Reported accounts are reviewed and appropriate moderation actions are applied to maintain platform safety.

**Alternative Flows:**
- If there are no pending guide applications, the "Applications" tab displays an empty state message (e.g., "No pending applications").
- If there are no reported accounts, the "Reports" tab displays an empty state message (e.g., "No reported accounts").
- If a report fails to generate due to insufficient data, the system displays an informational message indicating no data is available for the selected report type.

---

## Use Case 7: Managing Local Guide Applications
**Actor:** Administrator

**Trigger:** The Admin clicks the "Applications" tab on the Admin Home Page.

**Preconditions:**
- The Admin is authenticated with an administrator role.
- There are one or more pending local guide applications submitted by users.

**Main Flow (How it is accomplished):**
1. The Admin clicks the "Applications" tab on the Admin Home Page.
2. The frontend sends a GET request to the backend API (`/api/admin/applications`) to retrieve a list of users who have applied to become local guides.
3. The backend queries the database for pending guide applications and returns the list.
4. The Admin views a list of applicants, each displaying the applicant's name, email, and date of application.
5. The Admin clicks the "View" button on a specific application to view the full application details.
6. The system displays the full application, including the applicant's name, email, qualifications, experience, and date of submission.
7. At the bottom of the application, two action buttons are displayed: "Accept" and "Reject".

### Accept Flow:
8a. The Admin clicks the "Accept" button.
9a. The frontend sends a PATCH request to the backend API (`/api/admin/applications/{id}/approve`).
10a. The backend updates the application status to "Approved".
11a. The backend updates the applicant's user role from "Explorer" to "Guide", storing their information as a local guide.
12a. The system sends a notification to the applicant informing them of their successful application.
13a. The Admin is returned to the applications list, where the accepted application is no longer displayed.

### Reject Flow:
8b. The Admin clicks the "Reject" button.
9b. The frontend sends a DELETE request to the backend API (`/api/admin/applications/{id}/reject`).
10b. The backend sends a notification to the applicant informing them of their unsuccessful application.
11b. The backend permanently deletes the application record from the database.
12b. The Admin is returned to the applications list, where the rejected application is no longer displayed.

**Postconditions:**
- If accepted: The applicant's role is updated to "Guide" in the system. The applicant is notified of their successful application. Their information is stored as a local guide.
- If rejected: The applicant is notified of their unsuccessful application. The application is permanently deleted from the database.

**Alternative Flows:**
- If there are no pending applications, the "Applications" tab displays an empty state message (e.g., "No pending applications").
- If a network error occurs during the accept or reject action, the system displays an error message and the application remains unchanged.

---

## Use Case 8: Suspending a Reported Account
**Actor:** Administrator

**Trigger:** The Admin clicks the "Reports" tab on the Admin Home Page.

**Preconditions:**
- The Admin is authenticated with an administrator role.
- There are one or more reported accounts in the `Reports` table (columns: `reportID`, `reporterID`, `reportedUserID`, `reason`, `status`, `sentAt`).

**Main Flow (How it is accomplished):**
1. The Admin clicks the "Reports" tab on the Admin Home Page.
2. The frontend sends a GET request to the backend API (`/api/admin/reported-accounts`) to retrieve a list of reported accounts.
3. The backend queries the `Reports` table and joins with the `User` table to return report details including the reported user's name, the reporter's name, the reason, status, and date sent.
4. The Admin views a list of reported accounts, each displaying the reported user's name, the reason for the report, and the date it was submitted.
5. The Admin clicks the "View" button next to a specific reported account to view the full report details.
6. The system displays the full report, including the reported user's name and email, the reporter's name, the reason for the report, and the date submitted.
7. The Admin reads and investigates the report.

### Suspend Flow (Report is Valid):
8a. The Admin determines the report is valid and clicks the "Suspend" button.
9a. The frontend sends a PATCH request to the backend API (`/api/admin/reported-accounts/{reportID}/suspend`).
10a. The backend updates the reported user's `accountStatus` to "Suspended" and records the suspension end date as two weeks from the current date.
11a. The backend updates the report's `status` to "Resolved".
12a. The suspended user will not be able to log into their account for the duration of the two-week suspension period. The login endpoint checks the user's `accountStatus` and denies access if the account is suspended.
13a. After two weeks, the user's account is automatically reactivated, allowing them to log in again.
14a. The Admin is returned to the reports list, where the resolved report is no longer displayed as pending.

### Delete Flow (Report is Invalid):
8b. The Admin determines the report is not valid and clicks the "Delete" button.
9b. The frontend sends a DELETE request to the backend API (`/api/admin/reported-accounts/{reportID}`).
10b. The backend permanently deletes the report record from the `Reports` table.
11b. The reported user's account remains unaffected.
12b. The Admin is returned to the reports list, where the deleted report is no longer displayed.

**Postconditions:**
- If suspended: The reported user's account status is set to "Suspended" for two weeks. The user cannot log in during this period. After two weeks, access is restored. The report status is updated to "Resolved".
- If deleted: The report is permanently removed from the database. The reported user's account is unaffected.

**Alternative Flows:**
- If there are no reported accounts, the "Reports" tab displays an empty state message (e.g., "No reported accounts").
- If a network error occurs during the suspend or delete action, the system displays an error message and the report remains unchanged.
- If the user attempts to log in while suspended, the system displays a message informing them that their account is suspended and the date when access will be restored.

---

## Use Case 9: Reporting a User or Content
**Actor:** User (Explorer or Guide)

**Trigger:** The user clicks on the ellipsis menu (⋯) in the top-right corner of a post.

**Preconditions:**
- The user is registered and logged into the application.
- The user is viewing a post in the community feed.
- The `Reports` table exists in the database with columns: `reportID` (PK, auto-increment), `reporterID` (FK MUL), `reportedUserID` (FK MUL), `reason` (text), `status` (varchar 20), `sentAt` (datetime).

**Main Flow (How it is accomplished):**
1. The user views a post in the community feed on the Explorer Home Page or Explore Page.
2. The user clicks on the ellipsis menu (⋯) in the top-right corner of the post.
3. The system displays two options: "Report Account" and "Report Content".
4. The user clicks on their desired option.

### Report Account Flow:
5a. The user selects "Report Account".
6a. The system navigates the user to a Report Form page, pre-filled with the reported user's ID (`reportedUserID`).
7a. The user fills in the reason for reporting the account in a text field (e.g., inappropriate behaviour, harassment, fake account).
8a. The user clicks the "Submit Report" button.
9a. The frontend sends a POST request to the backend API (`/api/reports`) with the following data:
    - `reporterID`: The currently logged-in user's ID.
    - `reportedUserID`: The ID of the user who owns the post.
    - `reason`: The text entered by the user explaining why they are reporting.
10a. The backend creates a new record in the `Reports` table with `status` set to "Pending" and `sentAt` set to the current date and time.
11a. The backend responds with a success status.
12a. The frontend displays a confirmation message (e.g., "Report submitted successfully") and navigates the user back to the feed.

### Report Content Flow:
5b. The user selects "Report Content".
6b. The system navigates the user to a Report Form page, pre-filled with the reported user's ID (`reportedUserID`) and a reference to the specific post.
7b. The user fills in the reason for reporting the content in a text field (e.g., inappropriate content, misinformation, spam).
8b. The user clicks the "Submit Report" button.
9b. The frontend sends a POST request to the backend API (`/api/reports`) with the following data:
    - `reporterID`: The currently logged-in user's ID.
    - `reportedUserID`: The ID of the user who owns the post.
    - `reason`: The text entered by the user explaining why they are reporting, prefixed with "[Content Report]" to distinguish it from account reports.
10b. The backend creates a new record in the `Reports` table with `status` set to "Pending" and `sentAt` set to the current date and time.
11b. The backend responds with a success status.
12b. The frontend displays a confirmation message (e.g., "Report submitted successfully") and navigates the user back to the feed.

**Postconditions:**
- A new report record is created in the `Reports` table with the reporter's ID, the reported user's ID, the reason for reporting, a status of "Pending", and the date the report was sent.
- The report is visible to the Admin under the "Reports" tab in the Admin Home Page for review.
- The reported user is not notified that they have been reported.

**Alternative Flows:**
- If the user clicks the ellipsis menu but then closes it without selecting an option, no action is taken.
- If the user navigates to the Report Form page but clicks "Back" or closes the page without submitting, no report is created.
- If the reason field is left empty and the user clicks "Submit Report", the system displays a validation error message (e.g., "Please provide a reason for your report").
- If a network error occurs during submission, the system displays an error message and the user can retry.

---

## Use Case 10: Managing Reported Spots/Locations
**Actor:** Administrator

**Trigger:** The Admin clicks the "Reports" tab on the Admin Home Page.

**Preconditions:**
- The Admin is authenticated with an administrator role.
- The "Reports" tab displays two sub-sections: "Reported Accounts" and "Reported Spots".
- There are one or more reported spots in the system.
- The `Spots` table exists in the database with columns: `spotID` (PK, auto-increment), `activityName` (varchar 100, NOT NULL), `activityType` (varchar 50), `description` (text), `location` (varchar 255), `isVerified` (varchar 50), `pictureURL` (longtext), `submittedByUserID` (int), `submittedAt` (datetime).

**Main Flow (How it is accomplished):**
1. The Admin clicks the "Reports" tab on the Admin Home Page.
2. The Admin sees two sub-sections: "Reported Accounts" and "Reported Spots".
3. The Admin clicks on "Reported Spots" to view the list of spots that have been reported by users.
4. The frontend sends a GET request to the backend API (`/api/admin/reported-spots`) to retrieve a list of reported spots.
5. The backend queries the database, aggregates the reports per spot, and returns the list including the total number of reports for each spot.
6. The Admin views a list of reported spots, each displaying:
   - The spot's activity name
   - The spot's location
   - The total number of reports received
   - The current status (Active, Flagged, or Deleted)
7. The Admin clicks the "View" button on a specific reported spot to view its full details.
8. The system displays the full spot details including:
   - **Activity Name** (`activityName`)
   - **Activity Type** (`activityType`)
   - **Description** (`description`)
   - **Location** (`location`)
   - **Verification Status** (`isVerified`)
   - **Picture** (`pictureURL`)
   - **Submitted By** (user who created the spot, from `submittedByUserID`)
   - **Date Submitted** (`submittedAt`)
   - **Number of Reports** (total count of reports for this spot)
9. The Admin reviews the spot and investigates the reports.

### Flag Flow (3 or more reports):
10a. The spot has at least 3 reports. The Admin clicks the "Flag" button.
11a. The frontend sends a PATCH request to the backend API (`/api/admin/reported-spots/{spotID}/flag`).
12a. The backend updates the spot's `isVerified` field to "Flagged" in the `Spots` table.
13a. The flagged spot remains visible to users but displays a warning indicator so users become wary of it.
14a. The Admin is returned to the reported spots list, where the spot now shows a "Flagged" status.

### Delete Flow (more than 5 reports):
10b. The spot has more than 5 reports. The Admin clicks the "Delete" button.
11b. The frontend sends a DELETE request to the backend API (`/api/admin/reported-spots/{spotID}`).
12b. The backend permanently removes the spot record from the `Spots` table.
13b. The spot is no longer visible to any users on the platform.
14b. The Admin is returned to the reported spots list, where the deleted spot is no longer displayed.

**Postconditions:**
- If flagged: The spot's `isVerified` status is updated to "Flagged". The spot remains visible to users but with a warning indicator. Users are made aware that the spot may not be reliable.
- If deleted: The spot is permanently removed from the database. It is no longer accessible to any user.

**Alternative Flows:**
- If there are no reported spots, the "Reported Spots" section displays an empty state message (e.g., "No reported spots").
- If a spot has fewer than 3 reports, the Admin can still investigate but the "Flag" and "Delete" buttons are disabled. The Admin must wait for more reports before taking action.
- If a network error occurs during the flag or delete action, the system displays an error message and the spot remains unchanged.
- If the Admin tries to delete a spot with 5 or fewer reports, the system prevents the action and displays a message (e.g., "A spot must have more than 5 reports to be deleted").
- If the Admin tries to flag a spot with fewer than 3 reports, the system prevents the action and displays a message (e.g., "A spot must have at least 3 reports to be flagged").

---

## Use Case 11: Manage Itinerary (D800)
**Actor:** Local Guide (Primary Actor), Matched Tourist / Explorer (Secondary Actor / Recipient)

**Trigger:** The Local Guide clicks the "Manage Itinerary" button on an assigned tourist's card in the "Manage Tourist Itineraries" section on the Guide Home Page.

**Preconditions:**
1. The Local Guide is registered, authenticated, and logged in with the Guide role.
2. The Guide has at least one assigned/matched Tourist (established via an accepted match or approved 1-on-1 booking request).
3. The system has initialized or can create a corresponding `CustomItinerary` tour record linking the Guide and the Tourist.

**Main Flow (User Interaction Journey):**

### Step 1: Navigating to Manage Itineraries
1. The Guide logs in and lands on the Guide Home Page (`/home`).
2. The Guide scrolls down to the **"Manage Tourist Itineraries"** section, situated between "Local Favourites" and the "Community Feed".
3. The Guide views cards for each assigned tourist, displaying the tourist's initial avatar, full name, and email address.
4. The Guide clicks the **"Manage Itinerary"** button on the desired tourist's card.
5. The application navigates to the dedicated itinerary workspace at `/manage-itinerary/:touristId`.

### Step 2: Loading Tourist & Itinerary Data
6. Upon route entry, the application:
   - Fetches the assigned tourist's profile via `GET /api/local-guide/{guideId}/assigned-tourists` and displays their avatar, full name, and email.
   - Retrieves the existing itinerary via `GET /api/local-guide/{guideId}/itinerary/{touristId}` (which finds or auto-creates a `CustomItinerary` tour record and decodes the timeline JSON stored in `Tour.Description`).
   - If an itinerary already exists, its scheduled activities are populated into the timeline state.

### Step 3: Inspecting Header and Live Stats Bar
7. The Guide views the persistent top header containing:
   - A **"← Back"** button to return to the Guide Home Page.
   - Tourist avatar badge, name, email, and trip label.
   - A prominent **"💾 Save & Notify"** button.
8. Directly below the header, the Guide consults the **Live Stats Bar**, which dynamically recalculates as activities change:
   - **Activities**: Total count of scheduled activities.
   - **Total Duration**: Cumulative sum of hours and minutes across all activities (e.g., `4h 30m`).
   - **Start Time**: The start time of the day's first activity.
   - **End Time**: The calculated ending time of the final activity (start time + duration).

### Step 4: Building & Managing the Itinerary Across Tabs
9. The Guide interacts with three dedicated tabs:

#### A. Itinerary Builder Tab (`🗓️ Itinerary Builder` - Default View)
10. The Guide uses the **"➕ Add New Activity"** form to schedule a stop:
    - **Activity Name** (Mandatory): Enters a title (e.g., *"Visit Table Mountain Cableway"*).
    - **Type**: Selects from 8 categorized options with signature colors and emojis: Sightseeing (🏛️), Dining (🍽️), Transit (🚗), Outdoor (🏕️), Shopping (🛍️), Entertainment (🎭), Accommodation (🏨), or Photo Stop (📸).
    - **Location**: Enters an address or landmark name (e.g., *"Tafelberg Rd, Cape Town"*).
    - **Start Time** (Mandatory): Picks a starting time (e.g., `09:30`).
    - **Duration** (Mandatory): Enters estimated time in standard formats (e.g., `1h`, `45m`, `2h 30m`, or numeric minutes like `90`).
    - **Notes**: Adds optional personalized guidance or tips for the tourist (e.g., *"Bring a light jacket and comfortable shoes"*).
11. The Guide clicks **"+ Add to Timeline"**.
12. The system validates the inputs:
    - Confirms name, start time, and duration are populated and duration is greater than 0.
    - Runs **time-conflict detection** against all currently scheduled activities.
    - If valid, appends the new activity and **automatically sorts the entire timeline chronologically** by start time.
13. The Guide views the visual **Vertical Timeline** beneath the form:
    - Each stop is rendered as a chronological timeline node connected by color-coded indicator lines and dots matching the activity category.
    - Each card displays an index badge (`#1`, `#2`, etc.), start and calculated end times, and full details.
    - **Inline Editing**: The Guide can click directly into any field on a timeline card (name, type dropdown, location, start time, duration, notes) to make instant adjustments without re-submitting a form.
    - **Removing Activities**: The Guide can click the **"✕"** icon button on any card header to delete an activity immediately from the timeline.

#### B. Overview Tab (`📋 Overview`)
14. The Guide clicks the **"📋 Overview"** tab to review the clean day-at-a-glance summary.
15. Each activity is presented in an orderly card row with:
    - Sequence number badge.
    - Color-coded left border.
    - Category type pill badge.
    - Location with map pin icon.
    - Scheduled time window (e.g., `09:30 – 11:00`).
    - Duration and guide notes.
16. If no activities exist yet, an empty state displays an illustration and a **"Go to Builder →"** button.

#### C. Locations Tab (`📍 Locations`)
17. The Guide clicks the **"📍 Locations"** tab to review the geographic route stops.
18. The system displays only activities that have a location specified, ordered sequentially with numeric pin icons, addresses, and scheduled times.
19. A helpful route tip advises visiting the locations in order for the smoothest travel flow.

### Step 5: Saving Changes and Notifying the Tourist
20. Once satisfied with the schedule, the Guide clicks the **"💾 Save & Notify"** button in the header.
21. The button switches to **"Saving..."** and is disabled to prevent duplicate submissions.
22. The frontend serializes the timeline array into JSON and issues a `PUT /api/local-guide/itinerary/{currentTourId}` request.
23. The backend:
    - Updates `Tour.Description` with the serialized timeline JSON and updates the tour timestamp.
    - Auto-generates a notification in the `Notifications` table addressed to the tourist: *"Your guide updated your itinerary schedule."*
24. The frontend alerts the Guide: *"Itinerary saved! The tourist has been notified."*

### Step 6: Tourist Accessing the Updated Itinerary
25. The matched Tourist receives an in-app notification alerting them of the itinerary update.
26. The Tourist navigates to **"My Activities"** (`/activities`) or the **"Bookings"** tab on their Profile page (`/profile`).
27. The custom itinerary booking card renders a glassmorphic itinerary timeline displaying the full sequence of activities, locations, times, and notes curated by their guide.

**Postconditions:**
1. The custom itinerary timeline is securely serialized and stored in the database (`Tour` table with `Type = 'CustomItinerary'`).
2. A persistent notification is dispatched to the assigned tourist.
3. The updated itinerary is immediately accessible to both the Guide (via `/manage-itinerary/:touristId`) and the Tourist (via `/activities` and `/profile`).

**Alternative Flows:**

- **11a. Missing Mandatory Information in Activity Form:**
  - 11a.1. The Guide clicks "+ Add to Timeline" without entering an activity name, start time, or duration.
  - 11a.2. The system triggers a validation alert specifying the missing requirement (e.g., *"Please enter an activity name"*, *"Please set a start time"*, or *"Invalid duration"*).
  - 11a.3. The Guide provides the missing value and clicks "+ Add to Timeline" again.

- **11b. Schedule Overlap / Time Conflict Detected:**
  - 11b.1. The Guide attempts to add an activity whose time span (start time to end time) overlaps with an existing activity on the timeline.
  - 11b.2. The system blocks insertion and displays an alert: *"Time conflict with '[Conflicting Activity Name]'. Choose a different time."*
  - 11b.3. The Guide adjusts the start time or duration to an open window and re-submits.

- **11c. Network Connectivity Interruption / Offline Mode:**
  - 11c.1. The Guide clicks "Save & Notify" while experiencing a network drop (`ERR_NETWORK` or `!navigator.onLine`).
  - 11c.2. The frontend catches the network exception and stores the updated timeline in `localStorage` under `pending_itinerary_{currentTourId}`.
  - 11c.3. The system sets offline mode, rendering a yellow notification banner across the top: *"📶 Offline Mode — Changes saved locally and will sync when you reconnect."*
  - 11c.4. An alert informs the Guide that their changes are preserved locally and will be synchronized when connectivity returns.

- **11d. Empty Itinerary State Navigation:**
  - 11d.1. The Guide switches to the "Overview" or "Locations" tab when no activities have been added yet.
  - 11d.2. The system renders an empty state illustration explaining that no activities are present.
  - 11d.3. The Guide clicks the "Go to Builder →" call-to-action button, which automatically switches the active tab back to the Itinerary Builder.

---

## Use Case 12: Report Spot (D900)
**Actor:** User (Travel Guide, Tourist)

**Trigger:** Clicking the Report option on a specific spot.

**Preconditions:**
- The user must be logged in.

**Main Flow (How it is accomplished):**
1. The actor navigates to a specific spot detail page.
2. The actor clicks the Report icon.
3. The system displays a modal requesting the reason for the report.
4. The actor selects the appropriate reason, optionally adds a comment, and clicks submit.
5. The system logs the report in the database and flags the spot for review by Admin.
6. The system displays a "Report Submitted Successfully" message.

**Postconditions:**
- The spot will be flagged for administrative review.
