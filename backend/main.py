from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from bot.routes import chat_router
from document.routes import knowledge_router
from allchat.routes import all_chats
from user.routes import user_router
from fetchdocuments.routes import document_fetch_router
from chat_operations.routes import router as chat_operations_router
from fastapi.staticfiles import StaticFiles
from login.routes import login_router
from tasks.routes import tasks_router
from tasks.notifications import router as notifications_router
from utilities.config import print_collections  # Import the function

application = FastAPI(title="HrNexus")



# Include existing routers
application.include_router(user_router, prefix="/user")
application.include_router(login_router, prefix="/auth", tags=["Login"])
application.include_router(chat_router, prefix="/chat")
application.include_router(knowledge_router, prefix="/knowledge")
application.include_router(all_chats, prefix="/allchats")
application.include_router(document_fetch_router, prefix="/document")
application.include_router(tasks_router, prefix="/tasks", tags=["Tasks"])
application.include_router(notifications_router, prefix="/tasks", tags=["Notifications"])
application.include_router(chat_operations_router, prefix="/chat_operations")

# CORS middleware
application.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-chat-id", "x-chat-title", "x-document-ids"],  # Expose necessary headers
)

# Use uvicorn to run the FastAPI app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(application, host="0.0.0.0", port=8000)