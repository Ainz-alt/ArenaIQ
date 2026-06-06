# ArenaIQ — CLAUDE.md

## Stack

- Frontend: React 18 + Vite + Tailwind CSS (port 5173)
- Backend: FastAPI + WebSockets, Python 3.11 (port 8000)
- Database: PostgreSQL 15
- Auth: JWT (python-jose + passlib)
- Package managers: npm (frontend), pip (backend)

## Project structure

- /frontend — React Vite app
- /backend — FastAPI app

## Architecture

- Rooms use 6-char unique codes for players to join
- WebSocket endpoint: ws://localhost:8000/ws/{room_code}/{user_id}
- Questions loaded from DB, served round by round by the host
- Scoring: 10 pts for correct answer + up to 5 speed bonus pts

## Database schema (planned)

- users: id, username, email, hashed_password, created_at
- rooms: id, code, host_id, status (waiting/active/ended), created_at
- room_players: room_id, user_id, score, joined_at
- questions: id, category, text, options (jsonb), correct_index (0–3)
- rounds: id, room_id, question_id, started_at, ended_at

## Conventions

- API routes: /api/v1/...
- WebSocket routes: /ws/...
- React components: PascalCase.tsx
- Python files: snake_case.py
- Always async def for FastAPI route handlers
- Use React Query (TanStack) for REST data fetching
- Pydantic schemas for all request/response models

## Known issues

(add bugs or gotchas here as you discover them)
