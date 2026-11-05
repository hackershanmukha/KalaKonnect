from fastapi import APIRouter
from ..schemas import (
    ProductAIAssistRequest, ProductAIAssistResponse,
    VerificationAIAssistRequest, VerificationAIAssistResponse
)
from ..services.ai_product_assist import AIProductAssistService
from ..services.ai_verification import AIVerificationAssistant

router = APIRouter(prefix="/ai-assist", tags=["AI Product & Verification Assistance"])

@router.post("/product-metadata", response_model=ProductAIAssistResponse)
def generate_product_metadata(req: ProductAIAssistRequest):
    result = AIProductAssistService.generate_product_details(
        raw_title=req.raw_title,
        category_hint=req.category_hint,
        notes=req.notes,
        image_url=req.image_url
    )
    return ProductAIAssistResponse(
        suggested_title=result["suggested_title"],
        suggested_description=result["suggested_description"],
        suggested_category=result["suggested_category"],
        suggested_material=result["suggested_material"],
        suggested_craft_technique=result["suggested_craft_technique"],
        suggested_tags=result["suggested_tags"],
        estimated_production_days=result["estimated_production_days"],
        cultural_heritage_highlight=result["cultural_heritage_highlight"],
        confidence_score=result["confidence_score"]
    )

@router.post("/verify-evidence", response_model=VerificationAIAssistResponse)
def verify_artisan_evidence(req: VerificationAIAssistRequest):
    result = AIVerificationAssistant.analyze_vendor_application(
        vendor_name=req.vendor_name,
        craft_category=req.craft_category,
        region=req.claimed_origin,
        documents=req.documents
    )
    return VerificationAIAssistResponse(
        authenticity_confidence=result["confidence_score"],
        category_match=result["category_match"],
        evidence_consistency=result["evidence_consistency"],
        potential_flags=result.get("flags", []),
        recommendation=result["recommendation"],
        summary=result["summary"]
    )

