# View Other User's Profile

**Actors:** User (Explorer), System

## Pre-Conditions

- User must be registered and logged in to the system.
- The target user must have a profile saved in the system.

## Triggers

User clicks on another user's name or avatar from one of the following pages:

- **ExplorerHome (Community Feed):** Clicking a post author's username.
- **Match:** Clicking the "View Full Profile" button on a match card.
- **Messages:** Clicking the contact name in the chat header or the "View Profile" button.

## Post-Conditions

System displays the target user's public profile information in a read-only view.

## Basic Flow of Events / Main Success Scenario

1. The user is on the ExplorerHome, Match, or Messages page.
2. The user clicks on another user's name, avatar, or "View Profile" button.
3. The system navigates to `/user/{userId}`.
4. The system calls `GET /api/profile/public/{userId}` to retrieve the target user's combined user and profile data.
5. The system displays the target user's public profile including:
   - Profile picture
   - First and last name
   - Job title
   - Location
   - Age
   - Bio/description
   - Interests (as tags)
   - Member since date
6. The user can optionally click "Message" to navigate to the Messages page.
7. The user can click "Back" to return to the previous page.

## Alternative Flows

**4a. User profile not found (404):**
- The system displays a message: "User profile not found."
- The system shows a "Go Back" button to return the user to the previous page.

**4b. Server error:**
- The system displays a message: "Unable to load profile. Please try again later."
- The system shows a "Go Back" button.

**Entry from ExplorerHome:**
- The user sees a community post and clicks the post author's username (in the post header or the bold name in the post body).
- The system navigates to the author's public profile.

**Entry from Match:**
- The user is swiping through match cards and clicks "View Full Profile" on a card.
- The system navigates to the matched user's public profile.
- The user can review the full profile before returning to decide on the match.

**Entry from Messages:**
- The user is in an active chat conversation and clicks the contact's name in the chat header or the "View Profile" button.
- The system navigates to the contact's public profile.

## API Endpoint

### `GET /api/profile/public/{userId}`

**Description:** Returns the combined user account information and profile data for a given user.

**Response (200 OK):**

```json
{
  "userID": 1,
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "age": 28,
  "profilePictureLink": "https://...",
  "interests": "hiking, photography, food",
  "description": "Passionate traveler exploring the world.",
  "location": "Cape Town",
  "job": "Digital Nomad",
  "createdAt": "2026-06-30"
}
```

**Error Responses:**
- `400` — Invalid userID provided.
- `404` — User not found.
- `500` — Internal server error.

## Frontend Components

| Component | File | Role |
|-----------|------|------|
| UserProfile page | `src/pages/UserProfile.jsx` | Read-only profile display |
| UserProfile styles | `src/styles/userprofile.css` | Page styling |
| Route | `/user/:userId` in `src/App.jsx` | Routing entry |

## Entry Points (Clickable Links)

| Source Page | Element | Navigation |
|-------------|---------|------------|
| ExplorerHome | Post author username (header + body) | `/user/{post.userID}` |
| Match | "View Full Profile" button on card | `/user/{currentMatch.userID}` |
| Messages | Chat header name + "View Profile" button | `/user/{activeContact.userID}` |

## Notes

- The profile view is read-only. Users cannot edit another user's profile.
- The "Message" button on the profile page navigates to the Messages page. A future enhancement could pre-select the user as the active contact.
- The back button uses browser history (`navigate(-1)`) so the user returns to whichever page they came from.
- The profile page is wrapped in the authenticated Layout component, so the NavBar is visible.
