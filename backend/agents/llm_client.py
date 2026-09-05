import os
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import ServerError, APIError
from sentence_transformers import SentenceTransformer, util

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

hf_embedder = SentenceTransformer("all-MiniLM-L6-v2")

FALLBACK_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-2.5-flash",
    "gemini-flash-latest"
]

def call_llm(prompt: str, system_prompt: str = "You are an expert academic project mentor.", max_tokens: int = 8192) -> str:
    """Calls Gemini with automatic fallback across high-capacity models to bypass 503 server overloads."""
    last_error = None
    
    for model_name in FALLBACK_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    max_output_tokens=max_tokens,
                    temperature=0.3
                )
            )
            if response and response.text:
                return response.text
        except (ServerError, APIError) as e:
            last_error = e
            time.sleep(0.5)
            continue
        except Exception as e:
            last_error = e
            break

    raise RuntimeError(f"All Gemini fallback models exhausted: {last_error}")

def compute_novelty(user_text: str, reference_corpus: list) -> dict:
    """Calculates cosine similarity locally without external API calls."""
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