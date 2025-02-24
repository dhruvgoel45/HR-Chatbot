from fastapi import HTTPException
from .models import UserCreate
from .db import create_user
from utilities.responses import success_response, error_response

async def create_new_user(user: UserCreate):
    try:
        user_id = await create_user(user)
        if user_id:
            return success_response(msg="User created successfully", data={"user_id": str(user_id)})
        else:
            raise HTTPException(status_code=500, detail="Failed to create user")
    except Exception as e:
        print(repr(e))
        return error_response(msg="Something went wrong while creating the user")
 