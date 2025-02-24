from utilities.config import db

async def delete_chat_from_db(username: str, chat_id: str) -> bool:
    """Delete a chat by chat_id from the user's collection."""
    try:
        chat_collection = db.get_collection(username)
        result = await chat_collection.delete_one({"chat_id": chat_id})
        return result.deleted_count > 0
    except Exception as e:
        print(repr(e))
        return False

async def rename_chat_in_db(username: str, chat_id: str, new_title: str) -> bool:
    """Rename a chat's title by chat_id in the user's collection."""
    try:
        chat_collection = db.get_collection(username)
        result = await chat_collection.update_one(
            {"chat_id": chat_id},
            {"$set": {"chat_title": new_title}}
        )
        return result.modified_count > 0
    except Exception as e:
        print(repr(e))
        return False
