from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class UserRegisterInput(BaseModel):
    username: str
    email: str
    password: str
    role: str = "Student"  # 'Student' or 'Faculty'

class UserLoginInput(BaseModel):
    email: str
    password: str

class GoogleAuthInput(BaseModel):
    email: str
    name: str
    google_id: str
    role: str = "Student"

class RawIdeaInput(BaseModel):
    raw_idea: str
    level: str = "Beginner"

class StudentProfile(BaseModel):
    level: str
    suggested_name: str
    suggested_domain: str
    questions: List[str]

class ProjectInput(BaseModel):
    name: str
    domain: str
    duration_months: int
    target_role: str = "Full-Stack AI Engineer"
    problem_statement: str
    preferred_tech: Optional[str] = "Open to recommendation"
    user_email: str

class ProjectBlueprint(BaseModel):
    user_email: str
    project_details: ProjectInput
    novelty_score: dict
    idea_evaluation: str
    scope_definition: str
    technology_stack: str
    architecture_diagram: str
    timeline_milestones: str
    risk_assessment: str
    documentation_plan: str
    code_starter_pack: str
    cost_estimation: str
    created_at: str
    approval_status: str = "Pending Review"
    faculty_feedback: Optional[str] = ""

class ProgressUpdate(BaseModel):
    project_name: str
    user_email: str
    week_number: int
    completed_tasks: str
    blockers: str

class FacultyReviewInput(BaseModel):
    project_name: str
    status: str
    comments: str

class MentorChatInput(BaseModel):
    project_name: str
    query: str
    context: str