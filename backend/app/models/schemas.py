from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class ConfidenceBand(str, Enum):
    GREEN = "GREEN"   # >= 0.85
    YELLOW = "YELLOW" # 0.60 - 0.85
    RED = "RED"       # < 0.60

class ClassifyRequest(BaseModel):
    text: str
    language: str = "en"  # "en" or "hi"

class CategoryResult(BaseModel):
    category: str
    code: str
    confidence: float
    band: ConfidenceBand

class ProductAttributes(BaseModel):
    material: Optional[str] = None
    product_types: Optional[list[str]] = None
    origin: Optional[str] = None
    craft_type: Optional[str] = None
    certification: Optional[str] = None
    quality: Optional[str] = None
    occasion: Optional[str] = None
    work_type: Optional[str] = None
    products: Optional[list[str]] = None

class ONDCCatalogItem(BaseModel):
    descriptor: dict
    category_id: str
    fulfillment_id: str = "F1"
    location_id: str = "L1"
    price: dict
    tags: list[dict]

class ClassifyResponse(BaseModel):
    original_text: str
    translated_text: Optional[str] = None
    language_detected: str
    top_categories: list[CategoryResult]
    hsn_code: str
    attributes: ProductAttributes
    ondc_catalog: Optional[dict] = None
    processing_time_ms: float

class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "hi"
    target_lang: str = "en"

class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    source_lang: str
    target_lang: str

class MatchFactor(BaseModel):
    domain: float
    geography: float
    capacity: float
    history: float
    specialization: float

class PlatformMatch(BaseModel):
    platform: str
    score: float
    factors: MatchFactor
    explanation_hi: str
    explanation_en: str

class MatchRequest(BaseModel):
    product_category: str
    product_description: str
    location: str
    language: str = "en"
    business_type: str = "B2C"  # B2B or B2C
    lat: Optional[float] = None
    lon: Optional[float] = None

class MatchResponse(BaseModel):
    msme_profile: dict
    top_platforms: list[PlatformMatch]
    processing_time_ms: float

class PricingProduct(BaseModel):
    name: str
    median_price: float
    p25: float
    p75: float
    avg_price: float
    sample_size: int

class DemandTrend(BaseModel):
    month: str
    index: float

class PricingInsight(BaseModel):
    product: str
    your_price: Optional[float] = None
    category_median: float
    price_position: str
    recommendation_hi: str
    recommendation_en: str

class PricingResponse(BaseModel):
    category: str
    category_path: str
    products: list[PricingProduct]
    demand_trends: list[DemandTrend]
    peak_season: str
    growth_yoy: float
    insight: Optional[PricingInsight] = None

class OverrideRequest(BaseModel):
    record_id: str
    field: str  # "category" or "platform"
    old_value: str
    new_value: str
    reason: str
    admin_id: str = "admin"

class OverrideResponse(BaseModel):
    success: bool
    record_id: str
    audit_id: str
    message: str

class DashboardMetrics(BaseModel):
    total_onboarded: int
    avg_confidence: float
    avg_processing_time_ms: float
    band_distribution: dict  # {"GREEN": n, "YELLOW": n, "RED": n}
    recent_classifications: list[dict]
