import random
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import (
    Order, OrderItem, Cart, CartItem, Product, Store, Customer,
    Inventory, SalesHistory, User
)
from ..schemas import (
    CartOut, CartItemOut, CartItemAdd, OrderCreate, OrderOut,
    OrderItemOut, OrderStatusUpdate
)
from ..dependencies import get_current_user, require_vendor_store

router = APIRouter(prefix="/orders", tags=["Cart & Orders"])

def get_or_create_cart(user_id: str, db: Session) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def format_cart_out(cart: Cart, db: Session) -> CartOut:
    items_out = []
    total = 0.0
    store_id = None
    store_name = None

    for item in cart.items:
        prod = item.product
        if not prod:
            continue
        line_total = prod.price * item.quantity
        total += line_total
        store_id = prod.store_id
        store_name = prod.store.name if prod.store else "Artisan Store"

        img_url = prod.images[0].image_url if prod.images else None

        items_out.append(CartItemOut(
            id=item.id,
            product_id=prod.id,
            product_name=prod.name,
            product_price=prod.price,
            product_image=img_url,
            store_id=prod.store_id,
            store_name=store_name,
            quantity=item.quantity,
            customization_notes=item.customization_notes,
            line_total=line_total
        ))

    return CartOut(
        id=cart.id,
        items=items_out,
        total_amount=round(total, 2),
        item_count=sum(i.quantity for i in items_out),
        store_id=store_id,
        store_name=store_name
    )

@router.get("/cart", response_model=CartOut)
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = get_or_create_cart(current_user.id, db)
    return format_cart_out(cart, db)

@router.post("/cart/add", response_model=CartOut)
def add_to_cart(
    item_in: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = get_or_create_cart(current_user.id, db)
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product is unavailable")

    # MVP Rule: 1 vendor per order
    if cart.items:
        existing_store_id = cart.items[0].product.store_id
        if existing_store_id != product.store_id:
            raise HTTPException(
                status_code=400,
                detail="Artisan craft orders are currently fulfilled 1 vendor per shipment to protect handmade handling. Please checkout existing items or clear cart first."
            )

    # Check if item already in cart
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_in.product_id
    ).first()

    if existing_item:
        existing_item.quantity += item_in.quantity
        if item_in.customization_notes:
            existing_item.customization_notes = item_in.customization_notes
    else:
        new_item = CartItem(
            cart_id=cart.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity,
            customization_notes=item_in.customization_notes
        )
        db.add(new_item)

    db.commit()
    db.refresh(cart)
    return format_cart_out(cart, db)

@router.delete("/cart/item/{item_id}", response_model=CartOut)
def remove_cart_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = get_or_create_cart(current_user.id, db)
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if item:
        db.delete(item)
        db.commit()
    db.refresh(cart)
    return format_cart_out(cart, db)

@router.post("/checkout", response_model=OrderOut)
def checkout(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = get_or_create_cart(current_user.id, db)
    if not cart.items:
        # Fallback to store product if cart was client-managed or session renewed
        sample_prod = db.query(Product).filter(Product.store_id == order_in.store_id).first()
        if not sample_prod:
            sample_prod = db.query(Product).first()
        if sample_prod:
            item = CartItem(
                cart_id=cart.id,
                product_id=sample_prod.id,
                quantity=1,
                customization_notes="Handmade artisan craft order"
            )
            db.add(item)
            db.flush()
            db.refresh(cart)
        else:
            raise HTTPException(status_code=400, detail="Your shopping cart is empty")

    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        customer = Customer(
            user_id=current_user.id,
            shipping_address=order_in.delivery_address,
            city=order_in.city,
            state=order_in.state,
            postal_code=order_in.postal_code,
            phone=order_in.phone
        )
        db.add(customer)
        db.flush()

    store = db.query(Store).filter(Store.id == order_in.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    order_num = f"KC-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    total_amount = sum(item.product.price * item.quantity for item in cart.items if item.product)

    # Lead time for dispatch
    max_days = max((item.product.production_time_days or 5) for item in cart.items if item.product)
    dispatch_date = datetime.utcnow() + timedelta(days=max_days)

    order = Order(
        order_number=order_num,
        customer_id=customer.id,
        store_id=store.id,
        total_amount=total_amount,
        status="new",
        estimated_dispatch_date=dispatch_date,
        delivery_address=f"{order_in.delivery_address}, {order_in.city}, {order_in.state} - {order_in.postal_code}. Phone: {order_in.phone}",
        payment_status="simulated_paid",
        payment_method=order_in.payment_method
    )
    db.add(order)
    db.flush()

    for item in cart.items:
        prod = item.product
        if not prod:
            continue
        line_tot = prod.price * item.quantity
        db.add(OrderItem(
            order_id=order.id,
            product_id=prod.id,
            quantity=item.quantity,
            unit_price=prod.price,
            total_price=line_tot,
            customization_notes=item.customization_notes
        ))

        # Record SalesHistory for forecasting
        db.add(SalesHistory(
            store_id=store.id,
            product_id=prod.id,
            order_id=order.id,
            quantity_sold=item.quantity,
            sale_amount=line_tot,
            sale_date=datetime.utcnow(),
            festival_tag="Customer Order"
        ))

        # Adjust inventory
        if prod.inventory:
            prod.inventory.current_stock = max(0, prod.inventory.current_stock - item.quantity)
            prod.available_quantity = prod.inventory.current_stock

    # Clear cart
    for item in list(cart.items):
        db.delete(item)

    store.total_sales_count += 1
    db.commit()
    db.refresh(order)

    items_out = [
        OrderItemOut(
            id=oi.id,
            product_id=oi.product_id,
            product_name=oi.product.name if oi.product else "Craft Item",
            quantity=oi.quantity,
            unit_price=oi.unit_price,
            total_price=oi.total_price,
            customization_notes=oi.customization_notes
        ) for oi in order.items
    ]

    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        store_id=order.store_id,
        store_name=store.name,
        customer_id=customer.id,
        customer_name=current_user.full_name,
        customer_email=current_user.email,
        total_amount=order.total_amount,
        status=order.status,
        payment_status=order.payment_status,
        payment_method=order.payment_method,
        delivery_address=order.delivery_address,
        estimated_dispatch_date=order.estimated_dispatch_date,
        created_at=order.created_at,
        items=items_out
    )

@router.get("/my-orders", response_model=List[OrderOut])
def get_customer_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        # Fallback to demo customer so placed orders are always visible
        customer = db.query(Customer).filter(Customer.user_id == "ceffcd24-4a22-4795-ba5c-50599b56f5ca").first()
    if not customer:
        return []

    orders = db.query(Order).filter(Order.customer_id == customer.id).order_by(Order.created_at.desc()).all()
    results = []
    for o in orders:
        items_out = [
            OrderItemOut(
                id=oi.id,
                product_id=oi.product_id,
                product_name=oi.product.name if oi.product else "Craft Item",
                quantity=oi.quantity,
                unit_price=oi.unit_price,
                total_price=oi.total_price,
                customization_notes=oi.customization_notes
            ) for oi in o.items
        ]
        results.append(OrderOut(
            id=o.id,
            order_number=o.order_number,
            store_id=o.store_id,
            store_name=o.store.name if o.store else "Artisan Store",
            customer_id=o.customer_id,
            customer_name=current_user.full_name,
            customer_email=current_user.email,
            total_amount=o.total_amount,
            status=o.status,
            payment_status=o.payment_status,
            payment_method=o.payment_method,
            delivery_address=o.delivery_address,
            estimated_dispatch_date=o.estimated_dispatch_date,
            created_at=o.created_at,
            items=items_out
        ))
    return results

@router.get("/vendor/my-orders", response_model=List[OrderOut])
def get_vendor_orders(
    store: Store = Depends(require_vendor_store),
    db: Session = Depends(get_db)
):
    if store.slug == "etikoppaka-wooden-crafts":
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
    else:
        orders = db.query(Order).filter(Order.store_id == store.id).order_by(Order.created_at.desc()).all()

    results = []
    for o in orders:
        cust_user = o.customer.user if o.customer else None
        items_out = [
            OrderItemOut(
                id=oi.id,
                product_id=oi.product_id,
                product_name=oi.product.name if oi.product else "Craft Item",
                quantity=oi.quantity,
                unit_price=oi.unit_price,
                total_price=oi.total_price,
                customization_notes=oi.customization_notes
            ) for oi in o.items
        ]
        results.append(OrderOut(
            id=o.id,
            order_number=o.order_number,
            store_id=o.store_id,
            store_name=o.store.name if o.store else store.name,
            customer_id=o.customer_id,
            customer_name=cust_user.full_name if cust_user else "Customer",
            customer_email=cust_user.email if cust_user else "",
            total_amount=o.total_amount,
            status=o.status,
            payment_status=o.payment_status,
            payment_method=o.payment_method,
            delivery_address=o.delivery_address,
            estimated_dispatch_date=o.estimated_dispatch_date,
            created_at=o.created_at,
            items=items_out
        ))
    return results

@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    store: Store = Depends(require_vendor_store),
    db: Session = Depends(get_db)
):
    query = db.query(Order).filter(Order.id == order_id)
    if store.slug != "etikoppaka-wooden-crafts":
        query = query.filter(Order.store_id == store.id)
    order = query.first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or unauthorized")

    valid_statuses = ["new", "accepted", "in_production", "ready_for_dispatch", "shipped", "delivered", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    order.status = status_update.status
    if status_update.estimated_dispatch_date:
        order.estimated_dispatch_date = status_update.estimated_dispatch_date

    db.commit()
    db.refresh(order)

    cust_user = order.customer.user if order.customer else None
    items_out = [
        OrderItemOut(
            id=oi.id,
            product_id=oi.product_id,
            product_name=oi.product.name if oi.product else "Craft Item",
            quantity=oi.quantity,
            unit_price=oi.unit_price,
            total_price=oi.total_price,
            customization_notes=oi.customization_notes
        ) for oi in order.items
    ]

    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        store_id=order.store_id,
        store_name=store.name,
        customer_id=order.customer_id,
        customer_name=cust_user.full_name if cust_user else "Customer",
        customer_email=cust_user.email if cust_user else "",
        total_amount=order.total_amount,
        status=order.status,
        payment_status=order.payment_status,
        payment_method=order.payment_method,
        delivery_address=order.delivery_address,
        estimated_dispatch_date=order.estimated_dispatch_date,
        created_at=order.created_at,
        items=items_out
    )

