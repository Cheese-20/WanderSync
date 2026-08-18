# Entity-Relationship Diagram (IMR)

```mermaid
erDiagram
    Admin {
        int adminID PK
        varchar(50) username 
        varchar(255) hashedPassword 
    }
    Bookings {
        int bookingID PK
        varchar(50) bookingType 
        varchar(20) status 
        datetime bookingDate 
        int numberOfGuests 
        longtext timeOfBooking 
        int userID FK
        int tourID FK
        int curatedSpotID 
    }
    Curated_spots {
        int curatedSpotID PK
        varchar(200) activityName 
        varchar(50) activityType 
        longtext description 
        longtext location 
        tinyint(1) isVerified 
    }
    Explorer {
        int userID PK
    }
    GuideApplication {
        int applicationID PK
        bigint IDno 
        text reason 
        varchar(100) loacation 
        varchar(250) bio 
        int userID FK
        varchar(100) loaction 
    }
    Matches {
        int matchID PK
        int requesterID FK
        int receiverID FK
        text commonInterests 
        varchar(20) status 
        datetime dateMatched 
    }
    Message {
        int mID PK
        int matchID FK
        int senderID FK
        int receiverID FK
        longtext textMessage 
        datetime(6) sentAt 
    }
    Notifications {
        int notificationID PK
        int userID FK
        longtext type 
        longtext message 
        tinyint(1) isRead 
        datetime(6) createdAt 
        datetime(6) scheduledFor 
        int relatedEntityID 
    }
    Posts {
        int postID PK
        int userID FK
        text content 
        longtext pictureURL 
        datetime updatedAt 
        datetime createdAt 
        varchar(50) experienceType 
    }
    Profile {
        int pID PK
        int userID FK
        longtext profilePictureLink 
        text interests 
        datetime createdAt 
        text description 
        varchar(255) location 
        longtext job 
    }
    ReportUser {
        int reportID PK
        int userID PK
        datetime TimeofReport 
    }
    Reports {
        int reportID PK
        int reporterID FK
        int reportedUserID FK
        text reason 
        varchar(20) status 
        datetime sentAt 
    }
    Reviews {
        int reviewID PK
        int reviewerID FK
        int guideID FK
        int rating 
        text comment 
        datetime sentAt 
    }
    SpotVotes {
        int voteID PK
        int spotID FK
        int guideID FK
        varchar(50) voteType 
        datetime(6) votedAt 
    }
    Tours {
        int tourID PK
        int guideID FK
        varchar(100) title 
        varchar(50) type 
        longtext description 
        datetime(6) date 
        int maxPeople 
        decimal(18,2) price 
        varchar(100) location 
        varchar(500) pictureURL 
        longtext imageURL 
    }
    TravelGuide {
        int userID PK
    }
    User {
        int userID PK
        varchar(50) firstName 
        varchar(50) lastName 
        varchar(100) email 
        varchar(15) cellNumber 
        int age 
        varchar(255) hashedPword 
        varchar(20) role 
        varchar(20) accountStatus 
        datetime suspendedUntil 
    }
    curatedSpots {
        int spotID PK
        varchar(100) activityName 
        varchar(50) activityType 
        text description 
        varchar(255) location 
        varchar(50) isVerified 
        longtext pictureURL 
        int submittedByUserID 
        datetime(6) submittedAt 
        decimal(4,2) rating 
    }

    Tours ||--o{ Bookings : "has"
    User ||--o{ Bookings : "makes"
    User ||--o| Explorer : "is a"
    User ||--o{ GuideApplication : "submits"
    User ||--o{ Matches : "requests"
    User ||--o{ Matches : "receives"
    Matches ||--o{ Message : "contains"
    User ||--o{ Message : "receives"
    User ||--o{ Message : "sends"
    User ||--o{ Notifications : "receives"
    User ||--o{ Posts : "authors"
    User ||--o| Profile : "owns"
    Reports ||--o{ ReportUser : "contains"
    User ||--o{ ReportUser : "is_reported"
    User ||--o{ Reports : "reports"
    User ||--o{ Reports : "is_reported_in"
    User ||--o{ Reviews : "writes"
    TravelGuide ||--o{ Reviews : "receives"
    User ||--o{ SpotVotes : "casts"
    curatedSpots ||--o{ SpotVotes : "receives"
    User ||--o{ Tours : "guides"
    User ||--o| TravelGuide : "is a"
```
