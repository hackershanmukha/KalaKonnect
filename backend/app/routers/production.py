from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Store, Product, ProductionPlan
from ..services.production_planner import ProductionPlannerService
from ..dependencies import require_vendor_store
from ..schemas import ProductionPlanCreate, ProductionPlanOut

router = APIRouter(prefix="/production", tags=["AI Production Planning"])

@router.get("/plan/{product_id}")
def generate_product_production_plan(
    product_id: str,
    horizon_weeks: int = Query(4, ge=1, le=8),
    store: Store = Depends(require_vendor_store),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id, Product.store_id == store.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found in this store")

    plan = ProductionPlannerService.generate_plan_for_product(db, product_id, horizon_weeks)
    return plan

@router.get("/saved-plans")
def get_saved_production_plans(
    store: Store = Depends(require_vendor_store),
    db: Session = Depends(get_db)
):
    plans = db.query(ProductionPlan).filter(ProductionPlan.store_id == store.id).order_by(ProductionPlan.created_at.desc()).all()
    results = []
    for p in plans:
        prod = p.product
        results.append({
            "id": p.id,
            "product_id": p.product_id,
            "product_name": prod.name if prod else "Artisan Craft",
            "suggested_quantity": p.suggested_quantity,
            "recommended_start_date": p.recommended_start_date.strftime("%Y-%m-%d"),
            "target_completion_date": p.target_completion_date.strftime("%Y-%m-%d"),
            "raw_materials_needed": p.raw_materials_needed,
            "status": p.status,
            "artisan_notes": p.artisan_notes,
            "created_at": p.created_at
        })
    return results

@router.post("/save-plan")
def save_production_plan(
    plan_in: ProductionPlanCreate,
    store: Store = Depends(require_vendor_store),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == plan_in.product_id, Product.store_id == store.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_plan = ProductionPlan(
        store_id=store.id,
        product_id=plan_in.product_id,
        suggested_quantity=plan_in.suggested_quantity,
        recommended_start_date=plan_in.recommended_start_date,
        target_completion_date=plan_in.target_completion_date,
        raw_materials_needed=plan_in.raw_materials_needed,
        status="accepted",
        artisan_notes=plan_in.artisan_notes
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    return {
        "message": "Production plan scheduled successfully",
        "plan_id": new_plan.id,
        "status": new_plan.status
    }

@router.put("/plan/{plan_id}/status")
def update_plan_status(
    plan_id: str,
    status: str,
    store: Store = Depends(require_vendor_store),
    db: Session = Depends(get_db)
):
    plan = db.query(ProductionPlan).filter(ProductionPlan.id == plan_id, ProductionPlan.store_id == store.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Production plan not found")

    plan.status = status
    db.commit()
    return {"message": f"Plan updated to {status}"}

