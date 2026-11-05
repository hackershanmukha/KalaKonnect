from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Store, FestivalCalendar
from ..services.seasonal_engine import SeasonalRecommendationEngine
from ..dependencies import require_vendor_store
from ..schemas import SeasonalRecommendationItem

router = APIRouter(prefix="/seasonal", tags=["Seasonal Intelligence Engine"])

@router.get("/recommendations", response_model=List[SeasonalRecommendationItem])
def get_seasonal_recommendations(
    store: Store = Depends(require_vendor_store),
    db: Session = Depends(get_db)
):
    recommendations = SeasonalRecommendationEngine.get_recommendations_for_store(db, store.id)
    return recommendations

@router.get("/calendar")
def get_festival_calendar(db: Session = Depends(get_db)):
    festivals = db.query(FestivalCalendar).all()
    return [{
        "id": f.id,
        "name": f.name,
        "region": f.region,
        "month": f.month,
        "start_date": f.start_date,
        "craft_categories": f.craft_categories,
        "lead_time_weeks": f.lead_time_weeks,
        "demand_multiplier": f.demand_multiplier,
        "description": f.description
    } for f in festivals]

