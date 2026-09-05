import streamlit as st
import requests
from datetime import datetime, timedelta

st.set_page_config(page_title="AI Project Mentor & Academic Council", layout="wide", page_icon="🎓")
API_BASE = "http://localhost:8000/api"

st.markdown("""
    <style>
    .main { background: #0e1117; }
    .stApp { color: #f0f2f6; }
    h1, h2, h3, h4 { color: #58a6ff !important; font-weight: 700 !important; }
    .metric-card {
        background: rgba(22, 27, 34, 0.85);
        border: 1px solid rgba(48, 54, 61, 0.8);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
    }
    .reminder-banner {
        background: linear-gradient(90deg, #b08800 0%, #d29922 100%);
        color: #000;
        padding: 12px 18px;
        border-radius: 8px;
        font-weight: 700;
        margin-bottom: 15px;
    }
    </style>
""", unsafe_allow_html=True)

if "user" not in st.session_state:
    st.session_state.user = None
if "step" not in st.session_state:
    st.session_state.step = 1
if "discovery_data" not in st.session_state:
    st.session_state.discovery_data = {}
if "blueprint" not in st.session_state:
    st.session_state.blueprint = None

if not st.session_state.user:
    st.title("🎓 AI Project Mentor & Academic Council")
    st.caption("Secure Multi-Agent Academic Planning & Faculty Defense System")
    
    auth_mode = st.radio("Choose Access Method", ["Sign In", "Create Account", "Google Sign-In"], horizontal=True)

    if auth_mode == "Sign In":
        with st.form("login_form"):
            email = st.text_input("Email Address")
            password = st.text_input("Password", type="password")
            btn = st.form_submit_button("Sign In", use_container_width=True)
            if btn:
                try:
                    res = requests.post(f"{API_BASE}/auth/login", json={"email": email, "password": password})
                    if res.status_code == 200:
                        st.session_state.user = res.json()["user"]
                        st.rerun()
                    else:
                        st.error(res.json().get("detail", "Login failed"))
                except Exception as e:
                    st.error(f"Cannot reach server: {e}")

    elif auth_mode == "Create Account":
        with st.form("reg_form"):
            u_name = st.text_input("Full Name")
            u_email = st.text_input("Email Address")
            u_pass = st.text_input("Password", type="password")
            u_role = st.selectbox("I am a:", ["Student", "Faculty / Mentor"])
            btn_reg = st.form_submit_button("Create Account", use_container_width=True)
            if btn_reg:
                try:
                    res = requests.post(f"{API_BASE}/auth/register", json={
                        "username": u_name, "email": u_email, "password": u_pass, "role": u_role
                    })
                    if res.status_code == 200:
                        st.success("Account created! Please switch to 'Sign In' above.")
                    else:
                        st.error(res.json().get("detail", "Registration failed"))
                except Exception as e:
                    st.error(f"Cannot reach server: {e}")

    elif auth_mode == "Google Sign-In":
        st.markdown("### 🌐 Continuous Google Workspace Login")
        st.write("One-click authentication for institutional Google accounts.")
        g_email = st.text_input("Confirm Google Account Email", placeholder="user@gmail.com")
        g_name = st.text_input("Display Name", placeholder="Your Name")
        g_role = st.selectbox("Role for this session", ["Student", "Faculty / Mentor"])
        if st.button("Authenticate with Google", use_container_width=True):
            if g_email.strip() and g_name.strip():
                res = requests.post(f"{API_BASE}/auth/google", json={
                    "email": g_email, "name": g_name, "google_id": "oauth_token_sync", "role": g_role
                })
                if res.status_code == 200:
                    st.session_state.user = res.json()["user"]
                    st.rerun()

    st.stop()

user = st.session_state.user

top_c1, top_c2 = st.columns([5, 1])
with top_c1:
    st.markdown(f"### Welcome back, **{user['username']}** ({user.get('role', 'Student')})")
with top_c2:
    if st.button("Sign Out"):
        st.session_state.user = None
        st.session_state.blueprint = None
        st.session_state.step = 1
        st.rerun()

try:
    hist_res = requests.get(f"{API_BASE}/user/history?email={user['email']}")
    if hist_res.status_code == 200 and hist_res.json():
        latest_project = hist_res.json()[-1]
        created_date = datetime.strptime(latest_project.get("created_at", datetime.now().strftime("%Y-%m-%d %H:%M")), "%Y-%m-%d %H:%M")
        due_date = created_date + timedelta(days=30)
        days_left = (due_date - datetime.now()).days
        if days_left <= 7:
            st.markdown(f"""
            <div class="reminder-banner">
                ⏰ UPCOMING DEADLINE NOTICE: Month 1 deliverables for project '{latest_project['project_details']['name']}' 
                are due in <strong>{max(0, days_left)} days</strong>!
            </div>
            """, unsafe_allow_html=True)
except Exception:
    pass

if user.get("role") == "Faculty / Mentor":
    tabs = st.tabs(["👩‍🏫 Faculty Evaluation Portal", "📜 All Blueprints History"])
else:
    tabs = st.tabs([
        "🚀 Project Architect Wizard", 
        "📚 Previous Blueprint History", 
        "💬 Interactive AI Mentor Q&A", 
        "📈 Weekly Progress Tracker"
    ])

if user.get("role") != "Faculty / Mentor":
    with tabs[0]:
        if st.session_state.step == 1:
            st.subheader("💡 Step 1: Tell Me What You Want to Build")
            u_level = st.selectbox("Select Your Skill Level:", ["Beginner", "Intermediate", "Advanced"])
            raw_idea = st.text_area("Your Raw Project Idea (1-2 sentences)", placeholder="e.g., Real-time sign language interpreter for video calls.", height=120)
            
            if st.button("Start Adaptive Discovery Session", use_container_width=True):
                if raw_idea.strip():
                    with st.spinner("Profiler Agent is analyzing requirements..."):
                        res = requests.post(f"{API_BASE}/start-discovery", json={"raw_idea": raw_idea, "level": u_level})
                        if res.status_code == 200:
                            st.session_state.discovery_data = res.json()
                            st.session_state.selected_level = u_level
                            st.session_state.raw_idea = raw_idea
                            st.session_state.step = 2
                            st.rerun()
                        else:
                            st.error(res.text)
                else:
                    st.warning("Please enter an idea first.")

        elif st.session_state.step == 2:
            data = st.session_state.discovery_data
            st.subheader("🎯 Step 2: Refine Your Project Requirements")
            
            with st.form("discovery_form"):
                p_name = st.text_input("Project Name", value=data.get("suggested_name", "AI Assistant"))
                domain = st.text_input("Domain", value=data.get("suggested_domain", "Artificial Intelligence"))
                duration = st.slider("Target Duration (Months)", min_value=1, max_value=12, value=4)
                
                st.markdown("#### Clarifying Questions for Your Project:")
                answers = []
                for i, q in enumerate(data.get("questions", [])):
                    ans = st.text_input(f"Q{i+1}: {q}")
                    answers.append(f"{q} Answer: {ans}")
                    
                tech = st.text_input("Preferred Technologies", "Python, FastAPI, Streamlit, MongoDB")
                
                b1, b2 = st.columns([1, 4])
                with b1:
                    back = st.form_submit_button("⬅ Back")
                with b2:
                    generate = st.form_submit_button("🚀 Generate Full Multi-Agent Blueprint", use_container_width=True)

            if back:
                st.session_state.step = 1
                st.rerun()

            if generate:
                full_prob = f"{st.session_state.raw_idea} Context: {' | '.join(answers)}"
                payload = {
                    "name": p_name,
                    "domain": domain,
                    "duration_months": duration,
                    "target_role": "Full-Stack AI Engineer",
                    "problem_statement": full_prob,
                    "preferred_tech": tech,
                    "user_email": user["email"]
                }
                with st.spinner("Executing Master Council Blueprint generation (in 1 fast call)..."):
                    res = requests.post(f"{API_BASE}/generate-blueprint", json=payload)
                    if res.status_code == 200:
                        st.session_state.blueprint = res.json()
                        st.session_state.step = 3
                        st.rerun()
                    else:
                        st.error(res.text)

        elif st.session_state.step == 3:
            bp = st.session_state.blueprint
            details = bp["project_details"]
            
            col_h1, col_h2 = st.columns([3, 1])
            with col_h1:
                st.success(f"✅ Blueprint for **{details['name']}** Generated & Synced to Cloud!")
            with col_h2:
                if st.button("➕ Plan Another Project"):
                    st.session_state.step = 1
                    st.rerun()

            nov = bp["novelty_score"]
            m1, m2, m3 = st.columns(3)
            with m1:
                st.metric("Novelty Score (Local HuggingFace)", f"{nov['novelty_score']}%", nov['status'])
            with m2:
                st.metric("Faculty Status", bp.get("approval_status", "Pending Review"))
            with m3:
                st.metric("Timeline Span", f"{details['duration_months']} Months")

            t1, t2, t3, t4, t5, t6, t7 = st.tabs([
                "📋 Idea & Scope", "💻 Tech & Architecture", "📅 Milestone Timeline", 
                "⚠️ Risks", "📑 14-Section Thesis", "🛠️ Code Skeleton", "💰 Cost Breakdown"
            ])
            with t1:
                st.markdown("### Idea Evaluation")
                st.write(bp["idea_evaluation"])
                st.markdown("---")
                st.markdown("### Scope Boundaries & Non-Goals")
                st.write(bp["scope_definition"])
            with t2:
                st.markdown("### Technology Stack Recommendations")
                st.write(bp["technology_stack"])
                st.markdown("---")
                st.markdown("### System Flowchart")
                st.markdown(f"```mermaid\n{bp['architecture_diagram'].replace('```mermaid','').replace('```','').strip()}\n```")
            with t3:
                st.write(bp["timeline_milestones"])
            with t4:
                st.write(bp["risk_assessment"])
            with t5:
                st.write(bp["documentation_plan"])
            with t6:
                st.code(bp["code_starter_pack"], language="python")
            with t7:
                st.write(bp["cost_estimation"])

if user.get("role") != "Faculty / Mentor":
    with tabs[1]:
        st.subheader("📚 Saved Project History")
        h_res = requests.get(f"{API_BASE}/user/history?email={user['email']}")
        if h_res.status_code == 200 and h_res.json():
            for item in reversed(h_res.json()):
                det = item["project_details"]
                with st.expander(f"📌 {det['name']} ({det['domain']}) - Created: {item.get('created_at', 'N/A')}"):
                    st.write(f"**Approval Status:** {item.get('approval_status', 'Pending')}")
                    if item.get("faculty_feedback"):
                        st.info(f"Mentor Notes: {item['faculty_feedback']}")
                    st.write(item["idea_evaluation"])
        else:
            st.info("No saved blueprints found in your account yet.")

if user.get("role") != "Faculty / Mentor":
    with tabs[2]:
        st.subheader("💬 Ask Your AI Project Mentor")
        st.write("Ask targeted questions about your architecture, viva prep, or libraries.")
        active_bp = st.session_state.blueprint
        p_label = active_bp["project_details"]["name"] if active_bp else "General Mentorship"
        st.caption(f"Currently consulting on: **{p_label}**")
        
        q_user = st.text_input("Enter your question:")
        if st.button("Consult Lead Mentor"):
            if q_user.strip():
                context_str = json.dumps(active_bp) if active_bp else "General Software Project"
                with st.spinner("AI Mentor is analyzing..."):
                    m_res = requests.post(f"{API_BASE}/mentor/chat", json={
                        "project_name": p_label, "query": q_user, "context": context_str
                    })
                    if m_res.status_code == 200:
                        st.markdown(m_res.json()["reply"])
            else:
                st.warning("Please type a question first.")

if user.get("role") != "Faculty / Mentor":
    with tabs[3]:
        st.subheader("📈 Weekly Progress Check-In")
        with st.form("prog_form"):
            p_n = st.text_input("Project Name")
            w_no = st.number_input("Week Number", 1, 52, 1)
            comp = st.text_area("What did you accomplish this week?")
            bloc = st.text_area("Any blockers or errors?")
            submit_prog = st.form_submit_button("Submit Update")
            if submit_prog:
                if p_n.strip() and comp.strip():
                    with st.spinner("Evaluating weekly progress..."):
                        p_res = requests.post(f"{API_BASE}/track-progress", json={
                            "project_name": p_n, "user_email": user["email"],
                            "week_number": w_no, "completed_tasks": comp,
                            "blockers": bloc if bloc.strip() else "None"
                        })
                        if p_res.status_code == 200:
                            st.markdown(p_res.json()["analysis"])

if user.get("role") == "Faculty / Mentor":
    with tabs[0]:
        st.subheader("👩‍🏫 Faculty Evaluation & Review Board")
        if st.button("Refresh Blueprint Submissions"):
            st.rerun()
        f_res = requests.get(f"{API_BASE}/faculty/blueprints")
        if f_res.status_code == 200 and f_res.json():
            for item in f_res.json():
                det = item["project_details"]
                p_id = det["name"]
                with st.expander(f"📌 {p_id} | Student: {item.get('user_email')} | Status: {item.get('approval_status')}"):
                    st.write(f"**Domain:** {det['domain']} | **Duration:** {det['duration_months']} Months")
                    st.write(f"**Problem:** {det['problem_statement']}")
                    st.markdown("#### Idea Evaluation")
                    st.write(item["idea_evaluation"])
                    
                    with st.form(f"fac_form_{p_id}"):
                        new_stat = st.selectbox("Status", ["Approved", "Needs Revision", "Rejected"], key=f"s_{p_id}")
                        feed = st.text_area("Mentor Remarks", value=item.get("faculty_feedback", ""), key=f"f_{p_id}")
                        if st.form_submit_button("Submit Academic Review"):
                            requests.post(f"{API_BASE}/faculty/review", json={
                                "project_name": p_id, "status": new_stat, "comments": feed
                            })
                            st.success(f"Review recorded for {p_id}!")
                            st.rerun()
        else:
            st.info("No student blueprints submitted yet.")