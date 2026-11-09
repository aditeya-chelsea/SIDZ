from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.database import get_db
from backend.app.models import Investigation, Finding, EvidenceEdge, ScanLog
from backend.app.core.export_generator import ExportGenerator

router = APIRouter(prefix="/api/investigations", tags=["reports"])

@router.get("/{investigation_id}/report/html")
async def export_html_report(investigation_id: str, db: AsyncSession = Depends(get_db)):
    inv = await db.get(Investigation, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    res_f = await db.execute(select(Finding).where(Finding.investigation_id == investigation_id))
    findings = [f.to_dict() for f in res_f.scalars().all()]

    res_e = await db.execute(select(EvidenceEdge).where(EvidenceEdge.investigation_id == investigation_id))
    edges = [e.to_dict() for e in res_e.scalars().all()]

    html_content = ExportGenerator.generate_html(inv.to_dict(), findings, edges)
    return Response(
        content=html_content,
        media_type="text/html",
        headers={"Content-Disposition": f'inline; filename="{investigation_id}_report.html"'}
    )

@router.get("/{investigation_id}/report/json")
async def export_json_report(investigation_id: str, db: AsyncSession = Depends(get_db)):
    inv = await db.get(Investigation, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    res_f = await db.execute(select(Finding).where(Finding.investigation_id == investigation_id))
    findings = [f.to_dict() for f in res_f.scalars().all()]

    res_e = await db.execute(select(EvidenceEdge).where(EvidenceEdge.investigation_id == investigation_id))
    edges = [e.to_dict() for e in res_e.scalars().all()]

    res_l = await db.execute(select(ScanLog).where(ScanLog.investigation_id == investigation_id))
    logs = [l.to_dict() for l in res_l.scalars().all()]

    json_str = ExportGenerator.generate_json(inv.to_dict(), findings, edges, logs)
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{investigation_id}_export.json"'}
    )

