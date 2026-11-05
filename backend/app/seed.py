from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from .models import (
    User, UserRole, ArtisanProfile, Store, Product, ProductImage,
    ProductVerification, Customer, Inventory, SalesHistory,
    FestivalCalendar, VendorApplication, VerificationDocument, ProductReview
)
from .security import get_password_hash

def seed_database(db: Session):
    # Check if database already has users
    if db.query(User).first():
        print("Database already seeded. Skipping.")
        return

    print("🌱 Seeding KalaConnect AI database with demonstration data...")

    # 1. Admin Account
    admin = User(
        email="admin@kalaconnect.ai",
        full_name="KalaConnect Admin",
        phone_number="+91 98765 00001",
        hashed_password=get_password_hash("Admin@123"),
        is_active=True
    )
    db.add(admin)
    db.flush()
    db.add(UserRole(user_id=admin.id, role="admin"))

    # 2. Customer Account
    cust_user = User(
        email="priya@customer.com",
        full_name="Priya Sharma",
        phone_number="+91 98765 00002",
        hashed_password=get_password_hash("Customer@123"),
        is_active=True
    )
    db.add(cust_user)
    db.flush()
    db.add(UserRole(user_id=cust_user.id, role="customer"))

    cust = Customer(
        user_id=cust_user.id,
        shipping_address="B-402, Heritage Residency, Indiranagar",
        city="Bengaluru",
        state="Karnataka",
        postal_code="560038",
        phone="+91 98765 00002"
    )
    db.add(cust)

    # 3. Festivals Calendar
    festivals = [
        FestivalCalendar(
            name="Diwali (Deepavali)",
            region="All India",
            month="October / November",
            start_date="2026-11-08",
            craft_categories=["Pottery & Terracotta", "Metal Crafts & Brass", "Handloom & Textiles", "Wooden Toys & Crafts"],
            lead_time_weeks=5,
            demand_multiplier=3.2,
            description="Festival of lights. Massive surge in handmade clay diyas, brass lamps, festive attire, and heritage gifts."
        ),
        FestivalCalendar(
            name="Makar Sankranti & Pongal",
            region="South & West India",
            month="January",
            start_date="2027-01-14",
            craft_categories=["Wooden Toys & Crafts", "Pottery & Terracotta", "Handloom & Textiles"],
            lead_time_weeks=4,
            demand_multiplier=2.6,
            description="Harvest festival. Traditional toys (Golu/Bommai Kolu), clay cooking pots, and handwoven silk sarees."
        ),
        FestivalCalendar(
            name="Ugadi & Gudi Padwa",
            region="Deccan / South India",
            month="March / April",
            start_date="2027-03-30",
            craft_categories=["Handloom & Textiles", "Wooden Toys & Crafts", "Bamboo & Cane Crafts"],
            lead_time_weeks=3,
            demand_multiplier=2.1,
            description="Traditional New Year. High demand for handmade decor, brass puja vessels, and ethnic home craft."
        ),
        FestivalCalendar(
            name="Durga Puja & Navratri",
            region="East & West India",
            month="October",
            start_date="2026-10-18",
            craft_categories=["Handloom & Textiles", "Pottery & Terracotta", "Jewellery"],
            lead_time_weeks=6,
            demand_multiplier=3.0,
            description="Cultural celebration requiring traditional handloom sarees, terracotta artifacts, and handcrafted jewellery."
        ),
        FestivalCalendar(
            name="National Crafts Mela & Fairs",
            region="National / North India",
            month="February",
            start_date="2027-02-01",
            craft_categories=["Wooden Toys & Crafts", "Bamboo & Cane Crafts", "Handloom & Textiles", "Pottery & Terracotta"],
            lead_time_weeks=3,
            demand_multiplier=2.4,
            description="Peak season for regional artisan exhibitions and gift buyers seeking genuine GI-verified crafts."
        )
    ]
    for f in festivals:
        db.add(f)
    db.flush()

    # 4. Vendors & Stores
    stores_data = [
        {
            "email": "ramesh@etikoppaka.com",
            "name": "Ramesh Varma",
            "store_name": "Etikoppaka Wooden Crafts",
            "slug": "etikoppaka-wooden-crafts",
            "category": "Wooden Toys & Crafts",
            "region": "Andhra Pradesh (Visakhapatnam)",
            "location": "Etikoppaka Village, Visakhapatnam District, AP",
            "experience": 24,
            "bio": "4th generation master lathe-turner specializing in GI-certified non-toxic lacquerware wooden toys and sacred wooden artefacts.",
            "logo": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80",
            "banner": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
            "description": "Exquisite handmade turned wooden toys and home accents crafted from seasoned Ankudu softwood and polished using 100% natural organic vegetable lacquers.",
            "products": [
                {
                    "name": "Etikoppaka Hand-Turned Balancing Acrobat Toy",
                    "slug": "etikoppaka-balancing-acrobat-toy",
                    "price": 649.0,
                    "desc": "A timeless traditional wooden balancing toy crafted on a hand-lathe with organic vegetal lacquer colors. Completely child-safe and eco-friendly.",
                    "category": "Wooden Toys & Crafts",
                    "material": "Ankudu Softwood, Organic Tree Lacquer, Natural Turmeric & Indigo",
                    "technique": "Hand-Turned Lathe & Friction Lacquering",
                    "origin": "Etikoppaka, Andhra Pradesh (GI Tagged)",
                    "days": 4,
                    "stock": 35,
                    "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80"
                },
                {
                    "name": "Heritage Etikoppaka Lacquered Vermilion Box (Kumkum Bharani)",
                    "slug": "etikoppaka-lacquered-vermilion-box",
                    "price": 499.0,
                    "desc": "Traditional ceremonial vermilion container with a precision screw-top lid, dyed with rich natural red lacquer extracted from tree bark.",
                    "category": "Wooden Toys & Crafts",
                    "material": "Seasoned Softwood, Natural Lac Resin",
                    "technique": "Precision Hand Turning",
                    "origin": "Etikoppaka, Andhra Pradesh",
                    "days": 3,
                    "stock": 50,
                    "image": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80"
                },
                {
                    "name": "Etikoppaka Wooden Toy Train Set (5 Carriages)",
                    "slug": "etikoppaka-wooden-toy-train-set",
                    "price": 1290.0,
                    "desc": "Charming five-compartment vintage toy train with smoothly rolling wheels, finished in vibrant earth tones using botanical pigments.",
                    "category": "Wooden Toys & Crafts",
                    "material": "Ankudu Wood, Botanical Dyes",
                    "technique": "Hand Carving & Assembly",
                    "origin": "Etikoppaka, Andhra Pradesh",
                    "days": 6,
                    "stock": 18,
                    "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
                }
            ]
        },
        {
            "email": "lakshmi@kalamkari.com",
            "name": "Lakshmi Devi",
            "store_name": "Kalamkari Heritage Studio",
            "slug": "kalamkari-heritage-studio",
            "category": "Handloom & Textiles",
            "region": "Andhra Pradesh (Srikalahasti)",
            "location": "Srikalahasti, Tirupati District, AP",
            "experience": 19,
            "bio": "Renowned freehand Kalamkari master artist trained in hereditary temple scroll painting using bamboo kalam pens and natural vegetable mordants.",
            "logo": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80",
            "banner": "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=80",
            "description": "Authentic hand-drawn and vegetable-dyed Kalamkari wall hangings, dupattas, and sarees created along the Swarnamukhi river following 17-step ancient purification rituals.",
            "products": [
                {
                    "name": "Tree of Life Hand-Drawn Kalamkari Cotton Tapestry",
                    "slug": "kalamkari-tree-of-life-tapestry",
                    "price": 2850.0,
                    "desc": "Sacred Tree of Life motif meticulously rendered with natural bamboo kalam, myrobalan mordant, and fermented jaggery ink on handspun organic cotton.",
                    "category": "Handloom & Textiles",
                    "material": "100% Organic Handspun Cotton, Vegetable & Mineral Dyes",
                    "technique": "Srikalahasti Freehand Kalam Drawing",
                    "origin": "Srikalahasti, Andhra Pradesh (GI Tagged)",
                    "days": 14,
                    "stock": 12,
                    "image": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"
                },
                {
                    "name": "Pure Handwoven Chanderi Kalamkari Stole",
                    "slug": "pure-chanderi-kalamkari-stole",
                    "price": 1950.0,
                    "desc": "Featherlight Chanderi silk-cotton stole adorned with authentic hand-painted floral borders and peacock medallions in indigo and madder red.",
                    "category": "Handloom & Textiles",
                    "material": "Chanderi Silk-Cotton, Madder Root, Natural Indigo",
                    "technique": "Handloom Weave & Pen Kalamkari",
                    "origin": "Srikalahasti, Andhra Pradesh",
                    "days": 10,
                    "stock": 22,
                    "image": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
                }
            ]
        },
        {
            "email": "anita@terracotta.com",
            "name": "Anita Pal",
            "store_name": "Traditional Terracotta Works",
            "slug": "traditional-terracotta-works",
            "category": "Pottery & Terracotta",
            "region": "West Bengal (Bankura) / Uttar Pradesh",
            "location": "Panchmura, Bankura District, West Bengal",
            "experience": 16,
            "bio": "Hereditary potter crafting authentic Bankura terracotta horses and auspicious festive clay diyas using regional alluvial riverbed silt.",
            "logo": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80",
            "banner": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
            "description": "Time-honored earthen pottery, sculpted terracotta horses, and handcrafted filigree oil lamps fired in traditional wood-burning earthen kilns.",
            "products": [
                {
                    "name": "Bankura Terracotta Heritage Horse Figurine (12 Inch)",
                    "slug": "bankura-terracotta-heritage-horse",
                    "price": 1450.0,
                    "desc": "Iconic GI-tagged Bankura horse featuring symmetrical erect ears and ornate neck coils, thrown in separate sections on the wheel and hand-assembled.",
                    "category": "Pottery & Terracotta",
                    "material": "Local Alluvial River Clay, Natural Earth Ochre",
                    "technique": "Wheel Thrown & Relief Clay Applique",
                    "origin": "Bankura, West Bengal (GI Tagged)",
                    "days": 9,
                    "stock": 15,
                    "image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
                },
                {
                    "name": "Handmade Filigree Clay Diyas (Auspicious Set of 12)",
                    "slug": "handmade-filigree-clay-diyas-set",
                    "price": 540.0,
                    "desc": "Delicately perforated festive terracotta oil lamps that cast mesmerizing lattice shadows when lit with pure ghee or sesame oil.",
                    "category": "Pottery & Terracotta",
                    "material": "Pure Ganga River Silt Clay",
                    "technique": "Wheel Thrown & Hand Pierced Filigree",
                    "origin": "Gorakhpur / Bankura",
                    "days": 5,
                    "stock": 60,
                    "image": "https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=800&q=80"
                }
            ]
        },
        {
            "email": "suresh@kondapalli.com",
            "name": "Suresh Achary",
            "store_name": "Kondapalli Toy Creations",
            "slug": "kondapalli-toy-creations",
            "category": "Wooden Toys & Crafts",
            "region": "Andhra Pradesh (Krishna District)",
            "location": "Kondapalli, NTR District, Andhra Pradesh",
            "experience": 21,
            "bio": "Preserving the 400-year legacy of Kondapalli Rajas and village folk tableau carved from sacred Tella Poniki softwood.",
            "logo": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80",
            "banner": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
            "description": "Renowned GI-tagged Kondapalli toys, Dasavatara tableau, and rural community figurines hand-chiseled from indigenous lightweight wood.",
            "products": [
                {
                    "name": "Kondapalli Bullock Cart with Farmers Tableau",
                    "slug": "kondapalli-bullock-cart-tableau",
                    "price": 1850.0,
                    "desc": "Classic village life diorama capturing a traditional bullock cart laden with harvest grain, carved from Tella Poniki softwood with fine tempera detailing.",
                    "category": "Wooden Toys & Crafts",
                    "material": "Tella Poniki Softwood, Tamarind Seed Paste, Natural Dyes",
                    "technique": "Chisel Carving & Tempera Painting",
                    "origin": "Kondapalli, Andhra Pradesh (GI Tagged)",
                    "days": 10,
                    "stock": 14,
                    "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
                }
            ]
        },
        {
            "email": "biren@bamboo.com",
            "name": "Biren Saikia",
            "store_name": "Handmade Bamboo Creations",
            "slug": "handmade-bamboo-creations",
            "category": "Bamboo & Cane Crafts",
            "region": "Assam (Barpeta)",
            "location": "Sarthebari, Barpeta District, Assam",
            "experience": 15,
            "bio": "Sustainable indigenous bamboo craftsman crafting durable, biodegradable home utilities and handwoven storage baskets.",
            "logo": "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=400&q=80",
            "banner": "https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=1200&q=80",
            "description": "Zero-carbon, sustainably harvested wild bamboo craft items combining tribal weaving heritage with modern eco-living utility.",
            "products": [
                {
                    "name": "Assam Handwoven Bamboo Planter & Storage Basket",
                    "slug": "assam-handwoven-bamboo-planter-basket",
                    "price": 890.0,
                    "desc": "Finely split natural Assam bamboo woven in interlocking hexagonal mesh. Treated with natural vegetable oils for water and pest resistance.",
                    "category": "Bamboo & Cane Crafts",
                    "material": "Mature Wild Bamboo, Natural Cane Splints",
                    "technique": "Hexagonal Hand Weave",
                    "origin": "Barpeta, Assam",
                    "days": 4,
                    "stock": 40,
                    "image": "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80"
                }
            ]
        }
    ]

    all_products = []

    for s_data in stores_data:
        # Create User
        u = User(
            email=s_data["email"],
            full_name=s_data["name"],
            phone_number="+91 94401 " + str(random.randint(10000, 99999)),
            hashed_password=get_password_hash("Artisan@123"),
            is_active=True
        )
        db.add(u)
        db.flush()

        # Roles: Vendor and Customer
        db.add(UserRole(user_id=u.id, role="vendor"))
        db.add(UserRole(user_id=u.id, role="customer"))

        # Artisan Profile
        profile = ArtisanProfile(
            user_id=u.id,
            artisan_name=s_data["name"],
            bio=s_data["bio"],
            years_of_experience=s_data["experience"],
            craft_specialization=s_data["category"],
            artisan_type="individual",
            phone=u.phone_number,
            address=s_data["location"],
            region=s_data["region"],
            district=s_data["location"].split(",")[1].strip() if "," in s_data["location"] else "District",
            state=s_data["region"].split("(")[0].strip(),
            profile_image=s_data["logo"],
            verification_status="approved"
        )
        db.add(profile)

        # Store
        store = Store(
            vendor_id=u.id,
            name=s_data["store_name"],
            slug=s_data["slug"],
            description=s_data["description"],
            craft_category=s_data["category"],
            region=s_data["region"],
            location=s_data["location"],
            logo_url=s_data["logo"],
            banner_url=s_data["banner"],
            verification_badge=True,
            is_regional_origin_verified=True,
            rating=4.9,
            total_sales_count=random.randint(48, 142)
        )
        db.add(store)
        db.flush()

        # Vendor Application (for admin history)
        app = VendorApplication(
            vendor_id=u.id,
            personal_info={"name": s_data["name"], "phone": u.phone_number},
            store_info={"store_name": s_data["store_name"], "category": s_data["category"]},
            craft_info={"experience": s_data["experience"], "specialization": s_data["category"]},
            status="approved",
            ai_summary=f"Artisan workshop evidence corroborated traditional {s_data['category']} methodology in {s_data['region']}. No automated flags.",
            ai_recommendation="approve",
            admin_notes="Approved verified heritage artisan after workshop verification."
        )
        db.add(app)
        db.flush()

        # Verification Documents
        doc1 = VerificationDocument(
            application_id=app.id,
            vendor_id=u.id,
            document_type="workshop_photo",
            file_url=s_data["banner"],
            title="Artisan Workshop & Traditional Tools",
            verified_status="verified",
            notes="Shows traditional hand lathes, chisels and workspace."
        )
        doc2 = VerificationDocument(
            application_id=app.id,
            vendor_id=u.id,
            document_type="raw_material",
            file_url=s_data["logo"],
            title="Natural Raw Materials & Pigments",
            verified_status="verified",
            notes="Natural wood logs and botanical pigments verified."
        )
        doc3 = VerificationDocument(
            application_id=app.id,
            vendor_id=u.id,
            document_type="gi_certificate",
            file_url="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
            title="Geographical Indication (GI) Certificate",
            verified_status="verified",
            notes="GI authorized user registration confirmed."
        )
        db.add_all([doc1, doc2, doc3])

        # Products
        for p_info in s_data["products"]:
            p = Product(
                store_id=store.id,
                name=p_info["name"],
                slug=p_info["slug"],
                description=p_info["desc"],
                category=p_info["category"],
                price=p_info["price"],
                available_quantity=p_info["stock"],
                material=p_info["material"],
                craft_technique=p_info["technique"],
                place_of_origin=p_info["origin"],
                production_time_days=p_info["days"],
                is_customizable=True,
                verification_status="approved",
                is_active=True
            )
            db.add(p)
            db.flush()
            all_products.append(p)

            # Image
            img = ProductImage(
                product_id=p.id,
                image_url=p_info["image"],
                is_primary=True,
                caption=p_info["name"],
                display_order=0
            )
            db.add(img)

            # Verification
            pv = ProductVerification(
                product_id=p.id,
                ai_confidence_score=0.96,
                ai_category_match=True,
                ai_material_consistency=True,
                ai_craft_authenticity_notes=f"Corroborated authentic {p_info['technique']} using genuine {p_info['material']}.",
                duplicate_flag=False,
                admin_decision="approved",
                admin_reason="Certified handmade craft by authorized artisan."
            )
            db.add(pv)

            # Inventory
            inv = Inventory(
                product_id=p.id,
                store_id=store.id,
                current_stock=p_info["stock"],
                reserved_stock=random.randint(1, 4),
                reorder_level=5,
                daily_production_capacity=random.randint(6, 15),
                raw_material_status="adequate"
            )
            db.add(inv)

            # Review
            rev = ProductReview(
                product_id=p.id,
                customer_id=cust.id,
                customer_name="Priya S.",
                rating=5,
                comment=f"Stunning authentic craftsmanship! The finish and natural materials are evident. Highly recommend this artisan.",
                verified_purchase=True
            )
            db.add(rev)

            # Generate realistic Sales History spanning past 4 months for Demand Forecasting
            today = datetime.utcnow()
            for week_offset in range(16, 0, -1):
                sale_time = today - timedelta(days=week_offset * 7 + random.randint(0, 5))
                # Slight growth trend
                base_qty = random.randint(3, 8)
                if week_offset < 4:
                    base_qty += random.randint(2, 6) # festival surge

                sh = SalesHistory(
                    store_id=store.id,
                    product_id=p.id,
                    quantity_sold=base_qty,
                    sale_amount=float(base_qty * p_info["price"]),
                    sale_date=sale_time,
                    festival_tag="Pre-Festive Surge" if week_offset in [2, 3] else None
                )
                db.add(sh)

    db.commit()
    print("✅ Database successfully seeded with 5 artisan stores, authentic craft products, sales history, and festivals!")

