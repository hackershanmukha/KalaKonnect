from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models import Product, Inventory, Order, OrderItem, ProductionPlan
from .forecasting_engine import DemandForecastingEngine

class ProductionPlannerService:
    """
    Connects demand forecasting with artisan production capacity, lead times,
    and raw material constraints to generate actionable shop-floor production schedules.
    """

    @staticmethod
    def generate_plan_for_product(db: Session, product_id: str, horizon_weeks: int = 4) -> Dict[str, Any]:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return {"error": "Product not found"}

        inventory = db.query(Inventory).filter(Inventory.product_id == product_id).first()
        current_stock = inventory.current_stock if inventory else product.available_quantity
        daily_capacity = inventory.daily_production_capacity if inventory else 10
        raw_material_status = inventory.raw_material_status if inventory else "adequate"

        # Count active open orders for this product (new, accepted, in_production)
        active_order_items = db.query(OrderItem).join(Order).filter(
            OrderItem.product_id == product_id,
            Order.status.in_(["new", "accepted", "in_production"])
        ).all()
        pending_order_units = sum(item.quantity for item in active_order_items)

        # Get forecasted demand
        forecast_data = DemandForecastingEngine.forecast_for_vendor(db, product.store_id, horizon_weeks)
        forecast_item = next(
            (item for item in forecast_data.get("high_demand_products", []) + forecast_data.get("low_demand_products", [])
             if item["product_id"] == product_id),
            None
        )

        expected_demand = forecast_item["predicted_demand_units"] if forecast_item else 40
        safety_stock = forecast_item["suggested_safety_stock"] if forecast_item else 10

        # Suggested quantity formula: (Expected Demand + Pending Orders + Safety Stock) - Current Stock
        net_required = (expected_demand + pending_order_units + safety_stock) - current_stock
        suggested_quantity = max(0, int(net_required))

        # Time to produce
        lead_days_per_unit = product.production_time_days or 3
        # Assuming artisan crafts can be done concurrently in batches:
        days_needed = max(3, int(suggested_quantity / max(1, daily_capacity)))

        target_date = datetime.utcnow() + timedelta(weeks=horizon_weeks)
        start_date = max(datetime.utcnow(), target_date - timedelta(days=days_needed + 3))

        # Raw materials required calculation
        materials = []
        craft = (product.craft_technique or product.category or "").lower()
        if "lacquer" in craft or "wood" in craft:
            materials = [
                {"name": "Ankudu Soft Wood Block", "quantity_needed": f"{suggested_quantity * 1.1:.1f} kg", "status": raw_material_status},
                {"name": "Natural Lacquer Resin", "quantity_needed": f"{suggested_quantity * 50} grams", "status": raw_material_status},
                {"name": "Organic Turmeric & Indigo Pigments", "quantity_needed": f"{suggested_quantity * 20} grams", "status": "adequate"}
            ]
        elif "pottery" in craft or "clay" in craft or "terracotta" in craft:
            materials = [
                {"name": "Prepared Riverbed Clay", "quantity_needed": f"{suggested_quantity * 0.8:.1f} kg", "status": raw_material_status},
                {"name": "Red Ochre Slip (Geru)", "quantity_needed": f"{suggested_quantity * 30} ml", "status": "adequate"},
                {"name": "Kiln Firing Fuel", "quantity_needed": f"{max(1, suggested_quantity // 50)} firings", "status": "adequate"}
            ]
        elif "kalamkari" in craft or "textile" in craft:
            materials = [
                {"name": "Pure Unprocessed Cotton/Silk (Mtrs)", "quantity_needed": f"{suggested_quantity * 2.5:.1f} meters", "status": raw_material_status},
                {"name": "Myrobalan Fruit Paste (Mordant)", "quantity_needed": f"{suggested_quantity * 40} grams", "status": "adequate"},
                {"name": "Alum & Natural Jaggery Inks", "quantity_needed": f"{suggested_quantity * 100} ml", "status": "adequate"}
            ]
        else:
            materials = [
                {"name": f"Base Raw Material for {product.material or 'craft'}", "quantity_needed": f"{suggested_quantity} units", "status": raw_material_status},
                {"name": "Protective Craft Finishing Oil", "quantity_needed": f"{suggested_quantity * 10} ml", "status": "adequate"}
            ]

        shortage_risk = "high" if raw_material_status == "out_of_stock" or (current_stock + suggested_quantity < pending_order_units) else (
            "medium" if raw_material_status == "low" else "low"
        )

        plan = {
            "product_id": product.id,
            "product_name": product.name,
            "category": product.category,
            "current_stock": current_stock,
            "pending_orders": pending_order_units,
            "expected_demand": expected_demand,
            "suggested_quantity": suggested_quantity,
            "recommended_start_date": start_date.strftime("%Y-%m-%d"),
            "target_completion_date": target_date.strftime("%Y-%m-%d"),
            "daily_capacity": daily_capacity,
            "estimated_production_days": days_needed,
            "raw_materials_needed": materials,
            "shortage_risk": shortage_risk,
            "status": "suggested"
        }

        return plan

