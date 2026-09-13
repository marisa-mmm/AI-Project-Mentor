import io
import os
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from docx import Document

from backend import database

load_dotenv()

app = FastAPI(title="AI Project Mentor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')
else:
    gemini_model = None

def clean_output(text: str) -> str:
    if not text:
        return ""
    cleaned = re.sub(r'^[ \t]*#{1,6}[ \t]*', '', text, flags=re.MULTILINE)
    return cleaned.strip()

def query_ai(prompt: str, fallback: str = "Detailed report is being compiled.") -> str:
    if not gemini_model:
        return fallback
    try:
        response = gemini_model.generate_content(prompt)
        text = response.text if response and response.text else fallback
        return clean_output(text)
    except Exception as e:
        print(f"Gemini query error: {e}")
        return f"{fallback}\n\nTechnical Error: {str(e)}"

# DOMAIN AUTO-DETECTOR
def detect_project_domain(name: str, problem: str) -> str:
    prompt = f"""
Analyze this engineering project idea and extract the primary technical/academic domain in 2 to 4 words.
Examples: "Computer Vision & Healthcare", "FinTech & Secure Banking", "IoT & Embedded Systems", "Educational Technology", "Natural Language Processing", "Autonomous Robotics".

Project Name: {name}
Problem Statement: {problem}

Reply ONLY with the concise domain title and nothing else.
"""
    detected = query_ai(prompt, fallback="Applied Software Engineering")
    cleaned = detected.replace('"', '').replace("'", "").replace(".", "").strip()
    return cleaned if cleaned else "Applied Software Engineering"

# AGENT 1: IDEA EVALUATION
def run_idea_agent(name: str, problem: str, domain: str) -> str:
    prompt = f"""
You are a Senior Academic Project Evaluator.
Analyze this university student project:
Project Name: {name}
Problem Statement: {problem}
Domain: {domain}

Provide an in-depth, professional evaluation.
CRITICAL RULE: Do NOT use markdown hashtags (#, ##, ###).
Format your response using the following bold sections:

**1. Academic Feasibility & Merit**
Provide a comprehensive paragraph assessing the project's technical rigor, scope suitability for a student semester, and engineering relevance.

**2. Core Problem Solved**
Detail the real-world bottleneck or inefficiency addressed, contrasting it with why traditional methods fall short.

**3. Target Stakeholders & End-Users**
List specific user groups, beneficiaries, and administrative stakeholders who interact with this system.

**4. Key Innovation Factors**
Provide at least 3 distinct innovative features or architectural decisions that elevate this project beyond generic tutorials.
"""
    return query_ai(prompt)

# AGENT 2: PROJECT SCOPE
def run_scope_agent(name: str, problem: str) -> str:
    prompt = f"""
You are a Principal Software Project Lead and Scope Architect.
Project: {name}
Problem: {problem}

Define the strict functional scope.
CRITICAL RULE: Do NOT use markdown hashtags (#, ##, ###).
Format your response using the following bold sections:

**1. Primary Project Objectives**
State 3 to 4 specific, measurable engineering goals.

**2. Top 5 MVP Features**
List and detail the 5 essential software features:
* **Feature 1**: Description, functionality, and user interaction.
* **Feature 2**: Description, functionality, and user interaction.
* **Feature 3**: Description, functionality, and user interaction.
* **Feature 4**: Description, functionality, and user interaction.
* **Feature 5**: Description, functionality, and user interaction.

**3. In-Scope Technical Boundaries**
List the exact technical workflows, APIs, and client-server interactions included.

**4. Explicit Non-Goals (What NOT to Build)**
State at least 3 complex features that will purposely NOT be built to maintain timeline integrity.

**5. Expected Output & Deliverables**
List the runnable software modules, documentation, and database schemas delivered.
"""
    return query_ai(prompt)

# AGENT 3: TECH STACK
def run_technology_agent(name: str, domain: str, problem: str) -> str:
    prompt = f"""
You are an Enterprise Software Architect.
Project: {name}
Domain: {domain}
Problem: {problem}

Recommend a complete, production-ready stack.
CRITICAL RULE: Do NOT use markdown hashtags (#, ##, ###).
For every technology, explain WHY it was chosen in depth on the same bullet line.

Format exactly like this:
* **Programming Language**: [Technology Name] - **Why**: [2-3 detailed sentences explaining performance, ecosystem, and suitability]
* **AI/ML Technology & Models**: [Technology Name] - **Why**: [2-3 detailed sentences explaining reasoning capability, speed, and API economics]
* **Database Layer**: [Technology Name] - **Why**: [2-3 detailed sentences explaining data models, indexing, and scalability]
* **Backend Framework**: [Technology Name] - **Why**: [2-3 detailed sentences explaining asynchronous speed, endpoint routing, and validation]
* **Frontend Framework**: [Technology Name] - **Why**: [2-3 detailed sentences explaining modular component reusability and rendering speed]
* **Hosting & Deployment**: [Technology Name] - **Why**: [2-3 detailed sentences explaining academic zero-cost tiers and CI/CD pipelines]
"""
    return query_ai(prompt)

# AGENT 4: TIME PLANNING
def run_planning_agent(name: str, duration_months: int, problem: str) -> str:
    prompt = f"""
You are an Agile Sprint Master and Academic Project Planner.
Project: {name}
Duration: {duration_months} Months
Problem: {problem}

Create a structured month-by-month sprint plan spanning Month 1 through Month {duration_months}.
CRITICAL RULE: Do NOT use markdown hashtags (#, ##, ###).

For each month, write out:
**Month [N]: [Phase Title]**
* **Technical Milestone**: [Core engineering objectives for this month]
* **Development Tasks**: [Frontend, backend, AI integration, and database operations]
* **Testing & Verification**: [Exact unit, integration, or validation tests performed]
* **Month Deliverable**: [Concrete runnable software output]
"""
    return query_ai(prompt)

# AGENT 5: RISK ASSESSMENT
def run_risk_agent(name: str, domain: str, duration_months: int) -> str:
    prompt = f"""
You are an IT Risk Analyst and Site Reliability Engineer.
Project: {name}
Domain: {domain}
Duration: {duration_months} Months

Identify critical technical and project risks with realistic mitigations.
CRITICAL RULE: Do NOT use markdown hashtags (#, ##, ###).

Format exactly as follows:
**1. Technical Risks & Failure Points**
* **Risk 1 (API & Service Limits)**: Description of the technical failure risk.
* **Risk 2 (Data Consistency & Storage)**: Description of the technical failure risk.
* **Risk 3 (Model Latency & Hallucination)**: Description of the technical failure risk.

**2. Execution & Timeline Risks**
* **Risk 4 (Scope Creep)**: Description of deadline risk.
* **Risk 5 (Integration Roadblocks)**: Description of development bottlenecks.

**3. Actionable Mitigation Protocols**
* **Mitigation 1**: Practical architectural solution for API/Service limitations.
* **Mitigation 2**: Practical recovery protocol for data issues.
* **Mitigation 3**: Practical guardrail for AI latency and input validation.
* **Mitigation 4**: Sprint buffer strategy for timeline recovery.
"""
    return query_ai(prompt)

# AGENT 6: FORMAL 14-SECTION UNIVERSITY THESIS
def run_thesis_agent(name: str, domain: str, problem: str = "") -> str:
    prompt = f"""
You are a Senior Academic Thesis Director and Capstone Review Committee Chair.
Write an exhaustive, formal academic thesis and capstone project specification for:
Project Title: {name}
Engineering Domain: {domain}
Problem Context: {problem}

Write in formal academic language suitable for an official university project report submission and viva examination defense.
CRITICAL RULE: Do NOT use markdown hashtags (#, ##, ###). Use bold section titles.

Structure your response using the standard 14-section university syllabus outline:

**1. Abstract**
Provide a comprehensive 200-word formal abstract detailing the technical context, primary objective, proposed architecture, and expected outcomes.

**2. Introduction**
Provide 2 detailed paragraphs explaining the background, technological motivation, and industry relevance of the project.

**3. Problem Formulation & Objectives**
State the core engineering problem and list 4 explicit, measurable technical objectives.

**4. Literature Survey & Related Work**
Provide a technical comparison of 3 existing tools/methodologies, detailing their technical limitations and what research gap this project addresses.

**5. System Architecture & Methodology**
Detail the architectural layers (Client Presentation, API Gateway, Controller Logic, Database Layer, and AI Integration Pipeline).

**6. Functional & Non-Functional Specifications**
* **Functional Requirements**: List 5 essential functional capabilities.
* **Non-Functional Requirements**: Specify exact latency, availability, security (JWT/TLS), and scalability targets.

**7. Technology Stack & Technical Rationale**
Detail the selection criteria and runtime advantages for the chosen frontend, backend, database, and AI engine.

**8. Module Design & Implementation Flow**
Describe the step-by-step data processing flow from initial user request to backend computation and database persistence.

**9. Database Schema & Data Modeling**
Explain the document/table schemas, primary collections, key fields, and indexing strategy.

**10. Verification, Testing & Quality Assurance**
Detail the unit tests, API integration tests, load testing boundaries, and validation results.

**11. Security, Privacy & Error Handling**
Detail the input validation, authentication lifecycles, exception handling strategies, and environment security.

**12. Results & Performance Evaluation**
Summarize the operational capabilities, observed throughput, and milestone achievement.

**13. Conclusion & Future Enhancements**
Provide a conclusive summary of deliverables followed by 3 concrete post-capstone technical enhancements.

**14. References & Academic Bibliography**
List 4 formal IEEE-style citations relevant to this domain and technology stack.
"""
    return query_ai(prompt)

# REPORTLAB NUMBERED CANVAS FOR FORMAL PAGINATION & HEADERS
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Skip cover page

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Header
        self.drawString(54, 750, "ACADEMIC PROJECT REPORT & SYSTEM BLUEPRINT")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)

        # Running Footer
        self.line(54, 50, 558, 50)
        self.setFont("Helvetica", 8)
        self.drawString(54, 38, "Confidential — Prepared for Academic Examination & Viva Defense")
        self.drawRightString(558, 38, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

# SCHEMAS
class RegisterSchema(BaseModel):
    username: str
    email: str
    password: str
    role: str = "Student"

class LoginSchema(BaseModel):
    email: str
    password: str

class BlueprintCreateRequest(BaseModel):
    name: str
    domain: str = ""
    duration_months: int = 3
    problem_statement: str
    user_email: str

class MentorChatRequest(BaseModel):
    project_name: str
    context: str
    query: str

class FacultyReviewSchema(BaseModel):
    project_name: str
    status: str
    comments: str

# AUTHENTICATION
@app.post("/api/auth/register")
@app.post("/register")
async def register_user(req: RegisterSchema):
    email_clean = req.email.strip().lower()
    existing = database.users_col.find_one({"email": email_clean})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    new_user = {
        "username": req.username.strip(),
        "email": email_clean,
        "password": req.password,
        "role": req.role
    }
    database.users_col.insert_one(new_user)
    
    return {
        "success": True,
        "user": {
            "username": new_user["username"],
            "email": new_user["email"],
            "role": new_user["role"]
        }
    }

@app.post("/api/auth/login")
@app.post("/login")
async def login_user(req: LoginSchema):
    email_clean = req.email.strip().lower()
    user = database.users_col.find_one({"email": email_clean})
    if not user or user.get("password") != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
        
    return {
        "success": True,
        "user": {
            "username": user.get("username", "Student"),
            "email": user.get("email"),
            "role": user.get("role", "Student")
        }
    }

# BLUEPRINT GENERATION
@app.post("/api/generate-blueprint")
async def generate_blueprint(req: BlueprintCreateRequest):
    try:
        p_name = req.name.strip() or f"{req.problem_statement[:25]} Platform"
        p_months = int(req.duration_months) if req.duration_months else 3
        p_prob = req.problem_statement.strip()

        # Handle Domain: If user left it blank or set to Auto-Detect, AI determines domain
        raw_domain = req.domain.strip() if req.domain else ""
        if not raw_domain or raw_domain.lower() in ["auto-detect", "none", "string"]:
            p_domain = detect_project_domain(p_name, p_prob)
        else:
            p_domain = raw_domain

        # Run 6 core agents with resolved domain
        idea_eval = run_idea_agent(p_name, p_prob, p_domain)
        scope_def = run_scope_agent(p_name, p_prob)
        tech_stack = run_technology_agent(p_name, p_domain, p_prob)
        planning = run_planning_agent(p_name, p_months, p_prob)
        risk_eval = run_risk_agent(p_name, p_domain, p_months)
        thesis_plan = run_thesis_agent(p_name, p_domain, p_prob)

        blueprint = {
            "user_email": req.user_email.strip().lower(),
            "name": p_name,
            "approval_status": "Pending Review",
            "project_details": {
                "name": p_name,
                "domain": p_domain,
                "duration_months": p_months,
                "problem_statement": p_prob,
                "preferred_tech": "AI Recommended Stack"
            },
            "idea_evaluation": idea_eval,
            "scope_definition": scope_def,
            "technology_stack": tech_stack,
            "time_planning": planning,
            "risk_assessment": risk_eval,
            "thesis_format": thesis_plan,
            "timeline_milestones": planning,
            "documentation_plan": thesis_plan,
            "faculty_feedback": ""
        }

        database.save_blueprint(blueprint)
        blueprint.pop("_id", None)
        return blueprint
    except Exception as e:
        print(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/history")
async def get_user_history(email: str):
    projects = list(database.blueprints_col.find({"user_email": email.strip().lower()}, {"_id": 0}))
    return projects

@app.get("/api/faculty/blueprints")
async def get_all_blueprints():
    projects = list(database.blueprints_col.find({}, {"_id": 0}))
    return projects

@app.post("/api/faculty/review")
async def submit_faculty_review(rev: FacultyReviewSchema):
    query = {"project_details.name": {"$regex": f"^{re.escape(rev.project_name.strip())}$", "$options": "i"}}
    update = {
        "$set": {
            "approval_status": rev.status,
            "faculty_feedback": rev.comments
        }
    }
    result = database.blueprints_col.update_one(query, update)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found.")
    return {"success": True, "message": "Evaluation recorded."}

@app.post("/api/mentor/chat")
async def mentor_chat(req: MentorChatRequest):
    prompt = f"""
You are the Lead Academic Project Mentor.
Project: {req.project_name}
Context: {req.context}
Student Question: {req.query}

Provide a direct, practical response with clean formatting and bold highlights.
Do NOT use hashtags (# or ##).
"""
    reply = query_ai(prompt)
    return {"reply": reply}

# EXPORT: PDF (ACADEMIC MANUSCRIPT)
@app.get("/api/export/pdf")
async def export_blueprint_pdf(project_name: str):
    query = {"project_details.name": {"$regex": f"^{re.escape(project_name.strip())}$", "$options": "i"}}
    blueprint = database.blueprints_col.find_one(query, {"_id": 0})
    if not blueprint:
        raise HTTPException(status_code=404, detail=f"Blueprint for '{project_name}' not found.")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=64,
        bottomMargin=64
    )

    styles = getSampleStyleSheet()

    cover_inst_style = ParagraphStyle('CoverInst', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=13, leading=17, alignment=1, textColor=colors.HexColor("#1E3A8A"), spaceAfter=12)
    cover_title_style = ParagraphStyle('CoverTitle', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=24, leading=30, alignment=1, textColor=colors.HexColor("#0F172A"), spaceAfter=14)
    cover_sub_style = ParagraphStyle('CoverSub', parent=styles['Normal'], fontName='Helvetica', fontSize=11, leading=16, alignment=1, textColor=colors.HexColor("#475569"), spaceAfter=30)
    cover_meta_style = ParagraphStyle('CoverMeta', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=16, alignment=1, textColor=colors.HexColor("#1E293B"))

    h1_style = ParagraphStyle('AcademicH1', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=13, leading=17, textColor=colors.HexColor("#0F172A"), spaceBefore=14, spaceAfter=8, keepWithNext=True)
    h2_style = ParagraphStyle('AcademicH2', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=11, leading=15, textColor=colors.HexColor("#1E40AF"), spaceBefore=10, spaceAfter=4, keepWithNext=True)
    body_style = ParagraphStyle('AcademicBody', parent=styles['Normal'], fontName='Helvetica', fontSize=9.5, leading=14.5, textColor=colors.HexColor("#1E293B"), spaceAfter=6)
    bullet_style = ParagraphStyle('AcademicBullet', parent=styles['Normal'], fontName='Helvetica', fontSize=9.5, leading=14, leftIndent=16, firstLineIndent=-10, textColor=colors.HexColor("#334155"), spaceAfter=4)

    det = blueprint.get("project_details", {})
    name = det.get('name', 'Capstone Project')
    domain = det.get('domain', 'Computer Engineering')
    duration = det.get('duration_months', 3)
    user_email = blueprint.get('user_email', 'Candidate')

    story = []

    # Cover Page
    story.append(Spacer(1, 40))
    story.append(Paragraph("PROJECT SPECIFICATION & SYSTEM THESIS", cover_inst_style))
    story.append(HRFlowable(width="60%", thickness=1.5, color=colors.HexColor("#2563EB"), spaceAfter=24, spaceBefore=6))
    story.append(Paragraph(name.upper(), cover_title_style))
    story.append(Paragraph(f"Specialization: <b>{domain}</b> &nbsp;|&nbsp; Target Timeline: <b>{duration} Months</b>", cover_sub_style))
    story.append(Spacer(1, 90))

    meta_text = f"""
    <b>Candidate / Submitter:</b> {user_email}<br/>
    <b>Approval Status:</b> {blueprint.get('approval_status', 'Pending Final Review')}<br/>
    <b>Academic Advisor Evaluation:</b> {blueprint.get('faculty_feedback') or 'Comprehensive Review Ready'}<br/>
    <b>Documentation Standard:</b> IEEE Capstone Specification
    """
    story.append(Paragraph(meta_text, cover_meta_style))
    story.append(Spacer(1, 140))
    story.append(Paragraph("A Technical Capstone Documentation Report Submitted in Partial Fulfillment of Academic Requirements", ParagraphStyle('CoverFooter', fontName='Helvetica-Oblique', fontSize=9, alignment=1, textColor=colors.HexColor("#64748B"))))
    story.append(PageBreak())

    # 6 Core Academic Sections
    sections = [
        ("SECTION 1: IDEA FEASIBILITY & ACADEMIC MERIT", blueprint.get("idea_evaluation", "")),
        ("SECTION 2: FUNCTIONAL SCOPE & BOUNDARIES", blueprint.get("scope_definition", "")),
        ("SECTION 3: ARCHITECTURAL TECHNOLOGY STACK", blueprint.get("technology_stack", "")),
        ("SECTION 4: SPRINT PLANNING & MILESTONE ROADMAP", blueprint.get("time_planning", "") or blueprint.get("timeline_milestones", "")),
        ("SECTION 5: RISK ASSESSMENT & MITIGATION PROTOCOLS", blueprint.get("risk_assessment", "")),
        ("SECTION 6: THESIS REPORT & FORMAL SPECIFICATIONS", blueprint.get("thesis_format", "") or blueprint.get("documentation_plan", ""))
    ]

    for section_title, content in sections:
        story.append(Paragraph(section_title, h1_style))
        story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#94A3B8"), spaceAfter=10, spaceBefore=2))

        lines = str(content).split("\n")
        for line in lines:
            trimmed = line.strip()
            if not trimmed:
                story.append(Spacer(1, 4))
                continue

            if trimmed.startswith("**") and trimmed.endswith("**") and len(trimmed) < 80:
                header_text = trimmed.replace("**", "")
                story.append(Paragraph(header_text, h2_style))
            elif trimmed.startswith("*") or trimmed.startswith("-"):
                clean_bullet = trimmed.lstrip("*- ").replace("<", "&lt;").replace(">", "&gt;")
                clean_bullet = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', clean_bullet)
                story.append(Paragraph(f"• &nbsp; {clean_bullet}", bullet_style))
            else:
                clean_text = trimmed.replace("<", "&lt;").replace(">", "&gt;")
                formatted_para = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', clean_text)
                story.append(Paragraph(formatted_para, body_style))

        story.append(Spacer(1, 14))

    doc.build(story, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    clean_filename = re.sub(r'[^a-zA-Z0-9_-]', '_', name)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={clean_filename}_Report.pdf"}
    )

# EXPORT: WORD (.DOCX)
@app.get("/api/export/docx")
async def export_blueprint_docx(project_name: str):
    query = {"project_details.name": {"$regex": f"^{re.escape(project_name.strip())}$", "$options": "i"}}
    blueprint = database.blueprints_col.find_one(query, {"_id": 0})
    if not blueprint:
        raise HTTPException(status_code=404, detail=f"Blueprint for '{project_name}' not found.")

    doc = Document()
    det = blueprint.get("project_details", {})

    doc.add_heading(f"Academic Project Blueprint: {det.get('name')}", 0)
    doc.add_paragraph(f"Domain: {det.get('domain')} | Target Duration: {det.get('duration_months')} Months\n")

    sections = [
        ("1. IDEA EVALUATION & ACADEMIC MERIT", blueprint.get("idea_evaluation", "")),
        ("2. PROJECT SCOPE & BOUNDARIES", blueprint.get("scope_definition", "")),
        ("3. RECOMMENDED TECHNOLOGY STACK", blueprint.get("technology_stack", "")),
        ("4. MONTHLY TIME PLANNING ROADMAP", blueprint.get("time_planning", "") or blueprint.get("timeline_milestones", "")),
        ("5. RISK ASSESSMENT & MITIGATION", blueprint.get("risk_assessment", "")),
        ("6. ACADEMIC THESIS FORMAT", blueprint.get("thesis_format", "") or blueprint.get("documentation_plan", ""))
    ]

    for heading, text in sections:
        doc.add_heading(heading, level=1)
        for line in str(text).split("\n"):
            clean = line.replace("**", "").replace("###", "").replace("##", "").replace("#", "").strip()
            if clean:
                doc.add_paragraph(clean)

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    clean_filename = re.sub(r'[^a-zA-Z0-9_-]', '_', det.get('name', 'project'))
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={clean_filename}_Blueprint.docx"}
    )