"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Sparkles,
  ShoppingBag,
  Store,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
  ArrowRight,
  Heart
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(1);
  const [customizationNotes, setCustomizationNotes] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { refreshCart } = useAuth();

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await fetchApi(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error("Product load error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await fetchApi("/orders/cart/add", {
        method: "POST",
        body: JSON.stringify({
          product_id: product.id,
          quantity: selectedQty,
          customization_notes: customizationNotes || undefined,
        }),
      });
      await refreshCart();
      setToastMessage(`Added ${selectedQty} × "${product.name}" to cart!`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#9C4221] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[#786C5E]">Retrieving craft heritage details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#261E18]">Product Not Found</h2>
        <p className="text-xs text-[#786C5E] mt-2">This craft piece may have been retired by the artisan.</p>
        <Link href="/marketplace?tab=products" className="inline-block mt-4 px-4 py-2 rounded-xl bg-[#9C4221] text-white text-xs font-semibold">
          Explore All Products
        </Link>
      </div>
    );
  }

  const primaryImg = product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2F6A4F] text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-sm font-medium animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-[#786C5E]">
        <Link href="/marketplace" className="hover:text-[#9C4221]">Marketplace</Link>
        <span>/</span>
        <Link href={`/marketplace?category=${encodeURIComponent(product.category)}`} className="hover:text-[#9C4221]">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-[#261E18] font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Product Images */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl overflow-hidden border border-[#E6DED3] bg-stone-100 aspect-square shadow-sm relative">
            <img
              src={primaryImg}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.is_regional_origin_verified && (
              <span className="absolute top-4 left-4 bg-[#B7791F] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-md">
                <Award className="w-4 h-4" />
                <span>GI Tagged Geographical Origin</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Craft Specifications & Purchase */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#9C4221]">
              <Sparkles className="w-4 h-4" />
              <span>{product.category}</span>
              <span>•</span>
              <span className="text-[#2F6A4F] flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Handmade Authenticity Verified</span>
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#261E18] leading-tight">
              {product.name}
            </h1>

            {/* Store link pill */}
            <div className="pt-1">
              <Link
                href={`/store/${product.store_slug}`}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EBE3D5] text-[#3D3128] border border-[#D5C9B8] text-xs font-semibold transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-[#9C4221]" />
                <span>Crafted by {product.store_name} ({product.artisan_name})</span>
                <ArrowRight className="w-3 h-3 text-[#786C5E]" />
              </Link>
            </div>
          </div>

          {/* Price display */}
          <div className="pt-2 pb-4 border-y border-[#E6DED3] flex items-baseline space-x-3">
            <span className="text-3xl font-serif font-bold text-[#261E18]">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-[#786C5E]">Taxes included • Direct artisan price</span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C7E6F]">Craft Description</h3>
            <p className="text-xs sm:text-sm text-[#594E42] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Artisan & Technique Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DED3] text-xs">
            <div>
              <p className="text-[#8C7E6F] font-medium">Craft Technique</p>
              <p className="font-bold text-[#261E18] mt-0.5">{product.craft_technique || "Traditional Handcraft"}</p>
            </div>
            <div>
              <p className="text-[#8C7E6F] font-medium">Natural Materials</p>
              <p className="font-bold text-[#261E18] mt-0.5">{product.material || "Indigenous Materials"}</p>
            </div>
            <div>
              <p className="text-[#8C7E6F] font-medium">Place of Origin</p>
              <p className="font-bold text-[#261E18] mt-0.5">{product.place_of_origin}</p>
            </div>
            <div>
              <p className="text-[#8C7E6F] font-medium">Custom Handcrafting Time</p>
              <p className="font-bold text-[#2F6A4F] mt-0.5 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{product.production_time_days || 7} Days</span>
              </p>
            </div>
          </div>

          {/* Customization Request */}
          {product.is_customizable && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#3D3128]">
                Customization Notes for the Artisan (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Inscribe family name on base, or specific natural dye shade..."
                value={customizationNotes}
                onChange={(e) => setCustomizationNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
              />
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-[#D5C9B8] rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                  className="px-3.5 py-2.5 text-xs font-bold text-[#786C5E] hover:bg-[#FAF7F2]"
                >
                  -
                </button>
                <span className="px-4 py-2.5 text-xs font-bold text-[#261E18]">
                  {selectedQty}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedQty(selectedQty + 1)}
                  className="px-3.5 py-2.5 text-xs font-bold text-[#786C5E] hover:bg-[#FAF7F2]"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#9C4221]/20 transition-all hover:translate-y-[-1px]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Cart</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F5EFE6] border border-[#E6DED3] flex items-center space-x-2 text-[11px] text-[#786C5E]">
              <ShieldCheck className="w-4 h-4 text-[#2F6A4F] shrink-0" />
              <span>
                Fulfillment Notice: Handmade items require artisan creation time before dispatch. Each order is handled directly by {product.store_name}.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

