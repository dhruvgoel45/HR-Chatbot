from fastapi import HTTPException
from .db import validate_user
from .utils import success_response, error_response

async def validate_login(email: str, password: str):
    """
    Validate the user's email and password.
    """
    try:
        # Check the database for the user
        user = await validate_user(email, password)
        if user:
            # Convert MongoDB ObjectId to string
            user["_id"] = str(user["_id"])
            user.pop("created_on", None)


            return success_response("Login successful", data=user)
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")
    except Exception as e:
        print(f"Validation error: {repr(e)}")
        return error_response("Something went wrong during login validation")



