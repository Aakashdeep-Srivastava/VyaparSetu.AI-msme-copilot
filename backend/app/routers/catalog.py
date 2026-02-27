from fastapi import APIRouter
from app.models.schemas import ClassifyRequest, ClassifyResponse, TranslateRequest, TranslateResponse
from app.services.catalog_ai import classify_product
from app.services.aws_nlp import aws_nlp

router = APIRouter()

@router.post("/classify", response_model=ClassifyResponse)
async def classify(request: ClassifyRequest):
    return await classify_product(
        text=request.text,
        language=request.language,
    )

@router.post("/translate", response_model=TranslateResponse)
async def translate(request: TranslateRequest):
    translated = await aws_nlp.translate(
        text=request.text,
        source_lang=request.source_lang,
        target_lang=request.target_lang,
    )
    return TranslateResponse(
        original_text=request.text,
        translated_text=translated,
        source_lang=request.source_lang,
        target_lang=request.target_lang,
    )
