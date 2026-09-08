from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.models import (
    UserRegisterInput,
    UserLoginInput,
    RawIdeaInput,
    ProjectInput,
    ProgressUpdate,
    FacultyReviewInput,
    MentorChatInput
)
import backend.database as database
import backend.agents.llm_client as llm_client
import backend.agents.council_agents as council_agents

app = FastAPI(title="AI Project Mentor API", version="3.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "online", "system": "AI Project Mentor & Academic Council"}

@app.post("/api/auth/register")
async def register(payload: UserRegisterInput):
    res = database.register_user(payload.username, payload.email, payload.password, payload.role)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Registration failed"))
    return res

@app.post("/api/auth/login")
async def login(payload: UserLoginInput):
    user = database.authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"success": True, "user": user}

@app.post("/api/start-discovery")
async def start_discovery(payload: RawIdeaInput):
    try:
        return council_agents.student_profiler_agent(payload.raw_idea, payload.level)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-blueprint")
async def generate_blueprint(payload: ProjectInput, level: str = "Beginner"):
    try:
        council_data = council_agents.master_council_agent(payload, level=level)

        all_blueprints = database.get_all_blueprints()
        corpus = [
            b.get("project_details", {}).get("problem_statement", "")
            for b in all_blueprints if b.get("project_details", {}).get("problem_statement")
        ]
        novelty = llm_client.compute_novelty(payload.problem_statement, corpus)

        blueprint_doc = {
            "user_email": payload.user_email,
            "project_details": payload.model_dump(),
            "skill_level": level,
            "novelty_score": novelty,
            "idea_evaluation": council_data.get("idea_evaluation", ""),
            "scope_definition": council_data.get("scope_definition", ""),
            "technology_stack": council_data.get("technology_stack", ""),
            "architecture_diagram": council_data.get("architecture_diagram", ""),
            "timeline_milestones": council_data.get("timeline_milestones", ""),
            "risk_assessment": council_data.get("risk_assessment", ""),
            "documentation_plan": council_data.get("documentation_plan", ""),
            "implementation_guide": council_data.get("implementation_guide", ""),
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "approval_status": "Pending Review",
            "faculty_feedback": ""
        }

        database.save_blueprint(blueprint_doc)
        return blueprint_doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.get("/api/user/history")
async def get_history(email: str):
    return database.get_user_blueprints(email)

@app.post("/api/mentor/chat")
async def mentor_chat(payload: MentorChatInput):
    try:
        reply = council_agents.interactive_mentor_agent(payload.project_name, payload.context, payload.query)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/track-progress")
async def track_progress(payload: ProgressUpdate):
    try:
        analysis = council_agents.progress_tracking_agent(
            payload.project_name, payload.week_number, payload.completed_tasks, payload.blockers
        )
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/faculty/blueprints")
async def get_faculty_blueprints():
    return database.get_all_blueprints()

@app.post("/api/faculty/review")
async def submit_faculty_review(payload: FacultyReviewInput):
    success = database.update_faculty_status(payload.project_name, payload.status, payload.comments)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True}