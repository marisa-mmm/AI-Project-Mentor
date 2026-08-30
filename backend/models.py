from pydantic import BaseModel, Field
from typing import List, Optional

class RawIdeaInput(BaseModel):
    raw_idea: str = Field(..., description="1-2 sentence initial raw thought from the student")

class StudentProfile(BaseModel):
    level: str = Field(..., description="Beginner, Intermediate, or Advanced")
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

class ProjectBlueprint(BaseModel):
    project_details: ProjectInput
    novelty_score: dict
    idea_evaluation: str
    scope_definition: str
    technology_stack: str
    architecture_diagram: str
    timeline_milestones: str
    risk_assessment: str
    documentation_plan: str
    faculty_feedback: Optional[str] = None
    approval_status: str = "Pending Review"  

class ProgressUpdate(BaseModel):
    project_name: str
    week_number: int
    completed_tasks: str
    blockers: str

class FacultyReviewInput(BaseModel):
    project_name: str
    status: str  
    comments: str