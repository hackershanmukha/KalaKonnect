"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("store_id");

  const { user, refreshCart } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery details form
  const [address, setAddress] = useState("Flat 402, Heritage Residency, Indiranagar");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [postalCode, setPostalCode] = useState("560038");
  const [phone, setPhone] = useState("+91 98765 00002");
  const [paymentMethod, setPaymentMethod] = useState("simulated_upi");

  useEffect(() => {
    async function getCart() {
      try {
        const data = await fetchApi("/orders/cart");
        if (!data || !Array.isArray(data.items) || data.items.length === 0) {
          router.push("/cart");
          return;
        }
        setCart(data);
      } catch (err) {
        console.error("Cart checkout error:", err);
      } finally {
        setLoading(false);
      }
    }
    getCart();
  }, [router]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || !cart.store_id) return;

    setIsSubmitting(true);
    try {
      const order = await fetchApi("/orders/checkout", {
        method: "POST",
        body: JSON.stringify({
          store_id: cart.store_id,
          delivery_address: address,
          city,
          state,
          postal_code: postalCode,
          phone,
          payment_method: paymentMethod,
        }),
      });

      await refreshCart();
      router.push(`/orders?placed=${order.order_number}`);
    } catch (err: any) {
      alert(err.message || "Could not place order");
      setIsSubmitting(false);
    }
  };

  if (loading || !cart) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#9C4221] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[#786C5E]">Preparing checkout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#261E18]">Fulfillment & Checkout</h1>
        <p className="text-xs text-[#786C5E] mt-1">
          Handmade orders are dispatched directly by {cart.store_name}.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Delivery & Payment Details */}
        <div className="md:col-span-7 space-y-6">
          {/* Delivery Address Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-[#261E18] flex items-center space-x-2">
              <Truck className="w-4 h-4 text-[#9C4221]" />
              <span>Delivery Details</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Shipping Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Card (SIMULATED FOR DEMO) */}
          <div className="bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-[#261E18] flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[#2F6A4F]" />
              <span>Payment Gateway (Simulated Demo)</span>
            </h3>

            {/* Clear Simulation Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Sandbox Demonstration Mode</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Real payment gateway is not charged. This simulates an instant verified UPI transaction for evaluation purposes.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center space-x-3 p-3 rounded-xl border border-[#9C4221] bg-[#FAF7F2] cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "simulated_upi"}
                  onChange={() => setPaymentMethod("simulated_upi")}
                  className="accent-[#9C4221]"
                />
                <div className="flex-1">
                  <p className="font-bold text-[#261E18]">Simulated Instant UPI / QR Payment</p>
                  <p className="text-[10px] text-[#786C5E]">Auto-confirms transaction to vendor</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 rounded-xl border border-[#E6DED3] bg-white cursor-pointer hover:bg-stone-50">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "simulated_card"}
                  onChange={() => setPaymentMethod("simulated_card")}
                  className="accent-[#9C4221]"
                />
                <div className="flex-1">
                  <p className="font-bold text-[#261E18]">Simulated Credit / Debit Card</p>
                  <p className="text-[10px] text-[#786C5E]">Sandbox checkout with zero live deduction</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review */}
        <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-6 h-max">
          <h3 className="font-serif text-lg font-bold text-[#261E18]">Cart Items</h3>

          <div className="space-y-3 divide-y divide-[#F0EBE1] text-xs">
            {cart.items.map((item: any) => (
              <div key={item.id} className="pt-2 flex justify-between items-center">
                <div className="pr-2">
                  <p className="font-semibold text-[#261E18]">{item.product_name}</p>
                  <p className="text-[11px] text-[#786C5E]">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-[#261E18] shrink-0">
                  ₹{item.line_total.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E6DED3] space-y-2 text-xs">
            <div className="flex justify-between text-[#615447]">
              <span>Subtotal</span>
              <span>₹{cart.total_amount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-[#2F6A4F] font-semibold">
              <span>Artisan Direct Courier</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#261E18] pt-2 border-t border-[#F0EBE1]">
              <span>Payable Total</span>
              <span className="text-[#9C4221] font-serif">
                ₹{cart.total_amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#9C4221]/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>{isSubmitting ? "Confirming Order..." : "Confirm & Place Order"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs text-stone-500">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
