from fastapi import APIRouter
from app.models.schemas import MatchRequest, MatchResponse
from app.services.matchmaker import recommend_platforms

router = APIRouter()

@router.post("/recommend", response_model=MatchResponse)
async def recommend(request: MatchRequest):
    return await recommend_platforms(
        product_category=request.product_category,
        product_description=request.product_description,
        location=request.location,
        language=request.language,
        business_type=request.business_type,
        lat=request.lat,
        lon=request.lon,
    )
