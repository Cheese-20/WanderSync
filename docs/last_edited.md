# Last Edited — WanderSync

**Date:** 2026-10-15  
**Changed by:** Kiro

---

## Latest: Spot Card Layout (Wider Button, Consistent Pin)

**Files:** `src/pages/ExplorerHome.jsx`, `src/pages/GuideHome.jsx`, `src/styles/explorer.css`

**What changed:**
1. **View Details button spans the card.** The spacer `<div style={{ flex: 1 }}>` was removed, and the button gets an extra class, `spot-details-btn` (`flex: 1; width: 100%`, slightly larger padding and font). The class is added next to `mint-btn` so other `mint-btn` buttons, like the tour "Join" button, are unaffected.
2. **Location pin is the same size on every card.** The pin `<svg>` sat in a flex row. When a longer address wrapped onto two lines, the browser shrank the icon to make room, so pins looked different sizes. The row now uses `.spot-card-location`, and the icon uses `.spot-card-location-pin` with `flex: 0 0 14px`, which means it never shrinks. The row aligns to the top (`align-items: flex-start`), so on wrapped addresses the pin lines up with the first line of text. The icon is marked `aria-hidden`, since the address text already conveys the meaning.

---

## Spot Cards Show a Street Address

**Problem:** spot cards show `curatedSpots.location`. For the seeded Gqeberha spots, that field only held the city ("Gqeberha"). The Explore page's "Add a spot" form also hinted at a city ("e.g. Cape Town, WC"). Spots added by dropping a pin on the map already got a street-level address from reverse geocoding in `MapModal.jsx`.

**What changed:**

| Where | Change |
|---|---|
| Live DB, `curatedSpots.location` | Updated spots 9201–9205 from "Gqeberha" to street addresses (see table below). |
| `backend/Program.cs` | The seed `INSERT IGNORE` for 9201–9205 now uses the same addresses, so a fresh database matches. It never overwrites existing rows. |
| `src/pages/ExplorePage.jsx` | Step 2 of the "Add a spot" wizard now asks for a street address (placeholder `Street address, e.g. 12 Marine Drive, Summerstrand, Gqeberha`, plus an `aria-label`). |

No card code changed. The cards already render `spot.location`, so they now show the address.

| spotID | Spot | New `location` |
|---|---|---|
| 9201 | Boardwalk Casino and Entertainment | Marine Drive, Summerstrand, Gqeberha, 6001 |
| 9202 | Donkin Reserve | Belmont Terrace, Central, Gqeberha, 6001 |
| 9203 | Kragga Kamma Game Park | Horseshoe Crescent, Kragga Kamma, Gqeberha, 6030 |
| 9204 | Sardinia Bay Beach | Sardinia Bay Road, Sardinia Bay, Gqeberha |
| 9205 | Bayworld | Beach Road, Humewood, Gqeberha, 6013 |

Addresses for 9201–9203 and 9205 were checked against OpenStreetMap (Nominatim) search results and well-known street addresses. Sardinia Bay Beach wasn't found by name on OSM, so its address uses the access road. To revert, set `location = 'Gqeberha'` for these IDs (that was the previous value for all five).

**Still city-only (user-submitted, no coordinates):** 9207/9208 "Sacramento Trail" and 9210 "Jack's Pizza Plaza". Their real addresses are needed before they can be updated.

---

## Spot Upvote (Thumbs Up) Removed

**What changed:** the upvote feature on verified spot cards is gone. The card footer now shows only the **View Details** button.

| File | Change |
|---|---|
| `src/pages/ExplorerHome.jsx` | Removed the thumbs-up button and the `handleUpvote` function from the local favourites spot cards. |
| `src/pages/GuideHome.jsx` | Same removal on the guide home spot cards. |
| `src/styles/explore.css` | Removed the unused `.upvote-btn` styles. |
| `backend/Controllers/SpotController.cs` | Removed the `POST /api/spots/{id}/upvote` endpoint and its `UpvoteRequest` class, along with the "X upvoted your spot" notification. `GET /api/spots/verified` no longer queries upvotes or returns `upvotesCount` / `hasUpvoted`. |
| `backend/Controllers/AuthController.cs` | Comment updated so it no longer mentions upvotes. |

**Not affected:** guide **verification** voting (`POST /api/spots/{id}/vote`, approve/reject, 5 approvals to verify) is a separate feature and still works. Spot star ratings are also unchanged.

**Database:** no schema change. One old row with `voteType = 'upvote'` is still in `SpotVotes`. Nothing reads it any more. There are no `Upvote` notifications.

---

## Notifications No Longer Wiped on Startup

**Problem:** `backend/Program.cs` ran `DROP TABLE IF EXISTS Notifications` on **every startup**, right before `CREATE TABLE IF NOT EXISTS Notifications`. Every `dotnet run` or redeploy therefore deleted all users' notifications. This also broke `BookingReminderService`, which checks existing notifications to avoid sending duplicate reminders, so reminders were re-sent after each restart. The line was added in commit `90f608e` (2026-08-05).

**What changed:**

| File | Change |
|---|---|
| `backend/Program.cs` | Removed the `DROP TABLE` line and left a comment explaining why it must not come back. `CREATE TABLE IF NOT EXISTS` still creates the table on a fresh database. |
| `backend/Controllers/NotificationsController.cs` | `GET /api/notifications/{userId}` now hides notifications whose `scheduledFor` is in the future (`ScheduledFor == null \|\| ScheduledFor <= now`). |
| `backend/Controllers/NotificationController.cs` | **Deleted.** It duplicated `NotificationsController` (`/api/notification/...` vs `/api/notifications/...`), and nothing in the frontend or backend called it. Its only extra feature, the `scheduledFor` filter, was moved into `NotificationsController`. |

**How notifications work now:**
1. **Creation:** an action (booking, tour cancellation, spot submission, guide application decision, match, message, etc.) adds a row with `_context.Notifications.Add(...)` in its own controller. This was unchanged.
2. **Display:** `NavBar.jsx` fetches `GET /api/notifications/{userId}` and shows notifications that are due, newest first.
3. **Mark as read:** `NavBar.jsx` calls `PUT /api/notifications/{id}/read`.
4. Rows now persist across restarts.

**Note:** no code currently sets `scheduledFor`, so in practice every notification still shows immediately. The filter only matters if scheduled notifications are added later. Notifications wiped before this fix can't be recovered from the app; the live table was last recreated at 2026-10-15 16:30:46.

---

## Guide Review Comment Is Optional

**File:** `src/pages/GuideDetail.jsx` (the "Leave a review" form on a guide's profile page)

**What changed:**
- Removed `required` from the comment textarea, so a guide can be reviewed with only a star rating.
- Label is now "Comment (optional)" and is linked to the textarea (`htmlFor`/`id`) for screen readers. The placeholder also says "(optional)".
- A blank or whitespace-only comment is sent as `null` (`reviewComment.trim() || null`).

**Why:** the rule is "rating required, comment optional". The My Activities rating form and the backend (`LocalGuideController`, which stores `request.Comment ?? string.Empty`) already followed it, but this form blocked submission without a comment.

**How it works:** the rating dropdown is still required (and defaults to 5). The backend still checks the score is 1–5 and that the user has a confirmed booking with this guide that ended at least 30 minutes ago.

---

## Tour Card Date No Longer Shows Time

**File:** `src/pages/ExplorerHome.jsx` (tour cards on the Explorer home page)

**What changed:** the card's date line used to show `28/10/2026 at 00:00`. It now shows just the date (`28/10/2026`).

**Why:** most tours are stored with a midnight time, so the card showed a meaningless "at 00:00".

**How:** removed the ` at {toLocaleTimeString(...)}` part from the card's date line. The date still comes from `new Date(tour.date).toLocaleDateString()`. The `timeOfBooking` value sent when booking a tour is untouched; that is request data, not something shown on the card.

---

## Summary

Removed the legacy `Spots` table and the `Spot` entity. `curatedSpots` (the `CuratedSpot` entity) is now the only table that stores spots. Also fixed a bug where the database backfill read spot names from the wrong table.

## Why

There were two spot tables:

| Table | Entity | Used by |
|---|---|---|
| `curatedSpots` | `CuratedSpot` | All real features: submitting, guide voting, verified map spots, ratings, reports, admin moderation, seed data |
| `Spots` | `Spot` | Only `DatabaseBackfillController` (by mistake) |

The live `Spots` table held 15 old rows. Their IDs 1–15 overlap with `curatedSpots` IDs 1–15, but they describe different places. For example, `Spots` #2 is "Durban Botanic Gardens" while `curatedSpots` #2 is "Blyde River Canyon Viewpoint". No other table had a foreign key pointing at `Spots`.

**The bug:** `DatabaseBackfillController` (step 8, SpotVotes) looked up `_context.Spots.FindAsync(vote.SpotID)` to copy the spot name and location onto each vote. Votes reference `curatedSpots.spotID`, so this copied the name of an unrelated spot with the same ID onto the vote. For IDs that don't exist in `Spots` (e.g. 9205), it copied nothing.

## What Changed

| File | Change |
|---|---|
| `backend/Models/Spot.cs` | **Deleted.** It mapped to the legacy `Spots` table. |
| `backend/Data/WanderSyncDbContext.cs` | Removed `DbSet<Spot> Spots`. |
| `backend/Controllers/DatabaseBackfillController.cs` | SpotVotes backfill now uses `_context.CuratedSpots.FindAsync(...)`. |
| `backend/Controllers/AdminController.cs` | Updated an outdated comment above the reported-spots endpoints. |
| `backend/Migrations/20261015155314_DropLegacySpotsTable.cs` (+ Designer, snapshot) | **New migration** that drops `Spots`. See below. |
| `database/backups/Spots_backup_2026-10-15.sql` | **New.** `mysqldump` of the 15 live `Spots` rows, taken before the drop. |
| `docs/use_case_narratives.md` | Use Case 10 now refers to `curatedSpots` instead of `Spots`. |

## How the Migration Works

`DropLegacySpotsTable.Up()` runs three steps. Each one is safe to run whatever state the database is in:

1. **Drop the old FK if present.** If `SpotReports` still has `FK_SpotReports_Spots_spotID` (only on a database built fresh from `InitialCreate`), it is dropped. MySQL 8 has no `DROP FOREIGN KEY IF EXISTS`, so the migration checks `information_schema` and runs the statement through `PREPARE`/`EXECUTE`.
2. **Ensure `SpotReports` points at `curatedSpots`.** It adds `FK_SpotReports_curatedSpots_spotID` (ON DELETE CASCADE) only if it is missing. The live DB already has it, so nothing changes there.
3. `DROP TABLE IF EXISTS Spots`.

EF also scaffolded a drop of an unrelated `UserSubmittedLocations` table, because the model snapshot was already out of date. That step was removed on purpose so this migration only touches `Spots`.

`Down()` recreates an **empty** `Spots` table. To get the data back, run the backup file:

```bash
mysql -h <host> -P <port> -u <user> -p WanderSync < database/backups/Spots_backup_2026-10-15.sql
```

## Applying It

```bash
cd backend
dotnet ef database update
```

This uses the connection string from `ConnectionStrings__WanderSyncDb` (the `.env` file).

## Part 2: SpotVotes Foreign Key

**Problem:** The live `SpotVotes` table had **no foreign key** to `curatedSpots`. The `CREATE TABLE IF NOT EXISTS` in `Program.cs` defines one, but it never runs against a table that already exists. So when a spot was deleted, its votes stayed behind. There were 4 orphaned `reject` votes, for spot IDs 9206 (×3) and 9209.

**What changed:**

| File | Change |
|---|---|
| `backend/Models/SpotVote.cs` | Added a `CuratedSpot` navigation property (`[ForeignKey("SpotID")]`) so EF knows about the relationship. |
| `backend/Migrations/20261015160048_AddSpotVotesCuratedSpotFk.cs` (+ Designer, snapshot) | **New migration.** |
| `database/backups/SpotVotes_orphans_backup_2026-10-15.sql` | **New.** Backup of the 4 orphan votes before they were deleted. |

**How the migration works:**
1. Deletes every `SpotVotes` row whose `spotID` doesn't exist in `curatedSpots`. MySQL won't add a foreign key while orphan rows exist.
2. Creates the index `IX_SpotVotes_spotID`.
3. Adds `FK_SpotVotes_curatedSpots_spotID` with `ON DELETE CASCADE`. Now, when a spot is deleted (e.g. by the admin delete endpoint), its votes are deleted automatically, the same way `SpotReports` and `SpotRatings` already work.

`Down()` removes the FK and index. It doesn't restore the deleted votes; use the backup file for that.

## Applied to the Live Database (2026-10-15)

Both migrations were applied with `dotnet ef database update`. Checked afterwards:
- The `Spots` table no longer exists.
- `__EFMigrationsHistory` lists `InitialCreate`, `DropLegacySpotsTable`, `AddSpotVotesCuratedSpotFk`.
- `SpotVotes`: 18 rows, 0 orphans (was 22).
- `curatedSpots`: 23 rows (unchanged).
- `SpotRatings`, `SpotReports` and `SpotVotes` all have a foreign key to `curatedSpots`.

## Part 3: Removed Unused SpotVotes Name Columns

**Problem:** `SpotVotes` had four denormalized columns: `spotName`, `spotLoaction` (sic), `guideName`, `guideSurname`. They were NULL in every row and nothing in the app read them. Only the backfill endpoint wrote to them.

**What changed:**

| File | Change |
|---|---|
| `backend/Models/SpotVote.cs` | Removed the `SpotName`, `SpotLocation`, `GuideName`, `GuideSurname` properties. The model is now `voteID`, `spotID`, `guideID`, `voteType`, `votedAt`. |
| `backend/Controllers/DatabaseBackfillController.cs` | Removed step 8 (the SpotVotes backfill), since there is nothing left to fill. |
| `backend/Program.cs` | Removed the four `ALTER TABLE SpotVotes ADD COLUMN ...` startup statements. **This step matters:** without it, the app would recreate the columns on every startup. |
| `backend/Migrations/20261015160732_DropSpotVoteNameColumns.cs` (+ Designer, snapshot) | **New migration** that runs `DROP COLUMN` for each of the four columns. |

**How it works now:** to show a vote's spot or guide name, join `SpotVotes.spotID` → `curatedSpots` and `SpotVotes.guideID` → `User`. That always gives the current name, whereas copies in the vote row can go stale.

**Applied to the live DB (2026-10-15):** before the drop, I confirmed all 4 columns held only NULLs (0 non-null rows). Afterwards, `SpotVotes` has the columns `voteID, spotID, guideID, voteType, votedAt` and all 18 rows are intact. `Down()` re-adds the columns, empty.

**Verified unused:** a search of the backend and the `src/` frontend found no remaining code that reads or writes these properties. The only `SpotVotes` usages left (in `SpotController`) use `SpotID`, `GuideID`, `VoteType` and `VotedAt`, and none of the API responses send vote rows to the frontend.

> Note: `Tours` and `GuideRatings` have their own `guideName`/`guideSurname` columns. Those are separate and were **not** changed.

## Decision: No FK on SpotVotes.guideID

`SpotVotes.guideID` intentionally has **no** foreign key to `User`. When a guide deletes their account, their votes are kept. Their approve/reject votes still count toward a spot's 5-vote threshold. This was a deliberate choice: once a spot is decided, it shouldn't change because the voter left.

`AuthController` (account deletion) had a comment saying user deletion cascades to `SpotVotes`. That was wrong, so the comment was corrected.

## Follow-ups (not changed)

- The model snapshot no longer includes `UserSubmittedLocations`. If a future migration is scaffolded, EF will try to drop that table again unless the step is removed.
