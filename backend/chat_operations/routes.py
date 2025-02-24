from fastapi import APIRouter, HTTPException, Request
from .views import delete_chat, rename_chat

router = APIRouter()

@router.delete("/chats/delete")
async def delete_chat_endpoint(request: Request):
    """Endpoint to delete a chat."""
    return await delete_chat(request)

@router.put("/chats/rename")
async def rename_chat_endpoint(request: Request):
    """Endpoint to rename a chat."""
    return await rename_chat(request)