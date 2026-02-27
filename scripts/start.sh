#!/usr/bin/env bash
set -euo pipefail

APP_NAME="property-sell-tracker"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$PROJECT_DIR/.pid"
LOG_FILE="$PROJECT_DIR/.app.log"
PORT="${PORT:-3000}"
MODE="${1:-dev}" # dev (default) or prod

cd "$PROJECT_DIR"

# Ensure local node_modules binaries are in PATH
export PATH="$PROJECT_DIR/node_modules/.bin:$PATH"

# Install dependencies if missing or incomplete
if [ ! -x "node_modules/.bin/next" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Check if already running
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "$APP_NAME is already running (PID: $PID)"
    exit 0
  else
    echo "Stale PID file found. Cleaning up..."
    rm -f "$PID_FILE"
  fi
fi

if [ "$MODE" = "prod" ]; then
  # Build first if .next directory doesn't exist
  if [ ! -d ".next" ]; then
    echo "Building $APP_NAME..."
    npm run build
  fi
  echo "Starting $APP_NAME in production mode on port $PORT..."
  PORT=$PORT nohup npm run start > "$LOG_FILE" 2>&1 &
else
  echo "Starting $APP_NAME in dev mode on port $PORT..."
  PORT=$PORT nohup npm run dev > "$LOG_FILE" 2>&1 &
fi

APP_PID=$!

# Wait briefly and check if process is alive
sleep 2
if kill -0 "$APP_PID" 2>/dev/null; then
  echo "$APP_PID" > "$PID_FILE"
  echo "$APP_NAME started successfully (PID: $APP_PID)"
  echo "Mode: $MODE"
  echo "Logs: $LOG_FILE"
  echo "URL:  http://localhost:$PORT"
else
  echo "Failed to start $APP_NAME. Check logs: $LOG_FILE"
  exit 1
fi
