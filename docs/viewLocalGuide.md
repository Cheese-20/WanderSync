# View Local Guide

**Actors:** User (Explorer), System

## Pre-Conditions

- User must be registered and logged in to the system.
- At least one user with the role "Guide" (approved local guide) must exist in the system.

## Triggers

User clicks on "Discover" in the main navigation bar and selects the "Local Guides" tab/filter.

## Post-Conditions

System displays local guide information to the user.

## Basic Flow of Events / Main Success Scenario

1. The user clicks on "Discover" in the main navigation bar.
2. The system displays the Discover page with a "Local Guides" section/tab.
3. The system calls `GET /api/local-guide/list` to retrieve all users with an approved guide role.
4. The system displays a list of available local guides showing each guide's name, profile picture, location, and a short description.
5. The user selects a specific guide from the list.
6. The system calls `GET /api/local-guide/{guideId}` to retrieve the guide's full profile details.
7. The system calls `GET /api/tours/guide/{guideId}` to retrieve the guide's available itineraries/tours.
8. The system displays the selected guide's profile including their experience, location, and available itineraries (tours).
9. The user can optionally proceed to book a tour or contact the guide via the messaging system.

## Alternative Flows

**3a. No guides available:**
- The system displays a message: "No local guides are available at this time."

**6a. Guide profile not found:**
- The system displays an error message and returns the user to the guide list.

**9a. User chooses to contact the guide:**
- The system navigates the user to the Messages page with the selected guide as the active contact.

**9b. User chooses to book a tour:**
- The system navigates the user to a booking confirmation flow for the selected tour.

## Notes

- The navigation entry point is "Discover" (main nav bar) rather than a sub-navigation under Messages. The current system NavBar supports: Discover, Match, Explore, Messages, Profile.
- The backend currently has `GET /api/tours/guide/{guideId}` available for fetching a guide's tours.
- The following backend endpoints need to be implemented to fully support this use case:
  - `GET /api/local-guide/list` — returns all users with an approved "Guide" role along with their profile info.
  - `GET /api/local-guide/{guideId}` — returns a single guide's full profile (experience, location, rating, tours).
- Rating data is not currently stored in the system. A future enhancement could add a reviews/ratings table for guides.
