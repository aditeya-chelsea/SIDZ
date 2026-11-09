import ipaddress
import re
import uuid
import datetime
import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from backend.app.database import get_db, AsyncSessionLocal
from backend.app.models import Investigation, Finding, EvidenceEdge, ScanLog
from backend.app.schemas import InvestigationCreate, InvestigationResponse
from backend.app.core.websocket_manager import ws_manager
from backend.app.modules.username_recon import UsernameReconModule
from backend.app.modules.email_recon import EmailReconModule
from backend.app.modules.domain_recon import DomainReconModule
from backend.app.modules.ip_recon import IpReconModule

router = APIRouter(prefix="/api/investigations", tags=["investigations"])

def detect_target_type(target: str) -> str:
    target = target.strip()
    if re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', target):
        return "email"
    try:
        ipaddress.ip_address(target)
        return "ip"
    except ValueError:
        pass
    clean_dom = re.sub(r'^https?://', '', target).split('/')[0].split(':')[0]
    if "." in clean_dom and not clean_dom.endswith(".") and not clean_dom.startswith("."):
        return "domain"
    return "username"

active_tasks: dict = {}

async def execute_investigation_pipeline(investigation_id: str):
    async with AsyncSessionLocal() as db:
        inv = await db.get(Investigation, investigation_id)
        if not inv:
            return

        inv.status = "running"
        inv.progress = 5
        inv.current_stage = "Initializing"
        await db.commit()
        await ws_manager.broadcast_investigation(investigation_id, "status", {"status": "running"})

        async def log_callback(level: str, stage: str, message: str):
            async with AsyncSessionLocal() as local_db:
                log_entry = ScanLog(
                    investigation_id=investigation_id,
                    level=level,
                    stage=stage,
                    message=message,
                    timestamp=datetime.datetime.utcnow(),
                )
                local_db.add(log_entry)
                await local_db.commit()
                await ws_manager.broadcast_investigation(investigation_id, "log", log_entry.to_dict())

        async def finding_callback(finding_data: dict):
            async with AsyncSessionLocal() as local_db:
                f = Finding(
                    id=finding_data["id"],
                    investigation_id=investigation_id,
                    category=finding_data["category"],
                    title=finding_data["title"],
                    value=finding_data["value"],
                    source_tool=finding_data["source_tool"],
                    source_url=finding_data.get("source_url"),
                    confidence=finding_data.get("confidence", "HIGH"),
                    raw_data=finding_data.get("raw_data", {}),
                    discovered_at=datetime.datetime.utcnow(),
                )
                # raw_data as json string in db
                import json
                f.raw_data = json.dumps(finding_data.get("raw_data", {}))
                local_db.add(f)
                await local_db.commit()
                await ws_manager.broadcast_investigation(investigation_id, "finding", f.to_dict())

        async def edge_callback(edge_data: dict):
            async with AsyncSessionLocal() as local_db:
                e = EvidenceEdge(
                    id=edge_data["id"],
                    investigation_id=investigation_id,
                    source_id=edge_data["source_id"],
                    target_id=edge_data["target_id"],
                    source_label=edge_data["source_label"],
                    target_label=edge_data["target_label"],
                    relation=edge_data["relation"],
                    evidence_tool=edge_data["evidence_tool"],
                    created_at=datetime.datetime.utcnow(),
                )
                local_db.add(e)
                await local_db.commit()
                await ws_manager.broadcast_investigation(investigation_id, "edge", e.to_dict())

        async def progress_callback(progress: int, stage: str, tool: str):
            async with AsyncSessionLocal() as local_db:
                current_inv = await local_db.get(Investigation, investigation_id)
                if current_inv:
                    current_inv.progress = progress
                    current_inv.current_stage = stage
                    current_inv.current_tool = tool
                    await local_db.commit()
                await ws_manager.broadcast_investigation(
                    investigation_id,
                    "progress",
                    {"progress": progress, "stage": stage, "tool": tool}
                )

        try:
            target_type = inv.target_type
            target = inv.target

            if target_type == "username":
                await UsernameReconModule.run(
                    investigation_id, target, log_callback, finding_callback, edge_callback, progress_callback
                )
            elif target_type == "email":
                await EmailReconModule.run(
                    investigation_id, target, log_callback, finding_callback, edge_callback, progress_callback
                )
            elif target_type == "domain":
                await DomainReconModule.run(
                    investigation_id, target, log_callback, finding_callback, edge_callback, progress_callback
                )
            elif target_type == "ip":
                await IpReconModule.run(
                    investigation_id, target, log_callback, finding_callback, edge_callback, progress_callback
                )

            async with AsyncSessionLocal() as local_db:
                final_inv = await local_db.get(Investigation, investigation_id)
                if final_inv:
                    final_inv.status = "completed"
                    final_inv.progress = 100
                    final_inv.current_stage = "Completed"
                    final_inv.completed_at = datetime.datetime.utcnow()
                    await local_db.commit()
                    await ws_manager.broadcast_investigation(investigation_id, "status", {"status": "completed"})

        except asyncio.CancelledError:
            async with AsyncSessionLocal() as local_db:
                cancelled_inv = await local_db.get(Investigation, investigation_id)
                if cancelled_inv:
                    cancelled_inv.status = "cancelled"
                    cancelled_inv.current_stage = "Cancelled by user"
                    await local_db.commit()
                    await ws_manager.broadcast_investigation(investigation_id, "status", {"status": "cancelled"})
        except Exception as e:
            async with AsyncSessionLocal() as local_db:
                err_inv = await local_db.get(Investigation, investigation_id)
                if err_inv:
                    err_inv.status = "failed"
                    err_inv.error_message = str(e)
                    err_inv.current_stage = f"Failed: {str(e)[:80]}"
                    await local_db.commit()
                    await ws_manager.broadcast_investigation(investigation_id, "status", {"status": "failed", "error": str(e)})
        finally:
            active_tasks.pop(investigation_id, None)

@router.post("", response_model=InvestigationResponse)
async def create_investigation(
    payload: InvestigationCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    target_clean = payload.target.strip()
    target_type = payload.target_type or detect_target_type(target_clean)

    # Security requirement: check authorization for personal identifiers (email/username)
    if target_type in ["email"] and not payload.authorized_by_user:
        raise HTTPException(
            status_code=403,
            detail="Investigation of email targets requires explicit confirmation of authorization for defensive/educational assessment."
        )

    short_id = uuid.uuid4().hex[:8].upper()
    investigation_id = f"INV-2026-{short_id}"
    title = payload.title or f"Investigation: {target_clean} ({target_type.upper()})"

    inv = Investigation(
        id=investigation_id,
        title=title,
        target=target_clean,
        target_type=target_type,
        status="queued",
        progress=0,
        current_stage="Queued",
        current_tool="system",
        authorized_by_user=payload.authorized_by_user,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(inv)
    await db.commit()
    await db.refresh(inv)

    # Launch task in background asyncio
    task = asyncio.create_task(execute_investigation_pipeline(investigation_id))
    active_tasks[investigation_id] = task

    return inv.to_dict()

@router.get("", response_model=List[InvestigationResponse])
async def list_investigations(
    query: Optional[str] = None,
    target_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Investigation).options(selectinload(Investigation.findings)).order_by(desc(Investigation.created_at))
    if target_type:
        stmt = stmt.where(Investigation.target_type == target_type)
    if query:
        stmt = stmt.where(
            (Investigation.target.ilike(f"%{query}%")) | (Investigation.title.ilike(f"%{query}%"))
        )
    stmt = stmt.offset(offset).limit(limit)
    res = await db.execute(stmt)
    invs = res.scalars().all()
    return [i.to_dict() for i in invs]

@router.get("/{investigation_id}", response_model=InvestigationResponse)
async def get_investigation(investigation_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Investigation).options(selectinload(Investigation.findings)).where(Investigation.id == investigation_id)
    res = await db.execute(stmt)
    inv = res.scalars().first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return inv.to_dict()

@router.delete("/{investigation_id}")
async def delete_investigation(investigation_id: str, db: AsyncSession = Depends(get_db)):
    inv = await db.get(Investigation, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    if investigation_id in active_tasks:
        active_tasks[investigation_id].cancel()
    await db.delete(inv)
    await db.commit()
    return {"status": "deleted", "id": investigation_id}

@router.post("/{investigation_id}/cancel")
async def cancel_investigation(investigation_id: str, db: AsyncSession = Depends(get_db)):
    inv = await db.get(Investigation, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    if investigation_id in active_tasks:
        active_tasks[investigation_id].cancel()
    inv.status = "cancelled"
    inv.current_stage = "Cancelled by user"
    await db.commit()
    await ws_manager.broadcast_investigation(investigation_id, "status", {"status": "cancelled"})
    return {"status": "cancelled", "id": investigation_id}

