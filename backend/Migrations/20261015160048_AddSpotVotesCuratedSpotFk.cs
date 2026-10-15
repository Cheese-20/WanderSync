using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <summary>
    /// Adds a foreign key from SpotVotes.spotID to curatedSpots.spotID (ON DELETE CASCADE).
    ///
    /// The live SpotVotes table never had this FK, so votes for deleted spots were left behind.
    /// The orphaned rows are removed first; otherwise MySQL would refuse to add the FK.
    /// A backup of the orphans removed on 2026-10-15 is in
    /// database/backups/SpotVotes_orphans_backup_2026-10-15.sql.
    /// </summary>
    public partial class AddSpotVotesCuratedSpotFk : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Remove votes pointing at spots that no longer exist.
            migrationBuilder.Sql(@"
                DELETE v FROM `SpotVotes` v
                LEFT JOIN `curatedSpots` c ON c.spotID = v.spotID
                WHERE c.spotID IS NULL;");

            migrationBuilder.CreateIndex(
                name: "IX_SpotVotes_spotID",
                table: "SpotVotes",
                column: "spotID");

            migrationBuilder.AddForeignKey(
                name: "FK_SpotVotes_curatedSpots_spotID",
                table: "SpotVotes",
                column: "spotID",
                principalTable: "curatedSpots",
                principalColumn: "spotID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        /// <remarks>Deleted orphan votes are not restored; use the backup file if needed.</remarks>
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SpotVotes_curatedSpots_spotID",
                table: "SpotVotes");

            migrationBuilder.DropIndex(
                name: "IX_SpotVotes_spotID",
                table: "SpotVotes");
        }
    }
}
