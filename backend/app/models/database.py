"""Simple in-memory store for demo purposes."""
import uuid
from datetime import datetime

# In-memory stores
classifications_store: list[dict] = []
matches_store: list[dict] = []
overrides_store: list[dict] = []
audit_log: list[dict] = []

def add_classification(data: dict) -> str:
    record_id = str(uuid.uuid4())[:8]
    record = {
        "id": record_id,
        "timestamp": datetime.utcnow().isoformat(),
        **data
    }
    classifications_store.append(record)
    return record_id

def add_match(data: dict) -> str:
    record_id = str(uuid.uuid4())[:8]
    record = {
        "id": record_id,
        "timestamp": datetime.utcnow().isoformat(),
        **data
    }
    matches_store.append(record)
    return record_id

def add_override(data: dict) -> str:
    audit_id = str(uuid.uuid4())[:8]
    record = {
        "audit_id": audit_id,
        "timestamp": datetime.utcnow().isoformat(),
        **data
    }
    overrides_store.append(record)
    audit_log.append(record)
    return audit_id

def get_dashboard_data() -> dict:
    total = len(classifications_store)
    if total == 0:
        return {
            "total_onboarded": 0,
            "avg_confidence": 0,
            "avg_processing_time_ms": 0,
            "band_distribution": {"GREEN": 0, "YELLOW": 0, "RED": 0},
            "recent_classifications": []
        }

    bands = {"GREEN": 0, "YELLOW": 0, "RED": 0}
    total_confidence = 0
    total_time = 0

    for c in classifications_store:
        band = c.get("band", "RED")
        bands[band] = bands.get(band, 0) + 1
        total_confidence += c.get("confidence", 0)
        total_time += c.get("processing_time_ms", 0)

    return {
        "total_onboarded": total,
        "avg_confidence": round(total_confidence / total, 3) if total > 0 else 0,
        "avg_processing_time_ms": round(total_time / total, 1) if total > 0 else 0,
        "band_distribution": bands,
        "recent_classifications": classifications_store[-10:][::-1]
    }
