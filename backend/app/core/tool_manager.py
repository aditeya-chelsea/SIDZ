import shutil
import asyncio
import os
import sys
from typing import Dict, Any, List
from backend.app.config import settings

TOOLS_CONFIG = [
    {
        "id": "sherlock",
        "name": "Sherlock Project",
        "category": "Username Intelligence",
        "binaries": ["sherlock", "/tmp/sidz_osint_venv/bin/sherlock"],
        "version_arg": "--version",
        "install_command": "pip install sherlock-project",
        "description": "Hunt down social media accounts by username across 400+ public websites.",
        "native_fallback": True,
    },
    {
        "id": "maigret",
        "name": "Maigret Suite",
        "category": "Username Intelligence",
        "binaries": ["maigret", "/tmp/sidz_osint_venv/bin/maigret"],
        "version_arg": "--version",
        "install_command": "pip install maigret",
        "description": "Advanced username search & dossier generation with recursive parsing.",
        "native_fallback": True,
    },
    {
        "id": "theHarvester",
        "name": "theHarvester",
        "category": "OSINT Aggregation",
        "binaries": ["theHarvester", "/tmp/sidz_osint_venv/bin/theHarvester"],
        "version_arg": "-h",
        "install_command": "pip install git+https://github.com/laramies/theHarvester.git@4.9.2",
        "description": "Public search engine reconnaissance for emails, subdomains, and names.",
        "native_fallback": True,
    },
    {
        "id": "whois",
        "name": "System WHOIS",
        "category": "Domain & IP Intelligence",
        "binaries": ["whois", "/tmp/sidz_osint_venv/bin/whois"],
        "version_arg": "--version",
        "install_command": "sudo apt-get install whois",
        "description": "Query official regional Internet registries (ARIN, RIPE, APNIC, ICANN).",
        "native_fallback": True,
    },
    {
        "id": "dig",
        "name": "DNS Utilities (dig)",
        "category": "DNS & Infrastructure",
        "binaries": ["dig", "/tmp/sidz_osint_venv/bin/dig"],
        "version_arg": "-v",
        "install_command": "sudo apt-get install dnsutils",
        "description": "Deep authoritative DNS resolver and zone inquiry client.",
        "native_fallback": True,
    },
    {
        "id": "amass",
        "name": "OWASP Amass",
        "category": "Attack Surface Mapping",
        "binaries": ["amass", "/tmp/sidz_osint_venv/bin/amass"],
        "version_arg": "-version",
        "install_command": "curl -sL https://github.com/owasp-amass/amass/releases/download/v5.1.3/amass_linux_amd64.tar.gz -o amass.tar.gz",
        "description": "In-depth asset discovery and network infrastructure mapping.",
        "native_fallback": True,
    },
]

class ToolManager:
    @staticmethod
    def find_executable(binaries: List[str]) -> str | None:
        for b in binaries:
            if b.startswith("/") and os.path.exists(b) and os.access(b, os.X_OK):
                return b
            # Check current virtual environment bin directory
            venv_bin = os.path.join(sys.prefix, "bin", b)
            if os.path.exists(venv_bin) and os.access(venv_bin, os.X_OK):
                return venv_bin
            found = shutil.which(b)
            if found:
                return found
        return None

    @classmethod
    async def get_tool_status(cls, tool_def: Dict[str, Any]) -> Dict[str, Any]:
        path = cls.find_executable(tool_def["binaries"])
        installed = path is not None
        version = None

        if installed and path:
            try:
                env = os.environ.copy()
                env["HOME"] = "/tmp"
                version_arg = tool_def.get("version_arg", "--version")
                proc = await asyncio.create_subprocess_exec(
                    path, version_arg,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    env=env
                )
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=3.0)
                out = (stdout or stderr).decode("utf-8", errors="ignore").strip()
                
                # Custom parse per tool
                if tool_def["id"] == "theHarvester":
                    version = "theHarvester v4.9.2 (CLI Active)"
                elif tool_def["id"] == "whois":
                    for line in out.splitlines():
                        if "Version" in line or "whois" in line.lower():
                            version = line.strip()
                            break
                    if not version:
                        version = "whois v5.5.22 (CLI Active)"
                elif tool_def["id"] == "amass":
                    for line in out.splitlines():
                        if line.startswith("v") or "Amass" in line:
                            version = f"OWASP Amass {line.strip()}"
                            break
                    if not version:
                        version = "OWASP Amass v5.1.3"
                elif tool_def["id"] == "dig":
                    version = out.splitlines()[0] if out else "DiG 9.18"
                else:
                    version = out.splitlines()[0] if out else "Installed (CLI Active)"
            except Exception:
                version = "Installed (CLI executable detected)"

        return {
            "id": tool_def["id"],
            "name": tool_def["name"],
            "category": tool_def["category"],
            "installed": installed,
            "executable_path": path,
            "version": version,
            "install_command": tool_def["install_command"],
            "description": tool_def["description"],
            "native_fallback": tool_def["native_fallback"],
        }

    @classmethod
    async def get_all_tools(cls) -> List[Dict[str, Any]]:
        tasks = [cls.get_tool_status(t) for t in TOOLS_CONFIG]
        return await asyncio.gather(*tasks)

    @classmethod
    def get_tool_executable(cls, tool_id: str) -> str | None:
        for t in TOOLS_CONFIG:
            if t["id"] == tool_id:
                return cls.find_executable(t["binaries"])
        return None
