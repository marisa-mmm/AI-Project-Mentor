from backend.models import ProjectInput
from backend.agents.council_agents import student_profiler_agent, idea_agent, planning_agent

print("--- 1. Testing Student Profiler ---")
raw_input = "I want to make an automated sign language translator for online video calls."
profile = student_profiler_agent(raw_input)
print("Detected Level:", profile.get("level"))
print("Suggested Name:", profile.get("suggested_name"))
print("Questions Generated:")
for q in profile.get("questions", []):
    print(f" - {q}")

print("\n--- 2. Testing Idea & Planning Agents ---")
sample_project = ProjectInput(
    name=profile.get("suggested_name", "SignSpeak AI"),
    domain=profile.get("suggested_domain", "Computer Vision"),
    duration_months=3,
    problem_statement=raw_input,
    preferred_tech="Python, OpenCV, MediaPipe, FastAPI"
)

idea_eval = idea_agent(sample_project)
print("Idea Evaluation:\n", idea_eval[:200] + "...\n")

plan_output = planning_agent(sample_project)
print("Planning Output:\n", plan_output[:200] + "...")