import os
import hashlib
from typing import Optional, List, Dict, Any
from pymongo import MongoClient
import certifi
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
        client = MongoClient(
            MONGO_URI,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=10000
        )
        client.admin.command('ping')
        db = client[DB_NAME]
        users_col = db["users"]
        blueprints_col = db["blueprints"]
        progress_col = db["progress_reports"]
        print(" Connected successfully to MongoDB Atlas via Secure TLS!")
    else:
        print(" Warning: MONGO_URI is missing in .env file.")
except Exception as e:
    print(f" MongoDB Atlas connection failed: {e}")
    client = None
    db = None
    users_col = None
    blueprints_col = None
    progress_col = None


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def register_user(username: str, email: str, password: str, role: str) -> Dict[str, Any]:
    if users_col is None:
        return {"success": False, "error": "Database connection is not active. Check Atlas network/IP whitelist."}
    
    clean_email = email.strip().lower()
    if users_col.find_one({"email": clean_email}):
        return {"success": False, "error": "User with this email already exists"}
    
    user_doc = {
        "username": username.strip(),
        "email": clean_email,
        "password": hash_password(password),
        "role": role,
        "auth_provider": "local"
    }
    users_col.insert_one(user_doc)
    return {"success": True, "user": {"username": username, "email": clean_email, "role": role}}


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    if users_col is None:
        return None
    
    clean_email = email.strip().lower()
    user = users_col.find_one({"email": clean_email, "password": hash_password(password)})
    if user:
        return {"username": user["username"], "email": user["email"], "role": user.get("role", "Student")}
    return None


def google_sync_user(email: str, name: str, google_id: str, role: str) -> Dict[str, Any]:
    if users_col is None:
        return {"username": name, "email": email, "role": role}
    
    clean_email = email.strip().lower()
    user = users_col.find_one({"email": clean_email})
    if not user:
        user_doc = {
            "username": name,
            "email": clean_email,
            "google_id": google_id,
            "role": role,
            "auth_provider": "google"
        }
        users_col.insert_one(user_doc)
        return {"username": name, "email": clean_email, "role": role}
    return {"username": user["username"], "email": user["email"], "role": user.get("role", "Student")}


def save_blueprint(blueprint_data: dict) -> bool:
    if blueprints_col is None:
        return False

    # Extract name safely from nested project_details or top-level fallback
    details = blueprint_data.get("project_details") or {}
    project_name = details.get("name") or blueprint_data.get("name") or "Academic Project"
    user_email = (blueprint_data.get("user_email") or "").strip().lower()

    # Ensure project_details always holds the resolved name
    if "project_details" not in blueprint_data or not isinstance(blueprint_data["project_details"], dict):
        blueprint_data["project_details"] = details
    blueprint_data["project_details"]["name"] = project_name

    blueprints_col.update_one(
        {
            "project_details.name": project_name,
            "user_email": user_email
        },
        {"$set": blueprint_data},
        upsert=True
    )
    return True


def get_user_blueprints(user_email: str) -> List[dict]:
    if blueprints_col is not None:
        return list(blueprints_col.find({"user_email": user_email.strip().lower()}, {"_id": 0}))
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