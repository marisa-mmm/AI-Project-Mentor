import os
from dotenv import load_dotenv
from anthropic import Anthropic
from sentence_transformers import SentenceTransformer, util

load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

hf_embedder = SentenceTransformer("all-MiniLM-L6-v2")

def call_llm(prompt: str, system_prompt: str = "You are an expert academic project mentor.", max_tokens: int = 1500) -> str:
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text

def compute_novelty(user_text: str, reference_corpus: list[str]) -> dict:
    """Computes semantic similarity against existing project ideas using embeddings."""
    if not reference_corpus:
        return {"novelty_score": 100.0, "status": "Unique Idea"}
    
    user_emb = hf_embedder.encode(user_text, convert_to_tensor=True)
    corpus_embs = hf_embedder.encode(reference_corpus, convert_to_tensor=True)
    cosine_scores = util.cos_sim(user_emb, corpus_embs)
    max_sim = float(cosine_scores.max().item())
    novelty = round((1.0 - max_sim) * 100, 2)
    
    return {
        "novelty_score": novelty,
        "max_similarity": round(max_sim * 100, 2),
        "status": "High Novelty" if novelty >= 50 else "High Overlap / Common Idea"
    }