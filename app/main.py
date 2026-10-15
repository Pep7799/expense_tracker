from fastapi import FastAPI
from .database import engine, Base
from . import models
from .routes import expenses
from app.routes.users import router as user_router
from fastapi.middleware.cors import CORSMiddleware
import os


Base.metadata.create_all(bind=engine)


app = FastAPI()


origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(expenses.router)
app.include_router(user_router)


@app.get('/')
def read_root():
    return {"message": "Expense tracker"}
