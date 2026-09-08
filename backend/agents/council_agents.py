import json
from backend.agents.llm_client import call_llm

def student_profiler_agent(raw_idea: str, user_level: str) -> dict:
    """Generates non-redundant clarifying questions without repeating the duration slider."""
    prompt = f"""You are an Expert AI Student Profiler.
The student has selected level: "{user_level}".
Project Idea: "{raw_idea}"

Task:
1. Generate exactly 3 targeted clarifying questions based on skill level:
   - If Beginner: Ask 3 simple, non-technical questions (Core goal/purpose, Who will use it, Expected final screen/output). Do NOT ask about duration or deadlines.
   - If Intermediate: Ask 3 practical questions (Key MVP features, External APIs or datasets needed, User workflow). Do NOT ask about duration.
   - If Advanced: Ask 3 technical architecture questions (Model pipeline/latency, Data ingestion/caching, Scalability & deployment constraints). Do NOT ask about duration.
2. Suggest an Academic Project Name and Domain.

Return strictly valid JSON with this schema (no markdown fences):
{{
  "level": "{user_level}",
  "suggested_name": "Academic Project Name",
  "suggested_domain": "Domain Name",
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ]
}}"""
    raw_res = call_llm(prompt, system_prompt="You are a strict JSON generator. Return only valid JSON.", max_tokens=1000)
    cleaned = raw_res.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)

def master_council_agent(project, level: str = "Beginner") -> dict:
    """Executes the AI Council in a single call, strictly formatted by competence level."""
    
    level_instruction = {
        "Beginner": "Use very simple, easy-to-understand words. Avoid overwhelming technical jargon. Keep explanations clear, encouraging, and focused on basic concepts.",
        "Intermediate": "Use standard software engineering terms. Focus on practical implementation details, REST APIs, clean database schema design, and modular code architecture.",
        "Advanced": "Provide deep technical rigor. Cover distributed microservices, model inference optimization, latency trade-offs, vector search indexing, and CI/CD security."
    }.get(level, "Use simple and practical language.")

    prompt = f"""You are the Master AI Academic Project Council.
Audience Level: {level.upper()}
Tone & Vocabulary Rule: {level_instruction}

Project Details:
- Name: {project.name}
- Domain: {project.domain}
- Duration: {project.duration_months} Months
- Student Preference / Stack: {project.preferred_tech}
- Problem Statement & Answers: {project.problem_statement}

Simulate all council agents and generate clean, well-formatted, line-spaced academic responses.
Do NOT bundle answers into one single dense paragraph. Use sub-bullets and numbered lists.

Return strictly valid JSON with this exact schema:
{{
  "idea_evaluation": "### 1. Academic Feasibility\\nDetailed evaluation here...\\n\\n### 2. Core Problem Solved\\nClear explanation of problem...\\n\\n### 3. Target Audience & Users\\nWho will use this...\\n\\n### 4. Key Innovation Factors\\nWhat makes this project stand out...",
  "scope_definition": "### 1. Project Objective\\nClear objective statement...\\n\\n### 2. Top 5 MVP Features\\n- Feature 1: Description\\n- Feature 2: Description\\n- Feature 3: Description\\n- Feature 4: Description\\n- Feature 5: Description\\n\\n### 3. Scope Boundaries\\nWhat the system covers...\\n\\n### 4. Explicit Non-Goals (What NOT to build)\\n- Non-Goal 1: Why it should be avoided\\n- Non-Goal 2: Why it should be avoided\\n\\n### 5. Expected Output & Deliverables\\nWhat will be submitted at the end...",
  "technology_stack": "### Recommended Full-Stack Architecture\\nRecommend the best tools tailored for this project with the exact reason WHY each is chosen:\\n- **Programming Language**: [Name] - *Why*: [Reason]\\n- **AI/ML Technology / Model**: [Name] - *Why*: [Reason]\\n- **Database**: [Name] - *Why*: [Reason]\\n- **Backend Framework**: [Name] - *Why*: [Reason]\\n- **Frontend Framework**: [Name] - *Why*: [Reason]\\n- **Free Deployment Platforms**: [Name] - *Why*: [Reason]",
  "architecture_diagram": "graph TD\\n    A[Client UI - Streamlit] --> B[FastAPI Gateway]\\n    B --> C[AI / Processing Pipeline]\\n    B --> D[(MongoDB Atlas)]",
  "timeline_milestones": "### {project.duration_months}-Month Milestone Roadmap\\nProvide a clear month-by-month sprint breakdown for all {project.duration_months} months with Task, Testing, and Deliverable for each month.",
  "risk_assessment": "### 1. Technical Risks & Failure Points\\n- **Risk 1**: Details...\\n- **Risk 2**: Details...\\n- **Risk 3**: Details...\\n\\n### 2. Fallbacks & Mitigation Plans\\n- **Mitigation 1**: Action...\\n- **Mitigation 2**: Action...\\n- **Mitigation 3**: Action...",
  "documentation_plan": "### 14-Section University Thesis Outline\\n1. **Abstract**: Summary...\\n2. **Introduction**: Background...\\n3. **Problem Statement**: Nuance...\\n4. **Objectives**: Goals...\\n5. **Literature Review**: Existing works...\\n6. **Methodology**: Flow...\\n7. **System Architecture**: Diagrams...\\n8. **Technologies**: Stack...\\n9. **Implementation**: Coding details...\\n10. **Testing & Validation**: Test cases...\\n11. **Results & Discussions**: Metrics...\\n12. **Future Scope**: Extensions...\\n13. **Conclusion**: Wrap-up...\\n14. **References**: IEEE style references...",
  "implementation_guide": "### Phase 1: Environment Setup\\n```bash\\npip install fastapi uvicorn pymongo streamlit\\n```\\n\\n### Phase 2: Core Logic Implementation\\nStep-by-step code files needed...\\n\\n### Phase 3: Integration & Testing\\nHow to run and verify..."
}}"""

    raw_res = call_llm(prompt, system_prompt="You are a strict JSON generator. Return only raw valid JSON without markdown wrapping.", max_tokens=8192)
    cleaned = raw_res.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)

def progress_tracking_agent(project_name: str, week: int, completed: str, blockers: str) -> str:
    prompt = f"""Analyze this student's weekly project status:
Project: {project_name} | Week: {week}
Completed Tasks: {completed}
Blockers Encountered: {blockers}

Provide:
1. Health Status: [ON TRACK] or [AT RISK]
2. Step-by-Step Action Plan to resolve blockers
3. Recommended Sprints for Next Week"""
    return call_llm(prompt, system_prompt="You are an encouraging Academic Project Mentor.", max_tokens=1500)

def interactive_mentor_agent(project_name: str, context: str, query: str) -> str:
    prompt = f"""You are the Lead Academic Project Mentor for '{project_name}'.
Project Context:
{context}

Student Question:
{query}

Provide a practical, step-by-step, and encouraging explanation."""
    return call_llm(prompt, system_prompt="You are a supportive AI thesis mentor.", max_tokens=1500)