from fastapi import FastAPI
from database import engine
import models
from routers import auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)


@app.get("/")
async def root():
    return {"message": "ArenaIQ backend is running"}
