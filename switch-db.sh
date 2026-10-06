#!/bin/bash
# =============================================================
# WanderSync - Database Switcher
# Usage:
#   ./switch-db.sh local   → use local MySQL database
#   ./switch-db.sh cloud   → use Aiven cloud MySQL database
# =============================================================

BACKEND_DIR="$(cd "$(dirname "$0")/backend" && pwd)"

case "$1" in
  local)
    cp "$BACKEND_DIR/.env.local" "$BACKEND_DIR/.env"
    echo "✅ Switched to LOCAL database (localhost:3306)"
    echo "   Make sure MySQL is running: brew services start mysql"
    ;;
  cloud)
    cp "$BACKEND_DIR/.env.cloud" "$BACKEND_DIR/.env"
    echo "✅ Switched to CLOUD database (Aiven - wandersync-2026-wandersync.d.aivencloud.com)"
    ;;
  status)
    CURRENT=$(grep -o 'Server=[^;]*' "$BACKEND_DIR/.env" | head -1)
    echo "📍 Current DB: $CURRENT"
    ;;
  *)
    echo "WanderSync Database Switcher"
    echo "----------------------------"
    echo "Usage: ./switch-db.sh [local|cloud|status]"
    echo ""
    echo "  local   - Switch to local MySQL database"
    echo "  cloud   - Switch to Aiven cloud database"
    echo "  status  - Show which database is currently active"
    ;;
esac
