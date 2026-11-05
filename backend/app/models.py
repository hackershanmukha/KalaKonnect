import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

# 1. Users
class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(30), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    artisan_profile = relationship("ArtisanProfile", back_populates="user", uselist=False)
    stores = relationship("Store", back_populates="vendor")
    customer = relationship("Customer", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")

# 2. User Roles
class UserRole(Base):
    __tablename__ = "user_roles"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    role = Column(String(50), nullable=False)  # "customer", "vendor", "admin"
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="roles")

# 3. Artisan Profiles
class ArtisanProfile(Base):
    __tablename__ = "artisan_profiles"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    artisan_name = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    years_of_experience = Column(Integer, default=0)
    craft_specialization = Column(String(255), nullable=True)
    artisan_type = Column(String(100), default="individual")  # individual, cooperative, authorized_seller
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    region = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    profile_image = Column(String(500), nullable=True)
    verification_status = Column(String(50), default="pending")  # pending, under_review, approved, rejected, info_required
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="artisan_profile")

# 4. Stores
class Store(Base):
    __tablename__ = "stores"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    vendor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    craft_category = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    logo_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)
    verification_badge = Column(Boolean, default=False)
    is_regional_origin_verified = Column(Boolean, default=False)
    rating = Column(Float, default=4.8)
    total_sales_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    vendor = relationship("User", back_populates="stores")
    products = relationship("Product", back_populates="store", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="store")
    inventory_items = relationship("Inventory", back_populates="store")
    sales_history = relationship("SalesHistory", back_populates="store")

# 5. Vendor Applications
class VendorApplication(Base):
    __tablename__ = "vendor_applications"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    vendor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    personal_info = Column(JSON, nullable=True)
    store_info = Column(JSON, nullable=True)
    craft_info = Column(JSON, nullable=True)
    status = Column(String(50), default="pending")  # pending, under_review, approved, rejected, info_required
    ai_summary = Column(Text, nullable=True)
    ai_recommendation = Column(String(100), nullable=True)
    admin_notes = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(String(36), nullable=True)

    documents = relationship("VerificationDocument", back_populates="application", cascade="all, delete-orphan")

# 6. Verification Documents
class VerificationDocument(Base):
    __tablename__ = "verification_documents"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("vendor_applications.id"), nullable=True)
    vendor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    document_type = Column(String(100), nullable=False)  # workshop_photo, process_video, raw_material, finished_product, identity_doc, gi_certificate
    file_url = Column(String(500), nullable=False)
    title = Column(String(255), nullable=True)
    verified_status = Column(String(50), default="pending")  # pending, verified, rejected
    notes = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("VendorApplication", back_populates="documents")

# 7. Products
class Product(Base):
    __tablename__ = "products"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    subcategory = Column(String(100), nullable=True)
    price = Column(Float, nullable=False)
    available_quantity = Column(Integer, default=0)
    material = Column(String(255), nullable=True)
    craft_technique = Column(String(255), nullable=True)
    place_of_origin = Column(String(255), nullable=False)
    production_time_days = Column(Integer, default=7)
    is_customizable = Column(Boolean, default=False)
    verification_status = Column(String(50), default="approved")  # pending, approved, rejected
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    store = relationship("Store", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    verification = relationship("ProductVerification", back_populates="product", uselist=False, cascade="all, delete-orphan")
    inventory = relationship("Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan")
    reviews = relationship("ProductReview", back_populates="product", cascade="all, delete-orphan")

# 8. Product Images
class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False)
    caption = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0)

    product = relationship("Product", back_populates="images")

# 9. Product Verifications
class ProductVerification(Base):
    __tablename__ = "product_verifications"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), unique=True, nullable=False)
    ai_confidence_score = Column(Float, default=0.92)
    ai_category_match = Column(Boolean, default=True)
    ai_material_consistency = Column(Boolean, default=True)
    ai_craft_authenticity_notes = Column(Text, nullable=True)
    duplicate_flag = Column(Boolean, default=False)
    admin_decision = Column(String(50), default="approved")  # pending, approved, rejected
    admin_reason = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="verification")

# 10. Customers
class Customer(Base):
    __tablename__ = "customers"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    shipping_address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(30), nullable=True)
    phone = Column(String(50), nullable=True)

    user = relationship("User", back_populates="customer")
    orders = relationship("Order", back_populates="customer")

# 11. Carts
class Cart(Base):
    __tablename__ = "carts"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

# 12. Cart Items
class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    cart_id = Column(String(36), ForeignKey("carts.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    customization_notes = Column(Text, nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")

# 13. Orders
class Order(Base):
    __tablename__ = "orders"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="new")  # new, accepted, in_production, ready_for_dispatch, shipped, delivered, cancelled
    estimated_dispatch_date = Column(DateTime, nullable=True)
    delivery_address = Column(Text, nullable=False)
    payment_status = Column(String(50), default="simulated_paid")
    payment_method = Column(String(50), default="simulated_upi")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="orders")
    store = relationship("Store", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

# 14. Order Items
class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    customization_notes = Column(Text, nullable=True)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

# 15. Inventory
class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), unique=True, nullable=False)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)
    current_stock = Column(Integer, default=10)
    reserved_stock = Column(Integer, default=0)
    reorder_level = Column(Integer, default=5)
    daily_production_capacity = Column(Integer, default=10)
    raw_material_status = Column(String(100), default="adequate")  # adequate, low, out_of_stock
    raw_material_notes = Column(Text, nullable=True)

    product = relationship("Product", back_populates="inventory")
    store = relationship("Store", back_populates="inventory_items")

# 16. Sales History
class SalesHistory(Base):
    __tablename__ = "sales_history"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    order_id = Column(String(36), nullable=True)
    quantity_sold = Column(Integer, nullable=False)
    sale_amount = Column(Float, nullable=False)
    sale_date = Column(DateTime, default=datetime.utcnow)
    festival_tag = Column(String(100), nullable=True)

    store = relationship("Store", back_populates="sales_history")
    product = relationship("Product")

# 17. Festival Calendar
class FestivalCalendar(Base):
    __tablename__ = "festival_calendar"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)
    month = Column(String(50), nullable=False)
    start_date = Column(String(50), nullable=False)
    craft_categories = Column(JSON, nullable=False)  # ["Pottery & Clay", "Handloom & Textiles"]
    lead_time_weeks = Column(Integer, default=4)
    demand_multiplier = Column(Float, default=2.5)
    description = Column(Text, nullable=True)

# 18. Demand Forecasts
class DemandForecast(Base):
    __tablename__ = "demand_forecasts"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    forecast_period = Column(String(100), nullable=False)  # e.g., "Next 4 Weeks", "Diwali Season"
    predicted_demand_units = Column(Integer, nullable=False)
    confidence_score = Column(Float, default=0.88)
    actual_vs_predicted_error = Column(Float, default=6.5)  # MAPE %
    stockout_risk_level = Column(String(50), default="medium")  # low, medium, high, critical
    suggested_safety_stock = Column(Integer, default=20)
    is_preliminary = Column(Boolean, default=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")

# 19. Production Plans
class ProductionPlan(Base):
    __tablename__ = "production_plans"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    suggested_quantity = Column(Integer, nullable=False)
    recommended_start_date = Column(DateTime, nullable=False)
    target_completion_date = Column(DateTime, nullable=False)
    raw_materials_needed = Column(JSON, nullable=True)
    status = Column(String(50), default="suggested")  # suggested, accepted, modified, rejected
    artisan_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")

# 20. Notifications
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

# 21. Product Reviews
class ProductReview(Base):
    __tablename__ = "product_reviews"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    customer_name = Column(String(255), default="Verified Buyer")
    rating = Column(Integer, default=5)
    comment = Column(Text, nullable=True)
    verified_purchase = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="reviews")

# 22. Audit Logs
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    admin_id = Column(String(36), nullable=False)
    target_entity = Column(String(100), nullable=False)  # "vendor", "product", "store"
    target_id = Column(String(36), nullable=False)
    action = Column(String(100), nullable=False)  # "approve_vendor", "reject_product", etc.
    reason = Column(Text, nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# 23. Artisan Inquiries & Buyer Messages
class ArtisanInquiry(Base):
    __tablename__ = "artisan_inquiries"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    store_id = Column(String(36), ForeignKey("stores.id"), nullable=False)
    artisan_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    buyer_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    buyer_name = Column(String(255), nullable=False)
    buyer_email = Column(String(255), nullable=False)
    buyer_phone = Column(String(50), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    artisan_reply = Column(Text, nullable=True)
    replied_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    store = relationship("Store")


