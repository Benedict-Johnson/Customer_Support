from .config import SIMILARITY_THRESHOLD, MARGIN_THRESHOLD
from .rag import retrieve_policy_rag

def decision_layer(user_text):
    results = retrieve_policy_rag(user_text, top_k=2)
    top1 = results[0]
    top2 = results[1] if len(results) > 1 else {"score": 0.0}

    # Escalate if confidence is actually low
    if top1["score"] < SIMILARITY_THRESHOLD:
        return {
            "escalate": True,
            "reason": "Low similarity score",
            "score": top1["score"]
        }

    # Escalate if it's ambiguous (two policies almost equally likely)
    if (top1["score"] - top2["score"]) < MARGIN_THRESHOLD:
        return {
            "escalate": True,
            "reason": "Ambiguous policy match",
            "score": top1["score"],
            "top1": top1,
            "top2": top2
        }

    return {
        "escalate": False,
        "policy": top1
    }
