# Changelog

All notable changes to **SIDZ** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-09

### Added

#### Core Architecture & Backend
- **FastAPI Core Engine**: Asynchronous REST API and WebSocket gateway on port 8000.
- **SQLite Database**: Persistent investigation dossiers, logs, findings, and graph relationships via SQLAlchemy async.
- **Safe Subprocess Manager**: Parameterized, vectorized execution of OSINT tools with zero `shell=True`.
- **Live WebSocket Streaming**: Real-time broadcast of engine stages, progress percentages, terminal logs, and discovered findings.
- **Automated Tool Detection**: Dynamic health checks and auto-resolution for Sherlock, Maigret, theHarvester, WHOIS, Dig, and OWASP Amass.

#### OSINT Intelligence Modules
- **Username Reconnaissance**:
  - High-speed async multi-platform scanner covering 118+ online networks.
  - Native integration with Sherlock Project and Maigret CLI engines.
  - Platform categorization (Development, Social, Media, Gaming, Creative).
- **Email Intelligence**:
  - RFC 5322 syntax validation and Mail Exchanger (MX) priority resolution.
  - Gravatar profile and avatar hash discovery.
  - GitHub public author commit lookups.
  - OpenPGP (`keys.openpgp.org`) public key verification.
  - Have I Been Pwned (HIBP) authorized breach exposure verification.
- **Domain Reconnaissance**:
  - System WHOIS and python-whois registry queries.
  - RFC DNS record resolution (`A`, `AAAA`, `MX`, `NS`, `TXT`, `SOA`).
  - Certificate Transparency (CT) log mining via `crt.sh`.
  - HTTP response header and technology fingerprinting.
  - OWASP Amass active subdomain enumeration integration.
- **IP & Network Intelligence**:
  - IPv4/IPv6 validation and RFC 1918 bogon filtering.
  - Reverse DNS (PTR) hostname resolution using native dig.
  - BGP Autonomous System (ASN) lookup and ISP attribution.
  - Approximate geographic resolution and Regional Internet Registry (RDAP) allocation queries.

#### Relationship Visualization & Analytics
- **Topological Entity Graph**:
  - Interactive React Flow (`@xyflow/react`) relationship mapping.
  - Distinct custom nodes for Root Targets, Social Profiles, Domains, IPs, and Entities.
  - Side-panel Entity Inspector displaying linked evidence and tool provenance.
- **Dossier Analytics**:
  - Recharts telemetry breakdown by category, confidence split, and tool consultation.

#### User Interface & Design
- **Retro 8-Bit / Y2K Aesthetic**:
  - Segmented 16-cell energy progress bars (`PixelProgressBar`).
  - 3D pressable pixel buttons with push-down translation effects (`PixelButton`).
  - Chunky retro windows with titlebars and controls `_ □ ✕` (`PixelWindow`).
  - Paired typography: `Press Start 2P` for arcade accents and headings; `JetBrains Mono` for technical data.
  - Pastel grid background with custom 8-bit brand vector logo.

#### Reporting & Portability
- **Standardized Reports**:
  - Standalone, self-contained HTML dossiers with `@media print` styling for PDF generation.
  - Full structured JSON dossier exports.
- **One-Command Setup**:
  - Automated installer (`install.sh`) and unified launcher (`start.sh`).

