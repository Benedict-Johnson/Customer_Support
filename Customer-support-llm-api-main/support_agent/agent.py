import datetime
import json

from .decision import decision_layer
from .llm import generate_response
from .db import write_log

interaction_logs = []

def handle_complaint(user_text):
    decision = decision_layer(user_text)

    log_entry = {
        "timestamp": str(datetime.datetime.now(datetime.UTC)),
        "user_text": user_text,
        "similarity_score": None,
        "policy_id": None,
        "escalated": None,
        "response": None
    }

    # ---- ESCALATION ----
    if decision["escalate"]:
        log_entry["similarity_score"] = decision.get("score")
        log_entry["escalated"] = True

        response_obj = {
            "response_text": "Your complaint requires human review.",
            "action_taken": "Escalated to human support",
            "escalate": True
        }

        log_entry["response"] = response_obj
        interaction_logs.append(log_entry)

        # ✅ DB log too
        write_log(
            user_text=user_text,
            policy_id=None,
            score=decision.get("score"),
            escalated=True,
            response_obj=response_obj
        )

        return response_obj

    # ---- NORMAL POLICY HANDLING ----
    policy = decision["policy"]
    log_entry["similarity_score"] = policy["score"]
    log_entry["policy_id"] = policy["policy_id"]
    log_entry["escalated"] = False

    response = generate_response(user_text, policy["content"])
    parsed_response = json.loads(response)

    log_entry["response"] = parsed_response
    interaction_logs.append(log_entry)

    # ✅ DB log too
    write_log(
        user_text=user_text,
        policy_id=policy["policy_id"],
        score=policy["score"],
        escalated=False,
        response_obj=parsed_response
    )

    return parsed_response
