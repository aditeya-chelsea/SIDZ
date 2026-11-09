import datetime
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.models import Investigation, Finding, EvidenceEdge, ScanLog

async def seed_sample_data(db: AsyncSession):
    # Check if demo investigations already exist
    stmt = select(Investigation).where(Investigation.is_demo == True)
    existing = await db.execute(stmt)
    if existing.scalars().first():
        return

    now = datetime.datetime.utcnow()

    # Demo 1: Username Investigation
    inv1 = Investigation(
        id="INV-DEMO-USER-01",
        title="[DEMONSTRATION DATA] Target: 'cyber_sentinel'",
        target="cyber_sentinel",
        target_type="username",
        status="completed",
        progress=100,
        current_stage="Completed",
        current_tool="system",
        authorized_by_user=True,
        created_at=now - datetime.timedelta(hours=2),
        completed_at=now - datetime.timedelta(hours=1, minutes=58),
        is_demo=True,
        error_message=None,
        meta_summary=json.dumps({"demo": True, "category": "social", "source": "simulated_seed"}),
    )
    db.add(inv1)

    f1_1 = Finding(
        id="f-demo-user-1",
        investigation_id=inv1.id,
        category="social",
        title="Public Profile: GitHub",
        value="https://github.com/cyber_sentinel",
        source_tool="sherlock",
        source_url="https://github.com/cyber_sentinel",
        confidence="HIGH",
        raw_data=json.dumps({"platform": "GitHub", "status_code": 200, "note": "Demonstration simulated record"}),
        discovered_at=now - datetime.timedelta(hours=2),
    )
    f1_2 = Finding(
        id="f-demo-user-2",
        investigation_id=inv1.id,
        category="social",
        title="Public Profile: Reddit",
        value="https://www.reddit.com/user/cyber_sentinel",
        source_tool="native_recon_engine",
        source_url="https://www.reddit.com/user/cyber_sentinel",
        confidence="HIGH",
        raw_data=json.dumps({"platform": "Reddit", "status_code": 200}),
        discovered_at=now - datetime.timedelta(hours=2),
    )
    f1_3 = Finding(
        id="f-demo-user-3",
        investigation_id=inv1.id,
        category="social",
        title="Public Profile: DockerHub",
        value="https://hub.docker.com/u/cyber_sentinel",
        source_tool="native_recon_engine",
        source_url="https://hub.docker.com/u/cyber_sentinel",
        confidence="HIGH",
        raw_data=json.dumps({"platform": "DockerHub", "status_code": 200}),
        discovered_at=now - datetime.timedelta(hours=2),
    )
    db.add_all([f1_1, f1_2, f1_3])

    e1_1 = EvidenceEdge(
        id="e-demo-user-1",
        investigation_id=inv1.id,
        source_id="target:cyber_sentinel",
        target_id="profile:GitHub:cyber_sentinel",
        source_label="cyber_sentinel",
        target_label="GitHub (cyber_sentinel)",
        relation="associated_profile",
        evidence_tool="sherlock",
    )
    e1_2 = EvidenceEdge(
        id="e-demo-user-2",
        investigation_id=inv1.id,
        source_id="target:cyber_sentinel",
        target_id="profile:Reddit:cyber_sentinel",
        source_label="cyber_sentinel",
        target_label="Reddit (cyber_sentinel)",
        relation="associated_profile",
        evidence_tool="native_recon_engine",
    )
    db.add_all([e1_1, e1_2])

    log1 = ScanLog(
        investigation_id=inv1.id,
        level="INFO",
        stage="Initialization",
        message="[DEMO] Investigation started for username cyber_sentinel",
        timestamp=now - datetime.timedelta(hours=2),
    )
    log2 = ScanLog(
        investigation_id=inv1.id,
        level="SUCCESS",
        stage="Completed",
        message="[DEMO] 3 public profiles mapped with high confidence",
        timestamp=now - datetime.timedelta(hours=1, minutes=58),
    )
    db.add_all([log1, log2])

    # Demo 2: Domain Reconnaissance
    inv2 = Investigation(
        id="INV-DEMO-DOMAIN-02",
        title="[DEMONSTRATION DATA] Target: 'cyberthreat-intel-lab.org'",
        target="cyberthreat-intel-lab.org",
        target_type="domain",
        status="completed",
        progress=100,
        current_stage="Completed",
        current_tool="system",
        authorized_by_user=True,
        created_at=now - datetime.timedelta(hours=1),
        completed_at=now - datetime.timedelta(minutes=55),
        is_demo=True,
        error_message=None,
        meta_summary=json.dumps({"demo": True, "category": "domain"}),
    )
    db.add(inv2)

    f2_1 = Finding(
        id="f-demo-dom-1",
        investigation_id=inv2.id,
        category="dns",
        title="DNS A Record",
        value="104.21.58.129",
        source_tool="dnspython",
        confidence="HIGH",
        raw_data=json.dumps({"type": "A", "ip": "104.21.58.129"}),
        discovered_at=now - datetime.timedelta(hours=1),
    )
    f2_2 = Finding(
        id="f-demo-dom-2",
        investigation_id=inv2.id,
        category="subdomain",
        title="Public Subdomain: api.cyberthreat-intel-lab.org",
        value="api.cyberthreat-intel-lab.org",
        source_tool="crt.sh_transparency",
        confidence="HIGH",
        raw_data=json.dumps({"subdomain": "api.cyberthreat-intel-lab.org"}),
        discovered_at=now - datetime.timedelta(hours=1),
    )
    f2_3 = Finding(
        id="f-demo-dom-3",
        investigation_id=inv2.id,
        category="whois",
        title="WHOIS Domain Record",
        value="Registrar: Cloudflare, Inc. | Created: 2021-04-12",
        source_tool="system_whois",
        confidence="HIGH",
        raw_data=json.dumps({"registrar": "Cloudflare, Inc."}),
        discovered_at=now - datetime.timedelta(hours=1),
    )
    db.add_all([f2_1, f2_2, f2_3])

    e2_1 = EvidenceEdge(
        id="e-demo-dom-1",
        investigation_id=inv2.id,
        source_id="domain:cyberthreat-intel-lab.org",
        target_id="ip:104.21.58.129",
        source_label="cyberthreat-intel-lab.org",
        target_label="IP: 104.21.58.129",
        relation="resolves_to",
        evidence_tool="dnspython",
    )
    e2_2 = EvidenceEdge(
        id="e-demo-dom-2",
        investigation_id=inv2.id,
        source_id="subdomain:api.cyberthreat-intel-lab.org",
        target_id="domain:cyberthreat-intel-lab.org",
        source_label="api.cyberthreat-intel-lab.org",
        target_label="cyberthreat-intel-lab.org",
        relation="subdomain_of",
        evidence_tool="crt.sh_transparency",
    )
    db.add_all([e2_1, e2_2])

    await db.commit()

