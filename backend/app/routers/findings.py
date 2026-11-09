from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from backend.app.database import get_db
from backend.app.models import Finding, Investigation
from backend.app.schemas import FindingResponse

router = APIRouter(prefix="/api", tags=["findings"])

@router.get("/investigations/{investigation_id}/findings", response_model=List[FindingResponse])
async def list_findings(
    investigation_id: str,
    category: Optional[str] = None,
    confidence: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Finding).where(Finding.investigation_id == investigation_id).order_by(desc(Finding.discovered_at))
    if category:
        stmt = stmt.where(Finding.category == category)
    if confidence:
        stmt = stmt.where(Finding.confidence == confidence)
    res = await db.execute(stmt)
    return [f.to_dict() for f in res.scalars().all()]

@router.get("/findings/overview")
async def get_findings_overview(db: AsyncSession = Depends(get_db)):
    # Total investigations
    total_invs = await db.scalar(select(func.count(Investigation.id)))
    active_invs = await db.scalar(select(func.count(Investigation.id)).where(Investigation.status == "running"))
    completed_invs = await db.scalar(select(func.count(Investigation.id)).where(Investigation.status == "completed"))
    
    # Total findings
    total_findings = await db.scalar(select(func.count(Finding.id)))
    
    # Breakdown by category
    stmt_cat = select(Finding.category, func.count(Finding.id)).group_by(Finding.category)
    res_cat = await db.execute(stmt_cat)
    categories = [{"name": cat, "count": count} for cat, count in res_cat.all()]

    # Breakdown by confidence
    stmt_conf = select(Finding.confidence, func.count(Finding.id)).group_by(Finding.confidence)
    res_conf = await db.execute(stmt_conf)
    confidence_dist = [{"confidence": conf, "count": count} for conf, count in res_conf.all()]

    # Target types distribution
    stmt_types = select(Investigation.target_type, func.count(Investigation.id)).group_by(Investigation.target_type)
    res_types = await db.execute(stmt_types)
    type_dist = [{"type": t, "count": c} for t, c in res_types.all()]

    return {
        "total_investigations": total_invs or 0,
        "active_investigations": active_invs or 0,
        "completed_investigations": completed_invs or 0,
        "total_findings": total_findings or 0,
        "categories": categories,
        "confidence_distribution": confidence_dist,
        "target_type_distribution": type_dist,
    }

@router.get("/investigations/{investigation_id}/logs")
async def get_investigation_logs(investigation_id: str, db: AsyncSession = Depends(get_db)):
    from backend.app.models import ScanLog
    stmt = select(ScanLog).where(ScanLog.investigation_id == investigation_id).order_by(ScanLog.id)
    res = await db.execute(stmt)
    return [l.to_dict() for l in res.scalars().all()]

