from backend.agents.llm_client import call_llm, compute_novelty

print("--- 1. Testing Gemini 2.5 Flash Response Time ---")
reply = call_llm("Explain the main role of an API Gateway in 30 words.")
print("LLM Response:\n", reply)

print("\n--- 2. Testing Hugging Face Novelty Engine ---")
past_projects = [
    "Smart attendance system using facial recognition and OpenCV",
    "Farmer crop disease detection app using CNN"
]
student_idea = "Attendance tracker with face detection for college classrooms"
novelty_result = compute_novelty(student_idea, past_projects)
print("Novelty Result:", novelty_result)