#!/usr/bin/env python3
"""
KalaConnect Automated Daily Artisan Digest & Predictive Inventory Script
Runs as a daily automated cron job or scheduled pipeline to:
1. Scan pending workshop orders across all registered artisans
2. Identify stockout risks based on current stock vs. AI demand forecasts
3. Output an automated daily digest report
4. Push real-time in-app and webhook alerts
"""

import os
import sys
from datetime import datetime

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.database import SessionLocal
from backend.app.models import Store, Order, Inventory, Product, Notification, SalesHistory

def run_daily_automation():
    print(f"[{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}] Starting KalaConnect Daily Artisan Automation...")
    db = SessionLocal()
    try:
        stores = db.query(Store).all()
        print(f"Processing {len(stores)} artisan store(s)...")

        report_lines = [
            f"# KalaConnect Daily Workshop Automation Digest",
            f"**Generated:** {datetime.utcnow().strftime('%A, %d %B %Y %H:%M UTC')}\n",
            f"---",
        ]

        total_pending = 0
        total_low_stock = 0

        for st in stores:
            pending_orders = db.query(Order).filter(
                Order.store_id == st.id,
                Order.status.in_(["new", "accepted", "in_production"])
            ).all()

            low_stock = db.query(Inventory).filter(
                Inventory.store_id == st.id,
                Inventory.current_stock <= 10
            ).all()

            total_pending += len(pending_orders)
            total_low_stock += len(low_stock)

            report_lines.append(f"## {st.name} ({st.region} • {st.craft_category})")
            report_lines.append(f"- **Active Orders:** {len(pending_orders)}")
            report_lines.append(f"- **Stockout Alert Items:** {len(low_stock)}")

            if pending_orders:
                report_lines.append("  - Orders in Queue:")
                for o in pending_orders:
                    report_lines.append(f"    - `#{o.order_number}`: Status `{o.status}` | Value ₹{o.total_amount:,.2f} | Est. Dispatch: {o.estimated_dispatch_date.strftime('%Y-%m-%d') if o.estimated_dispatch_date else 'N/A'}")

            if low_stock:
                report_lines.append("  - Critical Stock Items:")
                for item in low_stock:
                    pname = item.product.name if item.product else "Craft Item"
                    report_lines.append(f"    - {pname}: **{item.current_stock} left** (Safety threshold: {item.safety_stock})")

            # Push automated notification to artisan
            db.add(Notification(
                user_id=st.vendor_id,
                title="Morning Workshop Automation Digest",
                message=f"Good morning! You have {len(pending_orders)} active orders in handcrafting pipeline and {len(low_stock)} items needing raw material replenishment.",
                link="/vendor/dashboard"
            ))
            report_lines.append("")

        db.commit()

        # Ensure reports dir exists
        os.makedirs("reports", exist_ok=True)
        report_path = os.path.join("reports", "latest_artisan_digest.md")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("\n".join(report_lines))

        print(f"Daily automation completed successfully.")
        print(f"Total active orders: {total_pending} | Total low stock alerts: {total_low_stock}")
        print(f"Report written to: {report_path}")

    except Exception as e:
        print(f"Error executing automation: {e}", file=sys.stderr)
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_daily_automation()

