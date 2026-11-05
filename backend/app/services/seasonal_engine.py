from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models import Store, Product, Inventory, FestivalCalendar

class SeasonalRecommendationEngine:
    """
    Seasonal Intelligence Engine for Indian Cultural and Regional Festivals.
    Aligns artisan craft specialization with festival calendars, preparation lead times,
    and material procurement windows.
    """

    @staticmethod
    def get_recommendations_for_store(db: Session, store_id: str) -> List[Dict[str, Any]]:
        store = db.query(Store).filter(Store.id == store_id).first()
        if not store:
            return []

        products = db.query(Product).filter(
            Product.store_id == store_id,
            Product.is_active == True
        ).all()

        festivals = db.query(FestivalCalendar).all()
        recommendations = []

        for fest in festivals:
            # Check if this festival matches the store's craft category
            category_match = any(
                c.lower() in store.craft_category.lower() or store.craft_category.lower() in c.lower()
                for c in (fest.craft_categories or [])
            )

            # Match products
            matching_products = [
                p for p in products
                if any(c.lower() in p.category.lower() for c in (fest.craft_categories or []))
            ]

            if category_match or matching_products:
                # Calculate preparation timeline
                lead_weeks = fest.lead_time_weeks or 4
                target_names = [p.name for p in matching_products[:3]] if matching_products else [f"New festive {store.craft_category} collection"]

                # Recommended batch size based on store's past sales
                est_batch_size = max(50, len(matching_products) * 35)

                # Raw materials checklist based on craft
                raw_mat = []
                craft_lower = store.craft_category.lower()
                if "wood" in craft_lower:
                    raw_mat = ["Ankudu soft wood logs", "Natural lacquer colors", "Kewda leaf polishing pads"]
                elif "pottery" in craft_lower or "clay" in craft_lower:
                    raw_mat = ["Alluvial clay stock", "Natural earthen pigment dyes", "Kiln firewood / fuel"]
                elif "textile" in craft_lower or "kalamkari" in craft_lower or "loom" in craft_lower:
                    raw_mat = ["Unbleached cotton/silk fabric", "Vegetable dyes (Myrobalan & Alum)", "Bamboo kalam pens"]
                elif "bamboo" in craft_lower or "cane" in craft_lower:
                    raw_mat = ["Mature bamboo culms", "Splitting knives & oil", "Eco-friendly varnish"]
                else:
                    raw_mat = ["Primary natural raw materials", "Packaging boxes", "Craft authenticity tags"]

                # Action recommendation
                action = (
                    f"Begin batch production {lead_weeks} weeks prior to {fest.name}. "
                    f"Prepare approximately {est_batch_size} units to meet anticipated regional surges."
                )

                promotional_tip = (
                    f"Feature the '{fest.name} Heritage Collection' badge on your storefront and "
                    f"offer bundled regional craft gift sets 3 weeks ahead."
                )

                recommendations.append({
                    "festival_name": fest.name,
                    "region": fest.region,
                    "month": fest.month,
                    "start_date": fest.start_date,
                    "relevant_crafts": fest.craft_categories or [store.craft_category],
                    "lead_time_weeks": lead_weeks,
                    "recommended_action": action,
                    "target_products": target_names,
                    "suggested_batch_size": est_batch_size,
                    "raw_materials_checklist": raw_mat,
                    "promotional_tip": promotional_tip
                })

        return recommendations

