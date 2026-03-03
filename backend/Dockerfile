FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download embedding model during build to avoid runtime timeouts
RUN python -c "import os; \
os.environ.setdefault('HF_HOME','/tmp/hf'); \
os.environ.setdefault('TRANSFORMERS_CACHE','/tmp/hf'); \
os.environ.setdefault('SENTENCE_TRANSFORMERS_HOME','/tmp/hf'); \
from sentence_transformers import SentenceTransformer; \
SentenceTransformer('all-mpnet-base-v2')"

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
