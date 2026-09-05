import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from sentence_transformers import SentenceTransformer, util

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Local CPU-based embedding model
hf_embedder = SentenceTransformer("all-MiniLM-L6-v2")

def call_llm(prompt: str, system_prompt: str = "You are an expert academic project mentor.", max_tokens: int = 2000) -> str:
    """Executes inference with gemini-2.5-flash."""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=max_tokens,
            temperature=0.4
        )
    )
    return response.text

def compute_novelty(user_text: str, reference_corpus: list) -> dict:
    """Calculates semantic cosine similarity to detect project originality."""
    if not reference_corpus:
        return {"novelty_score": 100.0, "status": "Unique Idea", "max_similarity": 0.0}
    
    user_emb = hf_embedder.encode(user_text, convert_to_tensor=True)
    corpus_embs = hf_embedder.encode(reference_corpus, convert_to_tensor=True)
    cosine_scores = util.cos_sim(user_emb, corpus_embs)
    max_sim = float(cosine_scores.max().item())
    novelty = round((1.0 - max_sim) * 100, 2)
    
    return {
        "novelty_score": max(0.0, min(100.0, novelty)),
        "max_similarity": round(max_sim * 100, 2),
        "status": "High Novelty" if novelty >= 55 else "Moderate / High Overlap"
    }