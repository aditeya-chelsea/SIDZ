from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.app.core.websocket_manager import ws_manager

router = APIRouter(tags=["websockets"])

@router.websocket("/ws/investigations/{investigation_id}")
async def websocket_investigation_endpoint(websocket: WebSocket, investigation_id: str):
    await ws_manager.connect(websocket, investigation_id)
    try:
        while True:
            # Keep alive and receive any client ping
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket, investigation_id)
    except Exception:
        await ws_manager.disconnect(websocket, investigation_id)

@router.websocket("/ws/global")
async def websocket_global_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket, None)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket, None)
    except Exception:
        await ws_manager.disconnect(websocket, None)

