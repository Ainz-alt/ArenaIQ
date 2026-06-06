from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Room, RoomPlayer, User
from auth import get_current_user
import random
import string
from question_generator import generate_questions
from models import Question

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


@router.get("/")
async def get_all_rooms(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    rooms = db.query(Room).all()
    return rooms


@router.post("/{code}/load-questions")
async def load_questions(
    code: str,
    game_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only host can load questions")

    questions = generate_questions(game_name)
    for q in questions:
        question = Question(
            category=game_name,
            text=q["text"],
            options=q["options"],
            correct_index=q["correct_index"],
        )
        db.add(question)
    db.commit()
    return {"message": f"Loaded {len(questions)} questions for {game_name}"}


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
