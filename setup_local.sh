#!/bin/bash
# ============================================================
# WanderSync - Marker Local Setup Script
# Run this once to set up the local database automatically.
# Usage: bash setup_local.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SQL_FILE="$SCRIPT_DIR/database/wandersync_backup.sql"
ENV_LOCAL="$SCRIPT_DIR/backend/.env.local"
ENV_FILE="$SCRIPT_DIR/backend/.env"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   WanderSync Local Setup             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# ── Step 1: Check MySQL is installed ──────────────────────────
echo -e "${YELLOW}[1/4] Checking MySQL installation...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL is not installed or not in PATH.${NC}"
    echo ""
    echo "Please install MySQL 8.0 first:"
    echo "  → https://dev.mysql.com/downloads/mysql/"
    echo "  → Choose your OS, download the DMG/MSI installer"
    echo "  → After installing, run this script again"
    exit 1
fi
MYSQL_VERSION=$(mysql --version)
echo -e "${GREEN}✅ MySQL found: $MYSQL_VERSION${NC}"

# ── Step 2: Get MySQL credentials ─────────────────────────────
echo ""
echo -e "${YELLOW}[2/4] MySQL credentials...${NC}"
read -p "   Enter your MySQL username (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "   Enter your MySQL password (leave blank if none): " DB_PASS
echo ""

# Test connection
echo -e "   Testing connection..."
if [ -z "$DB_PASS" ]; then
    MYSQL_CMD="mysql -u $DB_USER"
else
    MYSQL_CMD="mysql -u $DB_USER -p$DB_PASS"
fi

if ! $MYSQL_CMD -e "SELECT 1;" &> /dev/null; then
    echo -e "${RED}❌ Could not connect to MySQL. Check your username/password.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Connected to MySQL successfully!${NC}"

# ── Step 3: Import the database ───────────────────────────────
echo ""
echo -e "${YELLOW}[3/4] Importing WanderSync database...${NC}"

if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}❌ SQL file not found: $SQL_FILE${NC}"
    echo "Make sure wandersync_local_setup.sql is in the project root."
    exit 1
fi

echo "   Importing 20 tables from wandersync_local_setup.sql..."
$MYSQL_CMD < "$SQL_FILE"
echo -e "${GREEN}✅ Database imported successfully!${NC}"

# ── Step 4: Write .env file ───────────────────────────────────
echo ""
echo -e "${YELLOW}[4/4] Configuring backend connection...${NC}"

if [ -z "$DB_PASS" ]; then
    CONN="Server=localhost;Port=3306;Database=WanderSync;Uid=$DB_USER;Pwd=;SslMode=None;"
else
    CONN="Server=localhost;Port=3306;Database=WanderSync;Uid=$DB_USER;Pwd=$DB_PASS;SslMode=None;"
fi

echo "ConnectionStrings__WanderSyncDb=\"$CONN\"" > "$ENV_FILE"
echo -e "${GREEN}✅ backend/.env configured!${NC}"

# ── Done ──────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Setup Complete!                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo "Now start the app with TWO terminals:"
echo ""
echo -e "  ${BLUE}Terminal 1 (Backend):${NC}"
echo "    cd backend"
echo "    dotnet run"
echo ""
echo -e "  ${BLUE}Terminal 2 (Frontend):${NC}"
echo "    npm install"
echo "    npm run dev"
echo ""
echo "Then open your browser at the URL shown by the frontend."
echo ""
