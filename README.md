# KalaConnect AI
> **Authentic Crafts. Verified Artisans. Unique Discoveries.**

An AI-powered, multi-vendor marketplace built exclusively for genuine handmade, traditional, culturally significant, and region-specific products (featuring Indian handicrafts, GI-certified specialties, terracotta, Kalamkari textiles, lathe-turned lacquer toys, and bamboo crafts).

---

## 🚀 Quick Start: How to Run the Platform

You can run both the Backend and Frontend with a single click or in two terminal windows:

### Option A: One-Click Launch (Windows)
Double-click `start_all.bat` or run:
```bash
.\start_all.bat
```
This automatically launches the FastAPI Backend (Port 8000) and Next.js Frontend (Port 3000) in separate terminals.

---

### Option B: Manual Two-Terminal Launch

#### 1. Start the FastAPI Backend (Port 8000)
```bash
# In project root:
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **API URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
*(On first startup, the database auto-seeds with 5 authentic artisan stores, products, historical sales, and festival calendars!)*

#### 2. Start the Next.js Frontend (Port 3000)
```bash
# In frontend directory:
cd frontend
npm run dev
```
- **Web Application:** `http://localhost:3000`

---

## 👥 Demo Accounts (1-Click Switcher Available in UI)

You can instantly switch between roles in the top navbar via the **"Demo Accounts"** dropdown:

| Role | Name & Details | Email | Password |
|---|---|---|---|
| **Administrator** | KalaConnect Admin (Application & Product Verification) | `admin@kalaconnect.ai` | `Admin@123` |
| **Artisan / Vendor 1** | Ramesh Varma (Etikoppaka GI Wooden Crafts) | `ramesh@etikoppaka.com` | `Artisan@123` |
| **Artisan / Vendor 2** | Lakshmi Devi (Kalamkari Heritage Studio) | `lakshmi@kalamkari.com` | `Artisan@123` |
| **Artisan / Vendor 3** | Suresh Achary (Kondapalli Softwood Toys) | `suresh@kondapalli.com` | `Artisan@123` |
| **Customer / Collector** | Priya Sharma (Bengaluru Buyer) | `priya@customer.com` | `Customer@123` |

---

## 🌟 Key Modules & Features

### 1. Customer Marketplace
- **TWO PRIMARY SEPARATED TABS:**
  - **Tab 1: STORES:** Independent vendor storefront cards with artisan profile, location, GI origin badge, and product count.
  - **Tab 2: PRODUCTS:** Unified product catalog from all approved artisan guilds with category, region, and price filters.
- **Individual Digital Storefronts:** Unique slug URLs (e.g., `/store/etikoppaka-wooden-crafts`) featuring the artisan's heritage story, verified workshop badge, and full catalog.
- **Cart & Checkout:** Handcrafted 1-vendor shipment grouping rule, custom production lead times, and clearly labelled sandbox payment workflow.

### 2. Artisan Onboarding & Authenticity Verification
- **5-Step Onboarding Wizard:** Personal info, store branding, craft specialization, and workshop/material evidence upload.
- **AI Authenticity Assistant:** Inspects evidence for traditional tools, detects factory molds, and flags anomalies.
- **Mandatory Admin Oversight:** Platform administrators review evidence and grant official verification badges.

### 3. AI Demand Forecasting Engine
- **Powered by Pandas & Scikit-learn:** Time-aware evaluation incorporating historical sales velocity and festival demand surges.
- Identifies high/low demand items, projected units, safety stock, and stockout risk alerts.
- Includes category-level benchmark fallbacks for new vendors with preliminary disclaimers.

### 4. Seasonal Intelligence Engine
- Indian festival calendar (Diwali, Makar Sankranti, Ugadi, Dussehra, Pongal, Crafts Fairs).
- Correlates artisan craft categories with upcoming occasions, procurement lead times, and batch size advice.

### 5. AI Production Planning Assistant
- Connects demand forecasts with artisan daily capacity and raw material status to generate shop-floor schedules.

### 6. AI Business Advisor (Conversational Assistant)
- Chat interface in Vendor Dashboard backed by real database tools (`get_sales_summary`, `get_inventory`, `get_product_performance`, `get_demand_forecast`).
- Strict zero-hallucination constraint: only cites authentic figures from the vendor's database.

---

## 🛠️ Technology Stack
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend:** Python FastAPI, Pydantic, SQLAlchemy, JWT Authentication.
- **AI & Analytics:** Gemini API (Vision & Multimodal Product Assistant), Pandas, Scikit-learn.
- **Database:** PostgreSQL / Supabase compatible (defaults to local SQLite for instant out-of-the-box evaluation).

