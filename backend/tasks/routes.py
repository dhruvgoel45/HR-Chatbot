from fastapi import APIRouter
from fastapi import APIRouter, HTTPException

from .views import create_task, submit_task, get_tasks_for_employee_with_details,get_all_tasks_with_employee_details
tasks_router = APIRouter()

# Define task-related routes
tasks_router.post("/create")(create_task)
tasks_router.post("/submit")(submit_task)
@tasks_router.get("/{email}")
async def get_employee_tasks(email: str):
    """
    Get all tasks assigned to a specific employee using their email,
    including additional task details from the tasks collection.
    """
    try:
        tasks = get_tasks_for_employee_with_details(email)
        return {"tasks": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@tasks_router.get("/admin/tasks")
async def get_tasks_with_employee_details():
    """
    Fetch all tasks with detailed employee information for admin.
    """
    try:
        tasks = get_all_tasks_with_employee_details()
        return {"tasks": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
