import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserRole, ArtisanProfile, Store, Customer, VendorApplication, VerificationDocument
from ..schemas import UserCreate, UserLogin, UserOut, Token, BecomeSellerRequest
from ..security import verify_password, get_password_hash, create_access_token
from ..dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_out(user: User, db: Session) -> UserOut:
    roles = [r.role for r in user.roles]
    store = db.query(Store).filter(Store.vendor_id == user.id).first()
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone_number=user.phone_number,
        is_active=user.is_active,
        roles=roles,
        has_store=store is not None,
        store_id=store.id if store else None,
        store_slug=store.slug if store else None,
        created_at=user.created_at
    )

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email address already exists")

    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        phone_number=user_in.phone_number,
        hashed_password=get_password_hash(user_in.password),
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Assign requested role + customer role by default
    db.add(UserRole(user_id=new_user.id, role="customer"))
    if user_in.role == "vendor":
        db.add(UserRole(user_id=new_user.id, role="vendor"))

    # Also create customer profile
    cust = Customer(
        user_id=new_user.id,
        phone=user_in.phone_number or ""
    )
    db.add(cust)
    db.commit()

    token = create_access_token(new_user.id)
    return Token(access_token=token, user=format_user_out(new_user, db))

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = create_access_token(user.id)
    return Token(access_token=token, user=format_user_out(user, db))

@router.get("/me", response_model=UserOut)
def get_current_user_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return format_user_out(user, db)

@router.post("/become-seller", response_model=UserOut)
def become_seller(seller_data: BecomeSellerRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if already vendor
    roles = [r.role for r in current_user.roles]
    if "vendor" not in roles:
        db.add(UserRole(user_id=current_user.id, role="vendor"))

    # Create or update ArtisanProfile
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if not profile:
        profile = ArtisanProfile(
            user_id=current_user.id,
            artisan_name=seller_data.artisan_name,
            bio=seller_data.store_description,
            years_of_experience=seller_data.years_of_experience,
            craft_specialization=seller_data.craft_specialization,
            artisan_type=seller_data.artisan_type,
            phone=seller_data.phone,
            address=seller_data.address,
            region=seller_data.region,
            district=seller_data.district,
            state=seller_data.state,
            verification_status="under_review"
        )
        db.add(profile)
    else:
        profile.artisan_name = seller_data.artisan_name
        profile.years_of_experience = seller_data.years_of_experience
        profile.craft_specialization = seller_data.craft_specialization

    # Create store if none
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', seller_data.store_name.lower()).strip('-')
    store = db.query(Store).filter(Store.vendor_id == current_user.id).first()
    if not store:
        # Check slug collision
        if db.query(Store).filter(Store.slug == slug).first():
            slug = f"{slug}-{current_user.id[:6]}"

        store = Store(
            vendor_id=current_user.id,
            name=seller_data.store_name,
            slug=slug,
            description=seller_data.store_description,
            craft_category=seller_data.craft_category,
            region=seller_data.region,
            location=f"{seller_data.district}, {seller_data.state}",
            verification_badge=True,  # enabled for demo
            is_regional_origin_verified=True
        )
        db.add(store)

    db.commit()
    return format_user_out(current_user, db)

@router.get("/demo-accounts")
def get_demo_accounts():
    """Returns quick credentials to facilitate testing."""
    return [
        {
            "role": "Administrator",
            "name": "KalaConnect Admin",
            "email": "admin@kalaconnect.ai",
            "password": "Admin@123",
            "description": "Full access to review vendor applications, verify crafts, and inspect platform analytics."
        },
        {
            "role": "Vendor / Artisan (Wooden Toys)",
            "name": "Ramesh Varma (Etikoppaka)",
            "email": "ramesh@etikoppaka.com",
            "password": "Artisan@123",
            "description": "GI-tagged Etikoppaka wooden lacquer crafts store with demand forecast, seasonal advice & AI advisor."
        },
        {
            "role": "Vendor / Artisan (Kalamkari Textiles)",
            "name": "Lakshmi Devi (Kalamkari)",
            "email": "lakshmi@kalamkari.com",
            "password": "Artisan@123",
            "description": "Traditional Srikalahasti Kalamkari studio with sales data, production plans, and order management."
        },
        {
            "role": "Customer / Buyer",
            "name": "Priya Sharma",
            "email": "priya@customer.com",
            "password": "Customer@123",
            "description": "Customer account to explore verified stores and products, manage cart, and place orders."
        }
    ]

