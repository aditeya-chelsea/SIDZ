import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
REPORTS_DIR = BASE_DIR / "reports"

DATA_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "SIDZ OSINT"
    APP_SUBTITLE: str = "Digital Footprint Intelligence Platform"
    VERSION: str = "1.0.0"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DATABASE_URL: str = f"sqlite+aiosqlite:///{DATA_DIR / 'sidz_osint.db'}"
    
    # OSINT API keys (Optional - defensive checks work without them or report key requirement)
    HIBP_API_KEY: str = os.getenv("HIBP_API_KEY", "")
    SHODAN_API_KEY: str = os.getenv("SHODAN_API_KEY", "")
    VIRUSTOTAL_API_KEY: str = os.getenv("VIRUSTOTAL_API_KEY", "")
    
    # Safety and limits
    MAX_CONCURRENT_SCANS: int = 4
    REQUEST_TIMEOUT_SECONDS: int = 20
    SUBPROCESS_TIMEOUT_SECONDS: int = 120
    
    # Tool execution paths (auto-detected if in PATH or venv)
    PYTHON_EXEC: str = os.getenv("PYTHON_EXEC", "/tmp/sidz_osint_venv/bin/python")
    SHERLOCK_EXEC: str = os.getenv("SHERLOCK_EXEC", "")
    MAIGRET_EXEC: str = os.getenv("MAIGRET_EXEC", "")
    THEHARVESTER_EXEC: str = os.getenv("THEHARVESTER_EXEC", "")
    AMASS_EXEC: str = os.getenv("AMASS_EXEC", "")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

