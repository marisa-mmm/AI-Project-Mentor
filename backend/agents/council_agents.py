import json
from backend.agents.llm_client import call_llm

def student_profiler_agent(raw_idea: str) -> dict:
    """Analyzes raw idea and selected level to generate tailored questions."""
    prompt = f"""You are an Expert AI Student Profiler.
Input from student: "{raw_idea}"

Task:
1. Determine or reflect the user level into: "Beginner", "Intermediate", or "Advanced".
2. Generate targeted questions matching the competence level:
   - If Beginner: Ask 4 simple questions covering (1. Core Idea clarity, 2. Problem Statement, 3. Expected Outcome, 4. Preferred Duration in months).
   - If Intermediate: Ask 5 practical questions covering (1. Detailed Idea, 2. Preferred Technologies/Languages, 3. Expected Outcome, 4. Preferred Duration, 5. Scope boundaries/Limits).
   - If Advanced: Ask 5 deep questions covering (1. System Architecture & Model Pipeline, 2. Production Technologies, 3. Sub-domain specialization, 4. Expected Outcome/Metrics, 5. Timeline Duration).
3. Suggest a formal Academic Project Name and Domain.

Return strictly valid JSON with this exact schema (no markdown fences, no extra text):
{{
  "level": "Beginner | Intermediate | Advanced",
  "suggested_name": "Formal Project Name",
  "suggested_domain": "Domain Name",
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4"
  ]
}}"""
    raw_res = call_llm(prompt, system_prompt="You are a strict JSON generator. Return only raw valid JSON.", max_tokens=1000)
    cleaned = raw_res.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)

def idea_agent(project) -> str:
    prompt = f"""You are an AI Project Idea Agent.
Analyze this student project:
Project Name:
{project.name}
Problem:
{project.problem_statement}
Domain:
{project.domain}

Tell me:
1. Is this a good academic project?
2. What problem does it solve?
3. Who will use it?
4. What can make the project innovative?

Keep the explanation simple."""
    return call_llm(prompt, system_prompt="You are an Academic Project Idea Evaluator. Keep explanations simple.")

def scope_agent(project) -> str:
    prompt = f"""You are an AI Project Scope Agent.
Project:
{project.name}
Problem:
{project.problem_statement}

Define:
1. Project objective
2. 5 important features
3. Project scope
4. What should not be included (Non-goals)
5. Expected output

Use simple language."""
    return call_llm(prompt, system_prompt="You are an Academic Scope Specialist.")

def technology_agent(project) -> str:
    prompt = f"""You are a Technology Selection Agent.
Student Project:
{project.name}
Domain:
{project.domain}
Current technologies:
{project.preferred_tech}

Recommend suitable technologies for this project.
Include:
1. Programming language
2. AI/ML technology
3. Database
4. Backend
5. Frontend
6. Deployment platform

For every technology, explain WHY it is useful.
Keep it beginner friendly."""
    return call_llm(prompt, system_prompt="You are a Senior Technology Advisor.")

def mermaid_architecture_agent(project) -> str:
    prompt = f"""Generate a clean Mermaid.js flowchart (graph TD) for the architecture of:
Project: {project.name}
Domain: {project.domain}
Tech Stack: {project.preferred_tech}

Include: Client UI -> API Backend -> Core Engine / ML -> Database.
Output ONLY the raw Mermaid code block."""
    return call_llm(prompt, system_prompt="You generate valid Mermaid.js diagrams only.")

def planning_agent(project) -> str:
    prompt = f"""You are an Academic Project Planning Agent.
Project:
{project.name}
Duration:
{project.duration_months} Months

Create a project roadmap.
Divide the project into monthly milestones across {project.duration_months} months.
For each month provide:
- Month Number
- Task
- Expected output

Also include testing and final documentation deadlines."""
    return call_llm(prompt, system_prompt="You are an Agile Academic Project Manager.")

def risk_agent(project) -> str:
    prompt = f"""You are a Project Risk Management Agent.
Project:
{project.name}
Domain:
{project.domain}

List:
1. Top 3 Technical Failure Points (e.g., rate limits, compute constraints, lack of dataset)
2. Simple Fallbacks & Mitigation Steps for each."""
    return call_llm(prompt, system_prompt="You are a Technical Risk Analyst.")

def documentation_agent(project) -> str:
    prompt = f"""You are a Project Documentation Agent.
Project:
{project.name}

Create a Documentation structure.
Include:
1. Abstract
2. Introduction
3. Problem Statement
4. Objectives
5. Literature Review
6. Methodology
7. System Architecture
8. Technologies
9. Implementation
10. Testing
11. Results
12. Future Scope
13. Conclusion
14. References

Explain briefly what should be written in each section."""
    return call_llm(prompt, system_prompt="You are an Academic Documentation Specialist.")

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