import re
import uuid
import asyncio
import httpx
import dns.resolver
import whois
from bs4 import BeautifulSoup
from typing import Dict, Any, Callable, List, Set
from backend.app.core.subprocess_runner import SafeSubprocessRunner
from backend.app.core.tool_manager import ToolManager

class DomainReconModule:
    @classmethod
    async def run(
        cls,
        investigation_id: str,
        domain: str,
        log_callback: Callable[[str, str, str], Any],
        finding_callback: Callable[[Dict[str, Any]], Any],
        edge_callback: Callable[[Dict[str, Any]], Any],
        progress_callback: Callable[[int, str, str], Any],
    ):
        clean_domain = domain.strip().lower()
        clean_domain = re.sub(r'^https?://', '', clean_domain).split('/')[0].split(':')[0]

        await log_callback("INFO", "Domain Initialization", f"Commencing comprehensive reconnaissance on target domain: {clean_domain}")
        await progress_callback(5, "Domain Initialization", "system")

        target_node_id = f"domain:{clean_domain}"

        # 1. DNS Record Resolution (A, AAAA, MX, NS, TXT, SOA)
        await progress_callback(15, "Authoritative DNS Resolution", "dnspython")
        await log_callback("INFO", "DNS Resolution", f"Querying standard DNS resource records for {clean_domain}...")

        record_types = ["A", "AAAA", "MX", "NS", "TXT", "SOA"]
        resolved_ips: Set[str] = set()
        resolved_subdomains: Set[str] = set()

        resolver = dns.resolver.Resolver()
        resolver.timeout = 4.0
        resolver.lifetime = 4.0

        for rtype in record_types:
            try:
                answers = resolver.resolve(clean_domain, rtype)
                for rdata in answers:
                    val = str(rdata).strip('"')
                    
                    if rtype == "A":
                        resolved_ips.add(val)
                    elif rtype == "MX":
                        val = f"{rdata.exchange} (Pref {rdata.preference})"
                    
                    await finding_callback({
                        "id": str(uuid.uuid4()),
                        "investigation_id": investigation_id,
                        "category": "dns",
                        "title": f"DNS {rtype} Record",
                        "value": val,
                        "source_tool": "dnspython",
                        "confidence": "HIGH",
                        "raw_data": {"type": rtype, "record": str(rdata)},
                    })

                    # Edges
                    if rtype == "A":
                        await edge_callback({
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "source_id": target_node_id,
                            "target_id": f"ip:{val}",
                            "source_label": clean_domain,
                            "target_label": f"IP: {val}",
                            "relation": "resolves_to",
                            "evidence_tool": "dnspython_A",
                        })
                    elif rtype == "NS":
                        ns_host = str(rdata).rstrip(".")
                        await edge_callback({
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "source_id": target_node_id,
                            "target_id": f"ns:{ns_host}",
                            "source_label": clean_domain,
                            "target_label": f"NS: {ns_host}",
                            "relation": "nameserver",
                            "evidence_tool": "dnspython_NS",
                        })
                    elif rtype == "MX":
                        mx_host = str(rdata.exchange).rstrip(".")
                        await edge_callback({
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "source_id": target_node_id,
                            "target_id": f"mx:{mx_host}",
                            "source_label": clean_domain,
                            "target_label": f"MX: {mx_host}",
                            "relation": "has_mx",
                            "evidence_tool": "dnspython_MX",
                        })

                await log_callback("INFO", "DNS Resolution", f"Resolved {rtype} records: {len(answers)} entries")
            except dns.resolver.NoAnswer:
                pass
            except dns.resolver.NXDOMAIN:
                await log_callback("ERROR", "DNS Resolution", f"Non-Existent Domain (NXDOMAIN): {clean_domain}")
                break
            except Exception:
                pass

        # 2. WHOIS Information
        await progress_callback(35, "WHOIS Registration Data", "whois")
        await log_callback("INFO", "WHOIS", f"Querying registration registries for {clean_domain}...")

        whois_exec = ToolManager.get_tool_executable("whois")
        whois_data_parsed = False

        if whois_exec:
            try:
                code, out, err = await SafeSubprocessRunner.run(
                    [whois_exec, clean_domain],
                    timeout=15,
                    log_callback=lambda lvl, msg: log_callback(lvl, "System WHOIS", msg),
                )
                if code == 0 and out:
                    # Extract registrar, dates, name servers from whois text
                    registrar_match = re.search(r'(?i)Registrar:\s*([^\n\r]+)', out)
                    created_match = re.search(r'(?i)(Creation Date|Created On|created):\s*([^\n\r]+)', out)
                    expiry_match = re.search(r'(?i)(Registry Expiry Date|Expiration Date|expires):\s*([^\n\r]+)', out)

                    summary_parts = []
                    if registrar_match:
                        summary_parts.append(f"Registrar: {registrar_match.group(1).strip()}")
                    if created_match:
                        summary_parts.append(f"Created: {created_match.group(2).strip()}")
                    if expiry_match:
                        summary_parts.append(f"Expires: {expiry_match.group(2).strip()}")

                    val = " | ".join(summary_parts) if summary_parts else "Public WHOIS data retrieved"
                    await finding_callback({
                        "id": str(uuid.uuid4()),
                        "investigation_id": investigation_id,
                        "category": "whois",
                        "title": "WHOIS Registration Record",
                        "value": val,
                        "source_tool": "system_whois",
                        "confidence": "HIGH",
                        "raw_data": {"snippet": out[:2000]},
                    })
                    whois_data_parsed = True
            except Exception as e:
                await log_callback("WARN", "WHOIS", f"System whois command issue: {str(e)}")

        if not whois_data_parsed:
            # Fallback to python-whois
            try:
                loop = asyncio.get_event_loop()
                w = await loop.run_in_executor(None, whois.whois, clean_domain)
                if w:
                    reg = w.registrar or "Unknown"
                    creation = str(w.creation_date[0] if isinstance(w.creation_date, list) else w.creation_date)
                    val = f"Registrar: {reg} | Created: {creation}"
                    await finding_callback({
                        "id": str(uuid.uuid4()),
                        "investigation_id": investigation_id,
                        "category": "whois",
                        "title": "WHOIS Domain Record",
                        "value": val,
                        "source_tool": "python_whois",
                        "confidence": "HIGH",
                        "raw_data": {"registrar": reg, "creation_date": creation, "org": w.org},
                    })
                    await log_callback("SUCCESS", "WHOIS", f"Parsed WHOIS registrar: {reg}")
            except Exception as e:
                await log_callback("WARN", "WHOIS", f"python-whois query notice: {str(e)}")

        # 3. Certificate Transparency Subdomain Enumeration (crt.sh)
        await progress_callback(55, "Certificate Transparency Logs", "crt.sh")
        await log_callback("INFO", "Certificate Transparency", f"Querying public SSL/TLS certificate transparency logs for '*.{clean_domain}' via crt.sh...")

        ct_subdomains: Set[str] = set()
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                ct_url = f"https://crt.sh/?q=%.{clean_domain}&output=json"
                resp = await client.get(ct_url)
                if resp.status_code == 200:
                    entries = resp.json()
                    for entry in entries:
                        name_value = entry.get("name_value", "")
                        for sub in name_value.split("\n"):
                            sub = sub.strip().lower()
                            if "*" not in sub and sub.endswith(f".{clean_domain}") and sub != clean_domain:
                                ct_subdomains.add(sub)

                    await log_callback("SUCCESS", "Certificate Transparency", f"Discovered {len(ct_subdomains)} unique public subdomains in CT logs.")
                    
                    # Record top discovered subdomains
                    for sub in list(ct_subdomains)[:25]:
                        resolved_subdomains.add(sub)
                        await finding_callback({
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "category": "subdomain",
                            "title": f"Public Subdomain: {sub}",
                            "value": sub,
                            "source_tool": "crt.sh_transparency",
                            "confidence": "HIGH",
                            "raw_data": {"subdomain": sub, "parent": clean_domain},
                        })
                        # Edge: Subdomain -> Domain
                        await edge_callback({
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "source_id": f"subdomain:{sub}",
                            "target_id": target_node_id,
                            "source_label": sub,
                            "target_label": clean_domain,
                            "relation": "subdomain_of",
                            "evidence_tool": "crt.sh_transparency",
                        })
        except Exception as e:
            await log_callback("WARN", "Certificate Transparency", f"crt.sh query notice: {str(e)}")

        # 4. Public Technology Fingerprinting & HTTP Header Security
        await progress_callback(80, "Technology Fingerprinting", "http_headers")
        await log_callback("INFO", "Technology Fingerprinting", f"Inspecting HTTP response headers and security headers for https://{clean_domain}...")

        async with httpx.AsyncClient(timeout=8.0, verify=False) as client:
            for proto in ["https", "http"]:
                try:
                    url = f"{proto}://{clean_domain}"
                    resp = await client.get(url, follow_redirects=True)
                    server_hdr = resp.headers.get("server", "")
                    powered_by = resp.headers.get("x-powered-by", "")
                    hsts = "strict-transport-security" in resp.headers
                    csp = "content-security-policy" in resp.headers
                    x_frame = resp.headers.get("x-frame-options", "Missing")

                    tech_list = []
                    if server_hdr:
                        tech_list.append(f"Web Server: {server_hdr}")
                    if powered_by:
                        tech_list.append(f"Framework: {powered_by}")

                    # HTML Parser for Generator
                    try:
                        soup = BeautifulSoup(resp.text, "html.parser")
                        gen = soup.find("meta", attrs={"name": "generator"})
                        if gen and gen.get("content"):
                            tech_list.append(f"CMS/Generator: {gen.get('content')}")
                        
                        title_tag = soup.find("title")
                        site_title = title_tag.text.strip() if title_tag else ""
                    except Exception:
                        site_title = ""

                    val = " | ".join(tech_list) if tech_list else "Standard Web Server"
                    await finding_callback({
                        "id": str(uuid.uuid4()),
                        "investigation_id": investigation_id,
                        "category": "technology",
                        "title": f"Web Infrastructure ({resp.status_code} {resp.reason_phrase})",
                        "value": f"{val} | Title: '{site_title[:60]}'",
                        "source_tool": "http_fingerprint",
                        "confidence": "HIGH",
                        "raw_data": {
                            "status_code": resp.status_code,
                            "headers": dict(resp.headers),
                            "hsts": hsts,
                            "csp": csp,
                            "x_frame_options": x_frame,
                            "title": site_title,
                        }
                    })

                    # Security Headers finding
                    sec_status = f"HSTS: {'Present' if hsts else 'Missing'} | CSP: {'Present' if csp else 'Missing'} | X-Frame-Options: {x_frame}"
                    await finding_callback({
                        "id": str(uuid.uuid4()),
                        "investigation_id": investigation_id,
                        "category": "technology",
                        "title": "HTTP Security Headers Profile",
                        "value": sec_status,
                        "source_tool": "security_headers_audit",
                        "confidence": "HIGH",
                        "raw_data": {"hsts": hsts, "csp": csp, "x_frame_options": x_frame},
                    })
                    break
                except Exception as ex:
                    await log_callback("WARN", "Technology Fingerprinting", f"Could not connect via {proto}://{clean_domain}: {str(ex)}")

        await progress_callback(100, "Investigation Completed", "system")
        await log_callback("SUCCESS", "Domain Reconnaissance", f"Completed domain footprint analysis for {clean_domain}")

