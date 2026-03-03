# Policy-Aware Customer Support Agent (LLM + RAG)

## Setup
1) Create an environment and install deps:
```bash
pip install -r requirements.txt
```

2) Set Groq key:
```bash
export GROQ_API_KEY="YOUR_KEY"
```

## Run API locally
```bash
uvicorn app.main:app --reload --port 8000
```

## Run CLI
```bash
PYTHONPATH=. python scripts/chat_cli.py
```

## Notes
- `data/policies.json` holds the policies.
- SQLite logs are written to `support.db`.
- API endpoint: `POST /v1/complaints/respond`.

## API usage example

Ensure `GROQ_API_KEY` is set before starting the API. The first startup may be slightly slower because the app performs a one-time warmup of retrieval/model dependencies.

```bash
curl -X POST "http://127.0.0.1:8000/v1/complaints/respond" \
  -H "Content-Type: application/json" \
  -d '{
    "complaint_text": "My package arrived damaged and I need a replacement.",
    "customer_id": "cust_123",
    "channel": "email",
    "metadata": {"order_id": "ORD-9001"}
  }'
```

Sample response:

```json
{
  "request_id": "2f0e8c2a-3d7a-4e54-b8c2-84d0d1f9736a",
  "timestamp": "2026-01-15T12:34:56.789012+00:00",
  "customer_id": "cust_123",
  "channel": "email",
  "metadata": {
    "order_id": "ORD-9001"
  },
  "result": {
    "response_text": "I'm sorry your package arrived damaged. I can help with a replacement right away.",
    "reasoning": "Policy allows replacement for damaged goods within 30 days.",
    "action": "replacement_initiated"
  }
}
```

