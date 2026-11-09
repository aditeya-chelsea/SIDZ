#!/usr/bin/env bash
set -e

# ==============================================================================
# SIDZ OSINT (TRACE//OSINT) - Automated Local Platform Installer
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "======================================================================"
echo "  [+] Initializing SIDZ OSINT (TRACE//OSINT) Installation..."
echo "  [+] Local-First Digital Footprint Intelligence Platform"
echo "======================================================================"

# 1. Environment & Pre-requisite Checks
command -v python3 >/dev/null 2>&1 || { echo "[!] Error: python3 is required. Aborting."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "[!] Error: node is required. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "[!] Error: npm is required. Aborting."; exit 1; }

echo "[*] Python: $(python3 --version)"
echo "[*] Node:   $(node -v)"
echo "[*] NPM:    $(npm -v)"

# Find Python binary (prefers python3, supports environment override via PYTHON)
PYTHON_BIN="${PYTHON:-python3}"

# 2. Virtual Environment Setup (Supports POSIX ext4 as well as exFAT/NTFS mounts)
VENV_DIR=""
if [ -d "/tmp/sidz_osint_venv" ] && [ -x "/tmp/sidz_osint_venv/bin/python" ]; then
  VENV_DIR="/tmp/sidz_osint_venv"
elif [ -d "$HOME/.sidz_osint_venv" ] && [ -x "$HOME/.sidz_osint_venv/bin/python" ]; then
  VENV_DIR="$HOME/.sidz_osint_venv"
else
  # Try creating in workspace first, fall back to ~/.sidz_osint_venv or /tmp/sidz_osint_venv if filesystem lacks symlink support
  if $PYTHON_BIN -m venv "$SCRIPT_DIR/.venv" 2>/dev/null; then
    VENV_DIR="$SCRIPT_DIR/.venv"
  elif $PYTHON_BIN -m venv "$HOME/.sidz_osint_venv" 2>/dev/null; then
    VENV_DIR="$HOME/.sidz_osint_venv"
  else
    $PYTHON_BIN -m venv "/tmp/sidz_osint_venv"
    VENV_DIR="/tmp/sidz_osint_venv"
  fi
fi

echo "$VENV_DIR" > "$SCRIPT_DIR/.venv_path"
echo "[+] Using Python Virtual Environment: $VENV_DIR"

# 3. Install Backend Dependencies
echo "[*] Installing backend dependencies into virtual environment..."
"$VENV_DIR/bin/pip" install --upgrade pip -q 2>/dev/null || true
"$VENV_DIR/bin/pip" install -r "$SCRIPT_DIR/backend/requirements.txt" -q

# 4. Install OSINT Tool Suites (Sherlock & Maigret)
echo "[*] Checking and installing Sherlock OSINT Project..."
"$VENV_DIR/bin/pip" install sherlock-project -q 2>/dev/null || true

echo "[*] Checking and installing Maigret OSINT Dossier Suite..."
"$VENV_DIR/bin/pip" install maigret -q 2>/dev/null || true

# 5. Frontend Dependencies & Build
echo "[*] Installing frontend dependencies (Vite, React, Tailwind, React Flow)..."
cd "$SCRIPT_DIR/frontend"
npm install --no-bin-links --silent

echo "[*] Compiling frontend production bundle..."
node ./node_modules/typescript/bin/tsc --noEmit || true
node ./node_modules/vite/bin/vite.js build

cd "$SCRIPT_DIR"

# 6. Database Initialization & Demonstration Seeding
echo "[*] Initializing SQLite database and pre-seeding demonstration dossiers..."
"$VENV_DIR/bin/python" -c "
import sys, asyncio
sys.path.insert(0, '$SCRIPT_DIR')
from backend.app.database import init_db, AsyncSessionLocal
from backend.app.seeds.sample_data import seed_sample_data

async def init():
    await init_db()
    async with AsyncSessionLocal() as db:
        await seed_sample_data(db)
    print('[+] Database and demo dossiers initialized successfully.')

asyncio.run(init())
"

# 7. Environment File Setup
if [ ! -f "$SCRIPT_DIR/.env" ]; then
  cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
  echo "[+] Generated default .env file."
fi

echo "======================================================================"
echo "  [✓] SIDZ OSINT (TRACE//OSINT) installed successfully!"
echo "  [✓] Launch the platform anytime by running: ./start.sh"
echo "======================================================================"

