from fastapi import APIRouter
from .views import create_new_user
from .models import UserCreate

user_router = APIRouter()

# POST endpoint to create a new user
@user_router.post("/")
async def create_user(user: UserCreate):
    return await create_new_user(user)
