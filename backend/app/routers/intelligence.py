from fastapi import APIRouter, Query
from app.services.pricewise import get_pricing_intelligence

router = APIRouter()

@router.get("/pricing/{category}")
async def get_pricing(category: str, your_price: float = Query(None), language: str = Query("en")):
    return await get_pricing_intelligence(
        category=category,
        your_price=your_price,
        language=language,
    )
