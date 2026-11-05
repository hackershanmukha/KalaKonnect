from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# ----------------- AUTH SCHEMAS -----------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: str = "customer"  # customer or vendor

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: str
    is_active: bool
    roles: List[str] = []
    has_store: bool = False
    store_id: Optional[str] = None
    store_slug: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class BecomeSellerRequest(BaseModel):
    artisan_name: str
    years_of_experience: int = 1
    craft_specialization: str
    artisan_type: str = "individual"
    phone: str
    address: str
    region: str
    district: str
    state: str
    store_name: str
    craft_category: str
    store_description: str

# ----------------- STORE SCHEMAS -----------------
class StoreBase(BaseModel):
    name: str
    description: Optional[str] = None
    craft_category: str
    region: str
    location: str
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None

class StoreCreate(StoreBase):
    pass

class StoreOut(StoreBase):
    id: str
    vendor_id: str
    slug: str
    verification_badge: bool = False
    is_regional_origin_verified: bool = False
    rating: float = 4.8
    total_sales_count: int = 0
    product_count: int = 0
    artisan_name: Optional[str] = None
    artisan_bio: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- PRODUCT SCHEMAS -----------------
class ProductImageBase(BaseModel):
    image_url: str
    is_primary: bool = False
    caption: Optional[str] = None
    display_order: int = 0

class ProductImageOut(ProductImageBase):
    id: str
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: str
    category: str
    subcategory: Optional[str] = None
    price: float
    available_quantity: int = 0
    material: Optional[str] = None
    craft_technique: Optional[str] = None
    place_of_origin: str
    production_time_days: int = 7
    is_customizable: bool = False

class ProductCreate(ProductBase):
    images: List[str] = []
    workshop_evidence_url: Optional[str] = None
    gi_claim: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    price: Optional[float] = None
    available_quantity: Optional[int] = None
    material: Optional[str] = None
    craft_technique: Optional[str] = None
    place_of_origin: Optional[str] = None
    production_time_days: Optional[int] = None
    is_customizable: Optional[bool] = None
    is_active: Optional[bool] = None

class ProductVerificationOut(BaseModel):
    ai_confidence_score: float
    ai_category_match: bool
    ai_material_consistency: bool
    ai_craft_authenticity_notes: Optional[str] = None
    duplicate_flag: bool = False
    admin_decision: str
    admin_reason: Optional[str] = None
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductOut(ProductBase):
    id: str
    store_id: str
    slug: str
    verification_status: str
    is_active: bool
    store_name: Optional[str] = None
    store_slug: Optional[str] = None
    artisan_name: Optional[str] = None
    region: Optional[str] = None
    verification_badge: bool = False
    is_regional_origin_verified: bool = False
    images: List[ProductImageOut] = []
    verification: Optional[ProductVerificationOut] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- CART & ORDER SCHEMAS -----------------
class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = 1
    customization_notes: Optional[str] = None

class CartItemOut(BaseModel):
    id: str
    product_id: str
    product_name: str
    product_price: float
    product_image: Optional[str] = None
    store_id: str
    store_name: str
    quantity: int
    customization_notes: Optional[str] = None
    line_total: float

class CartOut(BaseModel):
    id: str
    items: List[CartItemOut] = []
    total_amount: float = 0.0
    item_count: int = 0
    store_id: Optional[str] = None
    store_name: Optional[str] = None

class OrderCreate(BaseModel):
    store_id: str
    delivery_address: str
    city: str
    state: str
    postal_code: str
    phone: str
    payment_method: str = "simulated_upi"

class OrderItemOut(BaseModel):
    id: str
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total_price: float
    customization_notes: Optional[str] = None

class OrderOut(BaseModel):
    id: str
    order_number: str
    store_id: str
    store_name: Optional[str] = None
    customer_id: str
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    total_amount: float
    status: str
    payment_status: str
    payment_method: str
    delivery_address: str
    estimated_dispatch_date: Optional[datetime] = None
    created_at: datetime
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str  # new, accepted, in_production, ready_for_dispatch, shipped, delivered, cancelled
    estimated_dispatch_date: Optional[datetime] = None

# ----------------- VENDOR ONBOARDING & VERIFICATION -----------------
class VerificationDocumentCreate(BaseModel):
    document_type: str  # workshop_photo, process_video, raw_material, finished_product, identity_doc, gi_certificate
    file_url: str
    title: str
    notes: Optional[str] = None

class VendorOnboardingStep1(BaseModel):
    artisan_name: str
    phone: str
    email: EmailStr
    address: str
    region: str
    district: str
    state: str

class VendorOnboardingStep2(BaseModel):
    store_name: str
    store_description: str
    craft_category: str
    location: str
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None

class VendorOnboardingStep3(BaseModel):
    artisan_type: str  # individual, cooperative, authorized_seller
    years_of_experience: int
    craft_specialization: str
    bio: Optional[str] = None

class VendorOnboardingStep4(BaseModel):
    documents: List[VerificationDocumentCreate]

class VendorApplicationSubmit(BaseModel):
    personal_info: VendorOnboardingStep1
    store_info: VendorOnboardingStep2
    craft_info: VendorOnboardingStep3
    evidence: List[VerificationDocumentCreate]

class AdminDecisionRequest(BaseModel):
    decision: str  # approved, rejected, info_required
    reason: Optional[str] = None

# ----------------- FORECASTING & SEASONAL & PRODUCTION -----------------
class DemandForecastItemOut(BaseModel):
    product_id: str
    product_name: str
    category: str
    current_stock: int
    predicted_demand_units: int
    stockout_risk_level: str  # low, medium, high, critical
    suggested_safety_stock: int
    confidence_score: float
    is_preliminary: bool
    festival_relevance: Optional[str] = None
    actual_vs_predicted_error: float

class DemandForecastSummaryOut(BaseModel):
    store_id: str
    forecast_horizon: str
    high_demand_products: List[DemandForecastItemOut]
    low_demand_products: List[DemandForecastItemOut]
    potential_stockouts_count: int
    overall_confidence: float
    is_category_benchmark: bool
    notice_text: Optional[str] = None

class SeasonalRecommendationItem(BaseModel):
    festival_name: str
    region: str
    month: str
    start_date: str
    relevant_crafts: List[str]
    lead_time_weeks: int
    recommended_action: str
    target_products: List[str]
    suggested_batch_size: int
    raw_materials_checklist: List[str]
    promotional_tip: str

class ProductionPlanCreate(BaseModel):
    product_id: str
    suggested_quantity: int
    recommended_start_date: datetime
    target_completion_date: datetime
    raw_materials_needed: List[Dict[str, Any]]
    artisan_notes: Optional[str] = None

class ProductionPlanOut(BaseModel):
    id: str
    product_id: str
    product_name: str
    suggested_quantity: int
    recommended_start_date: datetime
    target_completion_date: datetime
    raw_materials_needed: List[Dict[str, Any]]
    status: str
    artisan_notes: Optional[str] = None
    created_at: datetime

# ----------------- AI BUSINESS ADVISOR -----------------
class AdvisorChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []

class AdvisorChatResponse(BaseModel):
    reply: str
    data_points: Optional[Dict[str, Any]] = None
    suggested_followups: List[str] = []

# ----------------- AI ASSISTANCE FOR PRODUCTS & VERIFICATION -----------------
class ProductAIAssistRequest(BaseModel):
    image_url: Optional[str] = None
    raw_title: Optional[str] = None
    category_hint: Optional[str] = None
    notes: Optional[str] = None

class ProductAIAssistResponse(BaseModel):
    suggested_title: str
    suggested_description: str
    suggested_category: str
    suggested_material: str
    suggested_craft_technique: str
    suggested_tags: List[str]
    estimated_production_days: int
    cultural_heritage_highlight: str
    confidence_score: float

class VerificationAIAssistRequest(BaseModel):
    vendor_name: str
    craft_category: str
    claimed_origin: str
    documents: List[Dict[str, str]]

class VerificationAIAssistResponse(BaseModel):
    authenticity_confidence: float
    category_match: bool
    evidence_consistency: str
    potential_flags: List[str]
    recommendation: str  # approve, human_review, reject
    summary: str

# ----------------- INQUIRIES & MESSAGING -----------------
class ArtisanInquiryCreate(BaseModel):
    message: str
    buyer_name: Optional[str] = None
    buyer_email: Optional[str] = None
    buyer_phone: Optional[str] = None

class ArtisanInquiryReply(BaseModel):
    reply: str

class ArtisanInquiryOut(BaseModel):
    id: str
    store_id: str
    store_name: Optional[str] = None
    artisan_user_id: str
    buyer_user_id: Optional[str] = None
    buyer_name: str
    buyer_email: str
    buyer_phone: Optional[str] = None
    message: str
    is_read: bool
    artisan_reply: Optional[str] = None
    replied_at: Optional[datetime] = None
    status: Optional[str] = "pending"
    created_at: datetime

    class Config:
        from_attributes = True


