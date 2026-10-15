using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <summary>
    /// Removes the legacy `Spots` table. All spot features use `curatedSpots`.
    ///
    /// Hand-edited from the scaffold so it is safe on both the live database and a fresh
    /// one built from InitialCreate:
    /// - On the live DB, SpotReports already references curatedSpots and nothing references
    ///   Spots, so the FK steps are skipped.
    /// - On a fresh DB, InitialCreate pointed SpotReports at Spots, so that FK is dropped and
    ///   re-pointed at curatedSpots before Spots is removed.
    /// The scaffold also tried to drop `UserSubmittedLocations`; that was removed on purpose
    /// because it is unrelated to this change.
    /// A data backup of the live Spots table is in database/backups/Spots_backup_2026-10-15.sql.
    /// </summary>
    public partial class DropLegacySpotsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // MySQL 8 has no "DROP FOREIGN KEY IF EXISTS", so check information_schema first.
            migrationBuilder.Sql(@"
                SET @fk := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
                            WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'SpotReports'
                              AND CONSTRAINT_NAME = 'FK_SpotReports_Spots_spotID' AND CONSTRAINT_TYPE = 'FOREIGN KEY');
                SET @sql := IF(@fk > 0, 'ALTER TABLE `SpotReports` DROP FOREIGN KEY `FK_SpotReports_Spots_spotID`', 'DO 0');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;");

            migrationBuilder.Sql(@"
                SET @fk := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
                            WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'SpotReports'
                              AND CONSTRAINT_NAME = 'FK_SpotReports_curatedSpots_spotID' AND CONSTRAINT_TYPE = 'FOREIGN KEY');
                SET @sql := IF(@fk = 0, 'ALTER TABLE `SpotReports` ADD CONSTRAINT `FK_SpotReports_curatedSpots_spotID` FOREIGN KEY (`spotID`) REFERENCES `curatedSpots` (`spotID`) ON DELETE CASCADE', 'DO 0');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;");

            migrationBuilder.Sql("DROP TABLE IF EXISTS `Spots`;");
        }

        /// <inheritdoc />
        /// <remarks>
        /// Recreates the empty Spots table structure only. Restore data from the backup file if needed.
        /// SpotReports is intentionally left pointing at curatedSpots.
        /// </remarks>
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Spots",
                columns: table => new
                {
                    spotID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    submittedByUserID = table.Column<int>(type: "int", nullable: false),
                    activityName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    activityType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    isVerified = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    location = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    pictureURL = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    submittedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Spots", x => x.spotID);
                    table.ForeignKey(
                        name: "FK_Spots_User_submittedByUserID",
                        column: x => x.submittedByUserID,
                        principalTable: "User",
                        principalColumn: "userID",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Spots_submittedByUserID",
                table: "Spots",
                column: "submittedByUserID");
        }
    }
}
