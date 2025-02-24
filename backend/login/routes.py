from fastapi import APIRouter
from pydantic import BaseModel
from .views import validate_login

login_router = APIRouter()

# Define a Pydantic model for login request
class LoginRequest(BaseModel):
    email: str
    password: str

@login_router.post("/")
async def login(credentials: LoginRequest):
    """
    Endpoint to validate login credentials.
    """
    return await validate_login(credentials.email, credentials.password)

