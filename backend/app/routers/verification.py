import re
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, ArtisanProfile, Store, VendorApplication, VerificationDocument
from ..schemas import (
    VendorApplicationSubmit, VerificationAIAssistRequest, VerificationAIAssistResponse
)
from ..services.ai_verification import AIVerificationAssistant
from ..dependencies import get_current_user

router = APIRouter(prefix="/verification", tags=["Vendor Onboarding & Verification"])

@router.post("/onboarding/submit")
def submit_onboarding_application(
    app_data: VendorApplicationSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Update or create ArtisanProfile
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if not profile:
        profile = ArtisanProfile(
            user_id=current_user.id,
            artisan_name=app_data.personal_info.artisan_name,
            bio=app_data.craft_info.bio or app_data.store_info.store_description,
            years_of_experience=app_data.craft_info.years_of_experience,
            craft_specialization=app_data.craft_info.craft_specialization,
            artisan_type=app_data.craft_info.artisan_type,
            phone=app_data.personal_info.phone,
            address=app_data.personal_info.address,
            region=app_data.personal_info.region,
            district=app_data.personal_info.district,
            state=app_data.personal_info.state,
            verification_status="under_review"
        )
        db.add(profile)
    else:
        profile.artisan_name = app_data.personal_info.artisan_name
        profile.craft_specialization = app_data.craft_info.craft_specialization
        profile.verification_status = "under_review"

    # 2. Update or create Store
    slug_base = re.sub(r'[^a-zA-Z0-9]+', '-', app_data.store_info.store_name.lower()).strip('-')
    store = db.query(Store).filter(Store.vendor_id == current_user.id).first()
    if not store:
        store = Store(
            vendor_id=current_user.id,
            name=app_data.store_info.store_name,
            slug=f"{slug_base}-{current_user.id[:4]}",
            description=app_data.store_info.store_description,
            craft_category=app_data.store_info.craft_category,
            region=app_data.personal_info.region,
            location=f"{app_data.personal_info.district}, {app_data.personal_info.state}",
            logo_url=app_data.store_info.logo_url or "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80",
            banner_url=app_data.store_info.banner_url or "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
            verification_badge=False,
            is_regional_origin_verified=False
        )
        db.add(store)
    db.flush()

    # 3. AI Verification Analysis
    doc_dicts = [d.dict() for d in app_data.evidence]
    ai_result = AIVerificationAssistant.analyze_vendor_application(
        vendor_name=app_data.personal_info.artisan_name,
        craft_category=app_data.store_info.craft_category,
        region=app_data.personal_info.region,
        documents=doc_dicts
    )

    # 4. Create Vendor Application record
    application = VendorApplication(
        vendor_id=current_user.id,
        personal_info=app_data.personal_info.dict(),
        store_info=app_data.store_info.dict(),
        craft_info=app_data.craft_info.dict(),
        status="under_review",
        ai_summary=ai_result.get("summary"),
        ai_recommendation=ai_result.get("recommendation"),
        admin_notes="Application queued for administrative review."
    )
    db.add(application)
    db.flush()

    # 5. Save verification documents
    for doc in app_data.evidence:
        db.add(VerificationDocument(
            application_id=application.id,
            vendor_id=current_user.id,
            document_type=doc.document_type,
            file_url=doc.file_url,
            title=doc.title,
            verified_status="pending",
            notes=doc.notes
        ))

    db.commit()

    return {
        "message": "Vendor application submitted successfully and queued for verification.",
        "application_id": application.id,
        "status": "under_review",
        "ai_analysis": ai_result
    }

@router.get("/status")
def get_vendor_verification_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    store = db.query(Store).filter(Store.vendor_id == current_user.id).first()
    app = db.query(VendorApplication).filter(VendorApplication.vendor_id == current_user.id).order_by(VendorApplication.submitted_at.desc()).first()

    return {
        "status": profile.verification_status if profile else "pending",
        "artisan_name": profile.artisan_name if profile else current_user.full_name,
        "store_name": store.name if store else None,
        "verification_badge": store.verification_badge if store else False,
        "is_regional_origin_verified": store.is_regional_origin_verified if store else False,
        "ai_summary": app.ai_summary if app else None,
        "admin_notes": app.admin_notes if app else None
    }

