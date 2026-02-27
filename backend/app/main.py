from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import catalog, match, intelligence, admin
import json, os

app = FastAPI(title="VyaparSetu AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory demo cache
demo_cache = {}

@app.on_event("startup")
async def load_demo_cache():
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    try:
        with open(os.path.join(data_dir, "demo_scenarios.json")) as f:
            scenarios = json.load(f)
            for s in scenarios["scenarios"]:
                demo_cache[s["id"]] = s
                # Also cache by input text for quick lookup
                demo_cache[s["input"]["text_hi"]] = s
                demo_cache[s["input"]["text_en"]] = s
    except Exception as e:
        print(f"Warning: Could not load demo cache: {e}")

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "VyaparSetu AI"}

app.include_router(catalog.router, prefix="/api/catalog", tags=["catalog"])
app.include_router(match.router, prefix="/api/match", tags=["match"])
app.include_router(intelligence.router, prefix="/api/intelligence", tags=["intelligence"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
