# WanderSync — Local Setup Guide 

> Get the full project running locally in under 10 minutes.
---
## Step 2 — Run the Automated Setup Script

Open a terminal in the project root folder and run:

```bash
bash setup_local.sh
```

This script will:
- ✅ Check MySQL is installed and reachable
- ✅ Ask for your MySQL username/password
- ✅ Import all 20 database tables + data automatically
- ✅ Configure the backend `.env` file for you
---
## Step 3 — Start the App

You need **two terminals** open at the same time:

### Terminal 1 — Backend
```bash
cd backend
dotnet run
```
Backend starts on: **http://localhost:5200**

### Terminal 2 — Frontend
```bash
npm install
npm run dev
```
Frontend starts on: **http://localhost:5173** (Vite will show the exact URL)

Open the URL shown in Terminal 2 in your browser — the app is running! 🎉

---

## Switching Between Local and Cloud Database
```bash
./switch-db.sh local    # use your local MySQL
./switch-db.sh cloud    # use Aiven cloud database
./switch-db.sh status   # see which is active
```
---