#!/usr/bin/env bash
set -euo pipefail

APP_NAME="property-sell-tracker"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$PROJECT_DIR/.pid"
PORT="${PORT:-3000}"

# Try PID file first
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "Stopping $APP_NAME (PID: $PID)..."
    kill "$PID"
    # Wait for graceful shutdown (up to 10 seconds)
    for i in $(seq 1 10); do
      if ! kill -0 "$PID" 2>/dev/null; then
        break
      fi
      sleep 1
    done
    # Force kill if still running
    if kill -0 "$PID" 2>/dev/null; then
      echo "Force killing $APP_NAME..."
      kill -9 "$PID" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
    echo "$APP_NAME stopped."
    exit 0
  else
    echo "Process $PID not found. Cleaning up stale PID file..."
    rm -f "$PID_FILE"
  fi
fi

# Fallback: find and kill process by port
PID=$(lsof -ti:"$PORT" 2>/dev/null || true)
if [ -n "$PID" ]; then
  echo "Stopping process on port $PORT (PID: $PID)..."
  kill "$PID" 2>/dev/null || true
  sleep 2
  kill -9 "$PID" 2>/dev/null || true
  rm -f "$PID_FILE"
  echo "$APP_NAME stopped."
else
  echo "$APP_NAME is not running."
fi
