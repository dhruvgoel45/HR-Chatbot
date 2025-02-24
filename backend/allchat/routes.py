from fastapi import APIRouter
from .views import fetch_all_chat

all_chats = APIRouter()


all_chats.post("")(fetch_all_chat)
