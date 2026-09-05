import os
import hashlib
from typing import Optional, List, Dict, Any
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DATABASE_NAME", "ai_project_mentor_db")

client = None
db = None
users_col = None
blueprints_col = None
progress_col = None

try:
    if MONGO_URI:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.server_info()
        db = client[DB_NAME]
        users_col = db["users"]
        blueprints_col = db["blueprints"]
        progress_col = db["progress_reports"]
        print(" Connected successfully to MongoDB Atlas!")
    else:
        print(" Warning: MONGO_URI is missing in .env file.")
except Exception as e:
    print(f" MongoDB Atlas connection failed: {e}")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def register_user(username: str, email: str, password: str, role: str) -> Dict[str, Any]:
    if users_col is None:
        return {"success": False, "error": "Database unavailable"}
    if users_col.find_one({"email": email}):
        return {"success": False, "error": "User with this email already exists"}
    
    user_doc = {
        "username": username,
        "email": email,
        "password": hash_password(password),
        "role": role,
        "auth_provider": "local"
    }
    users_col.insert_one(user_doc)
    return {"success": True, "user": {"username": username, "email": email, "role": role}}

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    if users_col is None:
        return None
    user = users_col.find_one({"email": email, "password": hash_password(password)})
    if user:
        return {"username": user["username"], "email": user["email"], "role": user.get("role", "Student")}
    return None

def google_sync_user(email: str, name: str, google_id: str, role: str) -> Dict[str, Any]:
    if users_col is None:
        return {"username": name, "email": email, "role": role}
    user = users_col.find_one({"email": email})
    if not user:
        user_doc = {
            "username": name,
            "email": email,
            "google_id": google_id,
            "role": role,
            "auth_provider": "google"
        }
        users_col.insert_one(user_doc)
        return {"username": name, "email": email, "role": role}
    return {"username": user["username"], "email": user["email"], "role": user.get("role", "Student")}

def save_blueprint(blueprint_data: dict) -> bool:
    if blueprints_col is not None:
        blueprints_col.update_one(
            {
                "project_details.name": blueprint_data["project_details"]["name"],
                "user_email": blueprint_data["user_email"]
            },
            {"$set": blueprint_data},
            upsert=True
        )
        return True
    return False

def get_user_blueprints(user_email: str) -> List[dict]:
    if blueprints_col is not None:
        return list(blueprints_col.find({"user_email": user_email}, {"_id": 0}))
    return []

def get_all_blueprints() -> List[dict]:
    if blueprints_col is not None:
        return list(blueprints_col.find({}, {"_id": 0}))
    return []

def update_faculty_status(project_name: str, status: str, comments: str) -> bool:
    if blueprints_col is not None:
        blueprints_col.update_one(
            {"project_details.name": project_name},
            {"$set": {"approval_status": status, "faculty_feedback": comments}}
        )
        return True
    return False