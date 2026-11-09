from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.database import get_db
from backend.app.models import Investigation, EvidenceEdge, Finding
from backend.app.schemas import GraphResponse, GraphNode, GraphEdge

router = APIRouter(prefix="/api/investigations", tags=["graph"])

def determine_node_type(node_id: str) -> str:
    if node_id.startswith("target:"):
        return "target"
    if node_id.startswith("profile:"):
        return "profile"
    if node_id.startswith("domain:"):
        return "domain"
    if node_id.startswith("subdomain:"):
        return "subdomain"
    if node_id.startswith("ip:"):
        return "ip"
    if node_id.startswith("email:"):
        return "email"
    if node_id.startswith("mx:"):
        return "mx"
    if node_id.startswith("ns:"):
        return "ns"
    if node_id.startswith("asn:"):
        return "asn"
    if node_id.startswith("breach:"):
        return "breach"
    if node_id.startswith("geo:"):
        return "geo"
    return "entity"

@router.get("/{investigation_id}/graph", response_model=GraphResponse)
async def get_investigation_graph(investigation_id: str, db: AsyncSession = Depends(get_db)):
    inv = await db.get(Investigation, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    # Fetch edges
    stmt_edges = select(EvidenceEdge).where(EvidenceEdge.investigation_id == investigation_id)
    res_edges = await db.execute(stmt_edges)
    edges_db = res_edges.scalars().all()

    # Also fetch findings to correlate evidence with nodes
    stmt_findings = select(Finding).where(Finding.investigation_id == investigation_id)
    res_findings = await db.execute(stmt_findings)
    findings_db = res_findings.scalars().all()

    # Map findings by category or tool
    nodes_map: Dict[str, GraphNode] = {}
    edges_list: List[GraphEdge] = []

    # Root Target Node
    root_node_id = f"target:{inv.target}"
    nodes_map[root_node_id] = GraphNode(
        id=root_node_id,
        label=inv.target,
        type="target",
        category=inv.target_type,
        data={
            "label": inv.target,
            "type": "target",
            "target_type": inv.target_type,
            "status": inv.status,
            "investigation_id": inv.id,
            "is_root": True,
        }
    )

    for edge in edges_db:
        # Ensure source node exists
        if edge.source_id not in nodes_map:
            nodes_map[edge.source_id] = GraphNode(
                id=edge.source_id,
                label=edge.source_label,
                type=determine_node_type(edge.source_id),
                category="entity",
                data={
                    "label": edge.source_label,
                    "type": determine_node_type(edge.source_id),
                    "evidence_tool": edge.evidence_tool,
                }
            )

        # Ensure target node exists
        if edge.target_id not in nodes_map:
            nodes_map[edge.target_id] = GraphNode(
                id=edge.target_id,
                label=edge.target_label,
                type=determine_node_type(edge.target_id),
                category="entity",
                data={
                    "label": edge.target_label,
                    "type": determine_node_type(edge.target_id),
                    "evidence_tool": edge.evidence_tool,
                }
            )

        edges_list.append(
            GraphEdge(
                id=edge.id,
                source=edge.source_id,
                target=edge.target_id,
                label=edge.relation,
                evidence_tool=edge.evidence_tool,
            )
        )

    # Attach related findings count to node data
    for f in findings_db:
        # Match finding value or title with node id
        for nid, n in nodes_map.items():
            if n.label.lower() in f.value.lower() or n.label.lower() in f.title.lower():
                n.data.setdefault("evidence", []).append({
                    "title": f.title,
                    "value": f.value,
                    "tool": f.source_tool,
                    "confidence": f.confidence,
                    "url": f.source_url,
                })

    return GraphResponse(
        nodes=list(nodes_map.values()),
        edges=edges_list
    )

