from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_code: str):
        await websocket.accept()
        if room_code not in self.rooms:
            self.rooms[room_code] = []
        self.rooms[room_code].append(websocket)

    def disconnect(self, websocket: WebSocket, room_code: str):
        if room_code in self.rooms:
            if websocket in self.rooms[room_code]:
                self.rooms[room_code].remove(websocket)
            if not self.rooms[room_code]:
                del self.rooms[room_code]

    async def broadcast(self, room_code: str, message: dict):
        if room_code in self.rooms:
            dead = []
            for connection in self.rooms[room_code]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead.append(connection)
            for conn in dead:
                self.rooms[room_code].remove(conn)

    async def send_personal(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_json(message)
        except Exception:
            pass


manager = ConnectionManager()
