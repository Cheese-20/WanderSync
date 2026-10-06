# WanderSync — Local Setup Guide for Markers

> Get the full project running locally in under 10 minutes.

---

## Prerequisites

| Tool | Download |
|------|---------|
| .NET 8 SDK | https://dotnet.microsoft.com/download/dotnet/8 |
| Node.js 18+ | https://nodejs.org/ |
| MySQL 8.0 | https://dev.mysql.com/downloads/mysql/ |

Install all three before continuing.

---

## Step 1 — Install MySQL

1. Go to https://dev.mysql.com/downloads/mysql/
2. Select your operating system and download the installer
3. Run the installer — click through the setup wizard
4. **When asked for a root password** — set one and remember it
5. **When asked about encryption** — choose **Legacy Password Encryption**
6. Finish the install and make sure MySQL is running

> **macOS only:** After installing, add MySQL to your PATH by running:
> ```bash
> echo 'export PATH="/usr/local/mysql/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
> ```

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

## How It All Connects

```
Your Machine
├── MySQL (running as background service on port 3306)
│     └── WanderSync database (imported by setup script)
│                   ↑ connects via connection string
├── Backend (.NET) on port 5200
│                   ↑ API calls
└── Frontend (Vite) on port 5173  ←── open this in browser
```

---

## Switching Between Local and Cloud Database

```bash
./switch-db.sh local    # use your local MySQL
./switch-db.sh cloud    # use Aiven cloud database
./switch-db.sh status   # see which is active
```

---

## Troubleshooting

**"MySQL is not installed or not in PATH"**
→ Make sure MySQL is fully installed and added to your system PATH.
→ On Mac: add `/usr/local/mysql/bin` to your PATH.
→ On Windows: the installer adds it automatically.

**"Could not connect to MySQL"**
→ Double-check the username/password you entered.
→ Make sure the MySQL service is running.

**Backend crashes on startup**
→ Check that `backend/.env` was created (the setup script does this).
→ Verify the connection string has the correct password.

**"Port 5200 already in use"**
→ Something else is using that port. Stop it or restart your machine.

---

*Generated: 2026-10-06*
