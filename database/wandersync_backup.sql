-- ============================================================
-- WanderSync Database Dump
-- Generated: 2026-10-06 18:20:06
-- Import with: mysql -u root -p WanderSync < wandersync_local_setup.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS WanderSync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE WanderSync;

SET FOREIGN_KEY_CHECKS=0;

-- Table: Admin
DROP TABLE IF EXISTS `Admin`;
CREATE TABLE `Admin` (
  `adminID` int NOT NULL AUTO_INCREMENT,
  `username` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `hashedPassword` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`adminID`)
);

INSERT INTO `Admin` (`adminID`, `username`, `hashedPassword`) VALUES
  (1, 'admin_wandersync', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (2, 'ops_manager', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (3, 'content_moderator', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (4, 'support_lead', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (5, 'safety_officer', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (6, 'finance_admin', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (7, 'partnerships_mgr', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (8, 'data_analyst', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (9, 'community_manager', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (10, 'tech_support', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (11, 'marketing_lead', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (12, 'legal_compliance', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (13, 'guide_coordinator', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (14, 'dispute_resolver', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e'),
  (15, 'super_admin', '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e');

-- Table: Bookings
DROP TABLE IF EXISTS `Bookings`;
CREATE TABLE `Bookings` (
  `bookingID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `tourID` int NOT NULL,
  `curatedSpotID` int NOT NULL,
  `numberOfGuests` int NOT NULL,
  `bookingType` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `bookingDate` datetime(6) NOT NULL,
  `timeOfBooking` longtext NOT NULL,
  `userName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `userSurname` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `tourName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `tourLocation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`bookingID`)
);

INSERT INTO `Bookings` (`bookingID`, `userID`, `tourID`, `curatedSpotID`, `numberOfGuests`, `bookingType`, `status`, `bookingDate`, `timeOfBooking`, `userName`, `userSurname`, `tourName`, `tourLocation`) VALUES
  (1, 1, 1, 1, 2, 'Tour', 'Confirmed', '2026-10-05 00:00:00', '09:00', 'Amahle', 'Dlamini', 'Soweto Heritage Walk', 'Soweto, Johannesburg'),
  (2, 3, 2, 2, 1, 'Tour', 'Confirmed', '2026-10-12 00:00:00', '08:30', 'Zanele', 'Mokoena', 'Cape Winelands Cycling Tour', 'Stellenbosch, Western Cape'),
  (3, 5, 3, 3, 3, 'Tour', 'Pending', '2026-10-19 00:00:00', '05:00', 'Nomvula', 'Zulu', 'Cathedral Peak Sunrise Hike', 'Bergville, KwaZulu-Natal'),
  (4, 7, 4, 4, 2, 'Tour', 'Confirmed', '2026-10-26 00:00:00', '10:00', 'Lerato', 'Sithole', 'Knysna Lagoon Kayaking', 'Knysna, Western Cape'),
  (5, 9, 5, 5, 4, 'Tour', 'Confirmed', '2026-11-02 00:00:00', '16:00', 'Nokwanda', 'Ndlovu', 'Shakaland Zulu Cultural Evening', 'Eshowe, KwaZulu-Natal'),
  (6, 11, 6, 6, 1, 'Tour', 'Confirmed', '2026-11-09 00:00:00', '09:30', 'Thandeka', 'Khoza', 'Kirstenbosch Botanical Walk', 'Cape Town, Western Cape'),
  (7, 13, 7, 7, 2, 'Tour', 'Pending', '2026-11-16 00:00:00', '08:00', 'Ntombi', 'Mhlongo', 'Isandlwana Battlefield Tour', 'Dundee, KwaZulu-Natal'),
  (8, 15, 8, 8, 1, 'Tour', 'Confirmed', '2026-11-23 00:00:00', '11:00', 'Ayanda', 'Buthelezi', 'Newtown Arts and Street Food Tour', 'Newtown, Johannesburg'),
  (9, 1, 9, 9, 2, 'Tour', 'Cancelled', '2026-11-30 00:00:00', '13:00', 'Amahle', 'Dlamini', 'Franschhoek Food and Wine Pairing', 'Franschhoek, Western Cape'),
  (10, 3, 10, 10, 3, 'Tour', 'Confirmed', '2026-12-07 00:00:00', '07:00', 'Zanele', 'Mokoena', 'Amphitheatre Waterfall Walk', 'Royal Natal National Park, KZN'),
  (11, 5, 11, 11, 2, 'Tour', 'Confirmed', '2026-12-14 00:00:00', '18:30', 'Nomvula', 'Zulu', 'Wilderness Bioluminescence Canoe', 'Wilderness, Western Cape'),
  (12, 7, 12, 12, 4, 'Tour', 'Pending', '2026-12-21 00:00:00', '09:00', 'Lerato', 'Sithole', 'Valley of a Thousand Hills Drive', 'Bothas Hill, KwaZulu-Natal'),
  (13, 9, 13, 13, 1, 'Tour', 'Confirmed', '2026-12-28 00:00:00', '08:00', 'Nokwanda', 'Ndlovu', 'Cape Point Nature Reserve Hike', 'Cape Point, Western Cape'),
  (14, 11, 14, 14, 2, 'Tour', 'Confirmed', '2027-01-04 00:00:00', '09:00', 'Thandeka', 'Khoza', 'Blood River Monument Tour', 'Nquthu, KwaZulu-Natal'),
  (15, 13, 15, 15, 3, 'Tour', 'Confirmed', '2027-01-11 00:00:00', '05:30', 'Ntombi', 'Mhlongo', 'Hluhluwe-iMfolozi Big Five Safari', 'Hluhluwe, KwaZulu-Natal'),
  (16, 24, 2, 0, 3, 'Standard', 'Pending', '2026-10-12 08:30:00', '08:30', NULL, NULL, NULL, NULL),
  (17, 24, 9103, 0, 1, 'Standard', 'Pending', '2026-09-18 07:30:00', '07:30', NULL, NULL, NULL, NULL),
  (18, 24, 9106, 0, 4, 'Standard', 'Pending', '2026-09-30 18:00:00', '18:00', NULL, NULL, NULL, NULL),
  (19, 25, 4, 0, 3, 'Standard', 'Pending', '2026-10-26 10:00:00', '10:00', NULL, NULL, NULL, NULL);

-- Table: GuideApplication
DROP TABLE IF EXISTS `GuideApplication`;
CREATE TABLE `GuideApplication` (
  `applicationID` int NOT NULL AUTO_INCREMENT,
  `IDno` bigint NOT NULL,
  `reason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `loaction` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bio` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `userID` int NOT NULL,
  `userName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `userSurname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`applicationID`),
  KEY `IX_GuideApplication_userID` (`userID`),
  CONSTRAINT `FK_GuideApplication_User_userID` FOREIGN KEY (`userID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
);

INSERT INTO `GuideApplication` (`applicationID`, `IDno`, `reason`, `loaction`, `bio`, `userID`, `userName`, `userSurname`) VALUES
  (1, 9001010001085, 'I have lived in Soweto my entire life and know its history from the inside. I want to share the authentic story of this iconic township with visitors.', 'Soweto, Johannesburg', 'A third-generation Soweto resident who has studied the local history of the 1976 uprisings and township culture for over 10 years.', 1, 'Amahle', 'Dlamini'),
  (2, 8504230002086, 'I am passionate about conservation in the Cape Floral Kingdom and want to share my knowledge with tourists who typically miss the fynbos experience.', 'Cape Town, Western Cape', 'Holder of a Botany diploma from Stellenbosch University. Volunteer guide at Kirstenbosch for 3 years.', 3, 'Zanele', 'Mokoena'),
  (3, 9612150003087, 'I grew up near Kruger and my family are all field guides. I want to formalise my expertise and share wildlife knowledge with international visitors.', 'Hazyview, Mpumalanga', 'Completed the FGASA Field Guides Association Level 1 course. Fluent in Zulu, Tsonga and English.', 5, 'Nomvula', 'Zulu'),
  (4, 9807240004088, 'Joburg art scene is invisible to most tourists. I want to change that by leading immersive art and culture tours through the city creative districts.', 'Johannesburg, Gauteng', 'Practising artist and member of the Market Photo Workshop in Newtown. Curated three exhibitions.', 7, 'Lerato', 'Sithole'),
  (5, 3120005089, 'I want to guide mindful wellness travel experiences for tourists seeking something deeper than sightseeing - connecting with nature and local communities.', 'Pietermaritzburg, KZN', 'Qualified yoga instructor (200hr RYT). Has led wellness retreats in the Drakensberg for 4 years.', 9, 'Nokwanda', 'Ndlovu'),
  (6, 109180006080, 'I have documented over 150 local Durban food spots on my blog. I want to turn that knowledge into curated food tour experiences for visitors.', 'Durban, KwaZulu-Natal', 'Food blogger with 28000 Instagram followers. Former kitchen manager at a Durban Indian restaurant.', 11, 'Thandeka', 'Khoza'),
  (7, 9410090007081, 'I want to turn my deep knowledge of Durban Indian Ocean food culture into guided food experiences celebrating the city unique multicultural identity.', 'Durban, KwaZulu-Natal', 'University of KZN Food Studies graduate. Writes for the Durban Food Guide and runs tasting events.', 13, 'Ntombi', 'Mhlongo'),
  (8, 205220008082, 'As an astronomy student, I want to guide dark sky experiences in the Karoo and show South Africans and tourists the incredible night skies we are lucky to have.', 'Pretoria, Gauteng', 'First-year BSc Astronomy student at UP. Completed the SAAO Amateur Astronomer certification course.', 15, 'Ayanda', 'Buthelezi'),
  (9, 8901150009083, 'I guide horse trails through the Natal Midlands. I want to create a registered eco-tourism experience combining horse riding with community visits.', 'Mooi River, KwaZulu-Natal', 'Professional equestrian with 15 years experience. Runs a small stables and has hosted 200+ trail rides.', 1, 'Amahle', 'Dlamini'),
  (10, 9305270010084, 'I specialise in rock art of the San people in the uKhahlamba-Drakensberg. This is endangered heritage that needs expert interpretation for visitors.', 'Bergville, KwaZulu-Natal', 'Holds a Heritage Studies certificate from UKZN. Worked with AMAFA as a voluntary rock art recorder.', 3, 'Zanele', 'Mokoena'),
  (11, 9611040011085, 'The Midlands Meander is one of SA best craft routes but most people rush through it. I want to create slow, immersive craft village experiences for tourists.', 'Nottingham Road, KZN', 'Ceramic artist and craft market organiser. Member of the Midlands Meander Association for 6 years.', 5, 'Nomvula', 'Zulu'),
  (12, 2180012086, 'I want to guide cycling tours through Johannesburg inner city to help visitors see the economic renaissance and creative renewal happening there.', 'Johannesburg, Gauteng', 'Urban cycling advocate and co-founder of the Joburg Commuter Cyclists group. Knows every safe city route.', 7, 'Lerato', 'Sithole'),
  (13, 9808310013087, 'I have spent years photographing the underwater world of Sodwana Bay. I want to guide snorkelling and dive discovery experiences for beginners.', 'Sodwana Bay, KwaZulu-Natal', 'PADI Open Water Divemaster. Has logged over 500 dives at Sodwana and speaks fluent dive ecology.', 9, 'Nokwanda', 'Ndlovu'),
  (14, 105240014088, 'I volunteer with San heritage societies and want to guide walking tours that tell the Khoisan story across South Africa northern Cape landscape.', 'Upington, Northern Cape', 'Member of the Xam San Revival Project. Studied Khoisan linguistics at UCT. Speaks Nama dialect.', 11, 'Thandeka', 'Khoza'),
  (15, 9702190015089, 'I want to offer literary walking tours of Cape Town and Joburg - connecting visitors to South African writers, poets, and the places that shaped them.', 'Cape Town, Western Cape', 'English Literature graduate from UCT. Published short story writer. Runs book club tours on weekends.', 13, 'Ntombi', 'Mhlongo'),
  (16, 401237891023, 'fun', 'Gqeberha, South Africa', 'Life is cool', 24, NULL, NULL);

-- Table: Matches
DROP TABLE IF EXISTS `Matches`;
CREATE TABLE `Matches` (
  `matchID` int NOT NULL AUTO_INCREMENT,
  `requesterID` int NOT NULL,
  `receiverID` int NOT NULL,
  `commonInterests` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `dateMatched` datetime(6) NOT NULL,
  `requesterName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `requesterSurname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `recieverName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `recieverSurname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`matchID`),
  KEY `IX_Matches_receiverID` (`receiverID`),
  KEY `IX_Matches_requesterID` (`requesterID`),
  CONSTRAINT `FK_Matches_User_receiverID` FOREIGN KEY (`receiverID`) REFERENCES `User` (`userID`) ON DELETE CASCADE,
  CONSTRAINT `FK_Matches_User_requesterID` FOREIGN KEY (`requesterID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
);

INSERT INTO `Matches` (`matchID`, `requesterID`, `receiverID`, `commonInterests`, `status`, `dateMatched`, `requesterName`, `requesterSurname`, `recieverName`, `recieverSurname`) VALUES
  (1, 1, 3, 'Photography,Beach,Nature Walks', 'accepted', '2025-07-01 10:00:00', 'Amahle', 'Dlamini', 'Zanele', 'Mokoena'),
  (2, 1, 5, 'Wildlife,Hiking,Camping', 'accepted', '2025-07-02 11:00:00', 'Amahle', 'Dlamini', 'Nomvula', 'Zulu'),
  (3, 3, 7, 'Art,History,Photography', 'accepted', '2025-07-03 12:00:00', 'Zanele', 'Mokoena', 'Lerato', 'Sithole'),
  (4, 5, 9, 'Safari,Birdwatching,Nature Walks', 'accepted', '2025-07-04 13:00:00', 'Nomvula', 'Zulu', 'Nokwanda', 'Ndlovu'),
  (5, 7, 11, 'Art,Photography,Budget Travel', 'accepted', '2025-07-05 14:00:00', 'Lerato', 'Sithole', 'Thandeka', 'Khoza'),
  (6, 9, 13, 'Wellness,Food Tours,Market', 'accepted', '2025-07-06 15:00:00', 'Nokwanda', 'Ndlovu', 'Ntombi', 'Mhlongo'),
  (7, 11, 15, 'Stargazing,Budget Travel,Camping', 'accepted', '2025-07-07 16:00:00', 'Thandeka', 'Khoza', 'Ayanda', 'Buthelezi'),
  (8, 13, 1, 'Food Tours,Photography,Beach', 'pending', '2025-07-08 09:00:00', 'Ntombi', 'Mhlongo', 'Amahle', 'Dlamini'),
  (9, 15, 3, 'Stargazing,Marine Life,Beach', 'pending', '2025-07-09 10:00:00', 'Ayanda', 'Buthelezi', 'Zanele', 'Mokoena'),
  (10, 1, 7, 'Photography,History,Art', 'rejected', '2025-07-10 11:00:00', 'Amahle', 'Dlamini', 'Lerato', 'Sithole'),
  (11, 3, 9, 'Beach,Wellness,Marine Life', 'accepted', '2025-07-11 12:00:00', 'Zanele', 'Mokoena', 'Nokwanda', 'Ndlovu'),
  (12, 5, 11, 'Camping,Budget Travel,Safari', 'accepted', '2025-07-12 13:00:00', 'Nomvula', 'Zulu', 'Thandeka', 'Khoza'),
  (13, 7, 13, 'History,Food Tours,Photography', 'accepted', '2025-07-13 14:00:00', 'Lerato', 'Sithole', 'Ntombi', 'Mhlongo'),
  (14, 9, 15, 'Nature Walks,Stargazing,Wellness', 'pending', '2025-07-14 15:00:00', 'Nokwanda', 'Ndlovu', 'Ayanda', 'Buthelezi'),
  (15, 11, 3, 'Budget Travel,Photography,Beach', 'accepted', '2025-07-15 16:00:00', 'Thandeka', 'Khoza', 'Zanele', 'Mokoena'),
  (16, 24, 1, 'Hiking,Photography,Wildlife', 'rejected', '2026-09-15 20:38:07.390196', NULL, NULL, NULL, NULL),
  (17, 24, 2, 'Township Tours,History,Food', 'pending', '2026-09-15 20:38:23.683357', NULL, NULL, NULL, NULL),
  (18, 24, 3, 'Beach,Surfing,Marine Life', 'pending', '2026-09-15 20:38:53.582565', NULL, NULL, NULL, NULL);

-- Table: Message
DROP TABLE IF EXISTS `Message`;
CREATE TABLE `Message` (
  `mID` int NOT NULL AUTO_INCREMENT,
  `matchID` int NOT NULL,
  `senderID` int NOT NULL,
  `receiverID` int NOT NULL,
  `textMessage` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sentAt` datetime(6) NOT NULL,
  `senderName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `senderSurname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `recieverName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `recieverSurname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `statusMatch` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`mID`),
  KEY `IX_Message_MatchID` (`matchID`),
  KEY `IX_Message_SentAt` (`sentAt`)
);

INSERT INTO `Message` (`mID`, `matchID`, `senderID`, `receiverID`, `textMessage`, `sentAt`, `senderName`, `senderSurname`, `recieverName`, `recieverSurname`, `statusMatch`) VALUES
  (1, 1, 1, 3, 'Hey Zanele! I noticed we both love photography and beaches. Are you planning any trips to the Cape south coast this summer?', '2025-07-01 10:30:00', 'Amahle', 'Dlamini', 'Zanele', 'Mokoena', 'accepted'),
  (2, 1, 3, 1, 'Hi Amahle! Yes actually! I was thinking of doing the De Hoop Nature Reserve over the September long weekend. Are you keen?', '2025-07-01 11:00:00', 'Zanele', 'Mokoena', 'Amahle', 'Dlamini', 'accepted'),
  (3, 1, 1, 3, 'De Hoop is on my bucket list! The whale nursery there is supposed to be incredible in September. Let us absolutely plan this together.', '2025-07-01 11:30:00', 'Amahle', 'Dlamini', 'Zanele', 'Mokoena', 'accepted'),
  (4, 2, 1, 5, 'Nomvula, your Kruger posts are amazing! I have never done a self-drive safari. Any tips for a first-timer?', '2025-07-02 14:00:00', 'Amahle', 'Dlamini', 'Nomvula', 'Zulu', 'accepted'),
  (5, 2, 5, 1, 'Welcome to the self-drive life! Pack before sunrise, go slow at river crossings, and always check the waterhole at Nkumbe. Big Five practically guaranteed at dawn.', '2025-07-02 14:45:00', 'Nomvula', 'Zulu', 'Amahle', 'Dlamini', 'accepted'),
  (6, 3, 3, 7, 'Lerato! I heard you know the Newtown arts scene. Any new street art murals I should visit before they get painted over?', '2025-07-03 16:00:00', 'Zanele', 'Mokoena', 'Lerato', 'Sithole', 'accepted'),
  (7, 3, 7, 3, 'There is a brand new mural on the corner of Bree and Quinn by Faith47 that just went up last week. You have to see it in morning light.', '2025-07-03 16:30:00', 'Lerato', 'Sithole', 'Zanele', 'Mokoena', 'accepted'),
  (8, 4, 5, 9, 'Nokwanda, I saw you love yoga and nature. Have you tried the sunrise yoga session at the Blyde River Canyon viewpoints?', '2025-07-04 08:00:00', 'Nomvula', 'Zulu', 'Nokwanda', 'Ndlovu', 'accepted'),
  (9, 4, 9, 5, 'That sounds like an absolute dream! I would love to combine that with some gentle birdwatching. Can we plan a Mpumalanga road trip?', '2025-07-04 08:45:00', 'Nokwanda', 'Ndlovu', 'Nomvula', 'Zulu', 'accepted'),
  (10, 5, 7, 11, 'Thandeka! Your student travel posts are so inspiring. How do you afford the Otter Trail on a student budget?', '2025-07-05 13:00:00', 'Lerato', 'Sithole', 'Thandeka', 'Khoza', 'accepted'),
  (11, 5, 11, 7, 'Book in the annual January lottery when prices are lowest, share campsites with strangers who become friends, and bring all your own food. You can do it for R800 total!', '2025-07-05 13:30:00', 'Thandeka', 'Khoza', 'Lerato', 'Sithole', 'accepted'),
  (12, 6, 9, 13, 'Ntombi, your bunny chow review had me drooling! Which Victoria Street Market stall should I visit for the freshest spices?', '2025-07-06 12:00:00', 'Nokwanda', 'Ndlovu', 'Ntombi', 'Mhlongo', 'accepted'),
  (13, 6, 13, 9, 'Look for Auntie Fatima stall near the main entrance - she has been there for 35 years and her masala blends are not sold anywhere else. Tell her Ntombi sent you!', '2025-07-06 12:30:00', 'Ntombi', 'Mhlongo', 'Nokwanda', 'Ndlovu', 'accepted'),
  (14, 7, 11, 15, 'Ayanda! I need a stargazer guide to Sutherland. What time of year has the most visible Milky Way from the Karoo?', '2025-07-07 20:00:00', 'Thandeka', 'Khoza', 'Ayanda', 'Buthelezi', 'accepted'),
  (15, 7, 15, 11, 'June and July are peak Milky Way season! The core rises in the south-east around 9pm. Stay away from full moon weekends and book the SAAO public night tour in advance.', '2025-07-07 20:30:00', 'Ayanda', 'Buthelezi', 'Thandeka', 'Khoza', 'accepted');

-- Table: Notifications
DROP TABLE IF EXISTS `Notifications`;
CREATE TABLE `Notifications` (
  `notificationID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `type` longtext NOT NULL,
  `message` longtext NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(6) NOT NULL,
  `scheduledFor` datetime(6) DEFAULT NULL,
  `relatedEntityID` int DEFAULT NULL,
  PRIMARY KEY (`notificationID`),
  KEY `FK_Notifications_User` (`userID`),
  CONSTRAINT `FK_Notifications_User` FOREIGN KEY (`userID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
);

INSERT INTO `Notifications` (`notificationID`, `userID`, `type`, `message`, `isRead`, `createdAt`, `scheduledFor`, `relatedEntityID`) VALUES
  (1, 8, 'NewBooking', 'Naledi Senekane sent a new booking request for Knysna Lagoon Kayaking.', 0, '2026-09-24 21:00:56.762893', NULL, 19);

-- Table: Posts
DROP TABLE IF EXISTS `Posts`;
CREATE TABLE `Posts` (
  `postID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `pictureURL` longtext,
  `createdAt` datetime(6) NOT NULL,
  `updatedAt` datetime(6) NOT NULL,
  `experienceType` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `userName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `userSurname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `taggedUsers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `alsoAttended` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`postID`)
);

INSERT INTO `Posts` (`postID`, `userID`, `content`, `pictureURL`, `createdAt`, `updatedAt`, `experienceType`, `userName`, `userSurname`, `taggedUsers`, `alsoAttended`) VALUES
  (1, 1, 'Just got back from the most incredible sunrise hike up Sentinel Peak in the Drakensberg! The mist was rolling in over the Amphitheatre as we reached the summit. Absolutely worth the 4am start. 10/10 would recommend!', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600', '2025-08-01 07:30:00', '2025-08-01 07:30:00', 'Solo', 'Amahle', 'Dlamini', NULL, NULL),
  (2, 3, 'Spent the day at Boulders Beach in Simons Town watching the African Penguin colony. Nothing prepares you for 3000 penguins waddling around your feet! Bring a rain jacket.', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600', '2025-08-03 15:00:00', '2025-08-03 15:00:00', 'Solo', 'Zanele', 'Mokoena', NULL, NULL),
  (3, 5, 'The Kruger Park birding this month is out of this world. Spotted a martial eagle carrying a monitor lizard right in front of our car at Olifants Camp. Game drives at 5am are always the best investment!', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600', '2025-08-05 08:00:00', '2025-08-05 08:00:00', 'Group', 'Nomvula', 'Zulu', '[7,9]', '[11]'),
  (4, 7, 'Explored the Constitutional Hill in Braamfontein today. The Old Fort Prison where Gandhi and Mandela were once held is now a living museum of human rights. This is Joburg\'s equivalent of the District Six Museum.', 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600', '2025-08-07 11:00:00', '2025-08-07 11:00:00', 'Solo', 'Lerato', 'Sithole', NULL, NULL),
  (5, 9, 'Completed the Otter Trail along the Garden Route! 5 days, 42km, 5 river crossings, and some of the most dramatic coastal scenery in the world. The final section above Storms River Mouth is breathtaking.', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600', '2025-08-10 18:00:00', '2025-08-10 18:00:00', 'Group', 'Nokwanda', 'Ndlovu', '[11,13]', '[15]'),
  (6, 11, 'Free things to do in Cape Town this weekend: Signal Hill sunset, Company\'s Garden, Cape Town City Hall concerts, and Bo-Kaap neighbourhood walk. The Mother City does not need to cost a fortune!', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600', '2025-08-12 09:00:00', '2025-08-12 09:00:00', 'Solo', 'Thandeka', 'Khoza', NULL, NULL),
  (7, 13, 'Durban curry trail day 2: The Golden Mile curry mile from Victoria Street Market to Florida Road. The best bunny chow I have ever had was at a tiny place called Canteen on Bertha Mkhize Street.', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', '2025-08-15 13:00:00', '2025-08-15 13:00:00', 'Solo', 'Ntombi', 'Mhlongo', NULL, NULL),
  (8, 15, 'Dark sky weekend in Sutherland was surreal. The SALT night tour let us look through a smaller scope at the Omega Centauri globular cluster. Over 10 million stars in one view.', 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600', '2025-08-18 22:00:00', '2025-08-18 22:00:00', 'Solo', 'Ayanda', 'Buthelezi', NULL, NULL),
  (9, 1, 'Volunteered at the Wildlife ACT rhino monitoring project in Hluhluwe-iMfolozi over the long weekend. We darted and radio-collared 2 white rhinos. SA has 70% of the world remaining rhinos.', 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600', '2025-08-20 16:00:00', '2025-08-20 16:00:00', 'Group', 'Amahle', 'Dlamini', '[3,5]', NULL),
  (10, 3, 'The Two Oceans Aquarium dive experience is worth every cent. I dived with raggedy-tooth sharks, green turtles, and thousands of fish in the Open Ocean exhibit. No diving experience required.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600', '2025-08-22 14:00:00', '2025-08-22 14:00:00', 'Solo', 'Zanele', 'Mokoena', NULL, NULL),
  (11, 5, 'Pilanesberg Game Reserve this weekend - saw all the Big Five in one day! Lions with cubs near Mankwe Dam, elephants at Lengau picnic site, and the lone male buffalo everyone was talking about.', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600', '2025-08-25 17:00:00', '2025-08-25 17:00:00', 'Group', 'Nomvula', 'Zulu', '[7]', NULL),
  (12, 7, 'Hidden gem alert: The Johannesburg Heritage Foundation walking tour of Parktown mansions. Victorian and Edwardian architecture with stories of early Rand Barons. Free on last Saturday of every month!', 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600', '2025-08-28 10:30:00', '2025-08-28 10:30:00', 'Solo', 'Lerato', 'Sithole', NULL, NULL),
  (13, 9, 'Spent a mindful day at the Tembe Elephant Park in northern KZN. The park has the largest free-roaming elephants in Africa. The sandforest ecosystem is completely unlike anywhere else in SA.', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600', '2025-09-01 08:00:00', '2025-09-01 08:00:00', 'Solo', 'Nokwanda', 'Ndlovu', NULL, NULL),
  (14, 11, 'Spent Heritage Day at the Zulu Kingdom Experience in Eshowe. Traditional beer brewing, beadwork making, and a warrior dance performance. The ujeqe with usu stew was unforgettable.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', '2025-09-05 12:00:00', '2025-09-05 12:00:00', 'Group', 'Thandeka', 'Khoza', '[13,15]', '[1]'),
  (15, 13, 'Ramsgate Beach this Easter was less crowded than Margate but just as beautiful. The rock pools at low tide teem with sea anemones, starfish, and tiny crabs. The local curry house does the best samoosas in SA.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', '2025-09-08 16:00:00', '2025-09-08 16:00:00', 'Solo', 'Ntombi', 'Mhlongo', NULL, NULL);

-- Table: Profile
DROP TABLE IF EXISTS `Profile`;
CREATE TABLE `Profile` (
  `pID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `profilePictureLink` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `interests` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `createdAt` datetime(6) NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `location` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `job` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `userName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `userSurname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `userEmail` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`pID`),
  UNIQUE KEY `IX_Profile_userID` (`userID`),
  CONSTRAINT `FK_Profile_User_userID` FOREIGN KEY (`userID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
);

INSERT INTO `Profile` (`pID`, `userID`, `profilePictureLink`, `interests`, `createdAt`, `description`, `location`, `job`, `userName`, `userSurname`, `userEmail`) VALUES
  (1, 1, 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200', 'Hiking,Photography,Wildlife', '2024-01-15 08:00:00', 'Adventurous explorer from Durban who loves discovering hidden trails and photographing wildlife.', 'Durban, KwaZulu-Natal', 'Graphic Designer', 'Amahle', 'Dlamini', 'amahle.dlamini@gmail.com'),
  (2, 2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 'Township Tours,History,Food', '2024-01-16 09:00:00', 'Born and raised in Soweto. I know every corner and story of this iconic township.', 'Johannesburg, Gauteng', 'Local Tour Guide', 'Sipho', 'Nkosi', 'sipho.nkosi@gmail.com'),
  (3, 3, 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200', 'Beach,Surfing,Marine Life', '2024-01-17 10:00:00', 'Cape Town girl who surfs Muizenberg on weekends and volunteers at the Two Oceans Aquarium.', 'Cape Town, Western Cape', 'Marine Biologist', 'Zanele', 'Mokoena', 'zanele.mokoena@gmail.com'),
  (4, 4, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200', 'Wine,Cycling,Gastronomy', '2024-01-18 11:00:00', 'Winelands specialist who has cycled every wine route in the Cape. Passionate about pairing food and local wine.', 'Stellenbosch, Western Cape', 'Winelands Guide', 'Lungelo', 'Mthembu', 'lungelo.mthembu@gmail.com'),
  (5, 5, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', 'Safari,Birdwatching,Camping', '2024-01-19 12:00:00', 'Kruger Park enthusiast. I have been on 30+ safaris and can identify over 400 bird species.', 'Hazyview, Mpumalanga', 'Safari Coordinator', 'Nomvula', 'Zulu', 'nomvula.zulu@gmail.com'),
  (6, 6, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', 'Mountains,Rock Climbing,Meditation', '2024-01-20 13:00:00', 'Drakensberg native who leads groups up Cathedral Peak every month.', 'Bergville, KwaZulu-Natal', 'Mountain Guide', 'Thabo', 'Khumalo', 'thabo.khumalo@gmail.com'),
  (7, 7, 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200', 'Art,Street Food,History', '2024-01-21 14:00:00', 'Art lover exploring the Newtown arts district. I know every mural and its story in Joburg.', 'Johannesburg, Gauteng', 'Art Curator', 'Lerato', 'Sithole', 'lerato.sithole@gmail.com'),
  (8, 8, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', 'Garden Route,Whale Watching,Kayaking', '2024-01-22 15:00:00', 'Garden Route expert based in Knysna. I specialise in ocean-based experiences.', 'Knysna, Western Cape', 'Marine Tour Guide', 'Bongani', 'Mahlangu', 'bongani.mahlangu@gmail.com'),
  (9, 9, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200', 'Yoga,Wellness,Nature Walks', '2024-01-23 16:00:00', 'Wellness traveller from Pietermaritzburg. I find peace in nature and love sharing mindful travel tips.', 'Pietermaritzburg, KZN', 'Yoga Instructor', 'Nokwanda', 'Ndlovu', 'nokwanda.ndlovu@gmail.com'),
  (10, 10, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200', 'Cultural Heritage,Dance,Music', '2024-01-24 17:00:00', 'Cultural guide celebrating Zulu heritage. I host authentic cultural evenings at Shakaland twice a month.', 'Eshowe, KwaZulu-Natal', 'Cultural Heritage Guide', 'Sifiso', 'Cele', 'sifiso.cele@gmail.com'),
  (11, 11, 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200', 'Backpacking,Budget Travel,Photography', '2024-01-25 08:30:00', 'Student explorer making the most of every holiday budget. Currently documenting 50 free spots in SA.', 'Bloemfontein, Free State', 'Student Photographer', 'Thandeka', 'Khoza', 'thandeka.khoza@gmail.com'),
  (12, 12, 'https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=200', 'Botanical Gardens,Hiking,Conservation', '2024-01-26 09:30:00', 'Passionate about conservation. I guide walking tours through Kirstenbosch.', 'Cape Town, Western Cape', 'Conservation Guide', 'Mthokozisi', 'Gumede', 'mthokozisi.gumede@gmail.com'),
  (13, 13, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200', 'Food Tours,Spices,Local Markets', '2024-01-27 10:30:00', 'Foodie from Durban. Indian Ocean cuisine specialist and food blogger.', 'Durban, KwaZulu-Natal', 'Food Blogger', 'Ntombi', 'Mhlongo', 'ntombi.mhlongo@gmail.com'),
  (14, 14, 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200', 'Battlefields,Military History,Photography', '2024-01-28 11:30:00', 'Battlefield guide with a Masters in South African Military History. Narrated Isandlwana 200+ times.', 'Dundee, KwaZulu-Natal', 'Battlefield Historian Guide', 'Sandile', 'Shabalala', 'sandile.shabalala@gmail.com'),
  (15, 15, 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200', 'Stargazing,Astronomy,Camping', '2024-01-29 12:30:00', 'First-year astronomy student who drives to Sutherland on every clear night.', 'Pretoria, Gauteng', 'Astronomy Student', 'Ayanda', 'Buthelezi', 'ayanda.buthelezi@gmail.com'),
  (16, 24, 'data:image/png;base64,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', 'Diving, Surfing, Art', '2026-09-15 00:00:00', 'New to GQ', 'Gqeberha, South Africa', 'Developer', NULL, NULL, NULL);

-- Table: Reports
DROP TABLE IF EXISTS `Reports`;
CREATE TABLE `Reports` (
  `reportID` int NOT NULL AUTO_INCREMENT,
  `reporterID` int NOT NULL,
  `reportedUserID` int NOT NULL,
  `reason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sentAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`reportID`),
  KEY `IX_Reports_reportedUserID` (`reportedUserID`),
  KEY `IX_Reports_reporterID` (`reporterID`),
  CONSTRAINT `FK_Reports_User_reportedUserID` FOREIGN KEY (`reportedUserID`) REFERENCES `User` (`userID`) ON DELETE CASCADE,
  CONSTRAINT `FK_Reports_User_reporterID` FOREIGN KEY (`reporterID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
);

INSERT INTO `Reports` (`reportID`, `reporterID`, `reportedUserID`, `reason`, `status`, `sentAt`) VALUES
  (1, 1, 5, 'User was rude and abusive in the message thread. Used offensive language and threatened to leave a bad review if I did not change my itinerary.', 'Pending', '2025-08-01 10:00:00'),
  (2, 3, 7, 'This user sent me unsolicited commercial messages about a third-party tour company unrelated to WanderSync.', 'Resolved', '2025-08-03 11:00:00'),
  (3, 5, 9, 'User shared inaccurate and misleading information about a national park in a public post, which could endanger other travellers.', 'Pending', '2025-08-05 12:00:00'),
  (4, 7, 11, 'User posted someone else travel photos without credit and presented them as their own personal experience.', 'Resolved', '2025-08-07 13:00:00'),
  (5, 9, 13, 'User made discriminatory comments about another user ethnicity in the community feed discussion thread.', 'Pending', '2025-08-09 14:00:00'),
  (6, 11, 15, 'This user created a fake tour listing pretending to be from a registered tour operator to solicit advance payments outside the platform.', 'Resolved', '2025-08-11 15:00:00'),
  (7, 13, 1, 'The user profile information appears to be copied verbatim from another travel blogger website. Possible fake account.', 'Pending', '2025-08-13 09:00:00'),
  (8, 15, 3, 'User posted misleading safety information about a surf spot that resulted in another member attempting it in dangerous conditions.', 'Resolved', '2025-08-15 10:00:00'),
  (9, 1, 7, 'This user systematically leaves one-star reviews on competitor tours without having attended them. Review manipulation.', 'Pending', '2025-08-17 11:00:00'),
  (10, 3, 9, 'User sent multiple automated-looking messages in a short time, consistent with spam or bot activity.', 'Resolved', '2025-08-19 12:00:00'),
  (11, 5, 11, 'User shared a third party private contact details in a public post without that person consent.', 'Pending', '2025-08-21 13:00:00'),
  (12, 7, 13, 'The user is impersonating a well-known travel journalist. The profile picture and biography appear to be stolen.', 'Pending', '2025-08-23 14:00:00'),
  (13, 9, 15, 'User repeatedly requested personal contact details from other community members, circumventing WanderSync safe-messaging system.', 'Resolved', '2025-08-25 15:00:00'),
  (14, 11, 1, 'User posted a tour review containing a competitor promotional link, which violates community guidelines on advertising.', 'Pending', '2025-08-27 09:00:00'),
  (15, 13, 3, 'User used the community feed to promote unofficial cash payments for tours, bypassing the platform secure booking system.', 'Resolved', '2025-08-29 10:00:00');

-- Table: Reviews
DROP TABLE IF EXISTS `Reviews`;
CREATE TABLE `Reviews` (
  `reviewID` int NOT NULL AUTO_INCREMENT,
  `reviewerID` int NOT NULL,
  `guideID` int NOT NULL,
  `rating` int NOT NULL,
  `comment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `sentAt` datetime(6) NOT NULL,
  `guideName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `guideSurname` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `reviewerName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `reviewerSurname` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`reviewID`)
);

INSERT INTO `Reviews` (`reviewID`, `reviewerID`, `guideID`, `rating`, `comment`, `sentAt`, `guideName`, `guideSurname`, `reviewerName`, `reviewerSurname`) VALUES
  (1, 1, 2, 5, 'Sipho is the best guide I have ever had. His knowledge of Soweto history is encyclopedic and his storytelling made us feel like we were living through the struggle era. Will absolutely book again.', '2025-08-10 09:00:00', 'Sipho', 'Nkosi', 'Amahle', 'Dlamini'),
  (2, 3, 4, 5, 'Lungelo\'s wine knowledge is extraordinary. He anticipated our palate preferences perfectly and took us to a gem estate we would never have found on our own.', '2025-08-12 10:00:00', 'Lungelo', 'Mthembu', 'Zanele', 'Mokoena'),
  (3, 5, 6, 4, 'Thabo pushed us beyond our comfort zone in the best way. The Cathedral Peak summit was harder than I expected but he never let us feel like giving up. The summit sunrise was pure magic.', '2025-08-14 11:00:00', 'Thabo', 'Khumalo', 'Nomvula', 'Zulu'),
  (4, 7, 8, 5, 'Bongani knows the Knysna Lagoon like the back of his hand. We spotted seahorses on the snorkel stop - something I have never done in my life! Professional, funny, and deeply knowledgeable.', '2025-08-16 12:00:00', 'Bongani', 'Mahlangu', 'Lerato', 'Sithole'),
  (5, 9, 10, 5, 'Sifiso hosted the most authentic cultural experience I have ever had in South Africa. The Zulu ceremony felt genuinely real - no tourist gimmicks. His connection to the community is deep.', '2025-08-18 13:00:00', 'Sifiso', 'Cele', 'Nokwanda', 'Ndlovu'),
  (6, 11, 12, 4, 'Mthokozisi is a walking encyclopedia of Kirstenbosch. I learned more about fynbos in 3 hours than I had in 30 years of living near Cape Town. His passion for conservation is infectious.', '2025-08-20 14:00:00', 'Mthokozisi', 'Gumede', 'Thandeka', 'Khoza'),
  (7, 13, 14, 5, 'Sandile\'s battlefield narration at Isandlwana left me in tears. His respect for both British and Zulu perspectives was refreshing and thoughtful. Brought history to life in a way no textbook can.', '2025-08-22 15:00:00', 'Sandile', 'Shabalala', 'Ntombi', 'Mhlongo'),
  (8, 15, 16, 4, 'Dumisani spotted a black rhino at iMfolozi that the other vehicle missed completely. His tracking instincts are phenomenal. The open 4x4 vehicle gives you a completely immersive experience.', '2025-08-24 16:00:00', 'Dumisani', 'Ntuli', 'Ayanda', 'Buthelezi'),
  (9, 1, 17, 3, 'Good guide but the tour ran slightly over time which caused us to miss our restaurant reservation. The content was excellent but better timekeeping would make this tour a 5-star experience.', '2025-08-26 09:00:00', 'Nombuso', 'Majola', 'Amahle', 'Dlamini'),
  (10, 3, 18, 5, 'Sibonelo\'s Blyde River Canyon commentary was top-notch. He knew the geological formation of every feature and told incredible stories about the Lowveld pioneers.', '2025-08-28 10:00:00', 'Sibonelo', 'Mwelase', 'Zanele', 'Mokoena'),
  (11, 5, 19, 4, 'Phindile created a wonderful waterfall route itinerary. The Mac-Mac Pools stop was a surprise highlight I had not expected. Very organised and excellent value for money.', '2025-08-30 11:00:00', 'Phindile', 'Mthiyane', 'Nomvula', 'Zulu'),
  (12, 7, 20, 5, 'Hlanganani\'s iSimangaliso boat safari was out of this world. We were surrounded by hippos at one point! His calm, expert handling made what could have been terrifying into a thrilling highlight.', '2025-09-01 12:00:00', 'Hlanganani', 'Myeni', 'Lerato', 'Sithole'),
  (13, 9, 21, 4, 'Nokukhanya designed a beautiful Sabie waterfall itinerary and suggested timings that meant we had each waterfall almost to ourselves. A real hidden-gem experience in the Lowveld.', '2025-09-03 13:00:00', 'Nokukhanya', 'Hadebe', 'Nokwanda', 'Ndlovu'),
  (14, 11, 22, 5, 'Mxolisi\'s Walter Sisulu botanical walk gave us a front-row seat to the resident Verreaux eagle pair. He called the exact time they would hunt and he was right to the minute.', '2025-09-05 14:00:00', 'Mxolisi', 'Vilakazi', 'Thandeka', 'Khoza'),
  (15, 13, 23, 5, 'Zinhle hosted an unforgettable Drakensberg Amphitheatre experience. Her mountaineering skills are world-class and her knowledge of the San rock art along the route added so much depth.', '2025-09-07 15:00:00', 'Zinhle', 'Khwela', 'Ntombi', 'Mhlongo'),
  (9001, 1, 21, 5, 'An absolute legend! The best local guide in town.', '2026-08-01 10:00:00', NULL, NULL, NULL, NULL),
  (9002, 2, 21, 4, 'Very knowledgeable and friendly, though we started a bit late.', '2026-08-15 14:30:00', NULL, NULL, NULL, NULL),
  (9003, 3, 21, 5, 'Incredible experience, showed us spots we never would have found.', '2026-08-20 09:15:00', NULL, NULL, NULL, NULL);

-- Table: SpotRatings
DROP TABLE IF EXISTS `SpotRatings`;
CREATE TABLE `SpotRatings` (
  `ratingID` int NOT NULL AUTO_INCREMENT,
  `spotID` int NOT NULL,
  `userID` int NOT NULL,
  `ratingScore` int NOT NULL,
  `reviewText` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `submittedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`ratingID`),
  KEY `IX_SpotRatings_spotID` (`spotID`),
  KEY `IX_SpotRatings_userID` (`userID`),
  CONSTRAINT `FK_SpotRatings_curatedSpots_spotID` FOREIGN KEY (`spotID`) REFERENCES `curatedSpots` (`spotID`) ON DELETE CASCADE,
  CONSTRAINT `FK_SpotRatings_User_userID` FOREIGN KEY (`userID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
);

INSERT INTO `SpotRatings` (`ratingID`, `spotID`, `userID`, `ratingScore`, `reviewText`, `submittedAt`) VALUES
  (1, 1, 1, 5, 'The Shongweni Dam picnic spot is perfect for a family day out. We had a braai and the kids loved the water. Very clean and well maintained.', '2025-08-05 14:00:00'),
  (2, 2, 3, 5, 'The Blyde River Canyon stole my breath. No photograph does it justice. I will come back every year just for this view.', '2025-08-07 15:00:00'),
  (3, 3, 5, 5, 'Cape of Good Hope was everything. The baboons were bold but harmless if you keep food hidden. Bring a jacket - the wind is fierce!', '2025-08-09 16:00:00'),
  (4, 4, 7, 4, 'Bourkes Luck Potholes are a geological marvel. The red walkway bridges make for great photos. Gets crowded mid-morning - go early.', '2025-08-11 09:00:00'),
  (5, 5, 9, 5, 'Gods Window lived up to its name on a clear day. We arrived just as the clouds parted and the Lowveld opened up below us. Magical.', '2025-08-13 10:00:00'),
  (6, 6, 11, 4, 'uShaka is fantastic for all ages. The shark dive was absolutely thrilling and the touch pools in the children\'s area are brilliant. A full-day destination easily.', '2025-08-15 11:00:00'),
  (7, 7, 13, 5, 'Robben Island moved me more than any other heritage site in the world. The tour by a former political prisoner is an irreplaceable experience.', '2025-08-17 12:00:00'),
  (8, 8, 15, 4, 'Oribi Gorge is surprisingly dramatic for a lesser-known reserve. The Cape vulture colony was a definite highlight. The suspension bridge is terrifying in the best way.', '2025-08-19 13:00:00'),
  (9, 9, 1, 5, 'Chapmans Peak drive is genuinely one of the most spectacular roads on the planet. I drove it at sunset and the Atlantic turned gold below me.', '2025-08-21 14:00:00'),
  (10, 10, 3, 4, 'The Cradle of Humankind blew my mind. Holding a cast of a 3.3 million year old skull puts your whole life into perspective. Maropeng museum is brilliant.', '2025-08-23 15:00:00'),
  (11, 11, 5, 5, 'Tsitsikamma Bungee is not for the faint-hearted but if you do it, your whole life changes. The gorge views from the bridge are stunning even without jumping.', '2025-08-25 16:00:00'),
  (12, 12, 7, 5, 'iSimangaliso is SA greatest natural treasure. Drove slowly along the Eastern Shores and spotted hippos, crocodiles, and a leopard all before lunch.', '2025-08-27 09:00:00'),
  (13, 13, 9, 4, 'The Sabie Waterfall Route is easily done in a day. Lone Creek is the most beautiful - the forest around it is ancient and serene. Go on a weekday to avoid crowds.', '2025-08-29 10:00:00'),
  (14, 14, 11, 4, 'Walter Sisulu Botanical Gardens is a hidden gem inside Johannesburg. The eagle pair nest on the cliff and you can watch them from the garden below.', '2025-08-31 11:00:00'),
  (15, 15, 13, 5, 'The Drakensberg Amphitheatre is the most dramatic landform in South Africa. The Tugela Falls cascade down the basalt wall like a ribbon of silver. Spend at least two days here.', '2025-09-02 12:00:00');

-- Table: SpotReports
DROP TABLE IF EXISTS `SpotReports`;
CREATE TABLE `SpotReports` (
  `spotReportID` int NOT NULL AUTO_INCREMENT,
  `spotID` int NOT NULL,
  `reporterID` int NOT NULL,
  `reason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sentAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`spotReportID`),
  KEY `IX_SpotReports_reporterID` (`reporterID`),
  KEY `IX_SpotReports_spotID` (`spotID`),
  CONSTRAINT `FK_SpotReports_Spots_spotID` FOREIGN KEY (`spotID`) REFERENCES `Spots` (`spotID`) ON DELETE CASCADE,
  CONSTRAINT `FK_SpotReports_User_reporterID` FOREIGN KEY (`reporterID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
);

INSERT INTO `SpotReports` (`spotReportID`, `spotID`, `reporterID`, `reason`, `sentAt`) VALUES
  (1, 1, 3, 'Inaccurate Information', '2025-08-01 10:00:00'),
  (2, 2, 5, 'Offensive Content', '2025-08-02 11:00:00'),
  (3, 3, 7, 'Does Not Exist', '2025-08-03 12:00:00'),
  (4, 4, 9, 'Spam', '2025-08-04 13:00:00'),
  (5, 5, 11, 'Inaccurate Information', '2025-08-05 14:00:00'),
  (6, 6, 13, 'Spam', '2025-08-06 15:00:00'),
  (7, 7, 15, 'Does Not Exist', '2025-08-07 09:00:00'),
  (8, 8, 1, 'Inaccurate Information', '2025-08-08 10:00:00'),
  (9, 9, 3, 'Offensive Content', '2025-08-09 11:00:00'),
  (10, 10, 5, 'Spam', '2025-08-10 12:00:00'),
  (11, 11, 7, 'Does Not Exist', '2025-08-11 13:00:00'),
  (12, 12, 9, 'Inaccurate Information', '2025-08-12 14:00:00'),
  (13, 13, 11, 'Offensive Content', '2025-08-13 15:00:00'),
  (14, 14, 13, 'Spam', '2025-08-14 09:00:00'),
  (15, 15, 15, 'Inaccurate Information', '2025-08-15 10:00:00');

-- Table: SpotVotes
DROP TABLE IF EXISTS `SpotVotes`;
CREATE TABLE `SpotVotes` (
  `voteID` int NOT NULL AUTO_INCREMENT,
  `spotID` int NOT NULL,
  `guideID` int NOT NULL,
  `voteType` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `votedAt` datetime(6) NOT NULL,
  `spotName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `spotLoaction` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `guideName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `guideSurname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`voteID`)
);

INSERT INTO `SpotVotes` (`voteID`, `spotID`, `guideID`, `voteType`, `votedAt`, `spotName`, `spotLoaction`, `guideName`, `guideSurname`) VALUES
  (1, 1, 2, 'approve', '2025-07-01 09:00:00', 'Shongweni Dam Picnic Spot', 'Shongweni, KwaZulu-Natal', 'Sipho', 'Nkosi'),
  (2, 2, 4, 'approve', '2025-07-02 10:00:00', 'Durban Botanic Gardens', 'Durban, KwaZulu-Natal', 'Lungelo', 'Mthembu'),
  (3, 3, 6, 'reject', '2025-07-03 11:00:00', 'Joburg Zoo Night Safari', 'Parktown, Johannesburg', 'Thabo', 'Khumalo'),
  (4, 4, 8, 'approve', '2025-07-04 12:00:00', 'Midmar Dam Water Sports', 'Midmar, KwaZulu-Natal', 'Bongani', 'Mahlangu'),
  (5, 5, 10, 'approve', '2025-07-05 13:00:00', 'Pretoria National Zoological', 'Pretoria, Gauteng', 'Sifiso', 'Cele'),
  (6, 6, 12, 'approve', '2025-07-06 14:00:00', 'Roodepoort Waterfall', 'Roodepoort, Gauteng', 'Mthokozisi', 'Gumede'),
  (7, 7, 14, 'approve', '2025-07-07 15:00:00', 'Cape Town City Bowl Markets', 'Woodstock, Cape Town', 'Sandile', 'Shabalala'),
  (8, 8, 16, 'reject', '2025-07-08 09:00:00', 'Groenkloof Nature Reserve', 'Groenkloof, Pretoria', 'Dumisani', 'Ntuli'),
  (9, 9, 17, 'approve', '2025-07-09 10:00:00', 'Umhlanga Lighthouse Beach', 'Umhlanga, KwaZulu-Natal', 'Nombuso', 'Majola'),
  (10, 10, 18, 'approve', '2025-07-10 11:00:00', 'Johannesburg Planetarium', 'Braamfontein, Johannesburg', 'Sibonelo', 'Mwelase'),
  (11, 11, 19, 'approve', '2025-07-11 12:00:00', 'Spioenkop Dam Nature Reserve', 'Spioenkop, KwaZulu-Natal', 'Phindile', 'Mthiyane'),
  (12, 12, 20, 'reject', '2025-07-12 13:00:00', 'Gold Reef City Theme Park', 'Ormonde, Johannesburg', 'Hlanganani', 'Myeni'),
  (13, 13, 21, 'approve', '2025-07-13 14:00:00', 'Langebaan Lagoon Kitesurfing', 'Langebaan, Western Cape', 'Nokukhanya', 'Hadebe'),
  (14, 14, 22, 'approve', '2025-07-14 15:00:00', 'Pilanesburg Hot Air Balloon', 'Pilanesberg, North West', 'Mxolisi', 'Vilakazi'),
  (15, 15, 23, 'approve', '2025-07-15 16:00:00', 'Emnotweni River Walk', 'Nelspruit, Mpumalanga', 'Zinhle', 'Khwela');

-- Table: Spots
DROP TABLE IF EXISTS `Spots`;
CREATE TABLE `Spots` (
  `spotID` int NOT NULL AUTO_INCREMENT,
  `activityName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `activityType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `isVerified` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `pictureURL` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `submittedByUserID` int NOT NULL,
  `submittedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`spotID`),
  KEY `IX_Spots_submittedByUserID` (`submittedByUserID`),
  CONSTRAINT `FK_Spots_User_submittedByUserID` FOREIGN KEY (`submittedByUserID`) REFERENCES `User` (`userID`) ON DELETE CASCADE
);

INSERT INTO `Spots` (`spotID`, `activityName`, `activityType`, `description`, `location`, `isVerified`, `pictureURL`, `submittedByUserID`, `submittedAt`) VALUES
  (1, 'Shongweni Dam Picnic Spot', 'Nature', 'Peaceful picnic area with braai facilities next to the Shongweni dam, popular with families and anglers on weekends.', 'Shongweni, KwaZulu-Natal', 'verified', 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400', 1, '2025-06-01 10:00:00'),
  (2, 'Durban Botanic Gardens', 'Botanical', 'The oldest surviving botanical garden in Africa. Famous for its cycad collection and the stunning sunken rose garden. Entry is free.', 'Durban, KwaZulu-Natal', 'verified', 'https://images.unsplash.com/photo-1585320806297-9794b3e4ebe1?w=400', 3, '2025-06-05 11:00:00'),
  (3, 'Joburg Zoo Night Safari', 'Wildlife', 'Experience the Johannesburg Zoo after dark on a guided night safari. Great for spotting nocturnal animals like aardvarks and bush babies.', 'Parktown, Johannesburg', 'pending', 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400', 5, '2025-06-10 12:00:00'),
  (4, 'Midmar Dam Water Sports', 'Water Sport', 'Popular water sports hub on the Midmar Dam offering jet skiing, water skiing, and wakeboarding. Facilities include change rooms and a snack bar.', 'Midmar, KwaZulu-Natal', 'verified', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', 7, '2025-06-15 13:00:00'),
  (5, 'Pretoria National Zoological', 'Wildlife', 'One of the largest zoos in the world with over 9000 animals. The aerial cableway across the zoo is a highlight for families.', 'Pretoria, Gauteng', 'pending', 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400', 9, '2025-06-20 14:00:00'),
  (6, 'Roodepoort Waterfall', 'Nature', 'A hidden 40m waterfall tucked behind Roodepoort suburbs. Best visited after rain when the flow is strongest.', 'Roodepoort, Gauteng', 'verified', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400', 11, '2025-06-25 15:00:00'),
  (7, 'Cape Town City Bowl Markets', 'Market', 'The vibrant weekly market at the Old Biscuit Mill. Fresh produce, artisan food stalls, vintage clothing and live music every Saturday morning.', 'Woodstock, Cape Town', 'verified', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', 13, '2025-07-01 09:00:00'),
  (8, 'Groenkloof Nature Reserve', 'Nature', 'A 5000-hectare game reserve inside Pretoria urban boundary. Home to white rhino, giraffe and over 140 bird species.', 'Groenkloof, Pretoria', 'pending', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400', 15, '2025-07-05 10:00:00'),
  (9, 'Umhlanga Lighthouse Beach', 'Beach', 'The iconic red-and-white lighthouse marks the most popular stretch of Umhlanga beach. Safe swimming, restaurants and a lively promenade walk.', 'Umhlanga, KwaZulu-Natal', 'verified', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', 1, '2025-07-10 11:00:00'),
  (10, 'Johannesburg Planetarium', 'Educational', 'The Wits University Planetarium offers digital star shows and public astronomy nights on Fridays. Perfect for families and curious minds.', 'Braamfontein, Johannesburg', 'pending', 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400', 3, '2025-07-15 12:00:00'),
  (11, 'Spioenkop Dam Nature Reserve', 'Fishing', 'Excellent tigerfish and carp fishing in a scenic dam surrounded by KwaZulu-Natal hills. Boat hire and camping available on the banks.', 'Spioenkop, KwaZulu-Natal', 'verified', 'https://images.unsplash.com/photo-1537140737893-29072b7da35d?w=400', 5, '2025-07-20 13:00:00'),
  (12, 'Gold Reef City Theme Park', 'Entertainment', 'Johannesburg iconic theme park built on an old gold mine. Includes thrill rides, a casino, and underground gold mine tours into the real mine shafts.', 'Ormonde, Johannesburg', 'pending', 'https://images.unsplash.com/photo-1578762560042-46ad127c95ea?w=400', 7, '2025-07-25 14:00:00'),
  (13, 'Langebaan Lagoon Kitesurfing', 'Water Sport', 'The West Coast Lagoon is considered the best kitesurfing spot in South Africa thanks to consistent south-east winds and flat water.', 'Langebaan, Western Cape', 'verified', 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=400', 9, '2025-08-01 09:00:00'),
  (14, 'Pilanesburg Hot Air Balloon', 'Adventure', 'Drift silently over Pilanesberg National Park at sunrise in a hot air balloon. Spot elephant, lion and rhino from above. Champagne breakfast included.', 'Pilanesberg, North West', 'verified', 'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=400', 11, '2025-08-05 06:00:00'),
  (15, 'Emnotweni River Walk', 'Nature', 'A 5km riverside walk along the Komati River near Nelspruit. Scenic, birder-friendly path with information boards about local flora and fauna.', 'Nelspruit, Mpumalanga', 'pending', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', 13, '2025-08-10 07:00:00');

-- Table: Tours
DROP TABLE IF EXISTS `Tours`;
CREATE TABLE `Tours` (
  `tourID` int NOT NULL AUTO_INCREMENT,
  `guideID` int NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `date` datetime(6) NOT NULL,
  `maxPeople` int NOT NULL,
  `price` decimal(65,30) NOT NULL,
  `pictureURL` longtext,
  `location` longtext,
  `guideName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `guideSurname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`tourID`)
);

INSERT INTO `Tours` (`tourID`, `guideID`, `title`, `type`, `description`, `date`, `maxPeople`, `price`, `pictureURL`, `location`, `guideName`, `guideSurname`) VALUES
  (1, 2, 'Soweto Heritage Walk', 'Cultural', 'Walk through the heart of Soweto visiting the Mandela House, Hector Pieterson Memorial, and vibrant street markets. Ends with a braai lunch at a local shebeen.', '2026-10-05 09:00:00', 12, '350.000000000000000000000000000000', 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=600', 'Soweto, Johannesburg', 'Sipho', 'Nkosi'),
  (2, 4, 'Cape Winelands Cycling Tour', 'Adventure', 'Cycle through the scenic vineyards of Stellenbosch and Franschhoek, stopping at three award-winning estates for tastings and gourmet cheese platters.', '2026-10-12 08:30:00', 8, '650.000000000000000000000000000000', 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=600', 'Stellenbosch, Western Cape', 'Lungelo', 'Mthembu'),
  (3, 6, 'Cathedral Peak Sunrise Hike', 'Hiking', 'A challenging but rewarding 18km hike to the Cathedral Peak summit in the uKhahlamba-Drakensberg. Spectacular views, experienced mountain guide included.', '2026-10-19 05:00:00', 6, '450.000000000000000000000000000000', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600', 'Bergville, KwaZulu-Natal', 'Thabo', 'Khumalo'),
  (4, 8, 'Knysna Lagoon Kayaking', 'Water Sport', 'Paddle through the crystal-clear Knysna Lagoon, explore the famous Heads, and spot rare seahorses on a guided underwater snorkel stop.', '2026-10-26 10:00:00', 10, '380.000000000000000000000000000000', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600', 'Knysna, Western Cape', 'Bongani', 'Mahlangu'),
  (5, 10, 'Shakaland Zulu Cultural Evening', 'Cultural', 'Experience authentic Zulu ceremonies including the reed dance, stick fighting demonstrations, and a traditional meal inside a beehive hut.', '2026-11-02 16:00:00', 20, '500.000000000000000000000000000000', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', 'Eshowe, KwaZulu-Natal', 'Sifiso', 'Cele'),
  (6, 12, 'Kirstenbosch Botanical Walk', 'Nature', 'A leisurely 3-hour guided walk through Kirstenbosch National Botanical Garden discovering indigenous fynbos, the boomslang canopy walkway, and medicinal plants.', '2026-11-09 09:30:00', 15, '280.000000000000000000000000000000', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600', 'Cape Town, Western Cape', 'Mthokozisi', 'Gumede'),
  (7, 14, 'Isandlwana Battlefield Tour', 'Historical', 'Stand on the battlefield where 1300 British soldiers fell in 1879. Vivid expert narration brings the Anglo-Zulu War to life. Includes transport and lunch in Dundee.', '2026-11-16 08:00:00', 16, '550.000000000000000000000000000000', 'https://images.unsplash.com/photo-1504016798967-59a258e9ab32?w=600', 'Dundee, KwaZulu-Natal', 'Sandile', 'Shabalala'),
  (8, 2, 'Newtown Arts and Street Food Tour', 'Food', 'Explore Johannesburg\'s creative Newtown district, visit galleries, discover street murals, and sample diverse street foods from vetkoek to samosas.', '2026-11-23 11:00:00', 18, '300.000000000000000000000000000000', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', 'Newtown, Johannesburg', 'Sipho', 'Nkosi'),
  (9, 4, 'Franschhoek Food and Wine Pairing', 'Food', 'A curated afternoon at three Franschhoek estates pairing local wines with artisan charcuterie and locally sourced cuisine by a resident chef.', '2026-11-30 13:00:00', 10, '850.000000000000000000000000000000', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600', 'Franschhoek, Western Cape', 'Lungelo', 'Mthembu'),
  (10, 6, 'Amphitheatre Waterfall Walk', 'Hiking', 'The 3km route to the base of the Amphitheatre and Tugela Falls - the world second highest waterfall at 947m. Includes safety gear and guide commentary.', '2026-12-07 07:00:00', 10, '400.000000000000000000000000000000', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600', 'Royal Natal National Park, KZN', 'Thabo', 'Khumalo'),
  (11, 8, 'Wilderness Bioluminescence Canoe', 'Nature', 'Paddle the Touw River at dusk and witness the magical blue bioluminescent glow of micro-organisms in the estuary on this unforgettable night canoe experience.', '2026-12-14 18:30:00', 8, '420.000000000000000000000000000000', 'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?w=600', 'Wilderness, Western Cape', 'Bongani', 'Mahlangu'),
  (12, 10, 'Valley of a Thousand Hills Drive', 'Scenic', 'A scenic drive through the Valley of a Thousand Hills stopping at traditional Zulu kraals, a pottery village, and a community cafe run by local women.', '2026-12-21 09:00:00', 14, '320.000000000000000000000000000000', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600', 'Bothas Hill, KwaZulu-Natal', 'Sifiso', 'Cele'),
  (13, 12, 'Cape Point Nature Reserve Hike', 'Hiking', 'Hike from Buffelsfontein to Cape Point through the spectacular fynbos landscape. Spot baboons, bontebok and the famous Cape sugarbirds. Includes a picnic lunch.', '2026-12-28 08:00:00', 12, '480.000000000000000000000000000000', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600', 'Cape Point, Western Cape', 'Mthokozisi', 'Gumede'),
  (14, 14, 'Blood River Monument Tour', 'Historical', 'Visit the Blood River Heritage Site where 470 Voortrekkers defeated 15 000 Zulu warriors. Includes both the bronze wagon monument and the new Zulu Heritage Centre.', '2027-01-04 09:00:00', 20, '490.000000000000000000000000000000', 'https://images.unsplash.com/photo-1504016798967-59a258e9ab32?w=600', 'Nquthu, KwaZulu-Natal', 'Sandile', 'Shabalala'),
  (15, 16, 'Hluhluwe-iMfolozi Big Five Safari', 'Safari', 'Full-day safari in Africa oldest proclaimed nature reserve. Expert ranger guide, open 4x4 vehicle. Excellent rhino and wild dog sightings.', '2027-01-11 05:30:00', 8, '1200.000000000000000000000000000000', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600', 'Hluhluwe, KwaZulu-Natal', 'Dumisani', 'Ntuli'),
  (9001, 21, 'Table Mountain Sunrise Hike', 'Adventure', 'Start your day with a breathtaking sunrise hike up Table Mountain via the Platteklip Gorge route. Witness the golden hour painting Cape Town in warm light as you reach the summit. Suitable for intermediate fitness levels.', '2026-09-05 05:30:00', 12, '350.000000000000000000000000000000', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600', 'Cape Town', NULL, NULL),
  (9002, 21, 'Bo-Kaap Cultural Walking Tour', 'Cultural', 'Explore the vibrant streets of Bo-Kaap, one of Cape Town\'s most iconic neighbourhoods. Learn about the rich Cape Malay heritage, sample traditional koeksisters, and capture stunning photos of the colourful houses.', '2026-09-12 10:00:00', 20, '200.000000000000000000000000000000', 'https://images.unsplash.com/photo-1588828195558-cf25e7e8d248?w=600', 'Bo-Kaap, Cape Town', NULL, NULL),
  (9003, 21, 'Cape Winelands Tasting Experience', 'Food & Wine', 'Journey through the picturesque Stellenbosch and Franschhoek wine valleys. Visit three award-winning estates for tastings of world-class wines paired with artisan cheeses and charcuterie.', '2026-09-20 09:00:00', 8, '750.000000000000000000000000000000', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600', 'Stellenbosch', NULL, NULL),
  (9004, 21, 'Shark Cage Diving Adventure', 'Adventure', 'Face your fears with an unforgettable shark cage diving experience in Gansbaai, the Great White Shark capital of the world. All equipment and safety briefings included. Lunch on board.', '2026-10-03 07:00:00', 10, '1800.000000000000000000000000000000', 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=600', 'Gansbaai', NULL, NULL),
  (9005, 21, 'Kirstenbosch Botanical Garden Tour', 'Nature', 'Discover the stunning biodiversity of Kirstenbosch National Botanical Garden. Walk the famous Tree Canopy Walkway, explore the fragrance garden, and learn about unique fynbos species from an expert botanist guide.', '2026-09-28 14:00:00', 15, '180.000000000000000000000000000000', 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=600', 'Newlands, Cape Town', NULL, NULL),
  (9101, 21, 'Route 67 Walking Tour', 'Cultural', 'Discover the 67 public art works symbolising Nelson Mandela\'s 67 years of work dedicated to the freedom of South Africa.', '2026-09-10 10:00:00', 15, '150.000000000000000000000000000000', 'https://images.unsplash.com/photo-1547471080-7bc2caa7eaa3?w=600', 'Gqeberha', NULL, NULL),
  (9102, 21, 'Donkin Heritage Trail', 'History', 'Walk the 5km trail that links 51 places of historical interest in the old Hill area of Port Elizabeth.', '2026-09-15 09:00:00', 20, '100.000000000000000000000000000000', 'https://images.unsplash.com/photo-1518342797664-9f93ee74f261?w=600', 'Gqeberha', NULL, NULL),
  (9103, 21, 'Sardinia Bay Beach Hike', 'Nature', 'Enjoy a guided hike along the pristine coastline of Sardinia Bay, known for its miles of unspoiled beach and towering sand dunes.', '2026-09-18 07:30:00', 10, '200.000000000000000000000000000000', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', 'Gqeberha', NULL, NULL),
  (9104, 21, 'Kragga Kamma Game Park Safari', 'Wildlife', 'Experience close encounters with white rhino, buffalo, cheetah, giraffe, zebra, and various antelope species in a lush coastal forest setting.', '2026-09-22 14:00:00', 8, '450.000000000000000000000000000000', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600', 'Gqeberha', NULL, NULL),
  (9105, 21, 'Addo Elephant National Park Trip', 'Wildlife', 'A full-day guided trip to Addo, home to over 600 elephants, lions, buffalo, black rhino, and leopard.', '2026-09-25 08:00:00', 12, '1200.000000000000000000000000000000', 'https://images.unsplash.com/photo-1588523315783-65391d3780f2?w=600', 'Gqeberha', NULL, NULL),
  (9106, 21, 'Boardwalk Casino and Entertainment Tour', 'Leisure', 'An evening tour of the Boardwalk precinct, featuring dining, shopping, and the spectacular musical fountain show.', '2026-09-30 18:00:00', 25, '300.000000000000000000000000000000', 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600', 'Gqeberha', NULL, NULL),
  (9107, 21, 'Algoa Bay Boat Cruise', 'Adventure', 'Take a boat cruise into Algoa Bay to spot dolphins, whales (in season), seals, and penguins at St Croix Island.', '2026-10-05 09:00:00', 15, '850.000000000000000000000000000000', 'https://images.unsplash.com/photo-1563220465-728b7e64177f?w=600', 'Gqeberha', NULL, NULL);

-- Table: TravelGuide
DROP TABLE IF EXISTS `TravelGuide`;
CREATE TABLE `TravelGuide` (
  `userID` int NOT NULL,
  PRIMARY KEY (`userID`)
);

INSERT INTO `TravelGuide` (`userID`) VALUES
  (2),
  (4),
  (6),
  (8),
  (10),
  (12),
  (14),
  (16),
  (17),
  (18),
  (19),
  (20),
  (21),
  (22),
  (23);

-- Table: User
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `userID` int NOT NULL AUTO_INCREMENT,
  `firstName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `lastName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cellNumber` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `age` int NOT NULL,
  `hashedPword` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `accountStatus` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `suspendedUntil` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`userID`)
);

INSERT INTO `User` (`userID`, `firstName`, `lastName`, `email`, `cellNumber`, `age`, `hashedPword`, `role`, `accountStatus`, `suspendedUntil`) VALUES
  (1, 'Amahle', 'Dlamini', 'amahle.dlamini@gmail.com', '0721234567', 24, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'explorer', 'active', NULL),
  (2, 'Sipho', 'Nkosi', 'sipho.nkosi@gmail.com', '0731234568', 31, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (3, 'Zanele', 'Mokoena', 'zanele.mokoena@gmail.com', '0741234569', 27, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'explorer', 'active', NULL),
  (4, 'Lungelo', 'Mthembu', 'lungelo.mthembu@gmail.com', '0751234570', 35, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (5, 'Nomvula', 'Zulu', 'nomvula.zulu@gmail.com', '0761234571', 22, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'explorer', 'active', NULL),
  (6, 'Thabo', 'Khumalo', 'thabo.khumalo@gmail.com', '0711234572', 29, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (7, 'Lerato', 'Sithole', 'lerato.sithole@gmail.com', '0721234573', 26, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'explorer', 'active', NULL),
  (8, 'Bongani', 'Mahlangu', 'bongani.mahlangu@gmail.com', '0731234574', 33, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (9, 'Nokwanda', 'Ndlovu', 'nokwanda.ndlovu@gmail.com', '0741234575', 28, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'explorer', 'active', NULL),
  (10, 'Sifiso', 'Cele', 'sifiso.cele@gmail.com', '0751234576', 37, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (11, 'Thandeka', 'Khoza', 'thandeka.khoza@gmail.com', '0761234577', 23, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'explorer', 'active', NULL),
  (12, 'Mthokozisi', 'Gumede', 'mthokozisi.gumede@gmail.com', '0711234578', 30, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (13, 'Ntombi', 'Mhlongo', 'ntombi.mhlongo@gmail.com', '0721234579', 25, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'explorer', 'active', NULL),
  (14, 'Sandile', 'Shabalala', 'sandile.shabalala@gmail.com', '0731234580', 40, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (15, 'Ayanda', 'Buthelezi', 'ayanda.buthelezi@gmail.com', '0741234581', 21, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'explorer', 'active', NULL),
  (16, 'Dumisani', 'Ntuli', 'dumisani.ntuli@gmail.com', '0761234582', 32, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (17, 'Nombuso', 'Majola', 'nombuso.majola@gmail.com', '0711234583', 38, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (18, 'Sibonelo', 'Mwelase', 'sibonelo.mwelase@gmail.com', '0721234584', 34, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (19, 'Phindile', 'Mthiyane', 'phindile.mthiyane@gmail.com', '0731234585', 29, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (20, 'Hlanganani', 'Myeni', 'hlanganani.myeni@gmail.com', '0741234586', 41, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (21, 'Nokukhanya', 'Hadebe', 'nokukhanya.hadebe@gmail.com', '0751234587', 27, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (22, 'Mxolisi', 'Vilakazi', 'mxolisi.vilakazi@gmail.com', '0761234588', 36, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (23, 'Zinhle', 'Khwela', 'zinhle.khwela@gmail.com', '0711234589', 30, '$2a$11$KFx9vFv8.t5R3DT2HJ6YJ.QaW7VnMhd4oH9oXtQ3bUw4Y0WfO1z8e', 'guide', 'active', NULL),
  (24, 'James', 'van Staden', 'JvStaden@email.com', '011 354 2231', 23, '$2a$11$JgYihvwLw5dqQr8Ux5.9v.ciU0vcl8QVcM01cZ/cX/OQ6.QL9mYQa', 'PendingGuide', 'Active', NULL),
  (25, 'Naledi', 'Senekane', 'Nalekane21@icloud.com', '066 853 0983', 22, '$2a$11$XWJNzfIg5HBt98DzjNbxXOGxgbbZvR3VA7ExILSCtqesMYCBkPS5O', 'Explorer', 'Active', NULL);

-- Table: UserSubmittedLocations
DROP TABLE IF EXISTS `UserSubmittedLocations`;
CREATE TABLE `UserSubmittedLocations` (
  `locationID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `locationName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `city` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `country` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `category` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `imageURL` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `verifiedByAdminID` int DEFAULT NULL,
  `rejectionReason` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `submittedAt` datetime(6) NOT NULL,
  `verifiedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`locationID`)
);

INSERT INTO `UserSubmittedLocations` (`locationID`, `userID`, `locationName`, `description`, `address`, `city`, `country`, `latitude`, `longitude`, `category`, `imageURL`, `status`, `verifiedByAdminID`, `rejectionReason`, `submittedAt`, `verifiedAt`) VALUES
  (1, 1, 'Shongweni Farmers Market', 'A weekly Saturday morning market in the Shongweni Valley offering fresh produce, artisan foods, handmade crafts, and live acoustic music.', 'Shongweni Valley Road, Shongweni', 'Shongweni', 'South Africa', -29.8667, 30.7333, 'Market', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', 'Approved', 1, NULL, '2025-07-01 09:00:00', '2025-07-08 10:00:00'),
  (2, 3, 'Franschhoek Village Square', 'The historic central plaza of Franschhoek village surrounded by Huguenot heritage buildings, galleries, wine bars and fine dining restaurants.', '40 Huguenot Road, Franschhoek', 'Franschhoek', 'South Africa', -33.9128, 19.1236, 'Cultural', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600', 'Approved', 2, NULL, '2025-07-03 10:00:00', '2025-07-10 09:00:00'),
  (3, 5, 'Magoebaskloof Waterfalls', 'A cluster of three accessible waterfalls in the misty indigenous forest of the Magoebaskloof Highlands near Tzaneen.', 'R71, Magoebaskloof', 'Tzaneen', 'South Africa', -23.8833, 29.8833, 'Nature', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600', 'Approved', 3, NULL, '2025-07-05 11:00:00', '2025-07-12 09:00:00'),
  (4, 7, 'Melville Koppies Nature Reserve', 'A 100-hectare dolomite ridge nature reserve in the middle of Johannesburg with archaeological sites, 240 plant species and 100 bird species.', 'Judith Road, Melville', 'Johannesburg', 'South Africa', -26.1833, 27.9833, 'Nature', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600', 'Pending', NULL, NULL, '2025-07-07 12:00:00', NULL),
  (5, 9, 'Nottingham Road Craft Village', 'A cluster of artist studios, potters, weavers, and leather craftspeople along the Midlands Meander route in the KZN Natal Midlands.', 'Nottingham Road Village', 'Nottingham Road', 'South Africa', -29.3667, 29.8833, 'Craft', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 'Approved', 4, NULL, '2025-07-09 13:00:00', '2025-07-16 10:00:00'),
  (6, 11, 'Paarl Rock Paarlberg', 'Three enormous rounded granite domes rising 200m above the Paarl valley. The largest naturally occurring granite rock in the world. Hiking trails to the summit.', 'Paarlberg Nature Reserve, Paarl', 'Paarl', 'South Africa', -33.7167, 18.9667, 'Geological', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600', 'Approved', 5, NULL, '2025-07-11 14:00:00', '2025-07-18 09:00:00'),
  (7, 13, 'Cintsa Lagoon', 'A pristine coastal lagoon mouth at Cintsa near East London where the river meets the sea. A paradise for kayaking, fishing and birdwatching.', 'Cintsa, Eastern Cape', 'East London', 'South Africa', -32.8167, 28.1833, 'Water Sport', 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=600', 'Pending', NULL, NULL, '2025-07-13 15:00:00', NULL),
  (8, 15, 'Sutherland Dark Sky Site', 'A certified dark-sky observation site 16km outside Sutherland used by SAAO amateur astronomers. The Milky Way core is visible to the naked eye.', 'R356, Outside Sutherland', 'Sutherland', 'South Africa', -32.4, 20.6667, 'Astronomy', 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600', 'Approved', 6, NULL, '2025-07-15 09:00:00', '2025-07-22 09:00:00'),
  (9, 1, 'Umgeni River Bird Park', 'One of the world largest free-flight aviaries housing 850 birds of 200 species in a spectacular waterfall garden setting.', '490 Riverside Road, Durban', 'Durban', 'South Africa', -29.8, 31.0167, 'Wildlife', 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600', 'Approved', 7, NULL, '2025-07-17 10:00:00', '2025-07-24 09:00:00'),
  (10, 3, 'Arniston Waenhuiskrans', 'One of the oldest and best-preserved fishing villages in SA. The whitewashed cottages and limestone cave are icons of Cape vernacular architecture.', 'Arniston', 'Bredasdorp', 'South Africa', -34.6667, 20.0, 'Heritage', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600', 'Rejected', 8, 'Location already listed under Overberg Tourism main directory.', '2025-07-19 11:00:00', '2025-07-26 10:00:00'),
  (11, 5, 'Nelshoogte Mountain Pass', 'A scenic 11km mountain pass winding through indigenous forest in the Mpumalanga Escarpment connecting Sabie to Barberton. Spectacular views.', 'R38, Mpumalanga', 'Sabie', 'South Africa', -25.3167, 31.0, 'Scenic', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600', 'Pending', NULL, NULL, '2025-07-21 12:00:00', NULL),
  (12, 7, 'Kyalami Circuit Museum', 'The museum at the historic Kyalami Grand Prix circuit traces South African motorsport history from the first 1967 F1 race through to today.', 'Kyalami Grand Prix Circuit', 'Midrand', 'South Africa', -25.9833, 28.0833, 'Educational', 'https://images.unsplash.com/photo-1578762560042-46ad127c95ea?w=600', 'Approved', 9, NULL, '2025-07-23 13:00:00', '2025-07-30 10:00:00'),
  (13, 9, 'Vernon Crookes Nature Reserve', 'Rare mistbelt forest and grassland reserve near Scottburgh on the KZN South Coast. Home to rare blue duiker and samango monkey.', 'D340, Scottburgh', 'Scottburgh', 'South Africa', -30.3, 30.5167, 'Wildlife', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600', 'Approved', 10, NULL, '2025-07-25 14:00:00', '2025-08-01 09:00:00'),
  (14, 11, 'Prince Albert Village', 'A beautifully preserved Karoo village ringed by olive groves at the foot of the Swartberg Mountains. Famous for its olive oil, cheese and tranquility.', 'Main Street, Prince Albert', 'Prince Albert', 'South Africa', -33.2167, 22.0333, 'Heritage', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 'Approved', 11, NULL, '2025-07-27 15:00:00', '2025-08-03 10:00:00'),
  (15, 13, 'Panorama Route Lookout', 'The official R532 Panorama Route viewpoints near Graskop including Gods Window, Pinnacle, and the Lisbon Falls - a must-do self-drive route.', 'R532, Graskop', 'Graskop', 'South Africa', -24.7, 30.8, 'Scenic', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600', 'Pending', NULL, NULL, '2025-07-29 09:00:00', NULL);

-- Table: __EFMigrationsHistory
DROP TABLE IF EXISTS `__EFMigrationsHistory`;
CREATE TABLE `__EFMigrationsHistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) VALUES
  ('20260915200354_InitialCreate', '9.0.0');

-- Table: curatedSpots
DROP TABLE IF EXISTS `curatedSpots`;
CREATE TABLE `curatedSpots` (
  `spotID` int NOT NULL AUTO_INCREMENT,
  `activityName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `activityType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `location` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `isVerified` varchar(50) DEFAULT 'pending',
  `pictureURL` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `submittedByUserID` int DEFAULT NULL,
  `submittedAt` datetime(6) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `submittedByName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `rating` decimal(4,2) DEFAULT NULL,
  PRIMARY KEY (`spotID`)
);

INSERT INTO `curatedSpots` (`spotID`, `activityName`, `activityType`, `description`, `location`, `isVerified`, `pictureURL`, `submittedByUserID`, `submittedAt`, `latitude`, `longitude`, `submittedByName`, `rating`) VALUES
  (1, 'Shongweni Dam Picnic Area', 'Nature', 'Tranquil picnic spot beside the Shongweni dam, with braai stands and easy walking trails. Family-friendly and beautifully scenic.', 'Shongweni, KwaZulu-Natal', 'verified', 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600', 2, '2025-05-01 09:00:00', -29.8833, 30.7167, 'Sipho Nkosi', '4.70'),
  (2, 'Blyde River Canyon Viewpoint', 'Scenic', 'The third largest canyon in the world. The Three Rondavels viewpoint is absolutely breathtaking and unmissable on any Mpumalanga trip.', 'Graskop, Mpumalanga', 'verified', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600', 4, '2025-05-05 10:00:00', -24.6333, 30.8, 'Lungelo Mthembu', '4.90'),
  (3, 'Cape of Good Hope', 'Landmark', 'The most south-western point of the African continent. Dramatic cliff scenery, wild baboons, and an old lighthouse with panoramic views.', 'Cape Point, Western Cape', 'verified', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600', 6, '2025-05-10 11:00:00', -34.3568, 18.474, 'Thabo Khumalo', '4.80'),
  (4, 'Bourkes Luck Potholes', 'Geological', 'Fascinating cylindrical holes carved into rock by swirling water at the confluence of the Blyde and Treur rivers. A geological marvel in Mpumalanga.', 'Moremela, Mpumalanga', 'verified', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600', 8, '2025-05-15 12:00:00', -24.6581, 30.8042, 'Bongani Mahlangu', '4.75'),
  (5, 'Gods Window', 'Scenic', 'A viewpoint on the Drakensberg Escarpment offering a dramatic window-like opening in the cliff face revealing the misty Lowveld below.', 'Graskop, Mpumalanga', 'verified', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600', 10, '2025-05-20 13:00:00', -24.7, 30.8833, 'Sifiso Cele', '4.85'),
  (6, 'uShaka Marine World', 'Entertainment', 'Africa largest marine theme park and aquarium. Shark dives, dolphin shows, a waterpark, and detailed marine biodiversity exhibits for all ages.', 'Durban, KwaZulu-Natal', 'verified', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600', 12, '2025-05-25 14:00:00', -29.8692, 31.0497, 'Mthokozisi Gumede', '4.60'),
  (7, 'Robben Island', 'Heritage', 'The island where Nelson Mandela was imprisoned for 18 years. Now a UNESCO World Heritage Site. Guided tours led by former political prisoners.', 'Cape Town, Western Cape', 'verified', 'https://images.unsplash.com/photo-1504016798967-59a258e9ab32?w=600', 14, '2025-06-01 09:00:00', -33.807, 18.3672, 'Sandile Shabalala', '4.95'),
  (8, 'Oribi Gorge Nature Reserve', 'Nature', 'Dramatic gorge carved by the Umzimkulwana River. Home to the endangered Cape vulture and spectacular suspension bridge over the gorge.', 'Port Shepstone, KZN', 'verified', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600', 16, '2025-06-05 10:00:00', -30.7167, 30.3, 'Dumisani Ntuli', '4.65'),
  (9, 'Chapmans Peak Drive', 'Scenic', 'Arguably the most scenic coastal drive in South Africa. 9km of winding road with 114 curves cut into the cliff face above the Atlantic.', 'Hout Bay, Western Cape', 'verified', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600', 17, '2025-06-10 11:00:00', -34.0833, 18.3667, 'Nombuso Majola', '4.88'),
  (10, 'Cradle of Humankind', 'Educational', 'A UNESCO World Heritage Site containing the world richest site of hominid fossils. The Maropeng visitor centre brings 3.5 billion years of history to life.', 'Magaliesberg, Gauteng', 'verified', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', 18, '2025-06-15 12:00:00', -25.9833, 27.6667, 'Sibonelo Mwelase', '4.78'),
  (11, 'Tsitsikamma National Park', 'Adventure', 'Home to the world highest bungee jump (216m) on the Bloukrans Bridge. Also offers canopy tours, kayaking, and pristine forest hiking trails.', 'Tsitsikamma, Eastern Cape', 'verified', 'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=600', 19, '2025-06-20 13:00:00', -33.9833, 23.7333, 'Phindile Mthiyane', '4.92'),
  (12, 'iSimangaliso Wetland Park', 'Wildlife', 'A UNESCO site with turtles nesting on beaches, hippos in lakes, and crocodiles in channels. Over 530 recorded bird species.', 'St Lucia, KwaZulu-Natal', 'verified', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600', 20, '2025-06-25 14:00:00', -28.3667, 32.4, 'Hlanganani Myeni', '4.83'),
  (13, 'Sabie Waterfalls Route', 'Scenic', 'A self-drive route linking four magnificent waterfalls near Sabie: Lone Creek, Bridal Veil, Mac-Mac, and Horseshoe Falls.', 'Sabie, Mpumalanga', 'verified', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600', 21, '2025-07-01 09:00:00', -25.1, 30.7833, 'Nokukhanya Hadebe', '4.72'),
  (14, 'Walter Sisulu National Botanical', 'Botanical', 'Beautiful garden featuring the endangered Witwatersrand cycad and a resident pair of Verreaux eagles nesting on the cliff face above the Magalies River.', 'Roodepoort, Gauteng', 'verified', 'https://images.unsplash.com/photo-1585320806297-9794b3e4ebe1?w=600', 22, '2025-07-05 10:00:00', -26.1, 27.7833, 'Mxolisi Vilakazi', '4.67'),
  (15, 'Drakensberg Amphitheatre', 'Hiking', 'The crown jewel of the Royal Natal National Park. A 5km basalt wall rising 1200m above the valley floor, framing the Tugela Falls.', 'Bergville, KwaZulu-Natal', 'verified', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600', 23, '2025-07-10 11:00:00', -28.6833, 28.9167, 'Zinhle Khwela', '4.97'),
  (9201, 'Boardwalk Casino and Entertainment', 'Leisure', 'An entertainment precinct featuring dining, shopping, and a spectacular musical fountain show.', 'Gqeberha', 'approved', 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600', NULL, '2026-09-15 20:17:26', -33.9825, 25.6586, 'John Doe', NULL),
  (9202, 'Donkin Reserve', 'History', 'A historic park featuring a lighthouse and a pyramid monument built by Sir Rufane Donkin in memory of his wife.', 'Gqeberha', 'approved', 'https://images.unsplash.com/photo-1518342797664-9f93ee74f261?w=600', NULL, '2026-09-15 20:17:26', -33.9622, 25.6214, 'Jane Smith', NULL),
  (9203, 'Kragga Kamma Game Park', 'Wildlife', 'A lush coastal forest setting where you can see white rhino, buffalo, cheetah, giraffe, and zebra.', 'Gqeberha', 'approved', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600', NULL, '2026-09-15 20:17:26', -33.9806, 25.4526, 'Alice Johnson', NULL),
  (9204, 'Sardinia Bay Beach', 'Nature', 'Known for its miles of unspoiled beach and towering sand dunes. Perfect for a long walk.', 'Gqeberha', 'approved', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', NULL, '2026-09-15 20:17:26', -34.0372, 25.4947, 'Bob Lee', NULL),
  (9205, 'Bayworld', 'Culture', 'A museum and oceanarium complex offering a blend of natural and cultural history.', 'Gqeberha', 'approved', 'https://images.unsplash.com/photo-1586071853637-231cb489e27c?w=600', NULL, '2026-09-15 20:17:26', -33.9781, 25.6483, 'Charlie Brown', NULL);

SET FOREIGN_KEY_CHECKS=1;

-- ✅ Import complete!