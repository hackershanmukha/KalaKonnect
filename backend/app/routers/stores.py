from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Store, Product, ArtisanProfile, ProductReview, ArtisanInquiry, Notification, User
from ..schemas import StoreOut, ProductOut, ArtisanInquiryCreate, ArtisanInquiryOut, ArtisanInquiryReply
from ..dependencies import get_optional_user, require_vendor_store

router = APIRouter(prefix="/stores", tags=["Stores"])

@router.get("", response_model=List[StoreOut])
def list_stores(
    search: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Store)

    if search:
        search_filter = f"%{search}%"
        query = query.outerjoin(User, Store.vendor_id == User.id).outerjoin(
            ArtisanProfile, ArtisanProfile.user_id == User.id
        ).filter(
            (Store.name.ilike(search_filter)) |
            (Store.description.ilike(search_filter)) |
            (Store.location.ilike(search_filter)) |
            (Store.craft_category.ilike(search_filter)) |
            (User.full_name.ilike(search_filter)) |
            (ArtisanProfile.artisan_name.ilike(search_filter))
        )
    if category and category != "All":
        query = query.filter(Store.craft_category.ilike(f"%{category}%"))
    if region and region != "All":
        query = query.filter(Store.region.ilike(f"%{region}%"))

    stores = query.order_by(Store.rating.desc()).all()

    results = []
    for s in stores:
        artisan = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == s.vendor_id).first()
        prod_count = db.query(Product).filter(
            Product.store_id == s.id,
            Product.verification_status == "approved",
            Product.is_active == True
        ).count()

        results.append(StoreOut(
            id=s.id,
            vendor_id=s.vendor_id,
            name=s.name,
            slug=s.slug,
            description=s.description,
            craft_category=s.craft_category,
            region=s.region,
            location=s.location,
            logo_url=s.logo_url,
            banner_url=s.banner_url,
            verification_badge=s.verification_badge,
            is_regional_origin_verified=s.is_regional_origin_verified,
            rating=s.rating,
            total_sales_count=s.total_sales_count,
            product_count=prod_count,
            artisan_name=artisan.artisan_name if artisan else "Master Artisan",
            artisan_bio=artisan.bio if artisan else s.description,
            created_at=s.created_at
        ))
    return results

@router.get("/{slug}")
def get_store_by_slug(slug: str, db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.slug == slug).first()
    if not store:
        # Check by ID if slug not found
        store = db.query(Store).filter(Store.id == slug).first()
    if not store:
        raise HTTPException(status_code=404, detail="Artisan store not found")

    artisan = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == store.vendor_id).first()

    # Get approved products
    products = db.query(Product).filter(
        Product.store_id == store.id,
        Product.verification_status == "approved",
        Product.is_active == True
    ).all()

    prod_out = []
    for p in products:
        prod_out.append({
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "description": p.description,
            "category": p.category,
            "price": p.price,
            "available_quantity": p.available_quantity,
            "material": p.material,
            "craft_technique": p.craft_technique,
            "place_of_origin": p.place_of_origin,
            "production_time_days": p.production_time_days,
            "is_customizable": p.is_customizable,
            "image": p.images[0].image_url if p.images else None,
            "verification_status": p.verification_status
        })

    # Get reviews for products in this store
    reviews = db.query(ProductReview).join(Product).filter(Product.store_id == store.id).limit(6).all()
    rev_out = [{
        "id": r.id,
        "customer_name": r.customer_name,
        "rating": r.rating,
        "comment": r.comment,
        "verified_purchase": r.verified_purchase,
        "created_at": r.created_at.strftime("%b %d, %Y")
    } for r in reviews]

    return {
        "store": {
            "id": store.id,
            "name": store.name,
            "slug": store.slug,
            "description": store.description,
            "craft_category": store.craft_category,
            "region": store.region,
            "location": store.location,
            "logo_url": store.logo_url,
            "banner_url": store.banner_url,
            "verification_badge": store.verification_badge,
            "is_regional_origin_verified": store.is_regional_origin_verified,
            "rating": store.rating,
            "total_sales_count": store.total_sales_count,
            "created_at": store.created_at
        },
        "artisan": {
            "name": artisan.artisan_name if artisan else "Master Artisan",
            "bio": artisan.bio if artisan else store.description,
            "years_of_experience": artisan.years_of_experience if artisan else 15,
            "craft_specialization": artisan.craft_specialization if artisan else store.craft_category,
            "profile_image": artisan.profile_image if artisan else store.logo_url,
            "verification_status": artisan.verification_status if artisan else "approved"
        },
        "products": prod_out,
        "reviews": rev_out
    }

@router.post("/{slug}/inquire")
def send_artisan_inquiry(
    slug: str,
    inquiry_in: ArtisanInquiryCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    store = db.query(Store).filter(Store.slug == slug).first()
    if not store:
        store = db.query(Store).filter(Store.id == slug).first()
    if not store:
        raise HTTPException(status_code=404, detail="Artisan store not found")

    # Determine buyer identity
    buyer_user_id = current_user.id if current_user else None
    buyer_name = (
        (current_user.full_name if current_user and current_user.full_name else None)
        or (inquiry_in.buyer_name if inquiry_in.buyer_name and inquiry_in.buyer_name.strip() else None)
        or "Registered Collector"
    )
    buyer_email = (
        (current_user.email if current_user and current_user.email else None)
        or (inquiry_in.buyer_email if inquiry_in.buyer_email and inquiry_in.buyer_email.strip() else None)
        or "collector@kalaconnect.ai"
    )
    buyer_phone = (
        (current_user.phone_number if current_user and current_user.phone_number else None)
        or inquiry_in.buyer_phone
    )

    # Create the inquiry record in the database
    new_inquiry = ArtisanInquiry(
        store_id=store.id,
        artisan_user_id=store.vendor_id,  # EXACT ARTISAN ACCOUNT LINK
        buyer_user_id=buyer_user_id,      # EXACT BUYER ACCOUNT LINK
        buyer_name=buyer_name,
        buyer_email=buyer_email,
        buyer_phone=buyer_phone,
        message=inquiry_in.message
    )
    db.add(new_inquiry)

    # Also notify the artisan's account directly
    artisan_notification = Notification(
        user_id=store.vendor_id,
        title=f"New Craft Inquiry from {buyer_name}",
        message=f"{buyer_name} ({buyer_email}) inquired: \"{inquiry_in.message[:100]}...\"",
        link=f"/vendor/dashboard"
    )
    db.add(artisan_notification)

    db.commit()
    db.refresh(new_inquiry)

    return {
        "message": f"Inquiry successfully delivered to {store.name}'s master artisan.",
        "inquiry_id": new_inquiry.id,
        "recipient_artisan_id": store.vendor_id,
        "store_name": store.name
    }

@router.get("/vendor/my-inquiries")
def get_vendor_inquiries(
    store: Store = Depends(require_vendor_store),
    db: Session = Depends(get_db)
):
    # Fetch all inquiries specifically sent to this artisan/store
    inquiries = db.query(ArtisanInquiry).filter(
        ArtisanInquiry.artisan_user_id == store.vendor_id
    ).order_by(ArtisanInquiry.created_at.desc()).all()

    return [{
        "id": inq.id,
        "store_id": inq.store_id,
        "store_name": store.name,
        "buyer_user_id": inq.buyer_user_id,
        "buyer_name": inq.buyer_name,
        "buyer_email": inq.buyer_email,
        "buyer_phone": inq.buyer_phone,
        "message": inq.message,
        "is_read": inq.is_read,
        "artisan_reply": inq.artisan_reply,
        "replied_at": inq.replied_at.strftime("%b %d, %Y %I:%M %p") if inq.replied_at else None,
        "status": inq.status or ("replied" if inq.artisan_reply else "pending"),
        "created_at": inq.created_at.strftime("%b %d, %Y %I:%M %p") if inq.created_at else None
    } for inq in inquiries]

@router.post("/vendor/inquiries/{inquiry_id}/reply")
def reply_to_artisan_inquiry(
    inquiry_id: str,
    reply_data: ArtisanInquiryReply,
    store: Store = Depends(require_vendor_store),
    db: Session = Depends(get_db)
):
    inquiry = db.query(ArtisanInquiry).filter(
        ArtisanInquiry.id == inquiry_id,
        ArtisanInquiry.artisan_user_id == store.vendor_id
    ).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found or does not belong to your store")
    
    reply_text = reply_data.reply.strip()
    if not reply_text:
        raise HTTPException(status_code=400, detail="Reply cannot be empty")
    
    inquiry.artisan_reply = reply_text
    inquiry.replied_at = datetime.utcnow()
    inquiry.status = "replied"
    inquiry.is_read = True
    
    # Notify buyer if linked to an account
    if inquiry.buyer_user_id:
        buyer_notif = Notification(
            user_id=inquiry.buyer_user_id,
            title=f"Artisan Reply from {store.name}",
            message=f"{store.name}: \"{reply_text[:120]}...\"",
            link="/orders?tab=inquiries"
        )
        db.add(buyer_notif)
    
    db.commit()
    db.refresh(inquiry)
    
    return {
        "success": True,
        "message": "Reply sent to buyer successfully",
        "inquiry": {
            "id": inquiry.id,
            "artisan_reply": inquiry.artisan_reply,
            "status": inquiry.status,
            "replied_at": inquiry.replied_at.strftime("%b %d, %Y %I:%M %p") if inquiry.replied_at else None
        }
    }

@router.get("/customer/my-inquiries")
def get_customer_inquiries(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        return []
    
    inquiries = db.query(ArtisanInquiry).filter(
        (ArtisanInquiry.buyer_user_id == current_user.id) | (ArtisanInquiry.buyer_email == current_user.email)
    ).order_by(ArtisanInquiry.created_at.desc()).all()
    
    results = []
    for inq in inquiries:
        st = db.query(Store).filter(Store.id == inq.store_id).first()
        artisan_user = db.query(User).filter(User.id == inq.artisan_user_id).first() if inq.artisan_user_id else None
        results.append({
            "id": inq.id,
            "store_id": inq.store_id,
            "store_name": st.name if st else "Artisan Studio",
            "store_slug": st.slug if st else "",
            "artisan_name": (artisan_user.full_name if artisan_user and artisan_user.full_name else None) or (st.name if st else "Master Artisan"),
            "craft_category": st.craft_category if st else "Handicrafts",
            "region": st.region if st else "India",
            "message": inq.message,
            "artisan_reply": inq.artisan_reply,
            "status": inq.status or ("replied" if inq.artisan_reply else "pending"),
            "replied_at": inq.replied_at.strftime("%b %d, %Y %I:%M %p") if inq.replied_at else None,
            "created_at": inq.created_at.strftime("%b %d, %Y %I:%M %p") if inq.created_at else None
        })
    return results


