from pymongo import MongoClient
from utilities.config import MONGO_URI, DATABASE_NAME

# Initialize MongoDB client
mongo_client = MongoClient(MONGO_URI)

# Access the database and collection
db = mongo_client[DATABASE_NAME]
documents_collection = db["documentsuploaded"]
BASE_URL = "http://localhost:8000/media"  # Adjust the URL to match your production environment


def fetch_all_documents():
    try:
        documents = documents_collection.find()  # Fetch all documents from the collection
        document_list = []

        for doc in documents:
            file_name = doc.get("file_name", "Unknown")
            document_list.append({
                "id": str(doc.get("_id", "")),  # Convert ObjectId to string
                "file_name": file_name,
                "document_id": doc.get("document_id", "Unknown"),
                "uploaded_at": doc.get("uploaded_at", "Unknown"),
                "document_name": doc.get("document_name", "Unknown"),  # New field
                "category": doc.get("category", "Unknown"),  # New field
                "effective_date": doc.get("effective_date", "Unknown"),  # New field
                "description": doc.get("description", "Unknown"),  # New field
                "file_link": f"{BASE_URL}/{file_name}"  # Create the clickable link
            })

        return document_list
    except Exception as e:
        print(repr(e))
        raise
