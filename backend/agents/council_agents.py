import json
from backend.agents.llm_client import call_llm

def student_profiler_agent(raw_idea: str, user_level: str) -> dict:
    prompt = f"""You are an AI Student Profiler Agent.
Student Level: {user_level}
Idea: "{raw_idea}"

Task:
1. Generate 4 clear questions matching {user_level} skill level:
   - Beginner: (Idea clarity, Simple problem statement, Expected final result, Preferred duration in months).
   - Intermediate: (Specific target tools, Problem nuance, MVP core features, Scope boundaries).
   - Advanced: (System architecture, Model selection, Latency targets, Real-time ingestion).
2. Suggest a formal Project Title and Domain.

Return strictly valid JSON with this exact schema:
{{
  "level": "{user_level}",
  "suggested_name": "Project Name",
  "suggested_domain": "Domain Name",
  "questions": ["Question 1", "Question 2", "Question 3", "Question 4"]
}}"""
    raw_res = call_llm(prompt, system_prompt="You are a strict JSON generator. Return only raw valid JSON.", max_tokens=1500)
    cleaned = raw_res.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)

def master_council_agent(project) -> dict:
    """Executes a unified agent pipeline to prevent 429 quota exhaustion and output truncation."""
    prompt = f"""You are the Master AI Project Council.
Generate an exhaustive, in-depth academic engineering blueprint.

Project Name: {project.name}
Domain: {project.domain}
Duration: {project.duration_months} Months
Technologies: {project.preferred_tech}
Problem Statement: {project.problem_statement}

You must return strictly valid JSON matching this schema:
{{
  "idea_evaluation": "Full evaluation: 1. Academic Feasibility, 2. Core Problem Solved, 3. Target Audience, 4. Innovation Factors.",
  "scope_definition": "1. Objectives, 2. Top 5 MVP Features, 3. Scope Boundaries, 4. Explicit Non-Goals, 5. Deliverables.",
  "technology_stack": "Detailed recommendations with justifications for Language, AI/ML Framework, Database, Backend, Frontend, and Free Deployment.",
  "architecture_diagram": "graph TD\\n  A[Client UI] --> B[FastAPI Gateway]\\n  B --> C[ML/Agent Pipeline]\\n  B --> D[(MongoDB Atlas)]",
  "timeline_milestones": "Month-by-Month breakdown over {project.duration_months} months with Tasks, Deadlines, and Deliverables.",
  "risk_assessment": "Top 3 Technical Risks (Compute, Data, API limits) and Mitigation Strategies.",
  "documentation_plan": "14-Section thesis outline from Abstract to References with complete paragraph summaries for each.",
  "code_starter_pack": "# Starter backend snippet for FastAPI & Streamlit connection",
  "cost_estimation": "Free tier breakdown (Hugging Face Spaces, MongoDB Atlas M0, Render Free, Streamlit Community Cloud) vs production cost."
}}"""
    raw_res = call_llm(prompt, system_prompt="You are a senior academic architect. Return only pure JSON without markdown codeblock wrappers.", max_tokens=8192)
    cleaned = raw_res.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)

def interactive_mentor_agent(project_name: str, context: str, query: str) -> str:
    prompt = f"""You are the Lead Project Advisor for '{project_name}'.
Blueprint Context:
{context}

Student Question:
{query}

Provide a direct, practical, and encouraging engineering answer."""
    return call_llm(prompt, system_prompt="You are an expert, friendly AI thesis mentor.", max_tokens=1500)

def progress_tracking_agent(project_name: str, week: int, completed: str, blockers: str) -> str:
    prompt = f"""Analyze student progress:
Project: {project_name} | Week: {week}
Completed: {completed}
Blockers: {blockers}

Return:
1. Health Status: [ON TRACK] or [AT RISK]
2. Actionable fixes for blockers
3. Sprints for next week"""
    return call_llm(prompt, system_prompt="You are an Agile Academic Mentor.", max_tokens=1500)