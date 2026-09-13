# AI Project Mentor

## University Academic Project Management & Evaluation Portal

AI Project Mentor is an enterprise-grade academic platform engineered for university engineering departments. It unifies AI-guided student technical architecture planning with faculty supervision, bi-weekly mentor sprint check-ins, departmental roster tracking, automated manuscript compliance verification, and standardized 50-mark viva defense scorecards.

---

## Key Architecture & Dual-Portal Workflow

```
+-----------------------------------------------------------------------------------+
|                                 AI Project Mentor                                 |
+-----------------------------------------+-----------------------------------------+
|             Student Platform            |             Faculty Portal              |
+-----------------------------------------+-----------------------------------------+
| - Multi-Agent Architecture Engine       | - My Mentees Bi-Weekly Sprint Reviews   |
|   (Idea, Scope, Tech Stack, Timeline)   | - Department Roster & Guide Allocation  |
| - Bi-Weekly Sprint Progress & Hours Log | - Standardized 50-Mark Viva Scorecard   |
| - AI Technical Mentor Chatbot           | - Cohort Noticeboard & Announcements    |
| - Academic Thesis Export (PDF & DOCX)   | - Blueprint Approval & Revisions        |
| - Kanban Milestones & Task Tracking     |                                         |
+-----------------------------------------+-----------------------------------------+
```

---

## Platform Features

### 1. Student Platform
* **4-Agent Architecture Planning Engine**: Automatically synthesizes an engineering idea into an academic blueprint covering problem formulation, functional and non-functional requirements, technology stack tradeoffs, and semester timeline milestones.
* **Bi-Weekly Sprint Logging**: Students submit sprint progress summaries, logged development hours, and technical blockers directly to their assigned faculty mentor for official sign-off.
* **Automated Academic Thesis Generator**: Compiles student project progress and architecture into standardized academic manuscripts with one-click export to PDF (via ReportLab) and DOCX (via python-docx).
* **AI Technical Mentor**: Real-time contextual technical guidance tailored specifically to the student's project domain, technology stack, and architectural decisions.
* **Interactive Kanban Board**: Visual sprint board categorizing backlog, in-progress, and completed thesis milestones.

### 2. Faculty Portal
* **My Mentees Supervised Dashboard**: Filtered supervisory view showing linked student projects, bi-weekly log submissions, attendance hours, and one-click log verification with custom guidance notes.
* **Departmental Roster**: Comprehensive institutional registry of all college submissions with student submitter details, assigned guides, and current review statuses.
* **Standardized 50-Mark Viva Scorecard**:
  * System Architecture & Engineering (/10)
  * Code Execution & Functional Delivery (/20)
  * Presentation & Documentation Quality (/10)
  * Defense & Viva Q&A (/10)
  * Committee Verdict: Excellent, Satisfactory, or Re-examination.
* **Cohort Noticeboard**: Instant announcement broadcast system notifying student portals of deadlines, viva dates, and thesis formatting guidelines.

### 3. Institutional Explore Projects Catalog
* Browse approved university capstone projects.
* Real-time originality / novelty score meters.
* Detailed Evaluation & Viva Scorecard breakdown modal with dynamically generated **Key Takeaways & Common Pitfalls** powered by Groq LLMs to help future batches avoid past review mistakes.

---

## Technology Stack

* **Backend**: FastAPI (Python 3.10+), Pydantic v2, Groq API (High-speed Llama 3.3 / Llama 3.1 production models).
* **Database**: MongoDB Atlas via PyMongo (TLS-secured).
* **Frontend**: React 18, Vite, TailwindCSS, Lucide React (strictly professional SVG icons, zero unicode emojis).
* **Document Generation**: ReportLab (PDF) and python-docx (DOCX).

---

## Repository Structure

```
AI-Project-Mentor/
├── backend/
│   ├── main.py              # FastAPI endpoints, agent workflows, and auth
│   ├── database.py          # MongoDB Atlas connection & user helpers
│   ├── models.py            # Pydantic schemas and data models
│   └── agents/              # Council agent definitions and prompts
├── frontend-react/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx               # Public university landing page
│   │   │   ├── AuthPage.jsx                  # Role-guarded sign in & registration
│   │   │   ├── DashboardPage.jsx             # Student dashboard & blueprints
│   │   │   ├── FacultyDashboardPage.jsx      # Faculty mentees & department roster
│   │   │   ├── WorkspacePage.jsx             # Blueprint generation wizard
│   │   │   ├── BenchmarksPage.jsx            # Explore projects & viva rubrics
│   │   │   ├── VivaGradingPage.jsx           # Committee viva grading portal
│   │   │   ├── NoticeboardPage.jsx           # Cohort announcements
│   │   │   ├── ReportCheckerPage.jsx         # Manuscript verification
│   │   │   ├── StudentProgressUpdatePage.jsx # Student progress syncing
│   │   │   ├── BatchProgressTrackerPage.jsx  # Faculty batch progress matrix
│   │   │   ├── SettingsPage.jsx              # Institutional profile & security
│   │   │   ├── ContactPage.jsx               # Academic help desk & appeals
│   │   │   ├── ChatMentorPage.jsx            # AI mentor chat assistant
│   │   │   ├── KanbanPage.jsx                # Roadmap sprint board
│   │   │   ├── ThesisDocPage.jsx             # Thesis documentation & export
│   │   │   └── ProjectHistoryPage.jsx        # Project revision archive
│   │   ├── components/
│   │   │   ├── Sidebar.jsx                   # University navigation menu
│   │   │   └── CustomSelect.jsx              # Accessible styled dropdown selector
│   │   ├── App.jsx                           # Route controller & notice alerts
│   │   └── index.css                         # Enterprise academic design tokens
│   ├── package.json
│   └── vite.config.js
├── requirements.txt         # Backend Python dependencies
├── .env                     # Environment variables (API keys, MongoDB URI)
└── README.md
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register student or faculty account with hashed credentials |
| `POST` | `/api/auth/login` | Authenticate user and return session payload |
| `POST` | `/api/generate-blueprint` | Run 4-agent academic evaluation and blueprint generator |
| `GET` | `/api/user/history` | Retrieve project blueprints for authenticated student |
| `GET` | `/api/faculty/blueprints` | Retrieve all departmental project submissions |
| `POST` | `/api/faculty/review` | Submit official faculty feedback and approval status |
| `POST` | `/api/mentor/assign` | Allocate faculty supervisor to a student project |
| `POST` | `/api/student/submit-log` | Submit bi-weekly progress log with hours and blockers |
| `POST` | `/api/mentor/verify-log` | Faculty approval or clarification request for sprint logs |
| `POST` | `/api/faculty/viva-grading` | Record 50-mark viva scorecard and committee verdict |
| `GET` | `/api/faculty/viva-scores` | Retrieve all recorded viva examination scores |
| `POST` | `/api/projects/pitfalls` | Generate common architectural pitfalls and review risks |
| `POST` | `/api/faculty/verify-report` | Automated compliance audit of student report manuscript |
| `POST` | `/api/faculty/announcements`| Publish cohort-wide broadcast announcement |
| `GET` | `/api/announcements` | Retrieve active announcements for noticeboard |
| `GET` | `/api/export/pdf` | Export complete academic blueprint to structured PDF |
| `GET` | `/api/export/docx` | Export project documentation to Microsoft Word format |
| `GET` | `/api/export/thesis-pdf` | Export full chapter thesis document to PDF |

---

## Getting Started

### Prerequisites
* Python 3.10 or higher
* Node.js 18+ and npm
* Active MongoDB Atlas connection URI
* Groq Cloud API Key (`gsk_...`)

### 1. Environment Configuration
Create a `.env` file in the project root directory:
```env
GROQ_API_KEY="your_groq_api_key_here"
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority"
DATABASE_NAME="ai_project_mentor_db"
```

### 2. Backend Setup
```bash
# Activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows
source venv/bin/activate       # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
The backend API documentation will be available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend-react

# Install dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:5174` in your browser to access the application.

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.