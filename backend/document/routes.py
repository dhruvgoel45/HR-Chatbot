from fastapi import APIRouter
from .views import upload_knowledge

knowledge_router = APIRouter()


knowledge_router.post("")(upload_knowledge)
