# WanderSync — Database Backups

## Files

| File | Description |
|------|-------------|
| `wandersync_backup.sql` | Full database dump — 20 tables + all data |

## How to import

```bash
mysql -u root -p < database/wandersync_backup.sql
```

## How to create a new backup

Run this from the project root:

```bash
cd backend && python3 dump_cloud_db.py
cp wandersync_local_setup.sql database/wandersync_backup.sql
```

## Backup contents
- **20 tables** — User, Admin, Profile, Bookings, Tours, Spots, Posts, Messages, Matches, Reviews, and more
- **Full data** — all records from the cloud database at time of export
