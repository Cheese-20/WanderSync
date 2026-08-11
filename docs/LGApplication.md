# Local Guide Application - Use Case C400

## Overview
Allows users to apply to become a Local Guide through an application form accessible from their profile.

## Actors
- User (Explorer)
- System

## Pre-Conditions
- User must be logged in with a valid account.

## Triggers
- User clicks the "Apply to be a Local Guide" button on their Profile page.

## Post-Conditions
- Application is submitted and stored in the `GuideApplication` table.
- User's role is updated to "PendingGuide" while awaiting admin review.

## Database Schema (`GuideApplication` Table)
| Column        | Type           | Description                     |
|---------------|----------------|---------------------------------|
| applicationID | int (PK)       | Auto-generated application ID   |
| IDno          | bigint         | User's ID number                |
| reason        | text           | Reason for applying (optional)  |
| loaction      | char(1)        | User's location/city            |
| bio           | varchar(250)   | Short bio about guiding expertise |
| userID        | int (FK)       | References the Users table       |

## Basic Flow of Events

1. The user navigates to their **Profile** page (`/profile`).
2. The user clicks the **"Apply to be a Local Guide"** button located below the profile form.
3. The system redirects the user to the Local Guide Application form (`/apply-guide`).
4. The user fills in the required fields:
   - **ID Number** (required, numeric only)
   - **Location** (required)
   - **Bio** (required, max 250 characters)
   - **Reason** (optional)
5. The user clicks **"Submit Application"**.
6. The system validates the form fields on the client side.
7. The system sends a POST request to `/api/local-guide/apply` with the form data.
8. The backend validates the request, checks for duplicate applications, and inserts the record into the `GuideApplication` table.
9. The backend updates the user's role to "PendingGuide".
10. The system displays a success message and redirects the user back to their profile.

## Alternative Flows

- **User not logged in**: System redirects to login page with a message prompting them to log in.
- **Duplicate application**: System returns a conflict error indicating the user already has a pending application.
- **Validation failure**: Error messages are displayed next to the invalid fields; form is not submitted.
- **Server error**: A generic error message is shown asking the user to try again.

## Technical Implementation

### Frontend
- **Page**: `src/pages/LocalGuideApplication.jsx`
- **Route**: `/apply-guide` (defined in `App.jsx`)
- **Profile button**: Located in `src/pages/Profile.jsx` within the `.apply-guide-section` div
- **Styles**: `src/styles/localGuide.css`

### Backend
- **Controller**: `backend/Controllers/LocalGuideController.cs`
- **Endpoint**: `POST /api/local-guide/apply`
- **Model**: `backend/Models/LocalGuideApplication.cs` (maps to `GuideApplication` table)
- **DTO**: `GuideApplicationRequest` class (defined in the controller file)
