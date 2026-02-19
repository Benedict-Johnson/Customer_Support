from datetime import datetime, UTC
from contextlib import asynccontextmanager
from typing import Any
from uuid import uuid4

from fastapi import FastAPI,Query
from pydantic import BaseModel, Field

from support_agent.db import fetch_logs 

from support_agent.agent import handle_complaint
from support_agent.db import init_db
from support_agent.rag import retrieve_policy_rag
import json
from typing import Any


class ComplaintRequest(BaseModel):
    complaint_text: str = Field(..., min_length=1, description="Customer complaint text")
    customer_id: str | None = None
    channel: str | None = None
    metadata: dict[str, Any] | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Manage app lifecycle with explicit startup warmup.

    Startup performs one-time initialization and a lightweight retrieval call to
    warm model/RAG dependencies so first user requests avoid cold-start overhead.
    This can add a small delay during process boot.
    """
    init_db()
    # Warm up retrieval/model path once during startup; first boot may be slower.
    retrieve_policy_rag("startup warmup", top_k=1)
    yield


app = FastAPI(title="Customer Support LLM API", version="1.0.0", lifespan=lifespan)

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/v1/complaints/respond")
def respond_to_complaint(payload: ComplaintRequest) -> dict[str, Any]:
    agent_response = handle_complaint(payload.complaint_text)

    return {
        "request_id": str(uuid4()),
        "timestamp": datetime.now(UTC).isoformat(),
        "customer_id": payload.customer_id,
        "channel": payload.channel,
        "metadata": payload.metadata,
        "result": agent_response,
    }


@app.post("/v1/complaints/message")
def respond_text_only(payload: ComplaintRequest) -> dict[str, Any]:
    """UI-friendly endpoint: return only user-facing text."""
    agent_response = handle_complaint(payload.complaint_text)

    # handle_complaint sometimes returns JSON string, sometimes dict
    if isinstance(agent_response, str):
        try:
            agent_response = json.loads(agent_response)
        except Exception:
            agent_response = {"response_text": str(agent_response)}

    return {"response_text": agent_response.get("response_text", "")}



@app.get("/v1/logs")
def get_logs(limit: int = Query(20, ge=1, le=200)) -> dict[str, Any]:
    """Return latest interaction logs (debug/admin)."""
    rows = fetch_logs(limit=limit)
    return {"count": len(rows), "logs": rows}
