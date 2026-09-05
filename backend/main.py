import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.models import (
    RawIdeaInput,
    ProjectInput,
    ProgressUpdate,
    FacultyReviewInput
)
import backend.database as database
import backend.agents.llm_client as llm_client
import backend.agents.council_agents as council_agents

app = FastAPI(
    title="AI Project Mentor & Academic Council API",
    version="2.0.0",
    description="Adaptive Multi-Agent Project Planning and Faculty Evaluation System"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "running", "engine": "gemini-2.5-flash", "db_connected": database.client is not None}

# --- 1. Discovery Endpoint ---
@app.post("/api/start-discovery")
async def start_discovery(payload: RawIdeaInput):
    try:
        profile = council_agents.student_profiler_agent(payload.raw_idea)
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Discovery failed: {str(e)}")

# --- 2. Master Blueprint Generation ---
@app.post("/api/generate-blueprint")
async def generate_blueprint(payload: ProjectInput):
    try:
        # Paced execution to stay well within free-tier rate limits
        idea_eval = council_agents.idea_agent(payload)
        await asyncio.sleep(1.2)
        
        scope_def = council_agents.scope_agent(payload)
        await asyncio.sleep(1.2)
        
        tech_stack = council_agents.technology_agent(payload)
        await asyncio.sleep(1.2)
        
        arch_diagram = council_agents.mermaid_architecture_agent(payload)
        await asyncio.sleep(1.2)
        
        timeline = council_agents.planning_agent(payload)
        await asyncio.sleep(1.2)
        
        risk = council_agents.risk_agent(payload)
        await asyncio.sleep(1.2)
        
        docs = council_agents.documentation_agent(payload)

        # Vector Novelty Calculation
        existing_blueprints = database.get_all_blueprints()
        reference_corpus = [
            b.get("project_details", {}).get("problem_statement", "") 
            for b in existing_blueprints if b.get("project_details", {}).get("problem_statement")
        ]
        novelty = llm_client.compute_novelty(payload.problem_statement, reference_corpus)

        blueprint = {
            "project_details": payload.model_dump(),
            "novelty_score": novelty,
            "idea_evaluation": idea_eval,
            "scope_definition": scope_def,
            "technology_stack": tech_stack,
            "architecture_diagram": arch_diagram,
            "timeline_milestones": timeline,
            "risk_assessment": risk,
            "documentation_plan": docs,
            "faculty_feedback": "",
            "approval_status": "Pending Review"
        }

        database.save_blueprint(blueprint)
        return blueprint

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline Execution Failed: {str(e)}")

# --- 3. Weekly Progress Endpoint ---
@app.post("/api/track-progress")
async def track_progress(payload: ProgressUpdate):
    try:
        feedback = council_agents.progress_tracking_agent(
            payload.project_name,
            payload.week_number,
            payload.completed_tasks,
            payload.blockers
        )
        return {"analysis": feedback}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. Faculty Endpoints ---
@app.get("/api/faculty/blueprints")
async def get_faculty_blueprints():
    try:
        return database.get_all_blueprints()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/faculty/review")
async def submit_faculty_review(payload: FacultyReviewInput):
    try:
        success = database.update_faculty_status(payload.project_name, payload.status, payload.comments)
        if not success:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"status": "success", "message": "Review updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))