import streamlit as st
import requests

st.set_page_config(page_title="AI Project Mentor & Faculty Council", layout="wide", page_icon="🎓")
API_BASE = "http://localhost:8000/api"

st.markdown("""
    <style>
    html, body, [class*="css"] {
        font-size: 17px !important;
    }
    .stTextInput input, .stTextArea textarea, .stSelectbox select {
        font-size: 16px !important;
    }
    .stButton>button {
        font-size: 17px !important;
        font-weight: 600 !important;
        padding: 0.5rem 1rem !important;
    }
    </style>
""", unsafe_allow_html=True)

st.title("🎓 Autonomous AI Project Mentor & Faculty Council")
st.caption("Adaptive Multi-Agent Project Planning, Vector Novelty Scoring, and Faculty Evaluation")

if "step" not in st.session_state:
    st.session_state.step = 1
if "discovery_data" not in st.session_state:
    st.session_state.discovery_data = {}
if "raw_idea" not in st.session_state:
    st.session_state.raw_idea = ""
if "selected_level" not in st.session_state:
    st.session_state.selected_level = "Beginner"

tab_student, tab_progress, tab_faculty = st.tabs([
    "🚀 Student Blueprint Hub", 
    "📈 Weekly Progress Tracker", 
    "👩‍🏫 Faculty Evaluation Portal"
])

with tab_student:
    if st.session_state.step == 1:
        st.subheader("💡 Step 1: Tell Us What You Want to Build")
        st.write("Select your level and enter a 1–2 line idea. The AI Profiler will adapt its questions to your background.")
        
        user_level = st.selectbox("Select Your Skill Level:", ["Beginner", "Intermediate", "Advanced"])
        raw_idea = st.text_area(
            "Your Raw Project Idea (1-2 sentences)", 
            placeholder="e.g., An automated sign language translator for online video conferencing.", 
            height=120
        )
        
        if st.button("Analyze & Start Discovery Session", use_container_width=True):
            if raw_idea.strip():
                with st.spinner("Profiler Agent is preparing your personalized questions..."):
                    try:
                        tagged_input = f"[Student Level: {user_level}] Idea: {raw_idea}"
                        res = requests.post(f"{API_BASE}/start-discovery", json={"raw_idea": tagged_input})
                        if res.status_code == 200:
                            st.session_state.discovery_data = res.json()
                            st.session_state.selected_level = user_level
                            st.session_state.raw_idea = raw_idea
                            st.session_state.step = 2
                            st.rerun()
                        else:
                            st.error(f"Error: {res.text}")
                    except Exception as e:
                        st.error(f"Failed to connect to backend: {e}")
            else:
                st.warning("Please enter an idea first.")

    elif st.session_state.step == 2:
        data = st.session_state.discovery_data
        st.subheader("🎯 Step 2: Refining Your Project Requirements")
        
        col1, col2 = st.columns(2)
        with col1:
            st.info(f"**Competence Level:** {st.session_state.selected_level}")
        with col2:
            st.success(f"**Suggested Domain:** {data.get('suggested_domain', 'Computer Science')}")

        with st.form("discovery_form"):
            proj_name = st.text_input("Project Name", value=data.get("suggested_name", "AI Assistant"))
            domain = st.text_input("Domain", value=data.get("suggested_domain", "Artificial Intelligence"))
            duration = st.slider("Target Duration (Months)", min_value=1, max_value=12, value=4)
            
            st.markdown("#### Answer These Discovery Questions:")
            answers = []
            questions = data.get("questions", [])
            for i, q in enumerate(questions):
                ans = st.text_input(f"Q{i+1}: {q}")
                answers.append(f"{q} Answer: {ans}")
                
            preferred_tech = st.text_input("Preferred Technologies (optional)", "Python, FastAPI, Streamlit, MongoDB")
            
            col_b1, col_b2 = st.columns([1, 4])
            with col_b1:
                back = st.form_submit_button("⬅ Back")
            with col_b2:
                generate = st.form_submit_button("🚀 Generate Full Multi-Agent Blueprint", use_container_width=True)

        if back:
            st.session_state.step = 1
            st.rerun()

        if generate:
            full_problem = f"{st.session_state.raw_idea} Additional Context: {' | '.join(answers)}"
            payload = {
                "name": proj_name,
                "domain": domain,
                "duration_months": duration,
                "target_role": "Full-Stack AI Engineer",
                "problem_statement": full_problem,
                "preferred_tech": preferred_tech
            }
            with st.spinner("Multi-Agent Council is analyzing requirements & building blueprint..."):
                try:
                    res = requests.post(f"{API_BASE}/generate-blueprint", json=payload)
                    if res.status_code == 200:
                        st.session_state.blueprint = res.json()
                        st.session_state.step = 3
                        st.rerun()
                    else:
                        st.error(f"Error: {res.text}")
                except Exception as e:
                    st.error(f"Backend call failed: {e}")

    elif st.session_state.step == 3:
        bp = st.session_state.blueprint
        details = bp["project_details"]
        
        col_t1, col_t2 = st.columns([3, 1])
        with col_t1:
            st.success(f"✅ Blueprint for **{details['name']}** Generated & Stored in MongoDB Atlas!")
        with col_t2:
            if st.button("🔄 Start New Project"):
                st.session_state.step = 1
                st.rerun()

        nov = bp["novelty_score"]
        col_m1, col_m2 = st.columns(2)
        with col_m1:
            st.metric("Novelty Score (Hugging Face)", f"{nov['novelty_score']}%", nov['status'])
        with col_m2:
            st.metric("Faculty Approval Status", bp.get("approval_status", "Pending Review"))

        if bp.get("faculty_feedback"):
            st.info(f"💬 **Faculty Feedback:** {bp['faculty_feedback']}")

        sub1, sub2, sub3, sub4, sub5, sub6 = st.tabs([
            "📋 Idea & Scope", 
            "💻 Tech & Architecture", 
            "📅 Milestone Roadmap", 
            "⚠️ Risk Management", 
            "📑 Thesis Structure",
            "📥 Export"
        ])
        
        with sub1:
            st.markdown("### Idea Evaluation")
            st.write(bp["idea_evaluation"])
            st.markdown("---")
            st.markdown("### Scope Boundaries & Non-Goals")
            st.write(bp["scope_definition"])
            
        with sub2:
            st.markdown("### Recommended Full-Stack Tech")
            st.write(bp["technology_stack"])
            st.markdown("---")
            st.markdown("### System Architecture")
            raw_mermaid = bp["architecture_diagram"].replace("```mermaid", "").replace("```", "").strip()
            st.markdown(f"```mermaid\n{raw_mermaid}\n```")

        with sub3:
            st.markdown(f"### Milestone Schedule ({details['duration_months']} Months)")
            st.write(bp["timeline_milestones"])

        with sub4:
            st.markdown("### Technical Risks & Mitigations")
            st.write(bp["risk_assessment"])

        with sub5:
            st.markdown("### 14-Section Thesis Outline")
            st.write(bp["documentation_plan"])

        with sub6:
            st.markdown("### Download Project Specification")
            doc_content = f"""# Academic Project Blueprint: {details['name']}
Domain: {details['domain']} | Duration: {details['duration_months']} Months
Novelty Score: {nov['novelty_score']}% ({nov['status']})

## 1. Idea Evaluation
{bp['idea_evaluation']}

## 2. Scope Definition
{bp['scope_definition']}

## 3. Technology Stack
{bp['technology_stack']}

## 4. Milestone Timeline
{bp['timeline_milestones']}

## 5. Risk Assessment
{bp['risk_assessment']}

## 6. Thesis Documentation Structure
{bp['documentation_plan']}
"""
            st.download_button(
                label="📥 Download Complete Report (.md)",
                data=doc_content,
                file_name=f"{details['name']}_Blueprint.md",
                mime="text/markdown"
            )

with tab_progress:
    st.subheader("📈 Weekly Progress Check-In")
    st.write("Submit weekly updates. The AI Mentor will assign a health status and suggest solutions for blockers.")
    
    with st.form("progress_form"):
        p_name = st.text_input("Project Name", placeholder="e.g., SignSpeak AI")
        week_num = st.number_input("Week Number", min_value=1, max_value=52, value=1)
        completed = st.text_area("What tasks did you complete this week?")
        blockers = st.text_area("Any blockers or errors you faced?")
        
        submit_p = st.form_submit_button("Submit Weekly Check-In", use_container_width=True)

    if submit_p:
        if p_name.strip() and completed.strip():
            with st.spinner("Analyzing progress update..."):
                res = requests.post(f"{API_BASE}/track-progress", json={
                    "project_name": p_name,
                    "week_number": week_num,
                    "completed_tasks": completed,
                    "blockers": blockers if blockers.strip() else "None"
                })
                if res.status_code == 200:
                    st.markdown(res.json()["analysis"])
                else:
                    st.error(f"Error: {res.text}")
        else:
            st.warning("Please fill in project name and completed tasks.")

with tab_faculty:
    st.subheader("👩‍🏫 Faculty & Mentor Review Portal")
    st.write("Review all submitted student blueprints, approve scopes, and provide feedback directly.")
    
    if st.button("🔄 Refresh Submissions List"):
        st.rerun()

    try:
        f_res = requests.get(f"{API_BASE}/faculty/blueprints")
        if f_res.status_code == 200:
            all_bps = f_res.json()
            if not all_bps:
                st.info("No student blueprints submitted yet.")
            else:
                for b in all_bps:
                    det = b.get("project_details", {})
                    p_name = det.get("name", "Unnamed")
                    
                    with st.expander(f"📌 {p_name} | {det.get('domain', 'N/A')} | Status: {b.get('approval_status', 'Pending Review')}"):
                        c1, c2 = st.columns(2)
                        with c1:
                            st.write(f"**Duration:** {det.get('duration_months', 0)} Months")
                            st.write(f"**Problem Statement:** {det.get('problem_statement', 'N/A')}")
                        with c2:
                            st.write(f"**Novelty:** {b.get('novelty_score', {}).get('novelty_score', 'N/A')}%")
                            st.write(f"**Current Status:** {b.get('approval_status', 'Pending Review')}")

                        st.markdown("#### Idea Evaluation & Scope")
                        st.write(b.get("idea_evaluation", "N/A"))

                        with st.form(f"review_form_{p_name}"):
                            new_status = st.selectbox("Update Status", ["Approved", "Needs Revision", "Rejected"], key=f"status_{p_name}")
                            feedback = st.text_area("Mentor Feedback / Remarks", value=b.get("faculty_feedback") or "", key=f"feed_{p_name}")
                            
                            if st.form_submit_button("Submit Review"):
                                review_payload = {
                                    "project_name": p_name,
                                    "status": new_status,
                                    "comments": feedback
                                }
                                rev_res = requests.post(f"{API_BASE}/faculty/review", json=review_payload)
                                if rev_res.status_code == 200:
                                    st.success(f"Review saved for {p_name}!")
                                    st.rerun()
                                else:
                                    st.error("Failed to update status.")
        else:
            st.error("Could not fetch submissions.")
    except Exception as e:
        st.error(f"Faculty Portal Error: {e}")