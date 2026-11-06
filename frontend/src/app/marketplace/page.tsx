"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Store,
  Package,
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  ArrowRight,
  Check,
  CheckCircle2,
  Tag
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "stores" ? "stores" : "products";
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [activeTab, setActiveTab] = useState<"stores" | "products">(initialTab);
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [addedItemNotification, setAddedItemNotification] = useState<string | null>(null);

  useEffect(() => {
    const s = searchParams.get("search");
    if (s !== null) setSearchQuery(s);
    const t = searchParams.get("tab");
    if (t === "stores" || t === "products") setActiveTab(t);
  }, [searchParams]);

  const { user, refreshCart } = useAuth();

  const categories = [
    "All",
    "Wooden Toys & Crafts",
    "Handloom & Textiles",
    "Pottery & Terracotta",
    "Bamboo & Cane Crafts",
    "Metal Crafts & Brass",
  ];

  const regions = [
    "All",
    "Andhra Pradesh",
    "West Bengal",
    "Assam",
    "Uttar Pradesh",
  ];

  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      let prodUrl = `/products?sort_by=${sortBy}`;
      if (selectedCategory !== "All") prodUrl += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedRegion !== "All") prodUrl += `&region=${encodeURIComponent(selectedRegion)}`;
      if (searchQuery) prodUrl += `&search=${encodeURIComponent(searchQuery)}`;

      let storeUrl = `/stores?`;
      if (selectedCategory !== "All") storeUrl += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedRegion !== "All") storeUrl += `&region=${encodeURIComponent(selectedRegion)}`;
      if (searchQuery) storeUrl += `&search=${encodeURIComponent(searchQuery)}`;

      const [prodsData, storesData] = await Promise.all([
        fetchApi(prodUrl),
        fetchApi(storeUrl)
      ]);

      setProducts(prodsData);
      setStores(storesData);
    } catch (err) {
      console.error("Marketplace fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();
  }, [selectedCategory, selectedRegion, sortBy, searchQuery]);

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await fetchApi("/orders/cart/add", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      await refreshCart();
      setAddedItemNotification(`Added "${productName}" to cart!`);
      setTimeout(() => setAddedItemNotification(null), 3000);
    } catch (err: any) {
      alert(err.message || "Could not add to cart. Please check login or store limit.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {addedItemNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2F6A4F] text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-sm font-medium animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{addedItemNotification}</span>
        </div>
      )}

      {/* Artisan Notice Banner */}
      {user?.roles?.includes("vendor") && (
        <div className="p-4 rounded-2xl bg-[#9C4221]/10 border border-[#9C4221]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5 text-[#261E18]">
            <Store className="w-5 h-5 text-[#9C4221] shrink-0" />
            <div>
              <p className="font-bold">Artisan Mode: Signed in as {user.full_name}</p>
              <p className="text-[11px] text-[#786C5E]">Your focus is listing handcrafted products for sale and answering collector requests.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/vendor/dashboard?action=add-product"
              className="px-3.5 py-1.5 rounded-xl bg-[#9C4221] text-white font-bold hover:bg-[#7B341E] transition-colors"
            >
              + Add Craft Listing
            </Link>
            <Link
              href="/vendor/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#D5C9B8] text-[#261E18] font-semibold hover:bg-stone-50 transition-colors"
            >
              Studio Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#F5EFE6] to-[#FAF7F2] p-8 rounded-3xl border border-[#E6DED3] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#9C4221] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>KalaConnect AI Unified Discovery</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#261E18] mt-1">
            Artisan Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-[#786C5E] mt-1 max-w-xl">
            Strictly authentic handmade products from verified regional clusters. Choose between browsing independent artisan stores or the unified product catalog.
          </p>
        </div>

        {/* PRIMARY TABS SELECTOR (STORES vs PRODUCTS) */}
        <div className="inline-flex p-1.5 rounded-2xl bg-[#EBE3D5] border border-[#D5C9B8]">
          <button
            onClick={() => setActiveTab("stores")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "stores"
                ? "bg-white text-[#9C4221] shadow-md shadow-black/5"
                : "text-[#615447] hover:text-[#261E18]"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>TAB 1: STORES ({stores.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "products"
                ? "bg-white text-[#9C4221] shadow-md shadow-black/5"
                : "text-[#615447] hover:text-[#261E18]"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>TAB 2: PRODUCTS ({products.length})</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6DED3] shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8C7E6F]" />
            <input
              type="text"
              placeholder={activeTab === "stores" ? "Search stores by name, craft, or city..." : "Search crafts, techniques, materials, origin..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30 focus:border-[#9C4221]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] text-[#3D3128] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
            >
              <option value="All">All Craft Categories</option>
              {categories.filter(c => c !== "All").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Region Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] text-[#3D3128] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
            >
              <option value="All">All Regions</option>
              {regions.filter(r => r !== "All").map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] text-[#3D3128] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
            >
              <option value="newest">Newly Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#9C4221] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-[#786C5E] font-medium">Loading verified craft listings...</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: STORES VIEW */}
          {activeTab === "stores" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-[#786C5E]">
                <span>Showing independent artisan storefronts</span>
                <span className="font-semibold">{stores.length} Approved Artisan Stores</span>
              </div>

              {stores.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-[#E6DED3]">
                  <Store className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-serif text-lg font-bold text-[#261E18]">No Artisan Stores Found</h3>
                  <p className="text-xs text-[#786C5E] mt-1">Try resetting the category or region filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stores.map((store) => (
                    <div
                      key={store.id}
                      className="bg-white rounded-2xl overflow-hidden border border-[#E6DED3] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Store Banner */}
                        <div className="relative h-40 bg-stone-100">
                          <img
                            src={store.banner_url || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"}
                            alt={store.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute -bottom-6 left-5 w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white">
                            <img
                              src={store.logo_url || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=200&q=80"}
                              alt={store.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {store.verification_badge && (
                            <span className="absolute top-3 right-3 bg-[#2F6A4F] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verified Artisan</span>
                            </span>
                          )}
                        </div>

                        {/* Store Details */}
                        <div className="pt-8 px-6 pb-4">
                          <div className="flex items-center space-x-2 text-[11px] text-[#9C4221] font-semibold">
                            <Tag className="w-3 h-3" />
                            <span>{store.craft_category}</span>
                          </div>

                          <h3 className="font-serif text-xl font-bold text-[#261E18] mt-1">
                            {store.name}
                          </h3>

                          <p className="text-xs font-medium text-[#4A3E31] mt-0.5">
                            Master Artisan: {store.artisan_name}
                          </p>

                          <p className="text-xs text-[#786C5E] flex items-center space-x-1 mt-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#9C4221] shrink-0" />
                            <span className="truncate">{store.location}</span>
                          </p>

                          <p className="text-xs text-[#615447] mt-3 line-clamp-2 leading-relaxed">
                            {store.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-6 pb-6 pt-3 border-t border-[#F0EBE1] flex items-center justify-between">
                        <span className="text-xs text-[#8C7E6F] font-semibold">
                          {store.product_count} Active Creations
                        </span>
                        <Link
                          href={`/store/${store.slug}`}
                          className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#9C4221] text-[#9C4221] hover:text-white border border-[#D5C9B8] hover:border-[#9C4221] text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
                        >
                          <span>View Store</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS VIEW */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-[#786C5E]">
                <span>Unified catalog from all approved artisan guilds</span>
                <span className="font-semibold">{products.length} Authenticated Products</span>
              </div>

              {products.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-[#E6DED3]">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h3 className="font-serif text-lg font-bold text-[#261E18]">No Products Found</h3>
                  <p className="text-xs text-[#786C5E] mt-1">Try relaxing the search keyword or category filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl overflow-hidden border border-[#E6DED3] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Product Image */}
                        <div className="relative h-56 bg-stone-100 overflow-hidden">
                          <img
                            src={prod.images?.[0]?.image_url || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80"}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-[11px] font-semibold text-[#3D3128] px-2.5 py-1 rounded-full shadow-sm">
                            {prod.category}
                          </span>
                          <span className="absolute top-3 right-3 bg-[#2F6A4F] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Handmade Verified</span>
                          </span>
                        </div>

                        {/* Product Info */}
                        <div className="p-5">
                          <div className="flex items-center justify-between text-xs text-[#786C5E]">
                            <span className="truncate font-medium">{prod.store_name}</span>
                            <span className="text-[#9C4221] shrink-0 font-semibold">{prod.region}</span>
                          </div>

                          <h3 className="font-serif text-base font-bold text-[#261E18] mt-1.5 line-clamp-1 group-hover:text-[#9C4221] transition-colors">
                            {prod.name}
                          </h3>

                          <p className="text-xs text-[#615447] mt-1 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {prod.material && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF7F2] text-[#786C5E] border border-[#E6DED3]">
                                {prod.material.split(",")[0]}
                              </span>
                            )}
                            {prod.craft_technique && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[#F5EFE6] text-[#9C4221] font-medium border border-[#E6DED3]">
                                {prod.craft_technique}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price & Action Buttons */}
                      <div className="px-5 pb-5 pt-3 border-t border-[#F0EBE1] flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-[#8C7E6F] uppercase font-semibold">Artisan Price</p>
                          <p className="text-lg font-serif font-bold text-[#261E18]">
                            ₹{Number(prod.price || 0).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/products/${prod.id}`}
                            className="px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EBE3D5] text-[#3D3128] text-xs font-semibold border border-[#D5C9B8] transition-colors"
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
          )}
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs text-stone-500">Loading marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
