from __future__ import annotations

import json
import os
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, Query
from pydantic import BaseModel, Field

from fastapi.middleware.cors import CORSMiddleware

from support_agent.agent import handle_complaint
from support_agent.db import fetch_logs, init_db
from support_agent.rag import retrieve_policy_rag


class ComplaintRequest(BaseModel):
    complaint_text: str = Field(..., min_length=1, description="Customer complaint text")
    customer_id: str | None = None
    channel: str | None = None
    metadata: dict[str, Any] | None = None


def _ensure_hf_cache_dirs() -> None:
    """
    Render containers sometimes have restricted/ephemeral filesystems.
    Point HF caches to /tmp unless user explicitly sets them.
    """
    os.environ.setdefault("HF_HOME", "/tmp/hf")
    os.environ.setdefault("TRANSFORMERS_CACHE", "/tmp/hf")
    os.environ.setdefault("SENTENCE_TRANSFORMERS_HOME", "/tmp/hf")


@asynccontextmanager
async def lifespan(_: FastAPI):
    """
    Keep startup fast so Render can detect the open port.
    Warmup is optional; disable on Render with DISABLE_WARMUP=1.
    """
    _ensure_hf_cache_dirs()

    # DB init should be quick
    init_db()

    # Optional warmup (model load can be slow / memory-heavy on free tiers)
    if os.getenv("DISABLE_WARMUP") != "1":
        try:
            retrieve_policy_rag("startup warmup", top_k=1)
        except Exception as e:
            # Do not crash the service just because warmup failed
            # (Render needs the port open first).
            print(f"[WARN] Warmup skipped due to error: {e}")

    yield


app = FastAPI(title="Customer Support LLM API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for demo; later you can restrict to your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    # Must be instant; no model calls here.
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


@app.post("/debug/rag")
def debug_rag(payload: ComplaintRequest):
    return {"matches": retrieve_policy_rag(payload.complaint_text, top_k=1)}


@app.get("/debug/policies")
def debug_policies():
    from support_agent.policies import policies
    return {
        "count": len(policies),
        "ids": [p["id"] for p in policies],
        "titles": [p["title"] for p in policies],
    }