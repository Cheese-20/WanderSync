# User Submitted Locations

## Overview

Users can submit new locations (landmarks, restaurants, hidden gems, etc.) to the WanderSync platform. All submitted locations require **admin verification** before they become visible to the community. This ensures quality control and prevents spam or inappropriate content.

## Workflow

1. **User submits a location** via `POST /api/user-submitted-locations`
2. Location is stored with status `Pending`
3. **Admin reviews** the submission via `PUT /api/user-submitted-locations/{id}/verify`
4. Admin either **Approves** or **Rejects** the location (with optional rejection reason)
5. Only admins (verified against the `Admin` table) can approve, reject, or delete locations

## API Endpoints

### Submit a Location (Any User)

```
POST /api/user-submitted-locations
```

**Request Body:**
```json
{
  "userID": 1,
  "locationName": "Table Mountain",
  "description": "Iconic flat-topped mountain overlooking Cape Town",
  "address": "Table Mountain National Park",
  "city": "Cape Town",
  "country": "South Africa",
  "latitude": -33.9625,
  "longitude": 18.4039,
  "category": "Landmark",
  "imageURL": "https://example.com/table-mountain.jpg"
}
```

**Response (200):**
```json
{
  "message": "Location submitted successfully and is pending admin verification.",
  "locationID": 5
}
```

---

### Get All Locations

```
GET /api/user-submitted-locations
GET /api/user-submitted-locations?status=Pending
GET /api/user-submitted-locations?status=Approved
GET /api/user-submitted-locations?status=Rejected
```

**Response (200):**
```json
[
  {
    "locationID": 5,
    "userID": 1,
    "submittedBy": "John Doe",
    "locationName": "Table Mountain",
    "description": "Iconic flat-topped mountain overlooking Cape Town",
    "address": "Table Mountain National Park",
    "city": "Cape Town",
    "country": "South Africa",
    "latitude": -33.9625,
    "longitude": 18.4039,
    "category": "Landmark",
    "imageURL": "https://example.com/table-mountain.jpg",
    "status": "Pending",
    "rejectionReason": null,
    "submittedAt": "2026-08-10T12:00:00Z",
    "verifiedAt": null
  }
]
```

---

### Get Location by ID

```
GET /api/user-submitted-locations/{id}
```

---

### Verify a Location (Admin Only)

```
PUT /api/user-submitted-locations/{id}/verify
```

**Request Body:**
```json
{
  "adminID": 1,
  "status": "Approved"
}
```

Or to reject:
```json
{
  "adminID": 1,
  "status": "Rejected",
  "rejectionReason": "Duplicate entry - this location already exists."
}
```

**Response (200):**
```json
{
  "message": "Location has been approved successfully.",
  "locationID": 5,
  "status": "Approved",
  "verifiedByAdminID": 1,
  "verifiedAt": "2026-08-10T14:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` — adminID does not match any record in the Admin table
- `400 Bad Request` — invalid status or location already verified
- `404 Not Found` — location ID does not exist

---

### Delete a Location (Admin Only)

```
DELETE /api/user-submitted-locations/{id}?adminID=1
```

**Response (200):**
```json
{
  "message": "Location deleted successfully."
}
```

## Authorization Model

- The verification and deletion endpoints enforce admin-only access by checking the provided `adminID` against the `Admin` database table.
- If the `adminID` does not correspond to a valid admin record, the request is rejected with `401 Unauthorized`.
- Regular users can only submit locations and view their status.

## Database Table: UserSubmittedLocations

| Column             | Type       | Description                                      |
|--------------------|------------|--------------------------------------------------|
| locationID         | int (PK)   | Auto-increment primary key                       |
| userID             | int        | ID of the user who submitted the location        |
| locationName       | string     | Name of the location                             |
| description        | string     | Description of the location                      |
| address            | string     | Street address                                   |
| city               | string     | City name                                        |
| country            | string     | Country name                                     |
| latitude           | double?    | GPS latitude (optional)                          |
| longitude          | double?    | GPS longitude (optional)                         |
| category           | string     | Category (Landmark, Restaurant, Park, etc.)      |
| imageURL           | string?    | URL to an image of the location (optional)       |
| status             | string     | Pending, Approved, or Rejected                   |
| verifiedByAdminID  | int?       | Admin who verified the location                  |
| rejectionReason    | string?    | Reason for rejection (if rejected)               |
| submittedAt        | datetime   | When the location was submitted                  |
| verifiedAt         | datetime?  | When the location was verified/rejected          |

## Files

- **Model:** `backend/Models/UserSubmittedLocation.cs`
- **Controller:** `backend/Controllers/UserSubmittedLocationsController.cs`
- **DbContext:** `backend/Data/WanderSyncDbContext.cs` (DbSet added)
