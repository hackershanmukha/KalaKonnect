"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Store,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, refreshCart } = useAuth();
  const router = useRouter();

  const loadCart = async () => {
    try {
      const data = await fetchApi("/orders/cart");
      if (data && Array.isArray(data.items)) {
        setCart(data);
      } else {
        setCart({ items: [], total_amount: 0, item_count: 0 });
      }
    } catch (err) {
      console.error("Cart error:", err);
      setCart({ items: [], total_amount: 0, item_count: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (itemId: string) => {
    try {
      const updated = await fetchApi(`/orders/cart/item/${itemId}`, { method: "DELETE" });
      if (updated && Array.isArray(updated.items)) {
        setCart(updated);
      } else {
        await loadCart();
      }
      await refreshCart();
    } catch (err: any) {
      alert(err.message || "Could not remove item");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#9C4221] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[#786C5E]">Loading your artisan craft bag...</p>
      </div>
    );
  }

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#FAF7F2] border border-[#E6DED3] flex items-center justify-center mx-auto text-stone-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#261E18]">Your Craft Bag is Empty</h2>
        <p className="text-xs text-[#786C5E] max-w-sm mx-auto leading-relaxed">
          Explore authentic handmade treasures created by verified master artisans across India.
        </p>
        <div className="pt-2">
          <Link
            href="/marketplace?tab=products"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#9C4221] text-white text-xs font-semibold hover:bg-[#7B341E] transition-colors"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#261E18]">Shopping Cart</h1>
        <p className="text-xs text-[#786C5E] mt-1">
          Review handcrafted pieces before entering delivery details.
        </p>
      </div>

      {/* 1 Vendor per order notice */}
      <div className="p-4 rounded-2xl bg-[#F5EFE6] border border-[#E6DED3] flex items-start space-x-3 text-xs text-[#615447]">
        <Store className="w-4 h-4 text-[#9C4221] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#261E18]">Direct Guild Shipment: {cart?.store_name || "Artisan Workshop"}</p>
          <p className="mt-0.5">
            To ensure genuine handmade quality and direct artisan packing, orders are processed one artisan workshop per checkout.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {(cart?.items || []).map((item: any) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-[#E6DED3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-[#E6DED3]">
                  <img
                    src={item.product_image || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=200&q=80"}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#261E18]">
                    {item.product_name}
                  </h3>
                  <p className="text-xs text-[#786C5E]">
                    Unit Price: ₹{item.product_price.toLocaleString("en-IN")} × {item.quantity}
                  </p>
                  {item.customization_notes && (
                    <p className="text-[11px] text-[#9C4221] mt-1 italic">
                      Customization: &ldquo;{item.customization_notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[#F0EBE1]">
                <p className="font-serif text-base font-bold text-[#261E18]">
                  ₹{item.line_total.toLocaleString("en-IN")}
                </p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Checkout CTA */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-6 h-max">
          <h3 className="font-serif text-lg font-bold text-[#261E18]">Order Summary</h3>

          <div className="space-y-3 text-xs text-[#615447] pb-4 border-b border-[#F0EBE1]">
            <div className="flex justify-between">
              <span>Subtotal ({cart.item_count} items)</span>
              <span className="font-bold text-[#261E18]">₹{cart.total_amount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-[#2F6A4F]">
              <span>Handcrafted Care Packaging</span>
              <span className="font-semibold">FREE</span>
            </div>
            <div className="flex justify-between text-[#2F6A4F]">
              <span>Regional Artisan Shipping</span>
              <span className="font-semibold">FREE</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-[#261E18]">Total Amount</span>
            <span className="font-serif text-2xl font-bold text-[#9C4221]">
              ₹{cart.total_amount.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            onClick={() => router.push(`/checkout?store_id=${cart.store_id}`)}
            className="w-full py-3.5 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#9C4221]/20 transition-all"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-[11px] text-[#786C5E] justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2F6A4F]" />
            <span>Encrypted simulated checkout guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}

