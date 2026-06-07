from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Room, RoomPlayer, User, Question
from ws.manager import manager
import random

router = APIRouter(tags=["game"])


@router.websocket("/ws/{room_code}/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket, room_code: str, user_id: int, db: Session = Depends(get_db)
):
    room = db.query(Room).filter(Room.code == room_code).first()
    if not room:
        await websocket.close(code=4004)
        return

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        await websocket.close(code=4001)
        return

    await manager.connect(websocket, room_code)
    await manager.broadcast(
        room_code,
        {
            "type": "player_joined",
            "username": user.username,
            "message": f"{user.username} joined the room",
        },
    )

    try:
        while True:
            data = await websocket.receive_json()

            if data["type"] == "start_game":
                if room.host_id != user_id:
                    await manager.send_personal(
                        websocket, {"type": "error", "message": "Only host can start"}
                    )
                    continue
                room.status = "active"
                db.commit()
                game_name = data.get("game_name", "")
                if game_name:
                    questions = (
                        db.query(Question).filter(Question.category == game_name).all()
                    )
                else:
                    questions = db.query(Question).all()
                if not questions:
                    await manager.send_personal(
                        websocket, {"type": "error", "message": "No questions yet"}
                    )
                    continue
                question = random.choice(questions)
                await manager.broadcast(
                    room_code,
                    {
                        "type": "question",
                        "question_id": question.id,
                        "text": question.text,
                        "options": question.options,
                        "category": question.category,
                    },
                )

            elif data["type"] == "answer":
                question_id = data["question_id"]
                answer_index = data["answer_index"]
                question = db.query(Question).filter(Question.id == question_id).first()
                if not question:
                    continue
                is_correct = answer_index == question.correct_index
                points = 10 if is_correct else 0
                if is_correct:
                    player = (
                        db.query(RoomPlayer)
                        .filter(
                            RoomPlayer.room_id == room.id, RoomPlayer.user_id == user_id
                        )
                        .first()
                    )
                    if player:
                        player.score += points
                        db.commit()
                players = (
                    db.query(RoomPlayer, User)
                    .join(User)
                    .filter(RoomPlayer.room_id == room.id)
                    .all()
                )
                await manager.broadcast(
                    room_code,
                    {
                        "type": "score_update",
                        "scores": [
                            {"username": u.username, "score": rp.score}
                            for rp, u in players
                        ],
                        "last_answer": {
                            "username": user.username,
                            "correct": is_correct,
                            "points": points,
                        },
                    },
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_code)
        await manager.broadcast(
            room_code,
            {
                "type": "player_left",
                "username": user.username,
                "message": f"{user.username} left the room",
            },
        )
