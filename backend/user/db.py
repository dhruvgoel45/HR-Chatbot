from utilities.config import db
from datetime import datetime

async def create_user(user_data):
    try:
        user_collection = db.get_collection("users")  # MongoDB collection for users
        user_document = {
            "username": user_data.username,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "password": user_data.password,  # Ideally, this should be hashed
            "is_admin": user_data.is_admin,  # Add the is_admin field
            "created_on": datetime.now()
        }
        result = await user_collection.insert_one(user_document)
        return result.inserted_id
    except Exception as e:
        print(repr(e))
        return None
