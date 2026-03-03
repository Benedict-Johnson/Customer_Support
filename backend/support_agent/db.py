"""DB adapter.

Defaults to local SQLite for zero-config dev.

If DATABASE_URL is set (recommended for deployment), logs are written to that
database (e.g., Postgres). The rest of the AI pipeline stays unchanged.
"""

import os
import sqlite3
import datetime
import json

from .config import DB_PATH


DATABASE_URL = os.getenv("DATABASE_URL", "").strip()


def _is_postgres(url: str) -> bool:
    u = url.lower()
    return u.startswith("postgresql://") or u.startswith("postgres://") or u.startswith("postgresql+psycopg2://")


def init_db():
    if DATABASE_URL and _is_postgres(DATABASE_URL):
        import psycopg2  # type: ignore

        pg_url = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql://", 1)
        conn = psycopg2.connect(pg_url)
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS interaction_logs (
                id SERIAL PRIMARY KEY,
                timestamp TEXT,
                user_text TEXT,
                policy_id TEXT,
                similarity_score DOUBLE PRECISION,
                escalated INTEGER,
                response_json TEXT
            );
            """
        )
        conn.commit()
        cur.close()
        conn.close()
        return

    # ---- SQLITE (default) ----
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS interaction_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            user_text TEXT,
            policy_id TEXT,
            similarity_score REAL,
            escalated INTEGER,
            response_json TEXT
        )
        """
    )
    conn.commit()
    conn.close()


def fetch_logs(limit: int = 20):
    limit = int(limit)

    if DATABASE_URL and _is_postgres(DATABASE_URL):
        import psycopg2  # type: ignore

        pg_url = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql://", 1)
        conn = psycopg2.connect(pg_url)
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, timestamp, user_text, policy_id, similarity_score, escalated, response_json
            FROM interaction_logs
            ORDER BY id DESC
            LIMIT %s
            """,
            (limit,),
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()

        logs = []
        for r in rows:
            logs.append(
                {
                    "id": r[0],
                    "timestamp": r[1],
                    "user_text": r[2],
                    "policy_id": r[3],
                    "similarity_score": r[4],
                    "escalated": bool(r[5]),
                    "response": json.loads(r[6]) if r[6] else None,
                }
            )
        return logs

    # ---- SQLITE (default) ----
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, timestamp, user_text, policy_id, similarity_score, escalated, response_json
        FROM interaction_logs
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    )
    rows = cur.fetchall()
    conn.close()

    logs = []
    for r in rows:
        logs.append(
            {
                "id": r[0],
                "timestamp": r[1],
                "user_text": r[2],
                "policy_id": r[3],
                "similarity_score": r[4],
                "escalated": bool(r[5]),
                "response": json.loads(r[6]) if r[6] else None,
            }
        )
    return logs



def write_log(user_text, policy_id, score, escalated, response_obj):
    ts = datetime.datetime.now(datetime.UTC).isoformat()
    payload = json.dumps(response_obj)
    score_val = float(score) if score is not None else None
    escalated_val = 1 if escalated else 0

    if DATABASE_URL and _is_postgres(DATABASE_URL):
        import psycopg2  # type: ignore

        pg_url = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql://", 1)
        conn = psycopg2.connect(pg_url)

        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO interaction_logs (timestamp, user_text, policy_id, similarity_score, escalated, response_json)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (ts, user_text, policy_id, score_val, escalated_val, payload),
        )
        conn.commit()
        cur.close()
        conn.close()
        return

    # ---- SQLITE (default) ----
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO interaction_logs (timestamp, user_text, policy_id, similarity_score, escalated, response_json)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (ts, user_text, policy_id, score_val, escalated_val, payload),
    )
    conn.commit()
    conn.close()


# Safe to call at import time; creates SQLite locally or Postgres table if configured.
init_db()
