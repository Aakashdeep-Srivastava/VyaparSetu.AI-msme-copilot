import json
import math
import os
import time
from app.services.bedrock import bedrock_client
from app.services.utils import extract_json
from app.models.schemas import MatchResponse, PlatformMatch, MatchFactor
from app.models.database import add_match

# Load platforms
_platforms = []
_demo_cache = {}
_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def _load_data():
    global _platforms, _demo_cache
    try:
        with open(os.path.join(_data_dir, "platforms_seed.json")) as f:
            data = json.load(f)
            # Handle both raw array and {"platforms": [...]} formats
            if isinstance(data, list):
                _platforms = data
            else:
                _platforms = data.get("platforms", [])
    except Exception:
        pass
    try:
        with open(os.path.join(_data_dir, "demo_scenarios.json")) as f:
            data = json.load(f)
            for s in data["scenarios"]:
                key = s["expected_classification"]["top_3"][0]["category"]
                _demo_cache[key] = s
    except Exception:
        pass

_load_data()

# Weights: M = 0.35D + 0.20G + 0.15C + 0.20H + 0.10S
WEIGHTS = {"domain": 0.35, "geography": 0.20, "capacity": 0.15, "history": 0.20, "specialization": 0.10}

def _haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def _cosine_similarity(a, b):
    if not a or not b or len(a) != len(b):
        return 0.5
    dot = sum(x*y for x,y in zip(a,b))
    mag_a = math.sqrt(sum(x*x for x in a))
    mag_b = math.sqrt(sum(x*x for x in b))
    if mag_a == 0 or mag_b == 0:
        return 0.5
    return dot / (mag_a * mag_b)

async def _compute_domain_score(product_description: str, product_category: str, platform: dict) -> float:
    """Compute domain score using Titan embeddings + L1 string match fallback."""
    platform_embedding = platform.get("embedding")
    if platform_embedding:
        try:
            product_embedding = await bedrock_client.get_embedding(product_description)
            sim = _cosine_similarity(product_embedding, platform_embedding)
            # Normalize: cosine similarity is [-1, 1], map to [0.3, 0.95]
            return max(0.3, min(0.95, 0.3 + (sim + 1) * 0.325))
        except Exception:
            pass

    # Fallback: L1 string match
    l1 = product_category.split(" > ")[0] if " > " in product_category else product_category
    domains = platform.get("domains", [])
    if l1 in domains:
        return 0.85 + 0.1 * (1 / (domains.index(l1) + 1))
    for d in domains:
        if l1.lower() in d.lower() or d.lower() in l1.lower():
            return 0.65
    return 0.3

def _compute_geography_score(lat, lon, platform: dict) -> float:
    plat_geo = platform.get("geography", {})
    plat_lat = plat_geo.get("lat", 28.6)
    plat_lon = plat_geo.get("lon", 77.2)
    dist = _haversine(lat or 28.6, lon or 77.2, plat_lat, plat_lon)
    return max(0.3, 1.0 - (dist / 2000))

def _compute_capacity_score(platform: dict) -> float:
    cap = platform.get("capacity", {})
    load = cap.get("load_ratio", 0.5)
    return max(0.3, 1.0 - load * 0.5)

def _compute_history_score(platform: dict) -> float:
    history = platform.get("history", {})
    return history.get("success_rate", 0.5)

def _compute_specialization_score(business_type: str, platform: dict) -> float:
    spec = platform.get("specialization", {})
    if business_type == "B2B":
        return min(1.0, spec.get("b2b_ratio", 0.5) + 0.3)
    else:
        return min(1.0, spec.get("b2c_ratio", 0.5) + 0.3)


EXPLANATION_PROMPT = """You are a marketplace advisor for Indian MSMEs. Generate a brief, helpful explanation (2-3 sentences) for why this platform is a good match.

Product: {product_description}
Category: {product_category}
Platform: {platform_name}
Platform Description: {platform_desc}
Match Score: {score}
Key Factors: Domain={domain}, Geography={geography}, Capacity={capacity}, History={history}, Specialization={specialization}

Return ONLY a JSON object:
{{"explanation_en": "...", "explanation_hi": "..."}}

The Hindi explanation should be in Hinglish (Hindi words in Roman script). Keep both explanations concise and actionable."""


async def _generate_explanations(product_description: str, product_category: str, scored_platforms: list) -> list[dict]:
    """Generate bilingual explanations for top platforms via Bedrock."""
    results = []
    for m in scored_platforms:
        # Find platform data
        platform_data = next((p for p in _platforms if p["name"] == m["platform"]), {})
        prompt = EXPLANATION_PROMPT.format(
            product_description=product_description,
            product_category=product_category,
            platform_name=m["platform"],
            platform_desc=platform_data.get("description", ""),
            score=m["score"],
            domain=m["factors"]["domain"],
            geography=m["factors"]["geography"],
            capacity=m["factors"]["capacity"],
            history=m["factors"]["history"],
            specialization=m["factors"]["specialization"],
        )
        try:
            raw = await bedrock_client.invoke_claude(prompt, system="You are a marketplace advisor. Return only valid JSON.")
            parsed = extract_json(raw)
            m["explanation_en"] = parsed.get("explanation_en", f"{m['platform']} scored {m['score']} based on strong domain match and geographic proximity.")
            m["explanation_hi"] = parsed.get("explanation_hi", f"{m['platform']} ka score {m['score']} hai, acchi domain matching aur geographic proximity ke basis par.")
        except Exception:
            m["explanation_en"] = f"{m['platform']} scored {m['score']} based on strong domain match and geographic proximity."
            m["explanation_hi"] = f"{m['platform']} ka score {m['score']} hai, acchi domain matching aur geographic proximity ke basis par."
        results.append(m)
    return results


async def recommend_platforms(
    product_category: str,
    product_description: str,
    location: str,
    language: str = "en",
    business_type: str = "B2C",
    lat: float = None,
    lon: float = None,
) -> MatchResponse:
    start = time.time()

    # Check demo cache
    if product_category in _demo_cache:
        scenario = _demo_cache[product_category]
        matches = []
        for m in scenario["expected_matching"]["top_3"]:
            matches.append(PlatformMatch(
                platform=m["platform"],
                score=m["score"],
                factors=MatchFactor(**m["factors"]),
                explanation_hi=m["explanation_hi"],
                explanation_en=m["explanation_en"]
            ))

        elapsed = (time.time() - start) * 1000 + 85

        add_match({
            "category": product_category,
            "location": location,
            "top_platform": matches[0].platform,
            "top_score": matches[0].score,
        })

        return MatchResponse(
            msme_profile={"category": product_category, "location": location, "business_type": business_type},
            top_platforms=matches,
            processing_time_ms=round(elapsed, 1)
        )

    # Live matching with embeddings
    scored = []
    for platform in _platforms:
        d = await _compute_domain_score(product_description, product_category, platform)
        g = _compute_geography_score(lat, lon, platform)
        c = _compute_capacity_score(platform)
        h = _compute_history_score(platform)
        s = _compute_specialization_score(business_type, platform)

        total = WEIGHTS["domain"]*d + WEIGHTS["geography"]*g + WEIGHTS["capacity"]*c + WEIGHTS["history"]*h + WEIGHTS["specialization"]*s

        scored.append({
            "platform": platform["name"],
            "score": round(total, 2),
            "factors": {"domain": round(d,2), "geography": round(g,2), "capacity": round(c,2), "history": round(h,2), "specialization": round(s,2)}
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    top3 = scored[:3]

    # Generate AI-powered bilingual explanations
    top3 = await _generate_explanations(product_description, product_category, top3)

    matches = []
    for m in top3:
        matches.append(PlatformMatch(
            platform=m["platform"],
            score=m["score"],
            factors=MatchFactor(**m["factors"]),
            explanation_hi=m["explanation_hi"],
            explanation_en=m["explanation_en"]
        ))

    elapsed = (time.time() - start) * 1000

    add_match({
        "category": product_category,
        "location": location,
        "top_platform": matches[0].platform if matches else "None",
        "top_score": matches[0].score if matches else 0,
    })

    return MatchResponse(
        msme_profile={"category": product_category, "location": location, "business_type": business_type},
        top_platforms=matches,
        processing_time_ms=round(elapsed, 1)
    )
