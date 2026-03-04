# 🍔 Benny's Eats — AI-Powered Customer Support Agent

<div align="center">

<img width="1892" height="887" alt="image" src="https://github.com/user-attachments/assets/7eff6bd6-14ae-4154-883c-5e0adaad0952" />


**An intelligent customer support system embedded in a food delivery demo app,  
powered by RAG, LLaMA 3.3, and the Groq API.**

<img width="1897" height="893" alt="image" src="https://github.com/user-attachments/assets/71b004d9-f758-47ce-be27-4222639849ab" />
<img width="1896" height="820" alt="image" src="https://github.com/user-attachments/assets/4e5d0a02-8c89-4c8e-8260-1fad642dd262" />
<img width="1570" height="682" alt="image" src="https://github.com/user-attachments/assets/64e2df3e-649f-4c96-9d5b-c514b5a938dc" />
<img width="1556" height="727" alt="image" src="https://github.com/user-attachments/assets/e9d0453d-2499-4d34-8071-0eb14b3c6ea5" />

</div>

---

## 🌐 Live Website

> **🔗 [[https://your-project-url.vercel.app](https://customer-support-myf6ozs7i-benedict-johnsons-projects.vercel.app/)](https://customer-support-myf6ozs7i-benedict-johnsons-projects.vercel.app/)**
---

## 📸 Sample Output

<div align="center">

| Normal Policy Response | Escalated to Human | Human Review |
|:-:|:-:|:-:|
| <img width="400" alt="Normal Policy Response" src="https://github.com/user-attachments/assets/7bf329da-f4f8-458e-a43a-f3b29a52c3fc" /> | <img width="400" alt="Escalated to Human" src="https://github.com/user-attachments/assets/3d8c8c7c-caea-4cad-81f2-af8cd65ac307" /> | <img width="400" alt="Human Review" src="https://github.com/user-attachments/assets/36999f2c-0c81-4286-bbdf-74433b6e04d5" /> |
| *AI resolves complaint using matched policy* | *AI resolves another complaint using matched policy* | *Low-confidence query escalated for human review* |

</div>
> 📁 Place your screenshot images in an `assets/` folder at the root of the repo and update the paths above.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Local Development](#-local-development)
- [Deployment](#-deployment)
- [Known Limitations & Future Improvements](#-known-limitations--future-improvements)
- [Disclaimer](#-disclaimer)

---

## 🧠 Overview

**Benny's Eats** is a demonstration project that simulates a food delivery platform with a fully functioning **AI-powered customer support agent** built into the UI. When a customer submits a complaint, the backend:

1. **Retrieves the most relevant support policy** from a knowledge base using **RAG (Retrieval-Augmented Generation)** with semantic search (FAISS + sentence embeddings).
2. **Decides whether to auto-respond or escalate** based on similarity confidence scores and policy ambiguity.
3. **Generates a structured, policy-compliant response** using **LLaMA 3.3 70B** via the **Groq API**.
4. **Logs every interaction** to a database (SQLite locally / PostgreSQL in production).

The frontend is a mock food delivery app (React + Vite) that presents the AI support widget naturally within the product experience.

> ⚠️ This is a **demo project** — no real orders are placed and no real deliveries are made.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                │
│                    React + Vite (Vercel)                            │
│                                                                     │
│   [ Restaurant UI ]  ────►  [ Complaint Textarea ]                  │
│                                    │                                │
│                          POST /v1/complaints/message                │
└────────────────────────────────────┼────────────────────────────────┘
                                     │ HTTPS
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND (Render)                        │
│                                                                     │
│   ┌─────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│   │  /v1/        │    │   Decision Layer │    │   Groq Client    │  │
│   │  complaints  │───►│                  │───►│  (LLaMA 3.3 70B) │  │
│   │  /message    │    │  RAG Retrieval   │    │                  │  │
│   └─────────────┘    │  + Confidence    │    └──────────────────┘  │
│                       │    Thresholds    │             │             │
│                       └──────────────────┘             │             │
│                              │                          │             │
│                    ┌─────────▼──────────┐               │             │
│                    │   FAISS Index      │               │             │
│                    │ (18 Policy Embeds) │               │             │
│                    │  all-MiniLM-L6-v2  │               │             │
│                    └────────────────────┘               │             │
│                                                         ▼             │
│                                              ┌──────────────────┐    │
│                                              │  Response / Esc. │    │
│                                              │  + DB Log        │    │
│                                              └──────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ How It Works

### 1. RAG — Retrieval-Augmented Generation

When a complaint arrives, `rag.py` uses the **`sentence-transformers/all-MiniLM-L6-v2`** model to encode the complaint text and performs a **cosine similarity search** over a FAISS index built from 18 support policies stored in `data/policies.json`.

```python
# rag.py (simplified)
query_embedding = model.encode([query], normalize_embeddings=True)
distances, indices = faiss_index.search(query_embedding, top_k=2)
```

The top-2 matching policies and their similarity scores are returned.

---

### 2. Decision Layer

`decision.py` applies two escalation rules:

| Condition | Action |
|-----------|--------|
| `top1_score < SIMILARITY_THRESHOLD (0.25)` | ❌ Escalate — low confidence, no clear policy match |
| `top1_score - top2_score < MARGIN_THRESHOLD (0.05)` | ❌ Escalate — ambiguous, two policies equally likely |
| Neither condition met | ✅ Proceed to LLM response generation |

---

### 3. LLM Response Generation (Groq + LLaMA 3.3)

If not escalated, the matched policy content is injected into a prompt alongside the customer's complaint. **LLaMA 3.3 70B Versatile** (via Groq API) generates a structured JSON response:

```json
{
  "response_text": "We sincerely apologise for the spoiled food...",
  "action_taken": "Full refund initiated",
  "escalate": false
}
```

The model is instructed to strictly follow the retrieved policy — no hallucinated compensation or invented rules.

---

### 4. Escalation Response

If the decision layer escalates, the agent returns:

```json
{
  "response_text": "Your complaint requires human review.",
  "action_taken": "Escalated to human support",
  "escalate": true
}
```

---

### 5. Logging

Every interaction is written to the database via `db.py`:

- **SQLite** — used in local development (zero config)
- **PostgreSQL** — used in production (set `DATABASE_URL` env var)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **LLM** | LLaMA 3.3 70B Versatile (via Groq API) |
| **Embeddings** | `sentence-transformers/all-MiniLM-L6-v2` (HuggingFace) |
| **Vector Search** | FAISS (IndexFlatIP — inner product / cosine similarity) |
| **Backend Framework** | FastAPI + Uvicorn |
| **Frontend** | React 18 + Vite |
| **Styling** | Vanilla CSS-in-JSX (DM Sans + Syne fonts) |
| **Database** | SQLite (dev) / PostgreSQL via psycopg2 (prod) |
| **Backend Hosting** | [Render](https://render.com) (Dockerized) |
| **Frontend Hosting** | [Vercel](https://vercel.com) |
| **Containerization** | Docker |
| **API Client** | `groq` Python SDK |

---

## 📁 Project Structure

```
Customer Support/
│
├── backend/
│   ├── Dockerfile                     # Docker build for Render deployment
│   ├── docker-compose.yml             # Local Docker orchestration
│   ├── requirements.txt               # Python dependencies
│   │
│   ├── app/
│   │   └── main.py                    # FastAPI app — routes, CORS, lifespan hooks
│   │
│   ├── support_agent/
│   │   ├── __init__.py
│   │   ├── agent.py                   # Core orchestrator: routes complaints → decision → LLM → log
│   │   ├── rag.py                     # RAG engine: FAISS index + sentence embeddings
│   │   ├── decision.py                # Escalation logic: similarity & margin thresholds
│   │   ├── llm.py                     # LLM prompts: classify_complaint, generate_response
│   │   ├── groq_client.py             # Groq API client initialisation
│   │   ├── policies.py                # Policy loader from data/policies.json
│   │   ├── db.py                      # DB adapter: SQLite (dev) + PostgreSQL (prod)
│   │   └── config.py                  # Thresholds: SIMILARITY_THRESHOLD, MARGIN_THRESHOLD
│   │
│   ├── data/
│   │   └── policies.json              # 18 support policies (food_spoiled, late_delivery, etc.)
│   │
│   └── scripts/
│       ├── chat_cli.py                # CLI tool for testing the agent locally
│       └── eval_decision_only.py      # Evaluation script for the decision layer
│
└── frontend/
    ├── vite.config.js
    ├── eslint.config.js
    └── src/
        ├── main.jsx                   # React entry point
        └── App.jsx                    # Full app: restaurant UI + AI support widget
```

---

## 🔌 API Reference

Base URL (production): `https://customer-support-e7jj.onrender.com`

---

### `POST /v1/complaints/message`
UI-friendly endpoint. Returns only the user-facing response text.

**Request Body:**
```json
{
  "complaint_text": "My order arrived 45 minutes late and the food was cold.",
  "customer_id": "cust_123",    // optional
  "channel": "web",             // optional
  "metadata": {}                // optional
}
```

**Response:**
```json
{
  "response_text": "We're sorry for the delay. As per our policy, a ₹50 credit has been applied to your account."
}
```

---

### `POST /v1/complaints/respond`
Full structured response including metadata, request ID, and escalation flag.

**Response:**
```json
{
  "request_id": "uuid-here",
  "timestamp": "2024-01-01T12:00:00Z",
  "customer_id": "cust_123",
  "result": {
    "response_text": "...",
    "action_taken": "...",
    "escalate": false
  }
}
```

---

### `GET /v1/logs?limit=20`
Returns recent interaction logs (for admin/debugging). Defaults to last 20 entries, max 200.

---

### `POST /debug/rag`
Returns the top RAG policy match for a given complaint — useful for debugging retrieval quality.

---

### `GET /debug/policies`
Returns all loaded policy IDs and titles.

---

### `GET /health`
Health check endpoint — always returns instantly (no model calls).

```json
{ "status": "ok" }
```

---

## 🔐 Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key from [console.groq.com](https://console.groq.com) |
| `DATABASE_URL` | ⬜ Optional | PostgreSQL connection string for production logging. Falls back to SQLite if not set. |
| `DISABLE_WARMUP` | ⬜ Optional | Set to `1` to skip model warmup on startup (useful on memory-constrained free-tier Render instances) |
| `HF_HOME` | ⬜ Optional | HuggingFace cache directory. Defaults to `/tmp/hf` |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE` | ⬜ Optional | Backend URL. Defaults to `https://customer-support-e7jj.onrender.com` |

---

## 💻 Local Development

### Prerequisites
- Python 3.12+
- Node.js 18+
- A [Groq API Key](https://console.groq.com)

---

### Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-username/customer-support.git
cd "customer-support/backend"

# 2. Create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set your Groq API key
export GROQ_API_KEY="gsk_your_key_here"

# 5. Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The backend will be live at: **`http://localhost:8000`**

Interactive API docs: **`http://localhost:8000/docs`**

---

### Frontend Setup

```bash
# From the repo root
cd "customer-support/frontend"

# 1. Install dependencies
npm install

# 2. (Optional) Point to local backend
echo "VITE_API_BASE=http://localhost:8000" > .env.local

# 3. Start the dev server
npm run dev
```

The frontend will be live at: **`http://localhost:5173`**

---

### Using Docker (Optional)

```bash
cd "customer-support/backend"

# Build and run with Docker Compose
GROQ_API_KEY=gsk_your_key_here docker-compose up --build
```

---

### Test via CLI

```bash
cd backend
python scripts/chat_cli.py
```

---

## 🚀 Deployment

### Backend → Render

1. Push the repo to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set **Root Directory** to `backend`.
4. Render will auto-detect the `Dockerfile`.
5. Add environment variables in the Render dashboard:
   - `GROQ_API_KEY` = your key
   - `DATABASE_URL` = your PostgreSQL connection string (optional)
6. Deploy. The service exposes port `8000` (or `$PORT` if set by Render).

> **Note:** The Dockerfile pre-downloads the `all-mpnet-base-v2` embedding model during the build step to avoid timeouts at runtime.

---

### Frontend → Vercel

1. Import the repo into [Vercel](https://vercel.com).
2. Vercel reads `vercel.json` — it automatically sets the **Root Directory** to `frontend`.
3. Add environment variable in Vercel dashboard:
   - `VITE_API_BASE` = your Render backend URL
4. Deploy. Vercel handles the Vite build automatically.

---

## 🗺️ Known Limitations & Future Improvements

### ⚠️ Current Limitation
A significant portion of edge-case or unusual complaints trigger the `"Your complaint requires human review"` escalation response. This is because the current knowledge base contains **18 policies**, which may not cover every possible complaint scenario. When no policy matches with sufficient confidence, the system correctly escalates — but this reduces the automation rate.

### 🔮 Planned Improvements

- **📚 Expand the Knowledge Base** — Add more granular policies to cover edge cases and reduce the escalation rate. This is the single highest-impact improvement to the system's automation coverage.
- **🔄 Feedback Loop** — Allow human agents to flag and resolve escalated tickets, then feed corrected responses back into the policy base.
- **📊 Analytics Dashboard** — A dedicated admin UI to monitor escalation rates, policy hit frequency, and similarity score distributions over time.
- **🌍 Multi-language Support** — Extend complaint handling to regional languages using multilingual embedding models.
- **🧪 A/B Testing** — Test different similarity thresholds and margin values to optimise the escalation vs. auto-respond trade-off.
- **🔒 Auth Layer** — Add JWT-based authentication to `/v1/logs` and debug endpoints.
- **📬 Webhook Notifications** — Trigger alerts (email/Slack) when a complaint is escalated.
- **🏎️ Response Caching** — Cache responses for semantically similar complaints to reduce Groq API calls and latency.

---

## 📦 Dependencies

### Python (Backend)

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | 0.131.0 | Web framework |
| `uvicorn` | 0.41.0 | ASGI server |
| `groq` | 1.0.0 | Groq API client |
| `sentence-transformers` | 5.2.3 | Text embeddings for RAG |
| `faiss-cpu` | 1.13.2 | Vector similarity search |
| `torch` | 2.10.0 (CPU) | Required by sentence-transformers |
| `numpy` | latest | Numerical operations |
| `psycopg2-binary` | 2.9.11 | PostgreSQL adapter |

### JavaScript (Frontend)

| Package | Purpose |
|---------|---------|
| `react` | UI library |
| `vite` | Build tool & dev server |

---

## ⚖️ Disclaimer

**Benny's Eats** is a **demonstration project only**. It is not a real food delivery service. No orders can be placed, no deliveries are made, and no payments are processed. This project exists solely to demonstrate how AI-powered customer support agents can be integrated into a real-world product interface.

---

## 🙌 Acknowledgements

- [Groq](https://groq.com) — for blazing-fast LLaMA inference
- [Meta AI](https://ai.meta.com) — for the LLaMA 3.3 model
- [HuggingFace](https://huggingface.co) — for `sentence-transformers`
- [Facebook Research](https://github.com/facebookresearch/faiss) — for FAISS
- [Render](https://render.com) & [Vercel](https://vercel.com) — for effortless deployment

---

<div align="center">

Made with ❤️ · Built to demonstrate AI-powered support in production

</div>
