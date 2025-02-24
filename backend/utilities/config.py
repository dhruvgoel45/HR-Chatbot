import os
from dotenv import load_dotenv
import chromadb
from motor.motor_asyncio import AsyncIOMotorClient
from chromadb.config import Settings

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
LLAMA_CLOUD_API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")

chroma_client = chromadb.Client(
    Settings(chroma_db_impl="duckdb+parquet", persist_directory="db/")
)

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = "hrnexus99ad@gmail.com"
SMTP_PASSWORD = "ghfnxnovjtsoefas"

REDIS_URL = "redis://localhost:6379"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]

# Function to print all collections in the database
async def print_collections():
    collections = await db.list_collection_names()
    print("Collections in the database:", collections)