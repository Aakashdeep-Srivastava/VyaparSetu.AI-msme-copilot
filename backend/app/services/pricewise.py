import json
import os
import time
from app.services.bedrock import bedrock_client
from app.services.utils import extract_json

_pricing_data = {}
_demo_cache = {}
_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def _load_data():
    global _pricing_data, _demo_cache
    try:
        with open(os.path.join(_data_dir, "pricing_data.json")) as f:
            _pricing_data = json.load(f).get("categories", {})
    except Exception:
        pass
    try:
        with open(os.path.join(_data_dir, "demo_scenarios.json")) as f:
            data = json.load(f)
            for s in data["scenarios"]:
                cat_path = s["expected_classification"]["top_3"][0]["category"]
                _demo_cache[cat_path] = s
    except Exception:
        pass

_load_data()

# Map category paths to pricing data keys
CATEGORY_KEY_MAP = {
    "Home & Decor > Metalware > Brass Decoratives": "brass_decoratives",
    "Fashion > Ethnic Wear > Silk Sarees": "silk_sarees",
    "Food & Beverages > Spices > Organic Spices": "organic_spices",
    "Fashion > Ethnic Wear > Handloom Sarees": "handloom_textiles",
    "Home & Decor > Furnishings > Wooden Furniture": "wooden_furniture",
    "Fashion > Accessories > Leather Goods": "leather_goods",
}

PRICING_INSIGHT_PROMPT = """You are a pricing advisor for Indian MSME sellers on e-commerce platforms.

Category: {category}
Products and their market data:
{products_summary}

Peak Season: {peak_season}
YoY Growth: {growth_yoy}%
{price_context}

Generate actionable pricing advice. Return ONLY a JSON object:
{{
  "product": "{lead_product}",
  "your_price": {your_price},
  "category_median": {category_median},
  "price_position": "X% above/below median",
  "recommendation_en": "2-3 sentences of actionable pricing advice in English",
  "recommendation_hi": "Same advice in Hinglish (Hindi words in Roman script)"
}}

Be specific: mention seasonal timing, price adjustments with exact numbers, and platform strategy."""

GEO_INSIGHT_PROMPT = """You are a geographic expansion advisor for Indian MSME sellers.

Category: {category}
Peak Season: {peak_season}
YoY Growth: {growth_yoy}%
Current demand trends show growth in this sector.

Suggest geographic expansion regions within India for this product category.
Consider: tier-2/3 city demand growth, regional preferences, competition density, logistics feasibility.

Return ONLY a JSON object:
{{
  "geo_insight_en": "2-3 sentences about which regions to expand to and why, in English",
  "geo_insight_hi": "Same insight in Hinglish (Hindi words in Roman script)",
  "demand_spike": "e.g. +40% Oct-Nov (Diwali)",
  "expansion_regions": ["Region1", "Region2", "Region3"],
  "expansion_growth": "estimated QoQ growth like 20% QoQ"
}}"""


def _find_pricing_data(category: str) -> tuple[str, dict | None]:
    """Find pricing data for a category. Returns (key, data) or ("", None)."""
    key = CATEGORY_KEY_MAP.get(category, "")
    if key:
        data = _pricing_data.get(key)
        if data:
            return key, data

    # Try partial match on category path
    for cat_path, k in CATEGORY_KEY_MAP.items():
        if cat_path.lower() in category.lower() or category.lower() in cat_path.lower():
            data = _pricing_data.get(k)
            if data:
                return k, data

    # Try matching against pricing data's category_path fields
    for k, v in _pricing_data.items():
        stored_path = v.get("category_path", "")
        if stored_path.lower() in category.lower() or category.lower() in stored_path.lower():
            return k, v

    return "", None


def _build_products_summary(data: dict) -> tuple[str, str, float]:
    """Build a text summary of products. Returns (summary, lead_product_name, lead_median)."""
    lines = []
    lead_product = ""
    lead_median = 0
    max_samples = 0
    for name, stats in data.get("products", {}).items():
        display_name = name.replace("_", " ").title()
        lines.append(f"- {display_name}: median Rs.{stats['median_price']}, range Rs.{stats['p25']}-{stats['p75']}, {stats['sample_size']} samples")
        if stats["sample_size"] > max_samples:
            max_samples = stats["sample_size"]
            lead_product = display_name
            lead_median = stats["median_price"]
    return "\n".join(lines), lead_product, lead_median


async def _generate_pricing_insight(category: str, data: dict, your_price: float = None) -> dict | None:
    """Generate AI-powered pricing insight via Bedrock Claude."""
    products_summary, lead_product, lead_median = _build_products_summary(data)
    if not lead_product:
        return None

    price_context = ""
    effective_price = your_price or lead_median
    if your_price:
        diff_pct = round((your_price - lead_median) / lead_median * 100, 1)
        position = f"{abs(diff_pct)}% {'above' if diff_pct > 0 else 'below'} median"
        price_context = f"Seller's current price: Rs.{your_price} ({position})"
    else:
        price_context = "No seller price provided - give general market positioning advice."

    prompt = PRICING_INSIGHT_PROMPT.format(
        category=category,
        products_summary=products_summary,
        peak_season=data.get("demand_trends", {}).get("peak_season", "Unknown"),
        growth_yoy=data.get("demand_trends", {}).get("growth_yoy", 0),
        price_context=price_context,
        lead_product=lead_product,
        your_price=effective_price,
        category_median=lead_median,
    )

    try:
        raw = await bedrock_client.invoke_claude(
            prompt,
            system="You are a pricing advisor for Indian MSMEs. Return only valid JSON."
        )
        parsed = extract_json(raw)
        if parsed and "recommendation_en" in parsed:
            return parsed
    except Exception as e:
        print(f"Pricing insight generation error: {e}")

    return None


async def _generate_geo_insight(category: str, data: dict) -> dict | None:
    """Generate AI-powered geographic expansion insight via Bedrock Claude."""
    prompt = GEO_INSIGHT_PROMPT.format(
        category=category,
        peak_season=data.get("demand_trends", {}).get("peak_season", "Unknown"),
        growth_yoy=data.get("demand_trends", {}).get("growth_yoy", 0),
    )

    try:
        raw = await bedrock_client.invoke_claude(
            prompt,
            system="You are a geographic expansion advisor for Indian MSMEs. Return only valid JSON."
        )
        parsed = extract_json(raw)
        if parsed and "geo_insight_en" in parsed:
            return parsed
    except Exception as e:
        print(f"Geo insight generation error: {e}")

    return None


async def get_pricing_intelligence(category: str, your_price: float = None, language: str = "en") -> dict:
    start = time.time()

    # Check demo cache for fast path
    demo_insight = None
    if category in _demo_cache:
        scenario = _demo_cache[category]
        demo_insight = scenario.get("expected_pricing")

    # Find pricing data
    _, data = _find_pricing_data(category)

    if not data:
        return {
            "category": category,
            "category_path": category,
            "products": [],
            "demand_trends": [],
            "peak_season": "Unknown",
            "growth_yoy": 0,
            "insight": None,
            "geo_insight": None,
            "processing_time_ms": round((time.time() - start) * 1000, 1)
        }

    products = []
    for name, stats in data.get("products", {}).items():
        products.append({
            "name": name.replace("_", " ").title(),
            "median_price": stats["median_price"],
            "p25": stats["p25"],
            "p75": stats["p75"],
            "avg_price": stats["avg_price"],
            "sample_size": stats["sample_size"]
        })

    trends = data.get("demand_trends", {}).get("monthly", [])
    peak = data.get("demand_trends", {}).get("peak_season", "Unknown")
    growth = data.get("demand_trends", {}).get("growth_yoy", 0)

    insight = None
    geo_insight = None

    if demo_insight:
        # Fast path: use demo cache
        insight = {
            "product": demo_insight["product"],
            "your_price": demo_insight["your_price"],
            "category_median": demo_insight["category_median"],
            "price_position": demo_insight["price_position"],
            "recommendation_hi": demo_insight["recommendation_hi"],
            "recommendation_en": demo_insight["recommendation_en"],
        }
        if "geo_insight_en" in demo_insight:
            geo_insight = {
                "geo_insight_hi": demo_insight.get("geo_insight_hi", ""),
                "geo_insight_en": demo_insight.get("geo_insight_en", ""),
                "demand_spike": demo_insight.get("demand_spike", ""),
                "expansion_regions": demo_insight.get("expansion_regions", []),
                "expansion_growth": demo_insight.get("expansion_growth", ""),
            }
    else:
        # Dynamic path: generate insights via Claude
        insight = await _generate_pricing_insight(category, data, your_price)
        geo_insight = await _generate_geo_insight(category, data)

    elapsed = (time.time() - start) * 1000
    if demo_insight:
        elapsed += 50  # simulated latency for demo cache

    return {
        "category": category,
        "category_path": data.get("category_path", category),
        "products": products,
        "demand_trends": trends,
        "peak_season": peak,
        "growth_yoy": growth,
        "insight": insight,
        "geo_insight": geo_insight,
        "processing_time_ms": round(elapsed, 1)
    }
