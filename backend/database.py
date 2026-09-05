import os
from typing import Optional, List
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DATABASE_NAME", "ai_project_mentor_db")

client = None
db = None
blueprints_collection = None
progress_collection = None

try:
    if MONGO_URI:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.server_info()
        db = client[DB_NAME]
        blueprints_collection = db["blueprints"]
        progress_collection = db["progress_reports"]
        print(" Connected successfully to MongoDB Atlas!")
    else:
        print(" Warning: MONGO_URI is missing in .env file.")
except Exception as e:
    print(f" MongoDB Atlas connection failed: {e}")
    client = None
    db = None

# --- Database Operations (CRUD) ---

def save_blueprint(blueprint_data: dict) -> bool:
    """Inserts or updates a student project blueprint."""
    if blueprints_collection is not None:
        blueprints_collection.update_one(
            {"project_details.name": blueprint_data["project_details"]["name"]},
            {"$set": blueprint_data},
            upsert=True
        )
        return True
    return False

def get_blueprint(project_name: str) -> Optional[dict]:
    """Retrieves a single blueprint by project name."""
    if blueprints_collection is not None:
        return blueprints_collection.find_one({"project_details.name": project_name}, {"_id": 0})
    return None

def get_all_blueprints() -> List[dict]:
    """Retrieves all student blueprints for the Faculty Dashboard."""
    if blueprints_collection is not None:
        return list(blueprints_collection.find({}, {"_id": 0}))
    return []

def update_faculty_status(project_name: str, status: str, comments: str) -> bool:
    """Allows mentors/faculty to approve blueprints and append feedback."""
    if blueprints_collection is not None:
        blueprints_collection.update_one(
            {"project_details.name": project_name},
            {"$set": {"approval_status": status, "faculty_feedback": comments}}
        )
        return True
    return False