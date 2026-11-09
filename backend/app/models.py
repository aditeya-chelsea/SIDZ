import datetime
import json
from typing import Any, Dict, Optional
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    target = Column(String(255), nullable=False, index=True)
    target_type = Column(String(32), nullable=False, index=True)  # 'username', 'email', 'domain', 'ip'
    status = Column(String(32), default="queued", index=True)      # 'queued', 'running', 'completed', 'failed', 'cancelled'
    progress = Column(Integer, default=0)
    current_stage = Column(String(128), default="Initializing")
    current_tool = Column(String(64), default="system")
    authorized_by_user = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    is_demo = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)
    meta_summary = Column(Text, default="{}")

    findings = relationship("Finding", back_populates="investigation", cascade="all, delete-orphan")
    edges = relationship("EvidenceEdge", back_populates="investigation", cascade="all, delete-orphan")
    logs = relationship("ScanLog", back_populates="investigation", cascade="all, delete-orphan")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "target": self.target,
            "target_type": self.target_type,
            "status": self.status,
            "progress": self.progress,
            "current_stage": self.current_stage,
            "current_tool": self.current_tool,
            "authorized_by_user": self.authorized_by_user,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "is_demo": self.is_demo,
            "error_message": self.error_message,
            "meta_summary": json.loads(self.meta_summary or "{}"),
            "findings_count": len(self.findings) if "findings" in self.__dict__ and self.findings is not None else 0,
        }

class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(64), primary_key=True, index=True)
    investigation_id = Column(String(64), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(64), nullable=False, index=True)  # 'identity', 'social', 'dns', 'network', 'breach', 'subdomain', 'whois', 'technology'
    title = Column(String(255), nullable=False)
    value = Column(Text, nullable=False)
    source_tool = Column(String(64), nullable=False)
    source_url = Column(Text, nullable=True)
    confidence = Column(String(16), default="HIGH")  # 'HIGH', 'MEDIUM', 'LOW'
    raw_data = Column(Text, default="{}")
    discovered_at = Column(DateTime, default=datetime.datetime.utcnow)

    investigation = relationship("Investigation", back_populates="findings")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "investigation_id": self.investigation_id,
            "category": self.category,
            "title": self.title,
            "value": self.value,
            "source_tool": self.source_tool,
            "source_url": self.source_url,
            "confidence": self.confidence,
            "raw_data": json.loads(self.raw_data or "{}"),
            "discovered_at": self.discovered_at.isoformat() if self.discovered_at else None,
        }

class EvidenceEdge(Base):
    __tablename__ = "evidence_edges"

    id = Column(String(64), primary_key=True, index=True)
    investigation_id = Column(String(64), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id = Column(String(128), nullable=False)
    target_id = Column(String(128), nullable=False)
    source_label = Column(String(255), nullable=False)
    target_label = Column(String(255), nullable=False)
    relation = Column(String(64), nullable=False)  # 'resolves_to', 'has_mx', 'profile_found', 'subdomain_of', 'hosted_on', etc.
    evidence_tool = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    investigation = relationship("Investigation", back_populates="edges")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "investigation_id": self.investigation_id,
            "source_id": self.source_id,
            "target_id": self.target_id,
            "source_label": self.source_label,
            "target_label": self.target_label,
            "relation": self.relation,
            "evidence_tool": self.evidence_tool,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class ScanLog(Base):
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    investigation_id = Column(String(64), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    level = Column(String(16), default="INFO")  # 'INFO', 'WARN', 'ERROR', 'SUCCESS'
    stage = Column(String(128), default="Scan")
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    investigation = relationship("Investigation", back_populates="logs")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "investigation_id": self.investigation_id,
            "level": self.level,
            "stage": self.stage,
            "message": self.message,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
