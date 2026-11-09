from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class InvestigationCreate(BaseModel):
    target: str = Field(..., min_length=1, max_length=255, description="Search target (username, email, domain, or IP)")
    target_type: Optional[str] = Field(None, description="Optional explicit type: 'username', 'email', 'domain', 'ip'. Auto-detected if omitted.")
    title: Optional[str] = Field(None, description="Optional custom investigation title")
    authorized_by_user: bool = Field(False, description="User confirmation of defensive/educational authorization")
    enabled_tools: Optional[List[str]] = Field(None, description="Optional list of specific tools to run")

class FindingResponse(BaseModel):
    id: str
    investigation_id: str
    category: str
    title: str
    value: str
    source_tool: str
    source_url: Optional[str] = None
    confidence: str
    raw_data: Dict[str, Any] = {}
    discovered_at: Optional[str] = None

class EvidenceEdgeResponse(BaseModel):
    id: str
    investigation_id: str
    source_id: str
    target_id: str
    source_label: str
    target_label: str
    relation: str
    evidence_tool: str
    created_at: Optional[str] = None

class ScanLogResponse(BaseModel):
    id: int
    investigation_id: str
    level: str
    stage: str
    message: str
    timestamp: Optional[str] = None

class InvestigationResponse(BaseModel):
    id: str
    title: str
    target: str
    target_type: str
    status: str
    progress: int
    current_stage: str
    current_tool: str
    authorized_by_user: bool
    created_at: Optional[str] = None
    completed_at: Optional[str] = None
    is_demo: bool = False
    error_message: Optional[str] = None
    meta_summary: Dict[str, Any] = {}
    findings_count: int = 0

class ToolInfo(BaseModel):
    name: str
    binary: str
    category: str
    installed: bool
    version: Optional[str] = None
    install_command: str
    description: str
    native_fallback: bool

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # target, profile, domain, ip, email, asn, dns
    category: str
    data: Dict[str, Any]

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    evidence_tool: str

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

