# Last Edited — WanderSync

**Date:** 2026-10-15  
**Changed by:** Antigravity

---

## Latest: Removed All Inline Styles from Overview.jsx

**Files changed:**
- `src/components/admin/Overview.jsx` — inline styles replaced with class names / CSS custom property
- `src/styles/admin.css` — corresponding CSS rules added

**What changed:**  
All `style={{...}}` attributes have been removed from `Overview.jsx`. Each value is now declared in `admin.css`:

| Removed inline style | Replacement |
|---|---|
| `style={{ marginTop: '16px' }}` on `report-list` (×2) | `.report-list--spaced` modifier class |
| `style={{ color: '#888', fontStyle: 'italic' }}` on "No stops" message | `.stop-empty` class (done in previous change) |
| `style={{ marginRight: '6px' }}` on stop type tag | removed — `.stop-meta { gap: 4px }` handles spacing (done in previous change) |
| `style={{ color: card.accent }}` on `.report-card-icon` | CSS custom property `--icon-accent` set per card in JSX; `.report-card-icon { color: var(--icon-accent) }` reads it |

**Why:** Inline styles scatter visual decisions across JSX and make them harder to find, override, or theme. Moving them to CSS keeps all styling in one place.

**How it works:**
- `.report-list--spaced` is a BEM-style modifier: add it alongside `.report-list` whenever the list needs top spacing after a stat line.
- The icon accent colour is inherently data-driven (each card has its own colour), so it cannot be a plain CSS class. Using a CSS custom property (`--icon-accent`) keeps the data in JSX while the styling rule stays in CSS — a clean separation.

---

## Latest: Fixed CustomItinerary Display in Top Rated Experiences Report

**Files changed:**
- `src/components/admin/Overview.jsx` — rendering logic
- `src/styles/admin.css` — itinerary stop styles

**What changed:**
- `CustomItinerary` type tours were showing raw JSON (e.g. `[{"id":...,"name":"Best day Tour",...}]`) in the Top Rated Experiences report, while every other type showed a plain-English description.
- Added a new `renderExperienceDescription(e)` helper that is called instead of rendering `e.description` directly.
- For any experience whose `type` is not `CustomItinerary`, the helper just renders `<p>{e.description}</p>` — identical to the old behaviour.
- For `CustomItinerary` entries it parses the JSON string into an array of stop objects and renders each one as a numbered card showing: stop name, stop type badge, 📍 location, 🕐 time, ⏱ duration, and an optional notes line.
- An empty itinerary array (`[]`) is shown as *"No stops added yet."* instead of `[]`.
- If the JSON string is somehow invalid it falls back to plain text so no crash occurs.

**Why it changed:**
- The `Description` column in the `Tours` table is reused for both free-text descriptions (all other types) and a serialised list of itinerary stops (`CustomItinerary`). The admin report was rendering the raw JSON, which is unreadable to an admin.

**How it works:**
1. `renderTopExperiences` calls `renderExperienceDescription(e)` for every item in the list.
2. If `e.type !== 'CustomItinerary'`, a simple `<p>` is returned — no change.
3. Otherwise `JSON.parse(e.description)` extracts the stops array.
4. Each stop is rendered inside an `.itinerary-stop` flex card: a circular numbered badge (`.stop-index`) on the left, and on the right the stop name, a meta row with the type pill + location/time/duration, and an italic notes line if present.
5. New CSS classes `.itinerary-stops`, `.itinerary-stop`, `.stop-index`, `.stop-details`, `.stop-name`, `.stop-meta`, and `.stop-notes` in `admin.css` handle the visual layout, re-using the existing `--admin-green-tint` and `--admin-green-border` CSS variables so the cards match the project colour palette.

---

## Latest: Guide Review Comment Is Optional

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

`SpotVotes.guideID` intentionally has **no** foreign key to `User`. When a guide deletes their account, their votes are kept. Their approve/reject votes still count toward a spot's 5-vote threshold, and their upvotes still count in `upvotesCount`. This was a deliberate choice: once a spot is decided, it shouldn't change because the voter left.

`AuthController` (account deletion) had a comment saying user deletion cascades to `SpotVotes`. That was wrong, so the comment was corrected.

## Follow-ups (not changed)

- The model snapshot no longer includes `UserSubmittedLocations`. If a future migration is scaffolded, EF will try to drop that table again unless the step is removed.
