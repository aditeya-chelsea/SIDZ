# Security Policy

## 🛡️ Supported Versions

We actively provide security patches and improvements for the latest release of **SIDZ**:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## 🔒 Defensive Scope & Architecture

**SIDZ** is designed with defensive boundaries at its core:

1. **Localhost-Only Binding**: Default network binding is strictly locked to `127.0.0.1`.
2. **Safe Subprocess Execution**: External CLI utilities (`sherlock`, `maigret`, `theHarvester`, `whois`, `dig`, `amass`) are executed via `asyncio.subprocess` using parameterized argument arrays. `shell=True` is never permitted.
3. **Log Sanitization**: Sensitive credentials, API keys, and environment variables are automatically masked before writing to scan logs or WebSocket events.
4. **No Credential Harvesting**: The application never stores, retrieves, hashes, or checks against leaked password databases, nor does it automate password recovery endpoints.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or privacy weakness within SIDZ, please report it responsibly:

1. **GitHub Security Advisory**: Submit a private advisory through the repository's **Security** tab.
2. **Direct Contact**: Contact the project maintainer via GitHub at [@aditeya-chelsea](https://github.com/aditeya-chelsea).

Please include:
- A description of the vulnerability and its potential impact.
- Step-by-step reproduction instructions or proof-of-concept.
- Suggestions on remediation if available.

We will acknowledge receipt within 48 hours and work with you to release a coordinated patch.

