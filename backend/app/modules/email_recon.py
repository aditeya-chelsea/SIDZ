import re
import hashlib
import uuid
import dns.resolver
import httpx
from typing import Dict, Any, Callable
from backend.app.config import settings

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

DISPOSABLE_DOMAINS = {
    "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com",
    "yopmail.com", "sharklasers.com", "trashmail.com", "dispostable.com"
}

# Top platforms for correlated handle probing
TOP_HANDLE_PROBES = [
    {"platform": "GitHub", "url": "https://github.com/{handle}"},
    {"platform": "Reddit", "url": "https://www.reddit.com/user/{handle}/about.json", "profile_url": "https://www.reddit.com/user/{handle}"},
    {"platform": "Pinterest", "url": "https://www.pinterest.com/{handle}/"},
    {"platform": "DockerHub", "url": "https://hub.docker.com/v2/users/{handle}/", "profile_url": "https://hub.docker.com/u/{handle}"},
    {"platform": "Dev.to", "url": "https://dev.to/{handle}"},
    {"platform": "Medium", "url": "https://medium.com/@{handle}"},
    {"platform": "Steam", "url": "https://steamcommunity.com/id/{handle}"},
    {"platform": "Keybase", "url": "https://keybase.io/{handle}"},
    {"platform": "SoundCloud", "url": "https://soundcloud.com/{handle}"},
]

class EmailReconModule:
    @classmethod
    async def run(
        cls,
        investigation_id: str,
        email: str,
        log_callback: Callable[[str, str, str], Any],
        finding_callback: Callable[[Dict[str, Any]], Any],
        edge_callback: Callable[[Dict[str, Any]], Any],
        progress_callback: Callable[[int, str, str], Any],
    ):
        clean_email = email.strip().lower()
        await log_callback("INFO", "Email Validation", f"Initiating open footprint search for '{clean_email}'")
        await progress_callback(5, "Email Syntax Validation", "validator")

        # 1. Syntax Validation
        if not EMAIL_REGEX.match(clean_email):
            await log_callback("ERROR", "Email Validation", f"Syntax error: '{clean_email}' does not adhere to standard RFC format.")
            return

        user_part, domain_part = clean_email.split("@", 1)
        target_node_id = f"email:{clean_email}"
        domain_node_id = f"domain:{domain_part}"

        is_disposable = domain_part in DISPOSABLE_DOMAINS
        await finding_callback({
            "id": str(uuid.uuid4()),
            "investigation_id": investigation_id,
            "category": "identity",
            "title": "Email Format & Classification",
            "value": f"User: {user_part} | Domain: {domain_part} | Disposable: {'YES' if is_disposable else 'NO'}",
            "source_tool": "native_email_validator",
            "confidence": "HIGH",
            "raw_data": {
                "user_part": user_part,
                "domain_part": domain_part,
                "is_disposable": is_disposable,
                "length": len(clean_email),
            }
        })
        await log_callback("SUCCESS", "Email Validation", f"Email syntax valid. Target domain: {domain_part}")

        # Edge: Email -> Domain
        await edge_callback({
            "id": str(uuid.uuid4()),
            "investigation_id": investigation_id,
            "source_id": target_node_id,
            "target_id": domain_node_id,
            "source_label": clean_email,
            "target_label": domain_part,
            "relation": "belongs_to_domain",
            "evidence_tool": "native_email_validator",
        })

        # 2. DNS MX Record Lookup
        await progress_callback(20, "Mail Exchange (MX) Analysis", "dnspython")
        await log_callback("INFO", "MX Analysis", f"Querying authoritative Mail Exchange (MX) records for '{domain_part}'...")

        try:
            resolver = dns.resolver.Resolver()
            resolver.timeout = 5.0
            resolver.lifetime = 5.0
            answers = resolver.resolve(domain_part, "MX")
            for rdata in answers:
                mx_host = str(rdata.exchange).rstrip(".")
                priority = rdata.preference
                
                await finding_callback({
                    "id": str(uuid.uuid4()),
                    "investigation_id": investigation_id,
                    "category": "dns",
                    "title": f"Mail Exchange Server (Pref {priority})",
                    "value": f"{mx_host} (Priority {priority})",
                    "source_tool": "dnspython_mx",
                    "confidence": "HIGH",
                    "raw_data": {"exchange": mx_host, "priority": priority, "domain": domain_part},
                })

                # Edge: Domain -> MX
                await edge_callback({
                    "id": str(uuid.uuid4()),
                    "investigation_id": investigation_id,
                    "source_id": domain_node_id,
                    "target_id": f"mx:{mx_host}",
                    "source_label": domain_part,
                    "target_label": f"MX: {mx_host}",
                    "relation": "has_mx_record",
                    "evidence_tool": "dnspython_mx",
                })
                await log_callback("INFO", "MX Analysis", f"Found MX record: {mx_host} (Priority {priority})")

        except Exception as e:
            await log_callback("WARN", "MX Analysis", f"Could not resolve MX records for {domain_part}: {str(e)}")

        # 3. Public Avatar & Gravatar Footprint with Linked Account Extraction
        await progress_callback(40, "Gravatar & Linked Accounts Probing", "gravatar_probe")
        email_hash = hashlib.md5(clean_email.encode("utf-8")).hexdigest()
        gravatar_api_url = f"https://en.gravatar.com/{email_hash}.json"
        gravatar_avatar_url = f"https://www.gravatar.com/avatar/{email_hash}?d=404"

        async with httpx.AsyncClient(timeout=7.0) as client:
            try:
                resp = await client.get(gravatar_api_url)
                if resp.status_code == 200:
                    data = resp.json()
                    entry = data.get("entry", [{}])[0]
                    display_name = entry.get("displayName", "")
                    profile_url = entry.get("profileUrl", f"https://gravatar.com/{email_hash}")
                    about_me = entry.get("aboutMe", "")
                    current_location = entry.get("currentLocation", "")
                    
                    val_parts = [f"Name: {display_name or 'Public'}", f"URL: {profile_url}"]
                    if current_location:
                        val_parts.append(f"Location: {current_location}")

                    await finding_callback({
                        "id": str(uuid.uuid4()),
                        "investigation_id": investigation_id,
                        "category": "identity",
                        "title": f"Public Gravatar Identity: {display_name or 'Associated Account'}",
                        "value": " | ".join(val_parts),
                        "source_tool": "gravatar_public_profile",
                        "source_url": profile_url,
                        "confidence": "HIGH",
                        "raw_data": entry,
                    })

                    await edge_callback({
                        "id": str(uuid.uuid4()),
                        "investigation_id": investigation_id,
                        "source_id": target_node_id,
                        "target_id": f"profile:Gravatar:{email_hash}",
                        "source_label": clean_email,
                        "target_label": f"Gravatar ({display_name or 'Profile'})",
                        "relation": "public_profile_linked",
                        "evidence_tool": "gravatar_public_profile",
                    })

                    # Extract verified linked accounts from Gravatar
                    accounts = entry.get("accounts", [])
                    for acc in accounts:
                        domain = acc.get("domain", "Social")
                        acc_url = acc.get("url", "")
                        acc_username = acc.get("username", "")
                        if acc_url:
                            await finding_callback({
                                "id": str(uuid.uuid4()),
                                "investigation_id": investigation_id,
                                "category": "social",
                                "title": f"Gravatar Linked Account: {domain}",
                                "value": f"{domain}: {acc_url} ({acc_username})",
                                "source_tool": "gravatar_linked_account",
                                "source_url": acc_url,
                                "confidence": "HIGH",
                                "raw_data": acc,
                            })
                            await edge_callback({
                                "id": str(uuid.uuid4()),
                                "investigation_id": investigation_id,
                                "source_id": target_node_id,
                                "target_id": f"profile:{domain}:{acc_username or 'user'}",
                                "source_label": clean_email,
                                "target_label": f"{domain} ({acc_username or 'Account'})",
                                "relation": "associated_profile",
                                "evidence_tool": "gravatar_linked_account",
                            })
                            await log_callback("SUCCESS", "Gravatar", f"Discovered verified linked account on {domain}: {acc_url}")

                    await log_callback("SUCCESS", "Gravatar", f"Public profile identified: {profile_url}")
                else:
                    avatar_resp = await client.get(gravatar_avatar_url)
                    if avatar_resp.status_code == 200:
                        await finding_callback({
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "category": "identity",
                            "title": "Public Gravatar Avatar Registered",
                            "value": gravatar_avatar_url,
                            "source_tool": "gravatar_avatar_probe",
                            "confidence": "MEDIUM",
                            "raw_data": {"avatar_url": gravatar_avatar_url},
                        })
                        await log_callback("INFO", "Gravatar", "Gravatar avatar image exists for this email hash.")
            except Exception as ex:
                await log_callback("WARN", "Gravatar", f"Gravatar probe exception: {str(ex)}")

        # 4. GitHub Public API Probing for Email Disclosures
        await progress_callback(55, "GitHub Public Activity & Commits", "github_public_api")
        await log_callback("INFO", "GitHub API", f"Checking public GitHub profile and commit event disclosures for handle '{user_part}'...")

        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                gh_url = f"https://api.github.com/users/{user_part}"
                gh_resp = await client.get(gh_url, headers={"User-Agent": "SIDZ-OSINT-Recon"})
                if gh_resp.status_code == 200:
                    gh_data = gh_resp.json()
                    name = gh_data.get("name", "")
                    bio = gh_data.get("bio", "")
                    company = gh_data.get("company", "")
                    location = gh_data.get("location", "")
                    public_repos = gh_data.get("public_repos", 0)
                    html_url = gh_data.get("html_url", f"https://github.com/{user_part}")

                    val_str = f"Name: {name or 'N/A'} | Repos: {public_repos} | Location: {location or 'N/A'} | URL: {html_url}"
                    await finding_callback({
                        "id": str(uuid.uuid4()),
                        "investigation_id": investigation_id,
                        "category": "social",
                        "title": f"GitHub Public Account: {user_part}",
                        "value": val_str,
                        "source_tool": "github_public_api",
                        "source_url": html_url,
                        "confidence": "HIGH",
                        "raw_data": gh_data,
                    })

                    await edge_callback({
                        "id": str(uuid.uuid4()),
                        "investigation_id": investigation_id,
                        "source_id": target_node_id,
                        "target_id": f"profile:GitHub:{user_part}",
                        "source_label": clean_email,
                        "target_label": f"GitHub ({user_part})",
                        "relation": "associated_profile",
                        "evidence_tool": "github_public_api",
                    })
                    await log_callback("SUCCESS", "GitHub API", f"Matching public GitHub profile discovered: {html_url} ({name})")
            except Exception:
                pass

        # 5. Open Web Social Cross-Correlation for the handle prefix
        await progress_callback(70, "Public Social Presence Correlation", "social_cross_probe")
        await log_callback("INFO", "Social Cross-Probe", f"Searching open web profiles for email prefix '{user_part}' across major networks...")

        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        async with httpx.AsyncClient(timeout=6.0) as client:
            for p in TOP_HANDLE_PROBES:
                test_url = p["url"].format(handle=user_part)
                view_url = p.get("profile_url", test_url).format(handle=user_part)
                try:
                    resp = await client.get(test_url, headers=headers, follow_redirects=True)
                    if resp.status_code == 200:
                        await finding_callback({
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "category": "social",
                            "title": f"Correlated Profile on {p['platform']}",
                            "value": view_url,
                            "source_tool": "social_cross_correlation",
                            "source_url": view_url,
                            "confidence": "MEDIUM",
                            "raw_data": {"platform": p["platform"], "status_code": 200, "handle": user_part},
                        })
                        await edge_callback({
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "source_id": target_node_id,
                            "target_id": f"profile:{p['platform']}:{user_part}",
                            "source_label": clean_email,
                            "target_label": f"{p['platform']} ({user_part})",
                            "relation": "correlated_handle",
                            "evidence_tool": "social_cross_correlation",
                        })
                        await log_callback("SUCCESS", "Social Cross-Probe", f"[FOUND] {p['platform']}: {view_url}")
                except Exception:
                    pass

        # 6. OpenPGP Public Keyserver Lookup
        await progress_callback(80, "Public Key Infrastructure Check", "openpgp_keyserver")
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                pgp_url = f"https://keys.openpgp.org/vks/v1/by-email/{clean_email}"
                pgp_resp = await client.get(pgp_url)
                if pgp_resp.status_code == 200 and "BEGIN PGP PUBLIC KEY BLOCK" in pgp_resp.text:
                    await finding_callback({
                        "id": str(uuid.uuid4()),
                        "investigation_id": investigation_id,
                        "category": "identity",
                        "title": "OpenPGP Public Key Published",
                        "value": f"Public PGP key found on keys.openpgp.org for {clean_email}",
                        "source_tool": "openpgp_keyserver",
                        "source_url": pgp_url,
                        "confidence": "HIGH",
                        "raw_data": {"keyserver": "keys.openpgp.org", "endpoint": pgp_url},
                    })
                    await log_callback("SUCCESS", "Public Key Infrastructure", f"Public PGP key discovered for {clean_email}")
        except Exception:
            pass

        # 7. Search Engine Dorks & Indexed Footprint References
        await progress_callback(90, "Search Engine Index References", "public_dork_intel")
        dork_queries = [
            {"service": "Google Search", "url": f"https://www.google.com/search?q=%22{clean_email}%22"},
            {"service": "GitHub Public Code", "url": f"https://github.com/search?q=%22{clean_email}%22&type=code"},
            {"service": "Pastebin Leaks", "url": f"https://www.google.com/search?q=site%3Apastebin.com+%22{clean_email}%22"},
            {"service": "LinkedIn Mentions", "url": f"https://www.google.com/search?q=site%3Alinkedin.com+%22{clean_email}%22"},
            {"service": "Twitter / X Posts", "url": f"https://x.com/search?q=%22{clean_email}%22&f=live"},
        ]
        for d in dork_queries:
            await finding_callback({
                "id": str(uuid.uuid4()),
                "investigation_id": investigation_id,
                "category": "identity",
                "title": f"Public Index Search: {d['service']}",
                "value": d["url"],
                "source_tool": "search_index_dork",
                "source_url": d["url"],
                "confidence": "HIGH",
                "raw_data": {"engine": d["service"], "query_url": d["url"]},
            })

        # 8. Have I Been Pwned (HIBP) Breach Exposure Check
        await progress_callback(95, "Breach Exposure Verification", "hibp")
        if settings.HIBP_API_KEY:
            try:
                headers = {"hibp-api-key": settings.HIBP_API_KEY, "user-agent": "SIDZ-OSINT-Platform/1.0"}
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(f"https://haveibeenpwned.com/api/v3/breachedaccount/{clean_email}?truncateResponse=false", headers=headers)
                    if resp.status_code == 200:
                        breaches = resp.json()
                        await log_callback("WARN", "Breach Exposure Verification", f"ALERT: Email appeared in {len(breaches)} public breach disclosures.")
                        for b in breaches:
                            b_name = b.get("Name", "Unknown Breach")
                            b_date = b.get("BreachDate", "N/A")
                            pwn_count = b.get("PwnCount", 0)
                            data_classes = ", ".join(b.get("DataClasses", []))
                            
                            await finding_callback({
                                "id": str(uuid.uuid4()),
                                "investigation_id": investigation_id,
                                "category": "breach",
                                "title": f"Breach Disclosure: {b_name} ({b_date})",
                                "value": f"Exposed Data: {data_classes} | Accounts affected: {pwn_count:,}",
                                "source_tool": "hibp_api_v3",
                                "confidence": "HIGH",
                                "raw_data": b,
                            })

                            await edge_callback({
                                "id": str(uuid.uuid4()),
                                "investigation_id": investigation_id,
                                "source_id": target_node_id,
                                "target_id": f"breach:{b_name}",
                                "source_label": clean_email,
                                "target_label": f"Breach: {b_name}",
                                "relation": "exposed_in_breach",
                                "evidence_tool": "hibp_api_v3",
                            })
                    elif resp.status_code == 404:
                        await log_callback("SUCCESS", "Breach Exposure Verification", "No known breach records found on Have I Been Pwned.")
            except Exception as e:
                await log_callback("ERROR", "Breach Exposure Verification", f"Error querying HIBP: {str(e)}")

        await progress_callback(100, "Investigation Completed", "system")
        await log_callback("SUCCESS", "Synthesis", f"Email analysis and open web search completed for {clean_email}")
