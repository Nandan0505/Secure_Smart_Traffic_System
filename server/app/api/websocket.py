# backend/app/api/websocket.py

import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.state import connected_clients, traffic_log, alert_log

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    print(f"[WS] Client connected. Total: {len(connected_clients)}")

    # Send last 20 traffic readings on connect so React has immediate data
    try:
        await websocket.send_json({
            "type": "init",
            "data": {
                "traffic": list(traffic_log)[-20:],
                "alerts":  list(alert_log)[-10:],
            }
        })
    except Exception:
        pass

    try:
        while True:
            # ── Keepalive ping every 20 seconds ───────────
            # This replaces the bare receive_text() which was
            # causing instant disconnects when the client was silent.
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=20.0)
            except asyncio.TimeoutError:
                # Send a ping to keep the connection alive
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break   # client is gone
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"[WS] Error: {e}")
    finally:
        connected_clients.discard(websocket)
        print(f"[WS] Client disconnected. Total: {len(connected_clients)}")