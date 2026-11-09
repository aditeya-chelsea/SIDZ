import json
from typing import Dict, Any, List
from jinja2 import Template

HTML_REPORT_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SIDZ OSINT Report - {{ investigation.id }}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background-color: #0b0f17;
      color: #e2e8f0;
      line-height: 1.5;
      padding: 40px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #111827;
      border: 1px solid #1f293d;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .header {
      border-bottom: 2px solid #1f293d;
      padding-bottom: 24px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title-area h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .badge-primary {
      background: rgba(0, 229, 153, 0.15);
      color: #00e599;
      border: 1px solid rgba(0, 229, 153, 0.3);
    }
    .badge-high {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .badge-med {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .badge-low {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 4px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      background: #0d131f;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 16px 20px;
      margin-bottom: 28px;
    }
    .meta-item {
      font-size: 13px;
    }
    .meta-label {
      color: #64748b;
      text-transform: uppercase;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .meta-val {
      font-family: 'JetBrains Mono', monospace;
      color: #f1f5f9;
      margin-top: 2px;
      word-break: break-all;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #38bdf8;
      margin-top: 32px;
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-left: 3px solid #00e599;
      padding-left: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 24px;
      background: #0d131f;
      border: 1px solid #1e293b;
      border-radius: 6px;
      overflow: hidden;
    }
    th {
      background: #151d2c;
      color: #94a3b8;
      font-weight: 600;
      text-align: left;
      padding: 10px 14px;
      border-bottom: 1px solid #1e293b;
      font-size: 12px;
    }
    td {
      padding: 10px 14px;
      border-bottom: 1px solid #162032;
      color: #cbd5e1;
      vertical-align: top;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
    .disclaimer {
      margin-top: 40px;
      padding: 16px;
      border-radius: 6px;
      background: #0d131f;
      border: 1px solid #1e293b;
      font-size: 12px;
      color: #94a3b8;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 11px;
      color: #475569;
      font-family: 'JetBrains Mono', monospace;
    }

    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
        padding: 0 !important;
      }
      .container {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        background: transparent !important;
        max-width: 100% !important;
      }
      .meta-grid, table, .disclaimer {
        background: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
      }
      th {
        background: #f1f5f9 !important;
        color: #334155 !important;
      }
      td, .meta-val {
        color: #0f172a !important;
      }
      .title-area h1 {
        color: #0f172a !important;
      }
      .badge-primary, .badge-high, .badge-med, .badge-low {
        border: 1px solid #94a3b8 !important;
        color: #000000 !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title-area">
        <h1>
          <span>SIDZ OSINT</span>
          <span class="badge badge-primary">Intelligence Report</span>
        </h1>
        <div class="subtitle">Digital Footprint Reconnaissance Assessment</div>
      </div>
      <div>
        <button onclick="window.print()" style="background:#1e293b; border:1px solid #334155; color:#cbd5e1; padding:8px 16px; border-radius:4px; font-size:12px; cursor:pointer;" class="no-print">Print / Save as PDF</button>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <div class="meta-label">Investigation ID</div>
        <div class="meta-val">{{ investigation.id }}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Investigation Target</div>
        <div class="meta-val">{{ investigation.target }} ({{ investigation.target_type | upper }})</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Timestamp (UTC)</div>
        <div class="meta-val">{{ investigation.created_at or 'N/A' }}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Status & Findings Count</div>
        <div class="meta-val">{{ investigation.status | upper }} | {{ findings | length }} Findings Recorded</div>
      </div>
    </div>

    <div class="section-title">Executive Summary & Methodology</div>
    <p style="font-size: 13px; color: #94a3b8; margin-bottom: 16px;">
      This intelligence report was generated by <strong>SIDZ OSINT</strong> using non-intrusive, passive reconnaissance methods and authoritative public open-source endpoints. The assessment executed local automated modules targeting publicly queryable DNS records, SSL/TLS certificate transparency logs, regional registries (ARIN/RIPE), public social media presences, and defensive breach repositories. No credentials were harvested or unauthorized systems probed.
    </p>

    <div class="section-title">Verified Intelligence Findings</div>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Finding</th>
          <th>Discovered Value / URL</th>
          <th>Confidence</th>
          <th>Source Tool</th>
        </tr>
      </thead>
      <tbody>
        {% for f in findings %}
        <tr>
          <td><span class="badge badge-low">{{ f.category | upper }}</span></td>
          <td><strong>{{ f.title }}</strong></td>
          <td class="mono">
            {% if f.source_url %}
            <a href="{{ f.source_url }}" target="_blank" style="color: #38bdf8; text-decoration: underline;">{{ f.value }}</a>
            {% else %}
            {{ f.value }}
            {% endif %}
          </td>
          <td>
            {% if f.confidence == 'HIGH' %}
            <span class="badge badge-high">HIGH</span>
            {% elif f.confidence == 'MEDIUM' %}
            <span class="badge badge-med">MED</span>
            {% else %}
            <span class="badge badge-low">LOW</span>
            {% endif %}
          </td>
          <td class="mono" style="color: #94a3b8;">{{ f.source_tool }}</td>
        </tr>
        {% endfor %}
      </tbody>
    </table>

    <div class="section-title">Discovered Relationship Graph Entities</div>
    <table>
      <thead>
        <tr>
          <th>Source Entity</th>
          <th>Relation</th>
          <th>Target Entity</th>
          <th>Evidence Tool</th>
        </tr>
      </thead>
      <tbody>
        {% for e in edges %}
        <tr>
          <td class="mono">{{ e.source_label }}</td>
          <td><span class="badge badge-primary">{{ e.relation }}</span></td>
          <td class="mono">{{ e.target_label }}</td>
          <td class="mono" style="color: #94a3b8;">{{ e.evidence_tool }}</td>
        </tr>
        {% endfor %}
      </tbody>
    </table>

    <div class="disclaimer">
      <strong>Ethical & Defensive OSINT Limitations Notice:</strong>
      <p style="margin-top: 6px;">
        All findings represent point-in-time public indicators. An identical username across services signifies naming correlation, not conclusive proof of common individual ownership. This documentation is intended strictly for authorized security auditing, defensive asset mapping, and educational research in compliance with applicable cybersecurity laws.
      </p>
    </div>

    <div class="footer">
      SIDZ OSINT Platform // Generated on {{ investigation.created_at }} // Local-First Intelligence Engine
    </div>
  </div>
</body>
</html>
"""

class ExportGenerator:
    @staticmethod
    def generate_html(investigation: Dict[str, Any], findings: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> str:
        template = Template(HTML_REPORT_TEMPLATE)
        return template.render(
            investigation=investigation,
            findings=findings,
            edges=edges,
        )

    @staticmethod
    def generate_json(investigation: Dict[str, Any], findings: List[Dict[str, Any]], edges: List[Dict[str, Any]], logs: List[Dict[str, Any]]) -> str:
        payload = {
            "metadata": {
                "platform": "SIDZ OSINT",
                "version": "1.0.0",
                "exported_at": investigation.get("created_at"),
            },
            "investigation": investigation,
            "findings": findings,
            "relationship_graph": {
                "edges": edges,
                "total_edges": len(edges),
            },
            "execution_logs": logs,
        }
        return json.dumps(payload, indent=2)

