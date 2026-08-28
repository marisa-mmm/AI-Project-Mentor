from pydantic import BaseModel, Field
from typing import Dict, Any

class ProjectInput(BaseModel):
    name: str = Field(..., example="AccessMeet")
    problem: str = Field(..., example="Deaf individuals face communication barriers in virtual calls.")
    domain: str = Field(..., example="Computer Vision / AI")
    technologies: str = Field(..., example="Python, FastAPI, YOLO, Streamlit, MongoDB")
    duration_months: int = Field(default=4, ge=1, le=12)

class WeeklyUpdateInput(BaseModel):
    project_name: str
    week_number: int
    tasks_completed: str
    current_blockers: str

class MasterBlueprint(BaseModel):
    project_details: ProjectInput
    idea_evaluation: str
    scope_definition: str
    technology_stack: str
    timeline_milestones: str
    risk_assessment: str
    viva_prep: str
    architecture_diagram: str
    novelty_score: Dict[str, Any]
    documentation_plan: str
    final_mentor_verdict: str