#!/usr/bin/env bash
set -e

# ==============================================================================
# SIDZ OSINT (TRACE//OSINT) - Platform Startup Engine
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Resolve Virtual Environment
VENV_DIR=""
if [ -f "$SCRIPT_DIR/.venv_path" ]; then
  VENV_DIR="$(cat "$SCRIPT_DIR/.venv_path")"
fi

if [ -z "$VENV_DIR" ] || [ ! -x "$VENV_DIR/bin/python" ]; then
  if [ -x "$SCRIPT_DIR/.venv/bin/python" ]; then
    VENV_DIR="$SCRIPT_DIR/.venv"
  elif [ -x "/tmp/sidz_osint_venv/bin/python" ]; then
    VENV_DIR="/tmp/sidz_osint_venv"
  elif [ -x "$HOME/.sidz_osint_venv/bin/python" ]; then
    VENV_DIR="$HOME/.sidz_osint_venv"
  else
    echo "[!] Virtual environment not detected. Running ./install.sh first..."
    ./install.sh
    VENV_DIR="$(cat "$SCRIPT_DIR/.venv_path")"
  fi
fi

echo "======================================================================"
echo "  [+] STARTING SIDZ OSINT (TRACE//OSINT) PLATFORM"
echo "  [+] Local-First Digital Footprint Intelligence Platform"
echo "======================================================================"
echo "  [*] Backend:  http://127.0.0.1:8000"
echo "  [*] Frontend: http://127.0.0.1:5173 (or http://127.0.0.1:8000 directly)"
echo "  [*] Python:   $VENV_DIR/bin/python"
echo "======================================================================"

# Trap SIGINT and SIGTERM to kill background workers cleanly
cleanup() {
  echo ""
  echo "[*] Shutting down SIDZ OSINT services..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Export path so all external tools (sherlock, maigret, amass, theHarvester, whois, dig) are on PATH
export PATH="$VENV_DIR/bin:$PATH"
export PYTHONPATH="$SCRIPT_DIR:$PYTHONPATH"
export LD_LIBRARY_PATH="/tmp/tools_extracted/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH"
[ -w "$HOME" ] || export HOME="/tmp"

# 2. Launch FastAPI Backend
echo "[+] Starting FastAPI Intelligence Engine on http://127.0.0.1:8000..."
"$VENV_DIR/bin/python" "$SCRIPT_DIR/backend/run.py" &
BACKEND_PID=$!

# Wait 2 seconds for backend to bind port
sleep 2

# 3. Launch Vite Frontend Development Server
echo "[+] Starting Vite Interactive Investigation UI on http://127.0.0.1:5173..."
cd "$SCRIPT_DIR/frontend"
node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

cd "$SCRIPT_DIR"

echo ""
echo "======================================================================"
echo "  [✓] SIDZ OSINT IS RUNNING LOCALLY"
echo "  [✓] Open in browser: http://127.0.0.1:5173"
echo "  [✓] Press [CTRL+C] at any time to safely terminate both services"
echo "======================================================================"

# Keep script running and wait for background processes
wait $BACKEND_PID $FRONTEND_PID

