#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

if [ -f ".env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  source ".env.local"
  set +a
fi

APP_URL="${APP_URL:-${NEXTAUTH_URL:-http://localhost:3000}}"

if [ -z "${CRON_SECRET:-}" ]; then
  echo "CRON_SECRET is not set. Add it to .env.local before running cron."
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running Telegram alert checks against ${APP_URL}"

curl -fsS \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_URL}/api/cron/profit-check"
echo

curl -fsS \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_URL}/api/cron/ssd-check"
echo

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Alert checks completed"
