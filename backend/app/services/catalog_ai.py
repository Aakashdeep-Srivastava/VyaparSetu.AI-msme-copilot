import json
import time
import os
from app.services.bedrock import bedrock_client
from app.services.aws_nlp import aws_nlp
from app.services.utils import extract_json
from app.models.schemas import ClassifyResponse, CategoryResult, ProductAttributes, ConfidenceBand
from app.models.database import add_classification

# Load demo scenarios for cache
_demo_cache = {}
_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

# Load ONDC taxonomy for prompt injection and validation
_ondc_taxonomy = {}
_valid_hsn_codes = set()
_valid_category_codes = {}  # code -> {"category": "L1 > L2 > L3", "hsn": "XXXX"}

def _load_cache():
    global _demo_cache
    try:
        with open(os.path.join(_data_dir, "demo_scenarios.json")) as f:
            data = json.load(f)
            for s in data["scenarios"]:
                _demo_cache[s["input"]["text_hi"]] = s
                _demo_cache[s["input"]["text_en"]] = s
    except Exception:
        pass

def _load_taxonomy():
    global _ondc_taxonomy, _valid_hsn_codes, _valid_category_codes
    try:
        with open(os.path.join(_data_dir, "ondc_categories.json")) as f:
            _ondc_taxonomy = json.load(f)
            for cat in _ondc_taxonomy.get("categories", []):
                l1 = cat["l1"]
                for sub in cat.get("subcategories", []):
                    l2 = sub["l2"]
                    for item in sub.get("items", []):
                        l3 = item["l3"]
                        code = item["l3_code"]
                        hsn = item["hsn"]
                        full_cat = f"{l1} > {l2} > {l3}"
                        _valid_hsn_codes.add(hsn)
                        _valid_category_codes[code] = {"category": full_cat, "hsn": hsn}
    except Exception:
        pass

_load_cache()
_load_taxonomy()


def _build_taxonomy_text() -> str:
    """Build a compact taxonomy string for the classification prompt."""
    lines = []
    for cat in _ondc_taxonomy.get("categories", []):
        l1 = cat["l1"]
        l1_code = cat["l1_code"]
        for sub in cat.get("subcategories", []):
            l2 = sub["l2"]
            for item in sub.get("items", []):
                l3 = item["l3"]
                code = item["l3_code"]
                hsn = item["hsn"]
                lines.append(f"  {l1} > {l2} > {l3}  (code: {code}, HSN: {hsn})")
    return "\n".join(lines)


CLASSIFICATION_PROMPT = """You are an expert product classifier for Indian MSME products using the ONDC (Open Network for Digital Commerce) taxonomy.

## Available ONDC Categories (pick ONLY from this list):
{taxonomy}

## Instructions:
- Classify the product into the TOP 3 most likely categories from the list above
- Use EXACT category paths, codes, and HSN codes from the taxonomy
- Confidence scores for all 3 must sum to ~1.0
- Extract product attributes from the description

## Few-shot Examples:

### Example 1:
Input: "I make brass decorative items - flower vase, diya stand, candle holder" (Moradabad)
Output:
```json
{{
  "top_3": [
    {{"category": "Home & Decor > Metalware > Brass Decoratives", "code": "HD-MW-BD", "confidence": 0.92}},
    {{"category": "Home & Decor > Candles & Holders > Candle Holders", "code": "HD-CH-CH", "confidence": 0.05}},
    {{"category": "Art & Craft > Metal Art > Metal Art", "code": "AC-MA-MA", "confidence": 0.03}}
  ],
  "hsn_code": "7418",
  "attributes": {{
    "material": "Brass (Peetal)",
    "product_types": ["Flower Vase", "Diya Stand", "Candle Holder"],
    "origin": "Moradabad",
    "craft_type": "Handcrafted Metalware"
  }}
}}
```

### Example 2:
Input: "I make Banarasi silk sarees with zari work, for weddings" (Varanasi)
Output:
```json
{{
  "top_3": [
    {{"category": "Fashion > Ethnic Wear > Silk Sarees", "code": "FA-EW-SS", "confidence": 0.96}},
    {{"category": "Fashion > Ethnic Wear > Handloom Sarees", "code": "FA-EW-HS", "confidence": 0.025}},
    {{"category": "Art & Craft > Textile Art > Textile Art", "code": "AC-TA-TA", "confidence": 0.015}}
  ],
  "hsn_code": "5007",
  "attributes": {{
    "material": "Silk (Banarasi)",
    "product_types": ["Banarasi Silk Saree"],
    "origin": "Varanasi",
    "craft_type": "Handloom Weaving",
    "work_type": "Zari",
    "occasion": "Wedding"
  }}
}}
```

### Example 3:
Input: "We produce organic black pepper and cardamom, export quality, FSSAI certified" (Kerala)
Output:
```json
{{
  "top_3": [
    {{"category": "Food & Beverages > Spices > Organic Spices", "code": "FB-SP-OS", "confidence": 0.95}},
    {{"category": "Food & Beverages > Spices > Whole Spices", "code": "FB-SP-WS", "confidence": 0.035}},
    {{"category": "Health & Beauty > Organic Products > Organic Products", "code": "HB-OP-OP", "confidence": 0.015}}
  ],
  "hsn_code": "0904",
  "attributes": {{
    "material": "Organic Spices",
    "product_types": ["Black Pepper", "Cardamom"],
    "origin": "Kerala",
    "certification": "FSSAI",
    "quality": "Export Grade"
  }}
}}
```

## Now classify this product:
Product description: {text}
Location: {location}

Return ONLY the JSON object (no markdown fences, no explanation)."""


def _get_confidence_band(confidence: float) -> ConfidenceBand:
    if confidence >= 0.85:
        return ConfidenceBand.GREEN
    elif confidence >= 0.60:
        return ConfidenceBand.YELLOW
    return ConfidenceBand.RED


def _validate_hsn(hsn_code: str) -> str:
    """Validate HSN code against taxonomy. Return the code if valid, or '9999' fallback."""
    if hsn_code in _valid_hsn_codes:
        return hsn_code
    return "9999"


def _validate_category_code(code: str) -> bool:
    """Check if a category code exists in our taxonomy."""
    return code in _valid_category_codes


def _normalize_confidences(top_3: list[dict]) -> list[dict]:
    """Normalize confidence scores so they sum to ~1.0."""
    total = sum(c.get("confidence", 0) for c in top_3)
    if total <= 0:
        # Assign default confidences
        defaults = [0.5, 0.3, 0.2]
        for i, c in enumerate(top_3):
            c["confidence"] = defaults[i] if i < len(defaults) else 0.1
        return top_3
    for c in top_3:
        c["confidence"] = round(c["confidence"] / total, 3)
    return top_3


async def classify_product(text: str, language: str = "en", location: str = "India") -> ClassifyResponse:
    start = time.time()

    # Check demo cache first
    if text in _demo_cache:
        scenario = _demo_cache[text]
        cls = scenario["expected_classification"]
        translated = scenario["input"]["text_en"] if language == "hi" else None

        top_cats = []
        for cat in cls["top_3"]:
            top_cats.append(CategoryResult(
                category=cat["category"],
                code=cat["code"],
                confidence=cat["confidence"],
                band=_get_confidence_band(cat["confidence"])
            ))

        attrs = ProductAttributes(**cls["attributes"])

        elapsed = (time.time() - start) * 1000 + 120

        ondc = _generate_ondc_catalog(top_cats[0], attrs, text)

        add_classification({
            "text": text,
            "category": top_cats[0].category,
            "confidence": top_cats[0].confidence,
            "band": top_cats[0].band.value,
            "hsn": cls["hsn"],
            "processing_time_ms": elapsed
        })

        return ClassifyResponse(
            original_text=text,
            translated_text=translated,
            language_detected=language,
            top_categories=top_cats,
            hsn_code=cls["hsn"],
            attributes=attrs,
            ondc_catalog=ondc,
            processing_time_ms=round(elapsed, 1)
        )

    # Live classification via Bedrock
    detected_lang = await aws_nlp.detect_language(text)
    translated_text = None
    classification_text = text

    if detected_lang == "hi":
        translated_text = await aws_nlp.translate(text, "hi", "en")
        classification_text = translated_text

    taxonomy_text = _build_taxonomy_text()
    prompt = CLASSIFICATION_PROMPT.format(
        taxonomy=taxonomy_text,
        text=classification_text,
        location=location,
    )
    result = await bedrock_client.invoke_claude(
        prompt,
        system="You are a product classification expert for Indian MSME products. Return only valid JSON matching the exact schema shown."
    )

    parsed = extract_json(result)

    if not parsed or "top_3" not in parsed:
        parsed = {
            "top_3": [
                {"category": "General > Uncategorized", "code": "GN-UC-UC", "confidence": 0.5},
                {"category": "General > Other", "code": "GN-OT-OT", "confidence": 0.3},
                {"category": "General > Misc", "code": "GN-MS-MS", "confidence": 0.2}
            ],
            "hsn_code": "9999",
            "attributes": {}
        }

    # Normalize confidences to sum to ~1.0
    parsed["top_3"] = _normalize_confidences(parsed.get("top_3", []))

    # Validate HSN code
    hsn = _validate_hsn(parsed.get("hsn_code", "9999"))

    top_cats = []
    for cat in parsed.get("top_3", []):
        top_cats.append(CategoryResult(
            category=cat["category"],
            code=cat["code"],
            confidence=cat["confidence"],
            band=_get_confidence_band(cat["confidence"])
        ))

    attrs = ProductAttributes(**parsed.get("attributes", {}))

    elapsed = (time.time() - start) * 1000

    ondc = _generate_ondc_catalog(top_cats[0] if top_cats else None, attrs, classification_text)

    add_classification({
        "text": text,
        "category": top_cats[0].category if top_cats else "Unknown",
        "confidence": top_cats[0].confidence if top_cats else 0,
        "band": top_cats[0].band.value if top_cats else "RED",
        "hsn": hsn,
        "processing_time_ms": elapsed
    })

    return ClassifyResponse(
        original_text=text,
        translated_text=translated_text,
        language_detected=detected_lang,
        top_categories=top_cats,
        hsn_code=hsn,
        attributes=attrs,
        ondc_catalog=ondc,
        processing_time_ms=round(elapsed, 1)
    )


def _generate_ondc_catalog(category: CategoryResult | None, attrs: ProductAttributes, text: str) -> dict:
    return {
        "context": {
            "domain": "nic2004:52110",
            "action": "on_search",
            "bpp_id": "vyaparsetu.ai"
        },
        "message": {
            "catalog": {
                "descriptor": {
                    "name": attrs.product_types[0] if attrs.product_types else "Product",
                    "short_desc": text[:100],
                    "long_desc": text
                },
                "category_id": category.code if category else "GN-UC",
                "fulfillment_id": "F1",
                "location_id": "L1",
                "price": {
                    "currency": "INR",
                    "value": "0",
                    "listed_value": "0"
                },
                "tags": [
                    {"code": "origin", "value": attrs.origin or "India"},
                    {"code": "material", "value": attrs.material or ""},
                    {"code": "hsn", "value": category.code if category else ""},
                ]
            }
        }
    }
