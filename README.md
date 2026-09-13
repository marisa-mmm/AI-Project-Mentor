AI Project MentorFrom Project Idea to Final Viva DefenseAI Project Mentor is a full-stack academic platform built for engineering departments. It streamlines final-year projects by bridging student architecture planning, progress tracking, and thesis documentation with faculty evaluation, bi-weekly log verification, and standardized viva defense grading.Core FeaturesStudent PlatformMulti-Agent Architecture Wizard: Formulates academic problem statements, dynamic scope, recommended tech stacks, and timelines based on skill level.Interactive Kanban & Roadmap: Converts multi-agent implementation milestones into manageable development sprints (To Do, In Progress, Done).AI Mentor Viva Preparation: Real-time context-aware chat assistant trained on the project's exact stack to simulate tough external examiner viva questions.Milestone Progress Updates: Visual completion slider and phase selectors to report live status back to academic supervisors.14-Section Thesis Generator: Formats complete academic manuscripts ready for black-book binding, complete with one-click PDF and Word (.docx) export.Faculty PortalCentralized Evaluation Hub: Review pending project blueprints, examine system architectures, and issue formal verdicts (Approved, Needs Revision, Rejected).Viva & Defense Rubric Scorecard: Standardized 50-mark digital evaluation sheet assessing System Architecture (10), Code Execution (20), Presentation (10), and Viva Defense (10).Batch Progress Tracker: Live dashboard monitoring student phase completions, sprint blockers, and bi-weekly milestone submissions.Manuscript Compliance Verifier: Automated structural consistency and originality audit for submitted thesis reports.Department Noticeboard: Broadcast official deadlines, viva schedules, and submission criteria directly to student dashboards.Tech StackLayerTechnologiesFrontendReact.js (Vite), Tailwind CSS, Lucide React Icons, AxiosBackendFastAPI (Python 3.10+), Uvicorn, PydanticDatabaseMongoDB (PyMongo / Atlas)AI EngineGroq Cloud API (llama-3.3-70b-versatile, llama-3.1-8b-instant)Document GenerationReportLab (PDF), python-docx (Word)Project StructurePlaintext├── backend/
│   ├── main.py              # FastAPI endpoints & multi-agent pipelines
│   ├── database.py          # MongoDB connection and collections
│   ├── pdf_generator.py     # PDF export engine (ReportLab)
│   ├── docx_generator.py    # Word docx export engine
│   └── requirements.txt     # Python backend dependencies
│
└── frontend-react/
    ├── src/
    │   ├── components/      # Sidebar, Navigation, Custom Selects
    │   ├── pages/           # Dashboard, Workspace, Kanban, Thesis, Viva Grading
    │   ├── App.jsx          # Route orchestration & role guards
    │   └── main.jsx         # React application entrypoint
    ├── tailwind.config.js   # University white & royal blue theme setup
    └── package.json         # Node.js dependencies
Getting Started1. PrerequisitesNode.js: v18.x or higherPython: 3.10 or higherMongoDB: Local instance running on port 27017 or MongoDB Atlas URIGroq API Key: Obtainable from console.groq.com2. Backend SetupNavigate to the backend directory:Bashcd backend
Create and activate a Python virtual environment:Bashpython -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
Install required packages:Bashpip install -r requirements.txt
Create a .env file in the backend/ folder:Code snippetGROQ_API_KEY=your_groq_api_key_here
MONGO_URI=mongodb://localhost:27017
DB_NAME=ai_project_mentor
Launch the FastAPI server:Bashuvicorn main:app --reload --port 8000
The API will start at [http://127.0.0.1:8000](http://127.0.0.1:8000) (Interactive docs at /docs).3. Frontend SetupOpen a new terminal and navigate to the frontend directory:Bashcd frontend-react
Install dependencies:Bashnpm install
Start the Vite development server:Bashnpm run dev
The application will launch at http://localhost:5174.User Roles & WorkflowsStudent Workflow: Sign In $\rightarrow$ Create Blueprint with AI Agents $\rightarrow$ Track Development on Kanban Board $\rightarrow$ Submit Bi-Weekly Progress $\rightarrow$ Prepare via AI Viva Chat $\rightarrow$ Export Bound Thesis.Faculty Workflow: Sign In $\rightarrow$ Review & Approve Blueprint Submissions $\rightarrow$ Track Batch Progress $\rightarrow$ Post Announcements $\rightarrow$ Run Report Verification $\rightarrow$ Grade Final Defense via Viva Scorecard.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
