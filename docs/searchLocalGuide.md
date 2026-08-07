# Search Local Guide

## Overview

The Search Local Guide feature allows users to find local guides by searching their name, location, interests, or description. Accessible via the "Explore" navigation link, it presents a search bar and displays matching guide cards that link to full guide profiles.

## User Flow

1. User clicks "Explore" in the navigation bar
2. Page loads showing all available local guides
3. User types a search term (name, location, or interest) into the search input
4. User clicks "Search" or presses Enter
5. Results update to show only matching guides
6. User clicks a guide card or "View Profile" button to navigate to the guide's detail page

## API Endpoint

### GET /api/local-guide/search

Searches for approved local guides by matching the query against name, location, interests, and description.

**Query Parameters:**

| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| query     | string | No       | Search term to filter guides by      |

- If `query` is empty or omitted, all approved guides are returned.
- Search is case-insensitive and matches partial strings.

**Response (200 OK):**

```json
[
  {
    "guideId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "profilePictureLink": "https://...",
    "location": "Cape Town",
    "description": "Experienced hiking guide",
    "job": "Tour Guide",
    "interests": "Hiking, Photography, Wildlife"
  }
]
```

**Error Response (500):**

```json
{
  "message": "Failed to search guides."
}
```

## Frontend Components

### ExplorePage (`src/pages/ExplorePage.jsx`)

- **Route:** `/explore`
- **Search form:** Text input with clear button and submit button
- **Results grid:** Responsive card layout showing guide avatar, name, location, job, description, and interests
- **States:** Loading spinner, error message, empty state, results count

### Styles (`src/styles/explore.css`)

Follows the existing project design system:
- Green accent color (#1a8f66)
- Card-based layout with hover effects
- Responsive grid (single column on mobile)
- Elevated search bar overlapping the hero section

## Files Modified/Created

| File | Action |
|------|--------|
| `backend/Controllers/LocalGuideController.cs` | Added `SearchGuides` endpoint |
| `src/pages/ExplorePage.jsx` | Rewrote stub with full search UI |
| `src/styles/explore.css` | Created page styles |
