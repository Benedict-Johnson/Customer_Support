from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

# NOTE: do NOT import sentence_transformers/faiss/numpy at module import time
from .policies import policies

_embedding_model = None
_index = None
_policy_texts: Optional[List[str]] = None


def _ensure_hf_cache_dirs() -> None:
    # Safe defaults for Render; can be overridden via env vars.
    os.environ.setdefault("HF_HOME", "/tmp/hf")
    os.environ.setdefault("TRANSFORMERS_CACHE", "/tmp/hf")
    os.environ.setdefault("SENTENCE_TRANSFORMERS_HOME", "/tmp/hf")


def _init_rag() -> None:
    """Initialize embedding model + FAISS index once (lazy)."""
    global _embedding_model, _index, _policy_texts

    if _embedding_model is not None and _index is not None:
        return

    _ensure_hf_cache_dirs()

    from sentence_transformers import SentenceTransformer
    import faiss
    import numpy as np

    _embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    _policy_texts = [p["title"] + " " + p["content"] for p in policies]
    policy_embeddings = _embedding_model.encode(_policy_texts, normalize_embeddings=True)

    dimension = policy_embeddings.shape[1]
    _index = faiss.IndexFlatIP(dimension)
    _index.add(np.array(policy_embeddings))


def retrieve_policy_rag(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    _init_rag()

    import numpy as np

    query_embedding = _embedding_model.encode([query], normalize_embeddings=True)  # type: ignore[union-attr]
    distances, indices = _index.search(np.array(query_embedding), top_k)  # type: ignore[union-attr]

    results: List[Dict[str, Any]] = []
    for score, idx in zip(distances[0], indices[0]):
        results.append(
            {
                "policy_id": policies[idx]["id"],
                "content": policies[idx]["content"],
                "score": float(score),
            }
        )
    return results