from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Store, SalesHistory
from ..services.forecasting_engine import DemandForecastingEngine
from ..dependencies import require_vendor_store
from ..schemas import DemandForecastSummaryOut

router = APIRouter(prefix="/forecasting", tags=["AI Demand Forecasting"])

@router.get("/vendor", response_model=DemandForecastSummaryOut)
def get_vendor_demand_forecast(
    horizon_weeks: int = Query(4, ge=1, le=12),
    store: Store = Depends(require_vendor_store),
    db: Session = Depends(get_db)
):
    result = DemandForecastingEngine.forecast_for_vendor(db, store.id, horizon_weeks)
    return result

@router.get("/historical-trends")
def get_historical_sales_trends(
    store: Store = Depends(require_vendor_store),
    db: Session = Depends(get_db)
):
    sales = db.query(SalesHistory).filter(SalesHistory.store_id == store.id).order_by(SalesHistory.sale_date.asc()).all()

    # Aggregate by month
    monthly_data = {}
    for s in sales:
        month_key = s.sale_date.strftime("%b %Y")
        if month_key not in monthly_data:
            monthly_data[month_key] = {"month": month_key, "units": 0, "revenue": 0.0}
        monthly_data[month_key]["units"] += s.quantity_sold
        monthly_data[month_key]["revenue"] += s.sale_amount

    return {
        "store_id": store.id,
        "store_name": store.name,
        "monthly_sales": list(monthly_data.values()),
        "total_recorded_transactions": len(sales)
    }

@router.post("/automation/run-digest")
def trigger_daily_automation_digest(db: Session = Depends(get_db)):
    from ..models import Order, Inventory, Notification, Store, Product
    from datetime import datetime

    stores = db.query(Store).all()
    digest_results = []

    for st in stores:
        pending_orders = db.query(Order).filter(
            Order.store_id == st.id,
            Order.status.in_(["new", "accepted", "in_production"])
        ).count()
        low_stock_items = db.query(Inventory).filter(
            Inventory.store_id == st.id,
            Inventory.current_stock <= 10
        ).all()

        msg = f"Daily Workshop Automation: {pending_orders} active craft orders in queue. {len(low_stock_items)} items near threshold for safe stock replenishment."
        db.add(Notification(
            user_id=st.vendor_id,
            title="Daily Artisan Automation Digest",
            message=msg,
            link="/vendor/dashboard"
        ))

        digest_results.append({
            "store_id": st.id,
            "store_name": st.name,
            "active_orders": pending_orders,
            "low_stock_items": len(low_stock_items)
        })

    db.commit()
    return {
        "success": True,
        "automated_at": datetime.utcnow().isoformat(),
        "stores_processed": len(stores),
        "results": digest_results,
        "message": f"Automated daily digest successfully generated and dispatched to {len(stores)} artisan workshops."
    }

