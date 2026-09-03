-- ============================================================================
-- SpotReports table
--
-- Backs the user-facing "report a spot" flow (SpotsController.ReportSpot) and the
-- admin review/flag/delete flow (AdminController reported-spots endpoints). Both
-- already target this table via the SpotReport model; the table was declared in
-- migration 20260826110229_CleanSpotRatings but never applied to the remote database.
--
-- Column names, types and nullability match backend/Models/SpotReport.cs and the
-- EF model snapshot exactly, so no code changes are needed once this runs.
--
-- Foreign keys are enforced against the REAL parent tables:
--   spotID     -> curatedSpots(spotID)   (NOT `Spots`, which does not exist)
--   reporterID -> User(userID)
--
-- Verified against the live database before writing:
--   * curatedSpots.spotID : int, PRIMARY KEY, auto_increment
--   * User.userID         : int, PRIMARY KEY, auto_increment
--   * both tables InnoDB, utf8mb4_0900_ai_ci  (FK-compatible)
--
-- ON DELETE CASCADE: when a spot or user is removed, its reports go with it, so no
-- orphan rows are left behind. This also means the admin "delete spot" action no
-- longer needs to delete the child reports first.
-- ============================================================================

CREATE TABLE IF NOT EXISTS `SpotReports` (
    `spotReportID` INT         NOT NULL AUTO_INCREMENT,
    `spotID`       INT         NOT NULL,
    `reporterID`   INT         NOT NULL,
    `reason`       LONGTEXT    NOT NULL,
    `sentAt`       DATETIME(6) NULL,
    PRIMARY KEY (`spotReportID`),
    KEY `IX_SpotReports_spotID` (`spotID`),
    KEY `IX_SpotReports_reporterID` (`reporterID`),
    CONSTRAINT `FK_SpotReports_curatedSpots_spotID`
        FOREIGN KEY (`spotID`) REFERENCES `curatedSpots` (`spotID`)
        ON DELETE CASCADE,
    CONSTRAINT `FK_SpotReports_User_reporterID`
        FOREIGN KEY (`reporterID`) REFERENCES `User` (`userID`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
