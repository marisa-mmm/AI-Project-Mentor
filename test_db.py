from backend.database import client, save_blueprint, get_all_blueprints

print("--- Testing Database Atlas Integration ---")
if client:
    mock_data = {
        "project_details": {
            "name": "AccessMeet Test",
            "domain": "Computer Vision",
            "duration_months": 4,
            "target_role": "AI Engineer",
            "problem_statement": "Sign to speech conversion for video calls."
        },
        "novelty_score": {"novelty_score": 85.5, "status": "High Novelty"},
        "idea_evaluation": "Feasible and relevant.",
        "scope_definition": "MVP scope defined.",
        "technology_stack": "FastAPI, MediaPipe, OpenCV",
        "architecture_diagram": "graph TD; A-->B;",
        "timeline_milestones": "Month 1: Dataset, Month 2: Pipeline",
        "risk_assessment": "Low latency required.",
        "documentation_plan": "Standard 14 chapter synopsis.",
        "approval_status": "Pending Review"
    }
    save_blueprint(mock_data)
    print("Mock blueprint saved successfully.")
    
    all_projects = get_all_blueprints()
    print(f"Total blueprints retrieved from Atlas: {len(all_projects)}")