from pymongo import MongoClient
from datetime import datetime
from bson.objectid import ObjectId
from utilities.config import MONGO_URI, DATABASE_NAME
from typing import List, Dict, Any
from bson.objectid import ObjectId



# Setup MongoDB client and database
mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DATABASE_NAME]

tasks_collection = db["tasks"]
employee_tasks_collection = db["employee_tasks"]

def save_task(task_data):
    """
    Save a task to the database and assign it to employees using their email IDs.
    """
    try:
        # Insert the task into the tasks collection
        task_data["completed_count"] = 0  # Initialize completed count
        task_id = tasks_collection.insert_one(task_data).inserted_id

        # Assign tasks to employees
        for email in task_data["assign_to"]:
            employee_tasks_collection.insert_one({
                "task_id": str(task_id),
                "email": email,
                "submitted": False,
                "uploaded_documents": [],
            })

        return str(task_id)
    except Exception as e:
        raise Exception(f"Error saving task: {repr(e)}")

def update_submission_status(task_id, email, uploaded_files, comments):
    """
    Update submission status for an employee's task, including comments.
    """
    try:
        # Update the employee task as submitted with comments
        employee_tasks_collection.update_one(
            {"task_id": task_id, "email": email},
            {
                "$set": {
                    "submitted": True,
                    "uploaded_documents": uploaded_files,
                    "comments": comments,
                }
            }
        )

        # Update completed count in the task collection
        completed_count = employee_tasks_collection.count_documents({"task_id": task_id, "submitted": True})
        tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"completed_count": completed_count}}
        )
    except Exception as e:
        raise Exception(f"Error updating submission status: {repr(e)}")


def get_tasks_for_employee_with_details(email: str):
    """
    Retrieve all tasks assigned to a specific employee using their email,
    including additional task details from the tasks collection.
    """
    try:
        # Fetch tasks assigned to the employee
        employee_tasks = employee_tasks_collection.find({"email": email})
        if not employee_tasks:
            return []

        result = []
        for employee_task in employee_tasks:
            task_id = employee_task["task_id"]
            task_details = tasks_collection.find_one({"_id": ObjectId(task_id)})

            if not task_details:
                continue  # Skip if task details are not found

            result.append({
                "task_id": str(task_id),
                "task_name": task_details.get("task_name", ""),
                "task_description": task_details.get("task_description", ""),
                "task_document": task_details.get("task_document", ""),
                "deadline": task_details.get("deadline", ""),
                "no_of_documents_required": task_details.get("no_of_documents_required", 0),
                "submitted": employee_task.get("submitted", False),
                "uploaded_documents": employee_task.get("uploaded_documents", []),
            })

        return result
    except Exception as e:
        raise Exception(f"Error retrieving tasks with details: {repr(e)}")
    

def get_all_tasks_with_employee_details():
    """
    Retrieve all tasks from the tasks collection.
    """
    try:
        # Fetch all tasks
        tasks = list(tasks_collection.find())  # Convert cursor to list

        # Prepare task details
        result = []
        for task in tasks:
            task_id = str(task["_id"])  # Convert ObjectId to string
            assigned_employees = list(employee_tasks_collection.find({"task_id": task_id}))
            employee_details = []
            for employee in assigned_employees:
                employee_details.append({
                    "email": employee["email"],
                    "submitted": employee["submitted"],
                    "comments": employee.get("comments", ""),  # Include comments if available
                    "uploaded_documents": employee.get("uploaded_documents", []),
                })

            result.append({
                  "task_id": task_id,
                "task_name": task.get("task_name", ""),
                "task_description": task.get("task_description", ""),
                "task_document": task.get("task_document", ""),
                "deadline": task.get("deadline", ""),
                "no_of_documents_required": task.get("no_of_documents_required", 0),
                "completed_count": task.get("completed_count", 0),
                "assign_to": task.get("assign_to", []),
                "employee_details": employee_details,  # List of employee-specific details
            })

        return result
    except Exception as e:
        raise Exception(f"Error fetching tasks: {repr(e)}")
