from typing import List, Dict, Any
from fastapi import APIRouter
from backend.app.core.tool_manager import ToolManager

router = APIRouter(prefix="/api/tools", tags=["tools"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_tools_status():
    """Returns detected status, versions, and installation instructions for all integrated OSINT tools."""
    return await ToolManager.get_all_tools()

