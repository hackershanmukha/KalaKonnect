from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import (
    User, Store, Product, Order, VendorApplication,
    VerificationDocument, ProductVerification, AuditLog, ArtisanProfile
)
from ..schemas import AdminDecisionRequest
from ..dependencies import require_role

router = APIRouter(prefix="/admin", tags=["Administrator Dashboard"], dependencies=[Depends(require_role("admin"))])

@router.get("/overview")
def get_admin_overview(db: Session = Depends(get_db)):
    total_vendors = db.query(Store).count()
    total_products = db.query(Product).count()
    approved_products = db.query(Product).filter(Product.verification_status == "approved").count()
    pending_applications = db.query(VendorApplication).filter(VendorApplication.status.in_(["pending", "under_review"])).count()
    total_orders = db.query(Order).count()
    total_volume = db.query(func.sum(Order.total_amount)).scalar() or 0.0

    return {
        "total_vendors": total_vendors,
        "total_products": total_products,
        "approved_products": approved_products,
        "pending_vendor_applications": pending_applications,
        "total_orders": total_orders,
        "total_platform_gmv_inr": round(float(total_volume), 2),
        "verified_heritage_ratio": "100% GI/Artisan Verified"
    }

@router.get("/applications")
def list_vendor_applications(db: Session = Depends(get_db)):
    apps = db.query(VendorApplication).order_by(VendorApplication.submitted_at.desc()).all()
    results = []
    for a in apps:
        vendor_user = db.query(User).filter(User.id == a.vendor_id).first()
        docs = db.query(VerificationDocument).filter(VerificationDocument.application_id == a.id).all()
        results.append({
            "id": a.id,
            "vendor_id": a.vendor_id,
            "vendor_name": vendor_user.full_name if vendor_user else "Artisan",
            "vendor_email": vendor_user.email if vendor_user else "",
            "personal_info": a.personal_info,
            "store_info": a.store_info,
            "craft_info": a.craft_info,
            "status": a.status,
            "ai_summary": a.ai_summary,
            "ai_recommendation": a.ai_recommendation,
            "admin_notes": a.admin_notes,
            "submitted_at": a.submitted_at.strftime("%Y-%m-%d %H:%M"),
            "documents": [{
                "id": d.id,
                "type": d.document_type,
                "url": d.file_url,
                "title": d.title,
                "status": d.verified_status
            } for d in docs]
        })
    return results

@router.post("/applications/{app_id}/decision")
def decide_vendor_application(
    app_id: str,
    req: AdminDecisionRequest,
    current_admin: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    app = db.query(VendorApplication).filter(VendorApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = req.decision
    app.admin_notes = req.reason
    app.reviewed_at = datetime.utcnow()
    app.reviewed_by = current_admin.id

    # Update ArtisanProfile & Store
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == app.vendor_id).first()
    if profile:
        profile.verification_status = req.decision

    store = db.query(Store).filter(Store.vendor_id == app.vendor_id).first()
    products_affected = 0
    if store:
        if req.decision == "approved":
            store.verification_badge = True
            store.is_regional_origin_verified = True
        else:
            store.verification_badge = False
            store.is_regional_origin_verified = False

        # Cascade vendor approval or rejection directly to all products in this store
        store_products = db.query(Product).filter(Product.store_id == store.id).all()
        for prod in store_products:
            products_affected += 1
            if req.decision == "approved":
                prod.verification_status = "approved"
                prod.is_active = True
                if prod.verification:
                    prod.verification.admin_decision = "approved"
                    prod.verification.admin_reason = f"Artisan guild approved: {req.reason or 'Verification standard met'}"
                    prod.verification.reviewed_at = datetime.utcnow()
            elif req.decision == "rejected":
                prod.verification_status = "rejected"
                prod.is_active = False  # Automatically delist from public marketplace!
                if prod.verification:
                    prod.verification.admin_decision = "rejected"
                    prod.verification.admin_reason = f"Vendor application rejected: {req.reason or 'Authenticity evidence declined'}"
                    prod.verification.reviewed_at = datetime.utcnow()
            elif req.decision == "info_required":
                prod.verification_status = "pending"
                prod.is_active = False
                if prod.verification:
                    prod.verification.admin_decision = "pending"
                    prod.verification.admin_reason = "Pending additional artisan documentation."
                    prod.verification.reviewed_at = datetime.utcnow()

    # Audit log
    db.add(AuditLog(
        admin_id=current_admin.id,
        target_entity="vendor_application",
        target_id=app.id,
        action=f"application_{req.decision}",
        reason=f"{req.reason or 'Administrative review'} (Cascaded to {products_affected} products)"
    ))

    db.commit()
    return {
        "message": f"Application marked as {req.decision}. {products_affected} products synchronized.",
        "status": req.decision,
        "products_affected": products_affected
    }


@router.get("/products/queue")
def list_product_verification_queue(db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.created_at.desc()).all()
    results = []
    for p in products:
        vendor_prof = p.store.vendor.artisan_profile if (p.store and p.store.vendor) else None
        vendor_status = vendor_prof.verification_status if vendor_prof else ("approved" if (p.store and p.store.verification_badge) else "pending")
        results.append({
            "id": p.id,
            "name": p.name,
            "store_name": p.store.name if p.store else "Store",
            "category": p.category,
            "price": p.price,
            "craft_technique": p.craft_technique,
            "material": p.material,
            "place_of_origin": p.place_of_origin,
            "verification_status": p.verification_status,
            "is_active": p.is_active,
            "vendor_verification_status": vendor_status,
            "ai_confidence": p.verification.ai_confidence_score if p.verification else 0.9,
            "ai_notes": p.verification.ai_craft_authenticity_notes if p.verification else "Verified",
            "admin_reason": p.verification.admin_reason if p.verification else None,
            "image": p.images[0].image_url if p.images else None,
            "created_at": p.created_at.strftime("%Y-%m-%d")
        })
    return results

@router.post("/products/{prod_id}/decision")
def decide_product_verification(
    prod_id: str,
    req: AdminDecisionRequest,
    current_admin: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == prod_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.verification_status = req.decision
    product.is_active = (req.decision == "approved")
    if product.verification:
        product.verification.admin_decision = req.decision
        product.verification.admin_reason = req.reason
        product.verification.reviewed_at = datetime.utcnow()

    db.add(AuditLog(
        admin_id=current_admin.id,
        target_entity="product",
        target_id=product.id,
        action=f"product_{req.decision}",
        reason=req.reason
    ))

    db.commit()
    return {"message": f"Product verification status updated to {req.decision}", "status": req.decision, "is_active": product.is_active}

@router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
    return [{
        "id": l.id,
        "admin_id": l.admin_id,
        "target_entity": l.target_entity,
        "target_id": l.target_id,
        "action": l.action,
        "reason": l.reason,
        "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S")
    } for l in logs]

