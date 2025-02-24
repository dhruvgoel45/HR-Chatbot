from fastapi import APIRouter
from .views import qa_bot

chat_router = APIRouter()


chat_router.post("")(qa_bot)
