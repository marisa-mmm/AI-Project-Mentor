import streamlit as st
import requests
import json
from datetime import datetime, timedelta

st.set_page_config(page_title="AI Project Mentor & Academic Council", layout="wide", page_icon="🎓")
API_BASE = "http://localhost:8000/api"

st.markdown("""
    <style>
    html, body, [class*="css"], p, span, label, div {
        font-size: 19px !important;
        line-height: 1.6 !important;
    }
    h1 { font-size: 34px !important; font-weight: 800 !important; color: #58a6ff !important; }
    h2 { font-size: 26px !important; font-weight: 700 !important; color: #79c0ff !important; margin-top: 15px !important; }
    h3 { font-size: 22px !important; font-weight: 700 !important; color: #a5d6ff !important; }
    
    .stTextInput input, .stTextArea textarea, select {
        font-size: 18px !important;
        padding: 10px !important;
        border-radius: 8px !important;
    }
    .stButton>button {
        font-size: 19px !important;
        font-weight: 700 !important;
        padding: 0.6rem 1.4rem !important;
        border-radius: 8px !important;
    }
    .metric-card {
        background: rgba(22, 27, 34, 0.9);
        border: 1px solid rgba(48, 54, 61, 0.8);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
    }
    .reminder-banner {
        background: linear-gradient(90deg, #d97706 0%, #b45309 100%);
        color: #ffffff;
        padding: 14px 20px;
        border-radius: 10px;
        font-size: 19px !important;
        font-weight: 700;
        margin-bottom: 20px;
    }
    .report-box {
        background: rgba(22, 27, 34, 0.7);
        border: 1px solid rgba(48, 54, 61, 0.9);
        border-radius: 10px;
        padding: 24px;
        margin-top: 15px;
        margin-bottom: 20px;
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
if "selected_level" not in st.session_state:
    st.session_state.selected_level = "Beginner"

if not st.session_state.user:
    st.title("🎓 AI Project Mentor & Academic Council")
    st.caption("Adaptive Multi-Agent Project Planning & Faculty Evaluation System")
    st.markdown("---")
    
    auth_mode = st.radio("Choose Access Method:", ["Sign In", "Create Account"], horizontal=True)

    if auth_mode == "Sign In":
        st.subheader("🔑 Sign In to Your Portal")
        with st.form("login_form"):
            email = st.text_input("Email Address")
            password = st.text_input("Password", type="password")
            btn = st.form_submit_button("Sign In", use_container_width=True)
            if btn:
                if email.strip() and password.strip():
                    try:
                        res = requests.post(f"{API_BASE}/auth/login", json={"email": email, "password": password})
                        if res.status_code == 200:
                            st.session_state.user = res.json()["user"]
                            st.success("Authenticated successfully!")
                            st.rerun()
                        else:
                            st.error(res.json().get("detail", "Invalid credentials"))
                    except Exception as e:
                        st.error(f"Cannot connect to backend: {e}")
                else:
                    st.warning("Please fill in both email and password.")

    elif auth_mode == "Create Account":
        st.subheader("📝 Register New Academic Profile")
        with st.form("reg_form"):
            u_name = st.text_input("Full Name")
            u_email = st.text_input("Institutional Email Address")
            u_pass = st.text_input("Password", type="password")
            u_role = st.selectbox("I am a:", ["Student", "Faculty / Mentor"])
            btn_reg = st.form_submit_button("Create Account", use_container_width=True)
            if btn_reg:
                if u_name.strip() and u_email.strip() and u_pass.strip():
                    try:
                        res = requests.post(f"{API_BASE}/auth/register", json={
                            "username": u_name, "email": u_email, "password": u_pass, "role": u_role
                        })
                        if res.status_code == 200:
                            st.success("Account created successfully! Switch to 'Sign In' above.")
                        else:
                            st.error(res.json().get("detail", "Registration failed"))
                    except Exception as e:
                        st.error(f"Cannot connect to backend: {e}")
                else:
                    st.warning("Please fill in all fields.")

    st.stop()

user = st.session_state.user

with st.sidebar:
    st.markdown("### 🎓 Academic Council")
    st.markdown(f"**{user['username']}**")
    st.caption(f"Role: `{user.get('role', 'Student')}`")
    st.caption(f"Email: `{user.get('email')}`")
    st.markdown("---")

    if user.get("role") == "Faculty / Mentor":
        nav_options = [
            "📊 Dashboard & Metrics", 
            "👩‍🏫 Faculty Review Board", 
            "📜 All Projects Archive"
        ]
    else:
        nav_options = [
            "📊 Dashboard & Metrics",
            "🚀 Project Architect Wizard",
            "📚 Project History",
            "💬 Ask AI Project Mentor",
            "📈 Weekly Progress Tracker"
        ]

    selected_nav = st.radio("Navigation Menu", nav_options)
    st.markdown("---")
    
    if st.button("🚪 Sign Out", use_container_width=True):
        st.session_state.user = None
        st.session_state.blueprint = None
        st.session_state.step = 1
        st.rerun()

if user.get("role") != "Faculty / Mentor":
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
                    ⏰ DEADLINE ALERT: Month 1 deliverables for project '{latest_project['project_details']['name']}' 
                    are due in <strong>{max(0, days_left)} days</strong>!
                </div>
                """, unsafe_allow_html=True)
    except Exception:
        pass

if selected_nav == "📊 Dashboard & Metrics":
    st.title("📊 Project Analytics & Progress Dashboard")
    st.caption("Real-time telemetry on academic blueprints, reviews, and completion milestones.")

    endpoint = f"{API_BASE}/user/history?email={user['email']}" if user.get("role") != "Faculty / Mentor" else f"{API_BASE}/faculty/blueprints"
    data_list = []
    try:
        res = requests.get(endpoint)
        if res.status_code == 200:
            data_list = res.json()
    except Exception:
        data_list = []

    total_projects = len(data_list)
    approved_count = sum(1 for p in data_list if p.get("approval_status") == "Approved")
    pending_count = sum(1 for p in data_list if p.get("approval_status") == "Pending Review")

    novelty_scores = [float(p.get("novelty_score", {}).get("novelty_score", 0)) for p in data_list if p.get("novelty_score")]
    avg_novelty = round(sum(novelty_scores) / len(novelty_scores), 1) if novelty_scores else 0.0

    m_col1, m_col2, m_col3, m_col4 = st.columns(4)
    with m_col1:
        st.metric("Total Blueprints", total_projects)
    with m_col2:
        st.metric("Approved Projects", approved_count)
    with m_col3:
        st.metric("Pending Reviews", pending_count)
    with m_col4:
        st.metric("Avg Vector Novelty", f"{avg_novelty}%")

    st.markdown("---")
    st.subheader("📋 Active Projects Status Overview")
    
    if data_list:
        table_rows = []
        for p in data_list:
            det = p.get("project_details", {})
            table_rows.append({
                "Project Title": det.get("name", "N/A"),
                "Domain": det.get("domain", "N/A"),
                "Duration": f"{det.get('duration_months', 0)} Mos",
                "Novelty": f"{p.get('novelty_score', {}).get('novelty_score', 0)}%",
                "Status": p.get("approval_status", "Pending Review"),
                "Created At": p.get("created_at", "N/A")
            })
        st.dataframe(table_rows, use_container_width=True)
    else:
        st.info("No projects recorded in the system yet. Launch the Project Architect Wizard to begin.")

elif selected_nav == "🚀 Project Architect Wizard":
    if st.session_state.step == 1:
        st.title("💡 Step 1: Define Project Scope & Skill Level")
        u_level = st.selectbox(
            "Select Your Competence Level:", 
            ["Beginner", "Intermediate", "Advanced"],
            help="Adapts multi-agent evaluation depth and vocabulary."
        )
        raw_idea = st.text_area(
            "Your Raw Project Idea (1-2 sentences)", 
            placeholder="e.g., An automated sign language translator for online video conferencing.", 
            height=120
        )
        
        if st.button("Start Adaptive Discovery Session", use_container_width=True):
            if raw_idea.strip():
                with st.spinner("AI Profiler is analyzing requirements..."):
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
        st.title("🎯 Step 2: Refine Your Project Requirements")
        
        col_info1, col_info2 = st.columns(2)
        with col_info1:
            st.info(f"**Competence Level:** {st.session_state.selected_level}")
        with col_info2:
            st.success(f"**Domain:** {data.get('suggested_domain', 'Computer Science')}")

        with st.form("discovery_form"):
            p_name = st.text_input("Project Name", value=data.get("suggested_name", "AI Assistant"))
            domain = st.text_input("Domain", value=data.get("suggested_domain", "Artificial Intelligence"))
            duration = st.slider("Target Duration (Months):", min_value=1, max_value=12, value=4)
            
            st.markdown("#### Clarifying Questions for Your Project:")
            answers = []
            for i, q in enumerate(data.get("questions", [])):
                ans = st.text_input(f"Q{i+1}: {q}")
                answers.append(f"{q} Answer: {ans}")
                
            tech = st.text_input(
                "Preferred Technologies / Interests (optional)", 
                value="Python, FastAPI, Streamlit, MongoDB"
            )
            
            b1, b2 = st.columns([1, 4])
            with b1:
                back = st.form_submit_button("⬅ Back")
            with b2:
                generate = st.form_submit_button("🚀 Generate Full Academic Blueprint", use_container_width=True)

        if back:
            st.session_state.step = 1
            st.rerun()

        if generate:
            full_prob = f"{st.session_state.raw_idea} Additional Context: {' | '.join(answers)}"
            payload = {
                "name": p_name,
                "domain": domain,
                "duration_months": duration,
                "target_role": "Full-Stack AI Engineer",
                "problem_statement": full_prob,
                "preferred_tech": tech,
                "user_email": user["email"]
            }
            with st.spinner("AI Council is generating your level-tailored blueprint..."):
                res = requests.post(f"{API_BASE}/generate-blueprint?level={st.session_state.selected_level}", json=payload)
                if res.status_code == 200:
                    st.session_state.blueprint = res.json()
                    st.session_state.step = 3
                    st.rerun()
                else:
                    st.error(res.text)

    elif st.session_state.step == 3:
        bp = st.session_state.blueprint
        details = bp["project_details"]
        nov = bp.get("novelty_score", {})
        
        col_h1, col_h2 = st.columns([3, 1])
        with col_h1:
            st.title(f"✅ Blueprint: {details['name']}")
        with col_h2:
            if st.button("➕ Plan Another Project"):
                st.session_state.step = 1
                st.rerun()

        m1, m2, m3 = st.columns(3)
        with m1:
            st.metric("Vector Novelty", f"{nov.get('novelty_score', 0)}%", nov.get("status", "Unique"))
        with m2:
            st.metric("Faculty Status", bp.get("approval_status", "Pending Review"))
        with m3:
            st.metric("Timeline", f"{details['duration_months']} Months")

        t1, t2, t3, t4, t5, t6, t7 = st.tabs([
            "📋 Idea & Scope", 
            "💻 Tech Stack & Reasons", 
            "🏛️ System Architecture",
            "📅 Milestone Roadmap", 
            "📑 14-Section Thesis", 
            "🛠️ Implementation Guide",
            "📥 Download Blueprint"
        ])
        
        with t1:
            st.markdown("<div class='report-box'>", unsafe_allow_html=True)
            st.markdown("## 💡 Idea Evaluation")
            st.markdown(bp["idea_evaluation"])
            st.markdown("---")
            st.markdown("## 🎯 Scope Boundaries & Non-Goals")
            st.markdown(bp["scope_definition"])
            st.markdown("</div>", unsafe_allow_html=True)
            
        with t2:
            st.markdown("<div class='report-box'>", unsafe_allow_html=True)
            st.markdown("## 💻 Recommended Tech Stack & Justifications")
            st.markdown(bp["technology_stack"])
            st.markdown("</div>", unsafe_allow_html=True)

        with t3:
            st.markdown("<div class='report-box'>", unsafe_allow_html=True)
            st.markdown("## 🏛️ System Architecture Flowchart")
            clean_mermaid = bp["architecture_diagram"].replace("```mermaid", "").replace("```", "").strip()
            st.markdown(f"```mermaid\n{clean_mermaid}\n```")
            st.markdown("</div>", unsafe_allow_html=True)

        with t4:
            st.markdown("<div class='report-box'>", unsafe_allow_html=True)
            st.markdown("## 📅 Milestone Roadmap")
            st.markdown(bp["timeline_milestones"])
            st.markdown("---")
            st.markdown("## ⚠️ Risk Management & Mitigation")
            st.markdown(bp["risk_assessment"])
            st.markdown("</div>", unsafe_allow_html=True)

        with t5:
            st.markdown("<div class='report-box'>", unsafe_allow_html=True)
            st.markdown("## 📑 14-Section Standard University Thesis Outline")
            st.markdown(bp["documentation_plan"])
            st.markdown("</div>", unsafe_allow_html=True)

        with t6:
            st.markdown("<div class='report-box'>", unsafe_allow_html=True)
            st.markdown("## 🛠️ Step-by-Step Implementation Guide & Starter Code")
            st.markdown(bp.get("implementation_guide", ""))
            st.markdown("</div>", unsafe_allow_html=True)

        with t7:
            st.markdown("<div class='report-box'>", unsafe_allow_html=True)
            clean_mermaid = bp["architecture_diagram"].replace("```mermaid", "").replace("```", "").strip()
            full_doc = f"""# Academic Project Blueprint: {details['name']}
**Domain**: {details['domain']} | **Duration**: {details['duration_months']} Months | **Student Level**: {bp.get('skill_level', 'Beginner')}
**Vector Novelty Score**: {nov.get('novelty_score', 0)}% ({nov.get('status', 'Unique')})
**Generated On**: {bp.get('created_at', 'N/A')}

---

## 1. Idea Evaluation
{bp['idea_evaluation']}

---

## 2. Scope Definition & Non-Goals
{bp['scope_definition']}

---

## 3. Technology Stack & Justifications
{bp['technology_stack']}

---

## 4. System Architecture
```mermaid
{clean_mermaid}
5. Milestone Roadmap & Timeline
{bp['timeline_milestones']}

6. Risk Assessment & Mitigations
{bp['risk_assessment']}

7. 14-Section Thesis Outline
{bp['documentation_plan']}

8. Implementation Guide
{bp.get('implementation_guide', '')}
"""
            st.download_button(
                label="📥 Download Complete Project Specification (.md)",
                data=full_doc,
                file_name=f"{details['name'].replace(' ', '_')}_Blueprint.md",
                mime="text/markdown",
                use_container_width=True
            )
            st.markdown("</div>", unsafe_allow_html=True)

elif selected_nav == "📚 Project History":
    st.title("📚 Saved Project Specifications")
    try:
        h_res = requests.get(f"{API_BASE}/user/history?email={user['email']}")
        if h_res.status_code == 200 and h_res.json():
            for item in reversed(h_res.json()):
                det = item.get("project_details", {})
                with st.expander(
                    f"📌 {det.get('name', 'Unnamed Project')} "
                    f"({det.get('domain', 'N/A')}) — Created: {item.get('created_at', 'N/A')}"
                ):
                    st.write(f"Approval Status: {item.get('approval_status', 'Pending Review')}")
                    if item.get("faculty_feedback"):
                        st.info(f"Mentor Notes: {item['faculty_feedback']}")
                    st.markdown("#### Idea Evaluation")
                    st.markdown(item.get("idea_evaluation", "N/A"))
        else:
            st.info("No saved blueprints found in your account yet.")
    except requests.RequestException as e:
        st.error(f"Cannot connect to backend: {e}")

elif selected_nav == "💬 Ask AI Project Mentor":
    st.title("💬 Ask Your Academic Project Mentor")
    active_bp = st.session_state.blueprint
    p_label = active_bp.get("project_details", {}).get("name", "General Mentorship") if active_bp else "General Mentorship"
    st.caption(f"Currently consulting on: {p_label}")

    q_user = st.text_input("Ask a question regarding your architecture, viva questions, or code:")
    if st.button("Consult Lead Mentor"):
        if q_user.strip():
            context_str = json.dumps(active_bp) if active_bp else "General Software Project"
            with st.spinner("AI Mentor is reviewing..."):
                try:
                    m_res = requests.post(
                        f"{API_BASE}/mentor/chat",
                        json={
                            "project_name": p_label,
                            "query": q_user,
                            "context": context_str
                        }
                    )
                    if m_res.status_code == 200:
                        st.markdown(m_res.json().get("reply", "No response received from the mentor."))
                    else:
                        st.error(m_res.text)
                except requests.RequestException as e:
                    st.error(f"Cannot connect to backend: {e}")
        else:
            st.warning("Please type a question first.")

elif selected_nav == "📈 Weekly Progress Tracker":
    st.title("📈 Weekly Progress Check-In")
    with st.form("prog_form"):
        p_n = st.text_input("Project Name")
        w_no = st.number_input("Week Number", min_value=1, max_value=52, value=1)
        comp = st.text_area("What tasks did you complete this week?")
        bloc = st.text_area("Any blockers or errors faced?")
        submit_prog = st.form_submit_button("Submit Weekly Report")

    if submit_prog:
        if p_n.strip() and comp.strip():
            with st.spinner("Analyzing progress update..."):
                try:
                    p_res = requests.post(
                        f"{API_BASE}/track-progress",
                        json={
                            "project_name": p_n,
                            "user_email": user["email"],
                            "week_number": w_no,
                            "completed_tasks": comp,
                            "blockers": bloc if bloc.strip() else "None"
                        }
                    )
                    if p_res.status_code == 200:
                        st.markdown(p_res.json().get("analysis", "No analysis returned."))
                    else:
                        st.error(p_res.text)
                except requests.RequestException as e:
                    st.error(f"Cannot connect to backend: {e}")
        else:
            st.warning("Please enter a project name and describe the completed tasks.")

elif selected_nav == "👩‍🏫 Faculty Review Board":
    st.title("👩‍🏫 Faculty Evaluation Board")

    if st.button("🔄 Refresh Submissions", key="fac_refresh"):
        st.rerun()

    try:
        f_res = requests.get(f"{API_BASE}/faculty/blueprints")
        if f_res.status_code == 200 and f_res.json():
            for idx, item in enumerate(f_res.json(), start=1):
                det = item.get("project_details", {})
                p_name = det.get("name", f"Project_{idx}")
                student_mail = item.get("user_email", "Unassigned")
                current_status = item.get("approval_status", "Pending Review")

                with st.expander(
                    f"📌 {p_name} | Student: {student_mail} | Status: {current_status}"
                ):
                    c1, c2 = st.columns(2)
                    with c1:
                        st.write(f"**Domain:** {det.get('domain', 'N/A')}")
                        st.write(f"**Duration:** {det.get('duration_months', 0)} Months")
                    with c2:
                        nov_val = item.get("novelty_score", {}).get("novelty_score", "N/A")
                        st.write(f"**Novelty Score:** {nov_val}%")
                        st.write(f"**Submitted:** {item.get('created_at', 'N/A')}")

                    st.markdown("#### Problem Statement & Context")
                    st.write(det.get("problem_statement", "N/A"))

                    st.markdown("#### Idea Evaluation")
                    st.markdown(item.get("idea_evaluation", "N/A"))

                    st.markdown("#### Tech Stack & Justifications")
                    st.markdown(item.get("technology_stack", "N/A"))

                    with st.form(f"fac_form_{idx}_{p_name}"):
                        st.markdown("---")
                        new_stat = st.selectbox(
                            "Evaluation Verdict",
                            ["Approved", "Needs Revision", "Rejected"],
                            key=f"sel_stat_{idx}_{p_name}"
                        )
                        feed = st.text_area(
                            "Mentor Remarks / Revision Notes",
                            value=item.get("faculty_feedback", ""),
                            key=f"txt_feed_{idx}_{p_name}"
                        )

                        if st.form_submit_button("💾 Save Review"):
                            try:
                                review_res = requests.post(
                                    f"{API_BASE}/faculty/review",
                                    json={
                                        "project_name": p_name,
                                        "status": new_stat,
                                        "comments": feed
                                    }
                                )
                                if review_res.status_code == 200:
                                    st.success(f"Review updated for {p_name}!")
                                    st.rerun()
                                else:
                                    st.error(review_res.text)
                            except requests.RequestException as e:
                                st.error(f"Cannot connect to backend: {e}")
        else:
            st.info("No student blueprints submitted yet.")
    except requests.RequestException as e:
        st.error(f"Cannot connect to backend: {e}")

elif selected_nav == "📜 All Projects Archive":
    st.title("📜 All Projects Repository")
    try:
        arch_res = requests.get(f"{API_BASE}/faculty/blueprints")
        if arch_res.status_code == 200 and arch_res.json():
            for idx, item in enumerate(arch_res.json(), start=1):
                det = item.get("project_details", {})
                p_name = det.get("name", f"Project_{idx}")
                with st.expander(
                    f"📁 {idx}. {p_name} ({det.get('domain', 'N/A')})"
                ):
                    st.write(f"Student: {item.get('user_email', 'N/A')}")
                    st.write(f"Status: {item.get('approval_status', 'Pending')}")
                    st.markdown(item.get("scope_definition", "N/A"))
        else:
            st.info("No projects in archive.")
    except requests.RequestException as e:
        st.error(f"Cannot connect to backend: {e}")

