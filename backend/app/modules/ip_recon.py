import ipaddress
import socket
import uuid
import httpx
import dns.resolver
import dns.reversename
from typing import Dict, Any, Callable
from backend.app.core.subprocess_runner import SafeSubprocessRunner
from backend.app.core.tool_manager import ToolManager

class IpReconModule:
    @classmethod
    async def run(
        cls,
        investigation_id: str,
        ip_str: str,
        log_callback: Callable[[str, str, str], Any],
        finding_callback: Callable[[Dict[str, Any]], Any],
        edge_callback: Callable[[Dict[str, Any]], Any],
        progress_callback: Callable[[int, str, str], Any],
    ):
        clean_ip = ip_str.strip()
        await log_callback("INFO", "IP Verification", f"Validating IP address format for '{clean_ip}'...")
        await progress_callback(5, "IP Format & Classification", "system")

        # 1. IP Validation & Classification
        try:
            ip_obj = ipaddress.ip_address(clean_ip)
        except ValueError:
            await log_callback("ERROR", "IP Verification", f"'{clean_ip}' is not a valid IPv4 or IPv6 address.")
            return

        is_private = ip_obj.is_private
        is_loopback = ip_obj.is_loopback
        is_reserved = ip_obj.is_reserved
        version = f"IPv{ip_obj.version}"
        target_node_id = f"ip:{clean_ip}"

        classification_desc = []
        if is_private:
            classification_desc.append("RFC 1918 Private")
        if is_loopback:
            classification_desc.append("Loopback (localhost)")
        if is_reserved:
            classification_desc.append("IANA Reserved")
        if not classification_desc:
            classification_desc.append("Publicly Routable Unicast")

        classification_str = ", ".join(classification_desc)

        await finding_callback({
            "id": str(uuid.uuid4()),
            "investigation_id": investigation_id,
            "category": "network",
            "title": f"IP Classification ({version})",
            "value": f"{version} | {classification_str}",
            "source_tool": "ipaddress_library",
            "confidence": "HIGH",
            "raw_data": {
                "version": version,
                "is_private": is_private,
                "is_loopback": is_loopback,
                "is_reserved": is_reserved,
            }
        })
        await log_callback("SUCCESS", "IP Verification", f"Valid {version} address: {classification_str}")

        # If private/loopback, note that public routing information does not apply
        if is_private or is_loopback:
            await log_callback("WARN", "IP Verification", "Target address is in a private/loopback block. Public WHOIS/GeoIP will not yield public internet data.")
            await progress_callback(100, "Scan Completed", "system")
            return

        # 2. Reverse DNS (PTR Record)
        await progress_callback(25, "Reverse DNS Resolution (PTR)", "reverse_dns")
        await log_callback("INFO", "Reverse DNS", f"Querying PTR record for {clean_ip}...")

        ptr_hostname = None
        try:
            rev_name = dns.reversename.from_address(clean_ip)
            resolver = dns.resolver.Resolver()
            resolver.timeout = 4.0
            answers = resolver.resolve(rev_name, "PTR")
            for r in answers:
                ptr_hostname = str(r).rstrip(".")
                break
        except Exception:
            try:
                ptr_hostname, _, _ = socket.gethostbyaddr(clean_ip)
            except Exception:
                ptr_hostname = None

        if ptr_hostname:
            await finding_callback({
                "id": str(uuid.uuid4()),
                "investigation_id": investigation_id,
                "category": "dns",
                "title": "Reverse DNS (PTR Hostname)",
                "value": ptr_hostname,
                "source_tool": "reverse_dns_ptr",
                "confidence": "HIGH",
                "raw_data": {"ptr": ptr_hostname},
            })
            await edge_callback({
                "id": str(uuid.uuid4()),
                "investigation_id": investigation_id,
                "source_id": target_node_id,
                "target_id": f"domain:{ptr_hostname}",
                "source_label": clean_ip,
                "target_label": f"PTR: {ptr_hostname}",
                "relation": "resolves_ptr",
                "evidence_tool": "reverse_dns_ptr",
            })
            await log_callback("SUCCESS", "Reverse DNS", f"Reverse DNS resolved to: {ptr_hostname}")
        else:
            await log_callback("INFO", "Reverse DNS", "No authoritative reverse DNS PTR record configured.")

        # 3. ASN, ISP & Public Geolocation via Open IP Intelligence APIs
        await progress_callback(50, "ASN & Geolocation Intelligence", "ip_api")
        await log_callback("INFO", "ASN & Geolocation", f"Querying public ASN and BGP routing data for {clean_ip}...")

        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                # Query ip-api.com (open public endpoint with rate-limit friendly behavior)
                geo_resp = await client.get(f"http://ip-api.com/json/{clean_ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query")
                if geo_resp.status_code == 200:
                    geo = geo_resp.json()
                    if geo.get("status") == "success":
                        country = geo.get("country", "Unknown")
                        city = geo.get("city", "Unknown")
                        region = geo.get("regionName", "")
                        isp = geo.get("isp", "Unknown")
                        org = geo.get("org", isp)
                        asn = geo.get("as", "Unknown ASN")
                        lat = geo.get("lat")
                        lon = geo.get("lon")

                        # Geolocation Finding
                        await finding_callback({
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "category": "network",
                            "title": f"Approximate Geolocation: {city}, {country}",
                            "value": f"{city}, {region}, {country} (Coords: {lat}, {lon})",
                            "source_tool": "ip_geolocation",
                            "confidence": "HIGH",
                            "raw_data": geo,
                        })

                        # ASN / ISP Finding
                        await finding_callback({
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "category": "network",
                            "title": f"Autonomous System: {asn}",
                            "value": f"Organization: {org} | ISP: {isp}",
                            "source_tool": "bgp_routing_intel",
                            "confidence": "HIGH",
                            "raw_data": {"asn": asn, "org": org, "isp": isp},
                        })

                        # Edges
                        await edge_callback({
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "source_id": target_node_id,
                            "target_id": f"asn:{asn}",
                            "source_label": clean_ip,
                            "target_label": asn,
                            "relation": "routed_by_asn",
                            "evidence_tool": "bgp_routing_intel",
                        })
                        await edge_callback({
                            "id": str(uuid.uuid4()),
                            "investigation_id": investigation_id,
                            "source_id": target_node_id,
                            "target_id": f"geo:{country}",
                            "source_label": clean_ip,
                            "target_label": f"{city}, {country}",
                            "relation": "located_in",
                            "evidence_tool": "ip_geolocation",
                        })

                        await log_callback("SUCCESS", "ASN & Geolocation", f"Location: {city}, {country} | ASN: {asn} | ISP: {isp}")
            except Exception as e:
                await log_callback("WARN", "ASN & Geolocation", f"Could not retrieve GeoIP/ASN data: {str(e)}")

        # 4. Regional Registry RDAP / WHOIS
        await progress_callback(80, "Regional Registry (RDAP) Inquiry", "rdap")
        await log_callback("INFO", "RDAP Inquiry", f"Querying official Regional Internet Registry (RIR) RDAP service...")

        async with httpx.AsyncClient(timeout=8.0) as client:
            try:
                rdap_url = f"https://rdap.arin.net/registry/ip/{clean_ip}"
                rdap_resp = await client.get(rdap_url, follow_redirects=True)
                if rdap_resp.status_code == 200:
                    rdap_data = rdap_resp.json()
                    net_name = rdap_data.get("name", "Unknown Net")
                    handle = rdap_data.get("handle", "")
                    start_addr = rdap_data.get("startAddress", "")
                    end_addr = rdap_data.get("endAddress", "")

                    await finding_callback({
                        "id": str(uuid.uuid4()),
                        "investigation_id": investigation_id,
                        "category": "whois",
                        "title": f"IP NetRange Block ({net_name})",
                        "value": f"Range: {start_addr} - {end_addr} (Handle: {handle})",
                        "source_tool": "arin_rdap",
                        "confidence": "HIGH",
                        "raw_data": {"name": net_name, "handle": handle, "start": start_addr, "end": end_addr},
                    })
                    await log_callback("SUCCESS", "RDAP Inquiry", f"RIR Allocation Block: {net_name} ({start_addr} - {end_addr})")
            except Exception:
                pass

        await progress_callback(100, "Investigation Completed", "system")
        await log_callback("SUCCESS", "IP Intelligence", f"Completed IP intelligence scan for {clean_ip}")

