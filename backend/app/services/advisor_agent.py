import json
import requests
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Store, Product, Inventory, SalesHistory, FestivalCalendar, Order, OrderItem
from .forecasting_engine import DemandForecastingEngine
from .seasonal_engine import SeasonalRecommendationEngine
from .production_planner import ProductionPlannerService
from ..config import settings

class AIBusinessAdvisorAgent:
    """
    AI Business Advisor agent for artisan vendors.
    Executes actual database tools to retrieve authentic vendor-specific facts.
    Strictly forbids fabricating numbers, sales, or inventory quantities.
    """

    @staticmethod
    def get_sales_summary(db: Session, store_id: str) -> Dict[str, Any]:
        """Tool: Retrieves exact sales and revenue history for the vendor"""
        total_sales = db.query(func.sum(SalesHistory.sale_amount)).filter(SalesHistory.store_id == store_id).scalar() or 0.0
        total_units = db.query(func.sum(SalesHistory.quantity_sold)).filter(SalesHistory.store_id == store_id).scalar() or 0
        order_count = db.query(Order).filter(Order.store_id == store_id).count()

        # Monthly breakdown
        recent_sales = db.query(SalesHistory).filter(SalesHistory.store_id == store_id).order_by(SalesHistory.sale_date.desc()).limit(10).all()

        return {
            "total_revenue_inr": round(float(total_sales), 2),
            "total_units_sold": int(total_units),
            "total_orders": order_count,
            "recent_transactions_count": len(recent_sales),
            "currency": "INR"
        }

    @staticmethod
    def get_inventory(db: Session, store_id: str) -> List[Dict[str, Any]]:
        """Tool: Retrieves current stock levels, reserved stock and low-stock warnings"""
        products = db.query(Product).filter(Product.store_id == store_id, Product.is_active == True).all()
        inventory_list = []
        for p in products:
            inv = db.query(Inventory).filter(Inventory.product_id == p.id).first()
            current_stock = inv.current_stock if inv else p.available_quantity
            reorder_level = inv.reorder_level if inv else 5
            raw_material = inv.raw_material_status if inv else "adequate"

            inventory_list.append({
                "product_id": p.id,
                "product_name": p.name,
                "current_stock": current_stock,
                "reorder_level": reorder_level,
                "is_low_stock": current_stock <= reorder_level,
                "raw_material_status": raw_material
            })
        return inventory_list

    @staticmethod
    def get_product_performance(db: Session, store_id: str) -> Dict[str, Any]:
        """Tool: Identifies top-selling products and slow-moving inventory"""
        products = db.query(Product).filter(Product.store_id == store_id).all()
        performance = []
        for p in products:
            units_sold = db.query(func.sum(SalesHistory.quantity_sold)).filter(SalesHistory.product_id == p.id).scalar() or 0
            revenue = db.query(func.sum(SalesHistory.sale_amount)).filter(SalesHistory.product_id == p.id).scalar() or 0.0
            performance.append({
                "product_name": p.name,
                "units_sold": int(units_sold),
                "revenue": float(revenue),
                "price": float(p.price)
            })

        performance.sort(key=lambda x: x["units_sold"], reverse=True)
        top_selling = performance[:2] if performance else []
        slow_moving = performance[-2:] if len(performance) > 2 else []

        return {
            "top_selling_products": top_selling,
            "slow_moving_products": slow_moving,
            "all_products_evaluated": len(performance)
        }

    @classmethod
    def execute_chat(cls, db: Session, store_id: str, message: str, conversation_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Orchestrates tool execution and generates an authentic, data-backed advisor answer.
        """
        store = db.query(Store).filter(Store.id == store_id).first()
        if not store:
            return {
                "reply": "Store profile could not be located. Please verify your artisan account credentials.",
                "data_points": None,
                "suggested_followups": ["How do I register a store?", "View onboarding status"]
            }

        msg_lower = message.lower()
        tool_data = {}

        # 1. Dispatch appropriate database tools based on user intent
        if any(w in msg_lower for w in ["sold", "sale", "revenue", "earn", "income", "money", "month"]):
            sales_summary = cls.get_sales_summary(db, store_id)
            perf = cls.get_product_performance(db, store_id)
            tool_data["sales_summary"] = sales_summary
            tool_data["product_performance"] = perf

        if any(w in msg_lower for w in ["stock", "inventory", "low", "raw material", "available", "shortage"]):
            inv = cls.get_inventory(db, store_id)
            tool_data["inventory"] = inv

        if any(w in msg_lower for w in ["diwali", "sankranti", "festival", "holiday", "season", "occasion", "calendar"]):
            seasons = SeasonalRecommendationEngine.get_recommendations_for_store(db, store_id)
            tool_data["seasonal_recommendations"] = seasons

        if any(w in msg_lower for w in ["forecast", "demand", "next month", "upcoming", "trend"]):
            forecast = DemandForecastingEngine.forecast_for_vendor(db, store_id, horizon_weeks=4)
            tool_data["demand_forecast"] = forecast

        if any(w in msg_lower for w in ["produce", "production", "batch", "plan", "capacity", "how much"]):
            forecast = DemandForecastingEngine.forecast_for_vendor(db, store_id, horizon_weeks=4)
            tool_data["demand_forecast"] = forecast
            # If top product exists, get production plan
            top_prod = db.query(Product).filter(Product.store_id == store_id).first()
            if top_prod:
                tool_data["sample_production_plan"] = ProductionPlannerService.generate_plan_for_product(db, top_prod.id)

        # If no specific keyword triggered tools, load overview
        if not tool_data:
            tool_data["sales_summary"] = cls.get_sales_summary(db, store_id)
            tool_data["inventory"] = cls.get_inventory(db, store_id)
            tool_data["product_performance"] = cls.get_product_performance(db, store_id)

        # 2. Try Gemini with tool outputs if API key is present
        if settings.GEMINI_API_KEY:
            try:
                system_instruction = f"""
                You are KalaConnect AI's dedicated Artisan Business Advisor for store '{store.name}' ({store.craft_category}, {store.region}).
                You have retrieved the following VERIFIED real-time database figures:
                {json.dumps(tool_data, default=str)}

                CRITICAL RULES:
                1. NEVER invent, extrapolate, or hallucinate revenue, inventory, or order numbers.
                2. Only cite figures present in the verified JSON above.
                3. Provide warm, encouraging, culturally respectful advice tailored for traditional Indian artisans.
                4. Keep the answer structured, actionable, and concise with bullet points.
                """
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": f"System context:\n{system_instruction}\n\nArtisan asks: {message}"}]}],
                    "generationConfig": {"temperature": 0.3}
                }
                res = requests.post(url, json=payload, timeout=8)
                if res.status_code == 200:
                    ai_reply = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "reply": ai_reply,
                        "data_points": tool_data,
                        "suggested_followups": [
                            "What should I prepare for upcoming festivals?",
                            "Which products have low inventory?",
                            "How much should I produce next month?"
                        ]
                    }
            except Exception:
                pass  # Fall back to grounded deterministic response generator

        # 3. Grounded Deterministic Generation (Zero hallucination guaranteed)
        reply_parts = []
        if "sales_summary" in tool_data:
            ss = tool_data["sales_summary"]
            reply_parts.append(
                f"📊 **Sales & Revenue Summary for {store.name}:**\n"
                f"- Total Recorded Revenue: **₹{ss['total_revenue_inr']:,.2f}**\n"
                f"- Total Craft Units Sold: **{ss['total_units_sold']} units** across **{ss['total_orders']} orders**."
            )

        if "product_performance" in tool_data and tool_data["product_performance"].get("top_selling_products"):
            top = tool_data["product_performance"]["top_selling_products"][0]
            reply_parts.append(
                f"\n🏆 **Top Performing Product:**\n"
                f"- **{top['product_name']}** has sold **{top['units_sold']} units**, generating ₹{top['revenue']:,.2f}."
            )

        if "inventory" in tool_data:
            low_items = [i for i in tool_data["inventory"] if i.get("is_low_stock")]
            if low_items:
                low_names = ", ".join([f"{i['product_name']} ({i['current_stock']} left)" for i in low_items])
                reply_parts.append(
                    f"\n⚠️ **Inventory Alert:**\n"
                    f"- The following items have fallen below their reorder threshold: **{low_names}**.\n"
                    f"- We recommend restocking raw materials soon to avoid stockouts."
                )
            else:
                reply_parts.append("\n✅ **Inventory Status:** All your craft listings currently have healthy inventory levels.")

        if "seasonal_recommendations" in tool_data and tool_data["seasonal_recommendations"]:
            rec = tool_data["seasonal_recommendations"][0]
            reply_parts.append(
                f"\n🪔 **Seasonal Advice for {rec['festival_name']} ({rec['month']}):**\n"
                f"- **Action:** {rec['recommended_action']}\n"
                f"- **Key Materials to Procure:** {', '.join(rec['raw_materials_checklist'])}\n"
                f"- **Promotion:** {rec['promotional_tip']}"
            )

        if "demand_forecast" in tool_data:
            df_info = tool_data["demand_forecast"]
            high_items = df_info.get("high_demand_products", [])
            if high_items:
                top_d = high_items[0]
                reply_parts.append(
                    f"\n📈 **Upcoming Demand Forecast ({df_info['forecast_horizon']}):**\n"
                    f"- **{top_d['product_name']}**: Expected demand of **{top_d['predicted_demand_units']} units** (Risk level: {top_d['stockout_risk_level'].upper()}).\n"
                    f"- Suggested Safety Stock: {top_d['suggested_safety_stock']} units."
                )

        if not reply_parts:
            reply_parts.append(
                f"Hello! I am your KalaConnect AI Business Advisor. I have analyzed your store '{store.name}'. "
                f"You have active listings in {store.craft_category}. How can I assist you with your sales, inventory, or festival production planning today?"
            )

        return {
            "reply": "\n".join(reply_parts),
            "data_points": tool_data,
            "suggested_followups": [
                "Which product sold the most this month?",
                "What should I prepare for Diwali?",
                "Which products have low inventory?",
                "How much should I produce next month?"
            ]
        }

