from utilities.config import db

async def get_chat_history(username, chat_id):
    try:
        chat_collection = db.get_collection(username)
        print(chat_collection)
        get_chat = await chat_collection.find_one({"chat_id": chat_id})
        print(get_chat)
        return get_chat
    except Exception as e:
        print(repr(e))
        return None
