from fastapi import Request
from utilities.responses import success_response, error_response
from .utils import delete_chat_from_db, rename_chat_in_db
from fastapi import HTTPException


async def delete_chat(request: Request):
    """Delete a chat by chat_id."""
    try:
        body = await request.json()
        username = body.get("username")
        chat_id = body.get("chat_id")

        if not username or not chat_id:
            raise HTTPException(status_code=400, detail="Username and chat_id are required.")

        result = await delete_chat_from_db(username, chat_id)

        if result:
            return success_response(msg="Chat deleted successfully.")
        else:
            raise HTTPException(status_code=404, detail="Chat not found.")
    except Exception as e:
        return error_response(msg=f"Error deleting chat: {repr(e)}")

async def rename_chat(request: Request):
    """Rename a chat's title."""
    try:
        body = await request.json()
        username = body.get("username")
        chat_id = body.get("chat_id")
        new_title = body.get("new_title")

        if not username or not chat_id or not new_title:
            raise HTTPException(status_code=400, detail="Username, chat_id, and new_title are required.")

        result = await rename_chat_in_db(username, chat_id, new_title)

        if result:
            return success_response(msg="Chat renamed successfully.")
        else:
            raise HTTPException(status_code=404, detail="Chat not found.")
    except Exception as e:
        return error_response(msg=f"Error renaming chat: {repr(e)}")
