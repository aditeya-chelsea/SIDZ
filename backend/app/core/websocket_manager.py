import asyncio
import json
from typing import Dict, Set, Any
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        # Maps investigation_id -> set of active WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Global listeners (e.g. for dashboard live counters)
        self.global_connections: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, investigation_id: str | None = None):
        await websocket.accept()
        async with self._lock:
            if investigation_id:
                if investigation_id not in self.active_connections:
                    self.active_connections[investigation_id] = set()
                self.active_connections[investigation_id].add(websocket)
            else:
                self.global_connections.add(websocket)

    async def disconnect(self, websocket: WebSocket, investigation_id: str | None = None):
        async with self._lock:
            if investigation_id and investigation_id in self.active_connections:
                self.active_connections[investigation_id].discard(websocket)
                if not self.active_connections[investigation_id]:
                    del self.active_connections[investigation_id]
            self.global_connections.discard(websocket)

    async def broadcast_investigation(self, investigation_id: str, message_type: str, data: Any):
        payload = json.dumps({"type": message_type, "data": data})
        recipients = set()
        async with self._lock:
            if investigation_id in self.active_connections:
                recipients.update(self.active_connections[investigation_id])
            recipients.update(self.global_connections)

        for ws in recipients:
            try:
                await ws.send_text(payload)
            except Exception:
                pass

ws_manager = WebSocketManager()

