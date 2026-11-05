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

