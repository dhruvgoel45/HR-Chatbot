from fastapi import HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from .utils import save_task, update_submission_status, get_tasks_for_employee_with_details, get_all_tasks_with_employee_details
from datetime import datetime
import os
import re
from typing import List, Dict, Any
import json
import aioredis  # Replace redis with aioredis
from .email import send_email

# Email validation function
def validate_email(email: str) -> bool:
    """
    Validate the format of an email address.
    """
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, email) is not None


async def create_task(
    background_tasks: BackgroundTasks,
    task_name: str = Form(...),
    task_description: str = Form(...),
    deadline: str = Form(...),
    no_of_documents_required: int = Form(...),
    assign_to: str = Form(...),  # Comma-separated email IDs
    task_document: UploadFile = File(...),
):
    """
    Create a new task and assign it to multiple employees using their email IDs.
    """
    try:
        # Validate deadline format
        try:
            datetime.strptime(deadline, "%d/%m/%Y")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use DD/MM/YYYY.")

        # Validate email IDs
        email_list = [email.strip() for email in assign_to.split(",")]
        invalid_emails = [email for email in email_list if not validate_email(email)]
        if invalid_emails:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid email format for: {', '.join(invalid_emails)}"
            )

        # Save the uploaded document
        UPLOAD_DIRECTORY = "media/tasks"
        os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIRECTORY, task_document.filename)

        with open(file_path, "wb") as buffer:
            buffer.write(await task_document.read())

        # Prepare task data
        task_data = {
            "task_name": task_name,
            "task_description": task_description,
            "task_document": file_path,
            "deadline": deadline,
            "no_of_documents_required": no_of_documents_required,
            "assign_to": email_list,  # Use email IDs here
        }

        # Save task to the database
        task_id = save_task(task_data)

        # Initialize Redis connection
        redis = aioredis.from_url("redis://localhost")

        for email in email_list:
            # Prepare the notification message
            notification_message = json.dumps({
                "type": "task_assigned",
                "task_id": task_id,
                "task_name": task_name,
                "message": "New task assigned!"
            })

            # Publish real-time notification
            print(f"Publishing notification to {email}")
            channel = f"notifications:{email}"

            # Check if the user is connected
            subscribers = await redis.pubsub_numsub(channel)

            if subscribers[0][1] == 0:  # No subscribers (user is not connected)
                # Store the notification in Redis
                stored_notifications_key = f"stored_notifications:{email}"
                await redis.rpush(stored_notifications_key, notification_message)
                print(f"User {email} is not connected. Notification stored in Redis.")
            else:
                # Publish the notification to the channel
                publish_result = await redis.publish(channel, notification_message)
                print(f"Publish result: {publish_result}")

            # Send email
            background_tasks.add_task(
                send_email,
                email,
                "New Task Assigned",
                f"You have been assigned a new task: {task_name}."
            )

        # Close Redis connection
        await redis.close()

        return {"message": "Task created successfully.", "task_id": task_id}

    except HTTPException as e:
        return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def submit_task(
    email: str = Form(...),
    task_id: str = Form(...),
    comments: str = Form(...),  # New input for comments
    files: list[UploadFile] = File(...),
):
    """
    Submit a task with uploaded documents and comments for a specific employee.
    """
    try:
        # Save uploaded files
        UPLOAD_DIRECTORY = "media/tasks/submissions"
        os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
        uploaded_files = []
        for file in files:
            file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)
            with open(file_path, "wb") as buffer:
                buffer.write(await file.read())
            uploaded_files.append(file_path)

        # Update submission status with comments
        update_submission_status(task_id, email, uploaded_files, comments)
        return {"message": "Task submitted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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


async def get_tasks_with_employee_details():
    """
    Fetch all tasks with employee-specific details such as submission status and comments.
    """
    try:
        tasks = get_all_tasks_with_employee_details()
        return {"tasks": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))