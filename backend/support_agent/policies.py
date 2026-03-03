from __future__ import annotations

import json
from pathlib import Path
from typing import Any, List, Dict

def _repo_root() -> Path:
    # support_agent/policies.py -> repo root is two levels up
    return Path(__file__).resolve().parents[1]

def load_policies() -> List[Dict[str, Any]]:
    path = _repo_root() / "data" / "policies.json"
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

policies = load_policies()