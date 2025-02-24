from fastapi import APIRouter
from .views import get_all_documents

document_fetch_router = APIRouter()

document_fetch_router.get("")(get_all_documents)
