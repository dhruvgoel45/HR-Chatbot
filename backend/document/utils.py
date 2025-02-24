from pymongo import MongoClient
from datetime import datetime
import uuid
from llama_parse import LlamaParse
from utilities.config import LLAMA_CLOUD_API_KEY, chroma_client, MONGO_URI , DATABASE_NAME
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from utilities.responses import success_response, error_response

# Setup MongoDB client and database
mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DATABASE_NAME]  # Replace with your database name
documents_collection = db["documentsuploaded"]  


def save_document(file_path, file_name, document_name, category, effective_date, description):
    try:
        # Parse document content
        llama_parse_documents = LlamaParse(
            result_type="markdown", api_key=LLAMA_CLOUD_API_KEY
        ).load_data(file_path)
        embedding = OpenAIEmbeddings()
        docs_content = llama_parse_documents[0].get_content()

        # Generate metadata
        document_id = str(uuid.uuid4())
        metadata = {
            "document_id": document_id,
            "source": file_name,
            "uploaded_at": datetime.now().isoformat(),
            "document_name": document_name,
            "category": category,
            "effective_date": effective_date,
            "description": description,
        }

        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        text_chunks = text_splitter.split_text(docs_content)

        # Store embeddings in ChromaDB with metadata
        chroma_instance = Chroma(
            embedding_function=embedding,
            client=chroma_client,
            persist_directory="db/",
        )

        chroma_instance.add_texts(
            texts=text_chunks,
            metadatas=[metadata] * len(text_chunks),
        )
        chroma_instance.persist()

        # Generate a relative file path link for storage
        file_link = f"/media/{file_name}"

        # Store document info in MongoDB
        document_info = {
            "document_id": str(document_id),
            "file_name": str(file_name),
            "document_name": document_name,
            "category": category,
            "effective_date": effective_date,
            "description": description,
            "uploaded_at": str(metadata["uploaded_at"]),
            "file_link": file_link,
        }

        inserted_id = documents_collection.insert_one(document_info).inserted_id
        document_info["_id"] = str(inserted_id)  # Convert ObjectId to string

        return success_response(
            msg="File uploaded successfully",
            data=document_info,
        )
    except Exception as e:
        print(repr(e))
        return error_response(msg="Failed", exception=e)
