from .model import User
from .db import get_chat_history
from utilities.responses import success_response, error_response
from bson import json_util

from datetime import datetime

def format_response(response):
    for each in response:
        # Remove `_id` if it exists
        each.pop("_id", None)

        # Convert `created_on` to string if present
        if "created_on" in each and isinstance(each["created_on"], datetime):
            each["created_on"] = each["created_on"].isoformat()

        # Convert timestamps inside `messages` list
        if "messages" in each and isinstance(each["messages"], list):
            for msg in each["messages"]:
                if "timestamp" in msg and isinstance(msg["timestamp"], datetime):
                    msg["timestamp"] = msg["timestamp"].isoformat()
    
    return response


async def fetch_all_chat(_model: User):
    try:
        get_chat = await get_chat_history(_model.username)
        formatted_chat = json_util.loads(json_util.dumps(format_response(get_chat)))
        return success_response(msg="Success", data={"thread": formatted_chat})
    except Exception as e:
        print(repr(e))
        return error_response(msg="Something went wrong")