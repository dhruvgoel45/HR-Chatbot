from utilities.config import db

async def validate_user(email: str, password: str):
    """
    Validate a user's email and password from the database.
    """
    try:
        user_collection = db.get_collection("users")  # MongoDB collection for users
        # Query the database for the email and password
        user = await user_collection.find_one({"email": email, "password": password})
        if user:
            return user
        return None
    except Exception as e:
        print(f"Database error: {repr(e)}")
        return None
