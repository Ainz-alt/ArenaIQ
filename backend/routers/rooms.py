from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Room, RoomPlayer, User
from auth import get_current_user
import random
import string

router = APIRouter(prefix="/api/v1/rooms", tags=["rooms"])


def generate_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


@router.post("/create")
async def create_room(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    code = generate_code()
    while db.query(Room).filter(Room.code == code).first():
        code = generate_code()
    room = Room(code=code, host_id=current_user.id, status="waiting")
    db.add(room)
    db.commit()
    db.refresh(room)
    player = RoomPlayer(room_id=room.id, user_id=current_user.id, score=0)
    db.add(player)
    db.commit()
    return {
        "room_code": room.code,
        "status": room.status,
        "host": current_user.username,
    }


@router.post("/join/{code}")
async def join_room(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.status != "waiting":
        raise HTTPException(status_code=400, detail="Room already started")
    existing = (
        db.query(RoomPlayer)
        .filter(RoomPlayer.room_id == room.id, RoomPlayer.user_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already in this room")
    player = RoomPlayer(room_id=room.id, user_id=current_user.id, score=0)
    db.add(player)
    db.commit()
    return {"message": f"Joined room {code}", "status": room.status}


@router.get("/{code}")
async def get_room(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    players = (
        db.query(RoomPlayer, User)
        .join(User, RoomPlayer.user_id == User.id)
        .filter(RoomPlayer.room_id == room.id)
        .all()
    )
    return {
        "code": room.code,
        "status": room.status,
        "host_id": room.host_id,
        "players": [{"username": u.username, "score": rp.score} for rp, u in players],
    }
