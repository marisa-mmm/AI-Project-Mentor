import json
from backend.agents.llm_client import call_llm

# ==========================================
# 1. DISCOVERY & PROFILER AGENT
# ==========================================
def student_profiler_agent(raw_idea: str) -> dict:
    """Analyzes a 1-2 line raw idea, estimates skill level, and generates adaptive questions."""
    prompt = f"""You are an Expert AI Student Profiler.
Raw Idea: "{raw_idea}"

Task:
1. Classify the user level into: "Beginner", "Intermediate", or "Advanced".
2. Based on the level:
   - If Beginner: Generate 3 simple, non-technical questions (problem, platform, data).
   - If Intermediate: Generate 4 practical technical questions (APIs, framework choice, scope).
   - If Advanced: Generate 5 deep architecture questions (scalability, ML model pipeline, real-time latency).
3. Suggest a formal Academic Project Name and Domain.

Return strictly valid JSON with this exact schema (no markdown fences, no extra text):
{{
  "level": "Beginner | Intermediate | Advanced",
  "suggested_name": "Formal Project Name",
  "suggested_domain": "Domain Name",
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ]
}}"""
    raw_res = call_llm(prompt, system_prompt="You are a strict JSON generator. Return only raw valid JSON.", max_tokens=1000)
    cleaned = raw_res.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)

# ==========================================
# 2. IDEA EVALUATION AGENT
# ==========================================
def idea_evaluation_agent(name: str, domain: str, problem: str) -> str:
    prompt = f"""Evaluate this academic engineering project:
Project Name: {name}
Domain: {domain}
Problem Statement: {problem}

Provide:
1. Core Feasibility (Can a student build this in college?)
2. Real-World Value & Target Users
3. Academic Evaluation Strengths for Final Year Defense"""
    return call_llm(prompt, system_prompt="You are an Academic Project Evaluator. Be direct, structured, and concise.")

# ==========================================
# 3. SCOPE DEFINITION AGENT
# ==========================================
def scope_definition_agent(name: str, problem: str, user_answers: str) -> str:
    prompt = f"""Define clear engineering boundaries for:
Project: {name}
Problem: {problem}
Context from Student: {user_answers}

Provide:
1. Top 5 MVP Functional Features (What must be built)
2. Scope Boundaries (System limits)
3. Non-Goals (Explicit list of features the student should NOT attempt to build to avoid deadline failure)"""
    return call_llm(prompt, system_prompt="You are a Technical Scope Architect.")

# ==========================================
# 4. FULL-STACK TECH ARCHITECT AGENT
# ==========================================
def tech_stack_agent(name: str, domain: str, preferred_tech: str) -> str:
    prompt = f"""Provide a complete full-stack tech recommendation for:
Project: {name} ({domain})
Student Preference: {preferred_tech}

Break down into:
- Frontend (UI/UX framework)
- Backend (API runtime & web server)
- Database (SQL vs NoSQL with justification)
- Real-Time / API Integration (Protocols & libraries)
- ML / AI Tools (Pre-trained models vs custom training)
- Free Deployment Platforms (Zero-cost hosting options)"""
    return call_llm(prompt, system_prompt="You are a Senior Full-Stack Architect.")

# ==========================================
# 5. MERMAID ARCHITECTURE GENERATOR
# ==========================================
def mermaid_architecture_agent(name: str, domain: str) -> str:
    prompt = f"""Generate a Mermaid.js flowchart (graph TD) for the architecture of:
Project: {name} ({domain})

Include: Client UI -> API Gateway/Backend -> Processing/ML Engine -> Database Storage.
Output ONLY the raw Mermaid code inside ```mermaid ... ``` codeblock."""
    return call_llm(prompt, system_prompt="You generate valid Mermaid.js diagrams only.")

# ==========================================
# 6. TIMELINE & MILESTONE AGENT (User Duration Bound)
# ==========================================
def timeline_agent(name: str, duration_months: int) -> str:
    prompt = f"""Create a month-by-month sprint milestone roadmap for:
Project: {name}
Total Duration: {duration_months} Months

Breakdown by month:
- Month 1 to {duration_months}: Concrete deliverables, integration milestones, testing deadlines, and report write-up windows."""
    return call_llm(prompt, system_prompt="You are an Agile Academic Project Manager.")

# ==========================================
# 7. RISK ASSESSMENT AGENT
# ==========================================
def risk_assessment_agent(name: str, domain: str) -> str:
    prompt = f"""Identify top technical risks for:
Project: {name} ({domain})

List:
1. Top 3 Technical Failure Points (e.g., API limits, data scarcity, compute constraints)
2. Practical Fallbacks & Mitigation Strategies for each."""
    return call_llm(prompt, system_prompt="You are a Software Reliability & Risk Specialist.")

# ==========================================
# 8. DOCUMENTATION & THESIS AGENT
# ==========================================
def documentation_agent(name: str, domain: str) -> str:
    prompt = f"""Provide a comprehensive 14-section Thesis / Project Report Outline for:
Project: {name} ({domain})

List chapters from Abstract, Literature Survey, System Architecture, UML, Results, to References."""
    return call_llm(prompt, system_prompt="You are an Academic Documentation Specialist.")

# ==========================================
# 9. WEEKLY PROGRESS TRACKING AGENT
# ==========================================
def progress_tracking_agent(project_name: str, week: int, completed: str, blockers: str) -> str:
    prompt = f"""Analyze this student's weekly project status:
Project: {project_name} | Week: {week}
Completed Work: {completed}
Current Blockers: {blockers}

Provide:
1. Health Status: [ON TRACK] or [AT RISK]
2. Step-by-Step Action Plan to resolve blockers
3. Target tasks for Next Week"""
    return call_llm(prompt, system_prompt="You are a Supportive Academic Mentor.")