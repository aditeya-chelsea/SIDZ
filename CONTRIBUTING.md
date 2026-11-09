# Contributing to SIDZ

Thank you for your interest in contributing to **SIDZ**! We welcome contributions from developers, cybersecurity researchers, and designers committed to building transparent, defensive, and privacy-respecting open-source intelligence tools.

---

## 🛡️ Core Principles & Ethical Boundaries

SIDZ is an educational and defensive OSINT platform. All contributions must adhere to the following principles:

1. **Defensive & Public Intelligence Only**: We only integrate legitimate, publicly available OSINT data sources, official APIs, and RFC-standard network query protocols.
2. **Zero Credential Harvesting**: Pull requests that implement credential dumping, password brute-forcing, password recovery abuse, or unauthorized private account access will be rejected immediately.
3. **Local-First Privacy**: SIDZ must never phone home or transmit user queries, targets, or telemetry to external telemetry brokers or third-party analytical services.
4. **Attribution Disclaimers**: Matching usernames across multiple services must never be represented as definitive legal proof of single-person ownership.

---

## 💻 Getting Started Locally

### Prerequisites

- **Python**: 3.10+ (Python 3.12 recommended)
- **Node.js**: 18+ (Node 20+ recommended)
- **Git**

### Installation

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/aditeya-chelsea/sidz.git
   cd sidz
   ```
3. Run the automated installer:
   ```bash
   ./install.sh
   ```
4. Start the application:
   ```bash
   ./start.sh
   ```
5. Access the live interface at `http://127.0.0.1:5173` and the backend API at `http://127.0.0.1:8000`.

---

## 📂 Project Architecture

- `backend/app/api/`: FastAPI route definitions (`investigations`, `tools`, `reports`, `findings`, `graph`).
- `backend/app/modules/`: Individual OSINT modules (`username_recon`, `email_recon`, `domain_recon`, `ip_recon`).
- `backend/app/core/`: Process management (`tool_manager`, `executor`, `sanitizer`).
- `backend/app/database.py`: SQLAlchemy async engine and SQLite configuration.
- `frontend/src/components/`: Reusable UI modules, React Flow nodes, segmented progress bars, and pixel-art windows.
- `frontend/src/pages/`: Module workstations and investigation dashboards.

---

## 🛠️ Code Standards

- **Python**: Follow PEP 8 style guidelines. Use type annotations (`typing`) and `async`/`await` patterns for I/O operations. Safe subprocess execution must use `asyncio.create_subprocess_exec` without `shell=True`.
- **TypeScript / React**: Use functional components with strict TypeScript interfaces. Preserve the custom retro pixel design system (`PixelWindow`, `PixelButton`, `PixelProgressBar`, `JetBrains Mono`).
- **Commits**: Write concise, conventional commit messages (e.g., `feat: add dig reverse DNS fallback`, `fix: sanitize whois output`).

---

## 🔄 Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Test your changes locally to ensure both backend and frontend compile without errors:
   ```bash
   # Frontend check
   cd frontend && node ./node_modules/typescript/bin/tsc --noEmit && cd ..
   ```
3. Commit your changes and push to your fork.
4. Open a Pull Request against the `main` branch with a clear description of the problem solved and testing steps performed.
