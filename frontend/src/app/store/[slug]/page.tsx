"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Award,
  Sparkles,
  ShoppingBag,
  Star,
  MessageCircle,
  Clock,
  Send,
  CheckCircle2
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ArtisanStorefront() {
  const params = useParams();
  const slug = params?.slug as string;

  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryText, setInquiryText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { user, refreshCart } = useAuth();
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  useEffect(() => {
    if (user) {
      setGuestName(user.full_name || "");
      setGuestEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    async function loadStore() {
      try {
        const data = await fetchApi(`/stores/${slug}`);
        setStoreData(data);
      } catch (err) {
        console.error("Storefront error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadStore();
  }, [slug]);

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await fetchApi("/orders/cart/add", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      await refreshCart();
      setToastMessage(`Added "${productName}" to cart!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to add to cart");
    }
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
    try {
      const activeName = user?.full_name || guestName || "Interested Collector";
      const activeEmail = user?.email || guestEmail || "collector@kalaconnect.ai";

      await fetchApi(`/stores/${slug}/inquire`, {
        method: "POST",
        body: JSON.stringify({
          message: inquiryText,
          buyer_name: activeName,
          buyer_email: activeEmail,
          buyer_phone: user?.phone_number || "",
        }),
      });
      setInquiryModalOpen(false);
      setInquiryText("");
      setToastMessage(`Your craft inquiry has been sent to ${store.name}'s master artisan!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert("Could not deliver inquiry: " + (err.message || "Network error"));
    } finally {
      setInquirySent(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#9C4221] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[#786C5E]">Opening verified artisan studio...</p>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#261E18]">Artisan Store Not Found</h2>
        <p className="text-xs text-[#786C5E] mt-2">The requested artisan guild might be unverified or inactive.</p>
        <Link href="/marketplace?tab=stores" className="inline-block mt-4 px-4 py-2 rounded-xl bg-[#9C4221] text-white text-xs font-semibold">
          Browse All Stores
        </Link>
      </div>
    );
  }

  const { store, artisan, products, reviews } = storeData;

  return (
    <div className="pb-20 space-y-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2F6A4F] text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-sm font-medium animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* STORE HERO BANNER */}
      <div className="relative bg-stone-900 h-64 sm:h-80 w-full overflow-hidden">
        <img
          src={store.banner_url || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80"}
          alt={store.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* ARTISAN IDENTITY HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6DED3] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-5">
            {/* Logo Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-stone-100 shrink-0">
              <img
                src={store.logo_url || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80"}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#261E18]">
                  {store.name}
                </h1>
                {store.verification_badge && (
                  <span className="bg-[#2F6A4F] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Artisan</span>
                  </span>
                )}
                {store.is_regional_origin_verified && (
                  <span className="bg-[#B7791F] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                    <Award className="w-3.5 h-3.5" />
                    <span>Regional Origin Verified</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#786C5E] font-medium">
                Crafted by <span className="text-[#261E18] font-bold">{artisan.name}</span> • {artisan.years_of_experience} Years Heritage Experience
              </p>

              <div className="flex items-center space-x-4 text-xs text-[#615447] pt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9C4221]" />
                  <span>{store.location}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#B7791F]" />
                  <span>{store.craft_category}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action: Inquiry Modal Trigger */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setInquiryModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EBE3D5] text-[#3D3128] font-semibold text-xs border border-[#D5C9B8] flex items-center space-x-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#9C4221]" />
              <span>Contact Artisan</span>
            </button>
          </div>
        </div>
      </div>

      {/* ARTISAN STORY & HERITAGE PROFILE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Story */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#261E18] flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#9C4221]" />
              <span>The Artisan Story & Craftsmanship</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#594E42] leading-relaxed whitespace-pre-line">
              {artisan.bio || store.description}
            </p>
            <div className="pt-4 border-t border-[#F0EBE1] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-[#8C7E6F] font-medium">Craft Technique</p>
                <p className="font-bold text-[#261E18] mt-0.5">{store.craft_category}</p>
              </div>
              <div>
                <p className="text-[#8C7E6F] font-medium">Regional Heritage</p>
                <p className="font-bold text-[#261E18] mt-0.5">{store.region}</p>
              </div>
              <div>
                <p className="text-[#8C7E6F] font-medium">Production Facility</p>
                <p className="font-bold text-[#2F6A4F] mt-0.5">Verified Rural Workshop</p>
              </div>
            </div>
          </div>

          {/* Verification Audit Summary Card */}
          <div className="lg:col-span-4 bg-[#F5EFE6] p-6 rounded-3xl border border-[#E6DED3] space-y-4">
            <h3 className="font-serif text-base font-bold text-[#261E18] flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#2F6A4F]" />
              <span>KalaConnect Verification</span>
            </h3>
            <p className="text-xs text-[#615447] leading-relaxed">
              This vendor completed formal evidence evaluation. Traditional tools, local raw materials, and genuine non-industrial methods have been verified by platform administrators.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#2F6A4F]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Physical Workshop Inspection Passed</span>
              </div>
              <div className="flex items-center space-x-2 text-[#2F6A4F]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Natural Raw Materials Corroborated</span>
              </div>
              <div className="flex items-center space-x-2 text-[#2F6A4F]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero Factory Mold Certification</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STORE PRODUCT CATALOG */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E6DED3] pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#261E18]">
              Artisan Catalog ({products.length} Creations)
            </h2>
            <p className="text-xs text-[#786C5E] mt-0.5">
              Every item is created by {artisan.name} and shipped directly from their workshop.
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#E6DED3]">
            <p className="text-xs text-[#786C5E]">No creations listed at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod: any) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E6DED3] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 bg-stone-100 overflow-hidden">
                    <img
                      src={prod.image || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80"}
                      alt={prod.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-[#2D241E] px-2.5 py-1 rounded-full shadow-sm">
                      {prod.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-serif text-base font-bold text-[#261E18] line-clamp-1">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-[#615447] mt-1 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                    <div className="mt-3 flex items-center space-x-2 text-[11px] text-[#786C5E]">
                      <Clock className="w-3.5 h-3.5 text-[#9C4221]" />
                      <span>{prod.production_time_days || 5} days craft lead time</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-[#F0EBE1] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#8C7E6F] uppercase font-semibold">Artisan Price</p>
                    <p className="text-lg font-serif font-bold text-[#261E18]">
                      ₹{prod.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/products/${prod.id}`}
                      className="px-3 py-2 rounded-xl bg-[#FAF7F2] text-[#3D3128] text-xs font-semibold border border-[#D5C9B8] hover:bg-[#EBE3D5] transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(prod.id, prod.name)}
                      className="px-3.5 py-2 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CUSTOMER REVIEWS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="font-serif text-2xl font-bold text-[#261E18]">
          Collector Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-xs text-[#786C5E]">Be the first to review this verified artisan!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r: any) => (
              <div key={r.id} className="bg-white p-5 rounded-2xl border border-[#E6DED3] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {[...Array(r.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#8C7E6F]">{r.created_at}</span>
                </div>
                <p className="text-xs text-[#4A3E31] italic leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                <div className="pt-2 flex items-center space-x-2 text-[11px] text-[#786C5E]">
                  <span className="font-bold text-[#2D241E]">{r.customer_name}</span>
                  {r.verified_purchase && (
                    <span className="text-emerald-700 font-semibold">• Verified Collector</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONTACT / CUSTOM ORDER INQUIRY MODAL */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E6DED3]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-[#261E18]">
                Inquire with {artisan.name}
              </h3>
              <button
                onClick={() => setInquiryModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-[#786C5E] leading-relaxed">
              Ask about custom dimensions, festival gift sets, or traditional techniques directly to {store.name}.
            </p>

            {/* Buyer Identity Section */}
            {user ? (
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6DED3] flex items-center space-x-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-[#9C4221]/10 text-[#9C4221] font-bold flex items-center justify-center shrink-0">
                  {user.full_name ? user.full_name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <p className="font-bold text-[#261E18]">Sending as: {user.full_name}</p>
                  <p className="text-[11px] text-[#786C5E]">{user.email} • Verified Customer Account</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E31] mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full p-2.5 text-xs rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E31] mb-1">Your Email Address</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="e.g. priya@customer.com"
                    className="w-full p-2.5 text-xs rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleSendInquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A3E31] mb-1">
                  Your Inquiry / Custom Requirements
                </label>
                <textarea
                  required
                  rows={4}
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder="e.g. Can you make a custom set of 24 Diwali filigree lamps with gift packaging?"
                  className="w-full p-3 text-xs rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInquiryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#786C5E] hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inquirySent}
                  className="px-5 py-2.5 rounded-xl bg-[#9C4221] text-white text-xs font-semibold flex items-center space-x-1.5 hover:bg-[#7B341E] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{inquirySent ? "Dispatching..." : "Send to Artisan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

