from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

from .policies import policies

embedding_model = SentenceTransformer("all-mpnet-base-v2")

policy_texts = [p["title"] + " " + p["content"] for p in policies]

policy_embeddings = embedding_model.encode(policy_texts, normalize_embeddings=True)

dimension = policy_embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)   # NOT L2
index.add(np.array(policy_embeddings))

def retrieve_policy_rag(query, top_k=3):
    query_embedding = embedding_model.encode([query], normalize_embeddings=True)
    distances, indices = index.search(np.array(query_embedding), top_k)

    results = []
    for score, idx in zip(distances[0], indices[0]):
        results.append({
            "policy_id": policies[idx]["id"],
            "content": policies[idx]["content"],
            "score": float(score)
        })

    return results
