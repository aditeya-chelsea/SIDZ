<div align="center">

<img src="./docs/assets/logo.jpg" alt="SIDZ Logo" width="220" style="border-radius: 12px; margin-bottom: 16px;" />

# SIDZ
### Local-First Digital Footprint Intelligence Platform // Retro 8-Bit Edition

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18.3-61dafb.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-Pending_Approval-yellow.svg)](#license)

**SIDZ** is an open-source, local-first digital footprint intelligence and reconnaissance platform built for cybersecurity researchers, SOC analysts, and security engineers.

It correlates publicly available online presence, network infrastructure, and breach disclosure telemetry using legitimate OSINT sources and locally executed open-source CLI utilities — wrapped in an authentic retro 8-bit / Y2K pixel art interface.

</div>

---

## ⚡ Key Features & Capabilities

### 1. 🔍 Username Intelligence
- Searches handles across **118+ public social platforms** (GitHub, Instagram, Reddit, Pinterest, Twitter/X, YouTube, TikTok, Steam, Spotify, and more).
- Direct local subprocess execution with **Sherlock Project** and **Maigret Suite**.
- Automatic platform categorization (Development, Social Media, Creative, Gaming, Audio/Video).
- Clear attribution safeguards: explicit warnings that matching usernames indicate correlation, not legal proof of common ownership.

### 2. 📬 Email Exposure & Delivery Recon
- RFC 5322 syntax validation and disposable domain filtering.
- Authoritative **Mail Exchanger (MX)** resolution and priority verification.
- Public **Gravatar** avatar hash profiling.
- **OpenPGP** public keyserver lookup via `keys.openpgp.org`.
- Public search engine references and **theHarvester** integration.
- Authorized breach exposure verification via the official **Have I Been Pwned (HIBP)** API v3.
- **Strict Ethical Boundaries**: Password recovery endpoints are never probed, and leaked password databases are never accessed or stored.

### 3. 🌐 Domain & Infrastructure Recon
- Authoritative **WHOIS** registry lookups (registrar, registration dates, authoritative nameservers).
- Complete DNS record harvesting: `A`, `AAAA`, `MX`, `NS`, `TXT`, `SOA`, `PTR`.
- **Certificate Transparency (CT)** log queries via `crt.sh` for public subdomain discovery.
- Web technology and HTTP security header fingerprinting (HSTS, CSP, X-Frame-Options).
- Deep attack surface mapping integration with **OWASP Amass**.

### 4. 🛰️ IP & Routing Telemetry
- IPv4 and IPv6 classification with RFC 1918 private/bogon filtering.
- Reverse DNS (PTR) hostname resolution using native **dig**.
- Autonomous System (**ASN**) lookup and BGP routing carrier allocation.
- ISP attribution and approximate geographic telemetry.
- Regional Internet Registry (**RDAP**) query resolution (ARIN, RIPE, APNIC, LACNIC).

### 5. 🕸️ Interactive Relationship Graph
- Powered by **React Flow** (`@xyflow/react`).
- Visualizes topological connections between Root Targets, Social Profiles, Domains, Subdomains, IPs, and Networks.
- Complete evidence provenance attached to each node and edge.
- Interactive **Entity Inspector** drawer displays underlying evidence records, URLs, and raw JSON.

### 6. 📊 Real-Time Telemetry & Reporting
- Live scan monitoring over **WebSockets** with per-stage progress and terminal logs.
- Segmented 16-cell pixel progress bars and active engine counters.
- One-click export of self-contained, professional **HTML intelligence dossiers** with print-ready PDF styling.
- Comprehensive structured **JSON dossier exports**.

---

## 🎨 User Interface & Aesthetic

SIDZ features a retro 8-bit / Y2K pixel art aesthetic paired with serious technical instrumentation:

- **Pastel Grid Canvas**: Soft gradient backdrop (`#fce7f3` to `#fef08a`) with fine isometric grid lines.
- **Chunky 3D Pixel Windows**: Colorful titlebars with window controls (`_ □ ✕`) and hard pixel drop shadows.
- **Segmented Energy Progress Bars**: 16-cell rectangular energy capsules illuminating live engine progression.
- **Dual Typography**: `Press Start 2P` for arcade titles, window headers, and buttons; `JetBrains Mono` for cryptographic hashes, IPs, URLs, and terminal logs.
- **Pressable Pixel Buttons**: Chunky 3D buttons (`START`, `NEXT`, `YES`, `NO`, `OK`, `ABORT`) with tactile press-down states.

---

## 🖼️ Screenshots

<div align="center">
  <img src="./docs/assets/logo.jpg" alt="SIDZ Platform Interface" width="600" style="border: 2px solid #181824; box-shadow: 4px 4px 0 #181824;" />
  <p><em>SIDZ — Digital Footprint Intelligence Station</em></p>
</div>

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, `@xyflow/react`, Recharts, Lucide Icons |
| **Backend** | Python 3.10+, FastAPI, SQLite 3, SQLAlchemy (asyncio), Uvicorn, WebSockets |
| **Integrated Tools** | Sherlock Project (`v0.16.2`), Maigret (`v0.6.6`), theHarvester (`v4.9.2`), System WHOIS (`v5.5`), BIND 9 Dig, OWASP Amass (`v5.1.3`) |
| **Libraries** | `dnspython`, `python-whois`, `httpx`, `aiosqlite`, `pydantic` |

---

## 📋 Prerequisites

Before installing SIDZ, ensure your machine has:

- **Linux** or **macOS** (Debian, Ubuntu, Arch, Fedora, macOS)
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** and **npm**
- Standard development tools (`curl`, `git`)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/aditeya-chelsea/sidz.git
cd sidz
```

### 2. Run the Automated Installer
The automated installer configures the Python virtual environment, installs backend dependencies, sets up local OSINT engines, and builds the frontend bundle:

```bash
chmod +x install.sh start.sh
./install.sh
```

### 3. Launch the Platform
Start both the FastAPI backend and the Vite interactive frontend in one command:

```bash
./start.sh
```

Once running, navigate to:
- **Frontend Dashboard**: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- **Backend REST API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

Press `Ctrl+C` in your terminal to safely terminate both services.

---

## 📁 Project Structure

```
sidz/
├── .env.example              # Environment variables template
├── .gitignore                # Git exclusions (credentials, databases, caches)
├── CHANGELOG.md              # Version history and feature releases
├── CONTRIBUTING.md           # Contribution guidelines & code standards
├── SECURITY.md               # Security policy & vulnerability reporting
├── README.md                 # Project documentation
├── install.sh                # Automated setup script
├── start.sh                  # Application launcher
├── requirements.txt          # Root Python dependencies
├── package.json              # Root project metadata
├── backend/
│   ├── requirements.txt      # Backend Python dependencies
│   ├── run.py                # Server entrypoint
│   └── app/
│       ├── main.py           # FastAPI application factory
│       ├── config.py         # App configuration & settings
│       ├── database.py       # Async SQLAlchemy SQLite setup
│       ├── models.py         # Database ORM models
│       ├── schemas.py        # Pydantic validation schemas
│       ├── api/              # API route controllers
│       ├── core/             # Process execution & tool management
│       ├── modules/          # OSINT reconnaissance modules
│       ├── seeds/            # Demonstration datasets
│       └── services/         # Reporting & WebSocket broadcaster
├── frontend/
│   ├── package.json          # Node dependencies
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.js    # Tailwind styling & pixel palette
│   ├── src/
│   │   ├── components/       # Pixel windows, buttons, progress bars
│   │   ├── pages/            # Investigation workspaces
│   │   ├── hooks/            # WebSocket and polling hooks
│   │   └── types/            # TypeScript interfaces
│   └── public/               # Static assets & favicon
├── docs/
│   └── assets/               # Repository documentation assets
├── data/                     # Local SQLite database directory (gitignored)
└── reports/                  # Generated HTML/JSON report directory (gitignored)
```

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` to `.env` to customize settings:

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `HOST` | `127.0.0.1` | Local network binding (restricted to localhost) |
| `PORT` | `8000` | Backend API port |
| `MAX_CONCURRENT_SCANS` | `4` | Maximum simultaneous worker threads |
| `HIBP_API_KEY` | *(empty)* | Optional. Have I Been Pwned official API v3 key |
| `SHODAN_API_KEY` | *(empty)* | Optional. Host exposure telemetry enrichment |
| `VIRUSTOTAL_API_KEY` | *(empty)* | Optional. Passive reputation scoring |

> **Note**: SIDZ is fully functional without paid API keys. All core modules operate using legitimate public endpoints and local utilities.

---

## 🛡️ Security & Privacy Considerations

SIDZ is engineered strictly as a defensive, ethical intelligence tool:

- **Localhost Boundary**: Binds exclusively to `127.0.0.1` by default. No telemetry or user queries ever leave your machine.
- **Zero Credential Probing**: Password recovery forms, login brute-forcing, and private authentication endpoints are never probed.
- **No Leaked Password Databases**: Password hashes and plaintexts are never retrieved, stored, or processed.
- **Mandatory Authorization Agreement**: The application requires explicit user confirmation of defensive/educational authorization before initiating queries on personal identifiers.
- **Safe Subprocess Execution**: External CLI utilities run through parameterized `asyncio.subprocess` vectors. `shell=True` is prohibited.
- **Automated Secret Redaction**: Application logs and WebSocket feeds automatically sanitize and mask tokens or sensitive parameters.

---

## ⚠️ Known Limitations

- **Platform Rate Limits**: Certain public services (e.g., social media profile pages) may temporarily throttle or return HTTP 429 when issuing rapid sequential queries.
- **Attribution Accuracy**: Common usernames (e.g., `alex`, `john`) may return matches across multiple platforms that belong to different individuals. Treat handle matches as correlation clues, not conclusive identity proof.
- **Dynamic Content**: Single-Page Applications that render user profile metadata solely through client-side JavaScript may require browser emulation for full validation.

---

## 📜 Credits & Acknowledgements

SIDZ proudly builds upon the work of the open-source security community:

- [Sherlock Project](https://github.com/sherlock-project/sherlock) — Social media username hunting
- [Maigret](https://github.com/soxoj/maigret) — Advanced username OSINT dossier suite
- [theHarvester](https://github.com/laramies/theHarvester) — Public search engine reconnaissance
- [OWASP Amass](https://github.com/owasp-amass/amass) — In-depth attack surface mapping
- [Have I Been Pwned](https://haveibeenpwned.com/) — Breach exposure data services
- [crt.sh](https://crt.sh/) — Certificate Transparency log search
- [React Flow](https://reactflow.dev/) — Interactive entity visualization

---

## 👤 Author

**Aditeya**

GitHub: [@aditeya-chelsea](https://github.com/aditeya-chelsea)

Built with curiosity and a passion for cybersecurity.

---

## 📄 License

*License pending author selection (e.g., MIT, Apache 2.0, or GPLv3).*
