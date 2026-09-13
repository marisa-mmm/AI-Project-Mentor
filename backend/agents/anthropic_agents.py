import os
from dataclasses import dataclass
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()

# Initialize client safely
anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
client = Anthropic(api_key=anthropic_api_key) if anthropic_api_key else None

@dataclass
class Project:
    name: str
    problem: str
    domain: str
    technologies: str
    duration: int

def ask_ai(prompt: str) -> str:
    if not client:
        raise ValueError("ANTHROPIC_API_KEY is not configured in your .env file.")

    response = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=1500,
        messages=[
            {
                "role": "user",
                "content": prompt  # Uses actual prompt variable, not "prompt"
            }
        ]
    )
    return response.content[0].text

def idea_agent(project: Project) -> str:
    prompt = f"""
You are an AI Project Idea Agent.
Analyze this student project:
Project Name: {project.name}
Problem: {project.problem}
Domain: {project.domain}

Tell me:
1. Is this a good academic project?
2. What problem does it solve?
3. Who will use it?
4. What can make the project innovative?

Keep the explanation simple.
"""
    return ask_ai(prompt)

def scope_agent(project: Project) -> str:
    prompt = f"""
You are an AI Project Scope Agent.
Project: {project.name}
Problem: {project.problem}

Define:
1. Project objective
2. 5 important features
3. Project scope
4. What should not be included
5. Expected output

Use simple language.
"""
    return ask_ai(prompt)

def technology_agent(project: Project) -> str:
    prompt = f"""
You are a Technology Selection Agent.
Student Project: {project.name}
Domain: {project.domain}
Current technologies: {project.technologies}

Recommend suitable technologies for this project.
Include:
1. Programming language
2. AI/ML technology
3. Database
4. Backend
5. Frontend
6. Deployment platform

For every technology, explain WHY it is useful.
Keep it beginner friendly.
"""
    return ask_ai(prompt)

def planning_agent(project: Project) -> str:
    prompt = f"""
You are an Academic Project Planning Agent.
Project: {project.name}
Duration: {project.duration} months

Create a project roadmap.
Divide the project into monthly milestones.
For each month provide:
- Month
- Task
- Expected output

Also include testing and final documentation.
"""
    return ask_ai(prompt)

def documentation_agent(project: Project) -> str:
    prompt = f"""
You are a Project Documentation Agent.
Project: {project.name}

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

Explain briefly what should be written in each section.
"""
    return ask_ai(prompt)

def mentor_agent(project: Project, idea: str, scope: str, technology: str, planning: str, documentation: str) -> str:
    prompt = f"""
You are the main AI Academic Project Mentor.
A student is developing:
Project Name: {project.name}
Problem: {project.problem}
Domain: {project.domain}
Technologies: {project.technologies}
Duration: {project.duration} months

You have received reports from several AI agents:

--- IDEA AGENT REPORT ---
{idea}

--- SCOPE AGENT REPORT ---
{scope}

--- TECHNOLOGY AGENT REPORT ---
{technology}

--- PLANNING AGENT REPORT ---
{planning}

--- DOCUMENTATION AGENT REPORT ---
{documentation}

Now create a final mentor report.
The report must contain:
1. Project Evaluation
2. Recommended Objectives
3. Recommended Features
4. Technology Stack
5. Project Roadmap
6. Documentation Plan
7. Risks
8. Suggestions for Improvement
9. Final Recommendation

Give practical advice to the student.
Use simple language.
"""
    return ask_ai(prompt)

def run_anthropic_council(project: Project) -> dict:
    idea = idea_agent(project)
    scope = scope_agent(project)
    tech = technology_agent(project)
    plan = planning_agent(project)
    doc = documentation_agent(project)
    mentor = mentor_agent(project, idea, scope, tech, plan, doc)

    return {
        "idea_evaluation": idea,
        "scope_definition": scope,
        "technology_stack": tech,
        "timeline_milestones": plan,
        "documentation_plan": doc,
        "implementation_guide": mentor
    }