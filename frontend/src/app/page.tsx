"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
  Store,
  Layers,
  MapPin,
  TrendingUp,
  HeartHandshake,
  CheckCircle2,
  Calendar,
  Users,
  Search,
  Heart,
  Play
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function LandingPage() {
  const router = useRouter();
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/marketplace?tab=products");
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [storesData, prodsData] = await Promise.all([
          fetchApi("/stores"),
          fetchApi("/products?sort_by=newest")
        ]);
        setStores(storesData.slice(0, 4));
        setProducts(prodsData.slice(0, 8));
      } catch (err) {
        console.error("Error loading landing page data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const popularTags = [
    { label: "etikoppaka toy", query: "etikoppaka" },
    { label: "kalamkari saree", query: "kalamkari" },
    { label: "terracotta horse", query: "terracotta" },
    { label: "brass diya", query: "brass" },
    { label: "kondapalli cart", query: "kondapalli" },
    { label: "chanderi silk", query: "silk" }
  ];

  const roundCategories = [
    { name: "Home & Living", img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80", query: "Pottery & Terracotta" },
    { name: "Handloom", img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80", query: "Handloom & Textiles" },
    { name: "Woodcraft", img: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80", query: "Wooden Toys & Crafts" },
    { name: "Terracotta", img: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80", query: "Pottery & Terracotta" },
    { name: "Bamboo & Cane", img: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=400&q=80", query: "Bamboo & Cane Crafts" },
    { name: "Festive Art", img: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=400&q=80", query: "Art" },
    { name: "Brass & Metal", img: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=400&q=80", query: "Metal" },
    { name: "Toys & Games", img: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=80", query: "Wooden Toys & Crafts" },
  ];

  const craftCategories = [
    {
      name: "Wooden Toys & Crafts",
      origin: "Etikoppaka & Kondapalli",
      count: "35+ Products",
      desc: "Lacquered vegetable-dyed softwood figurines and traditional play toys.",
      image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Handloom & Textiles",
      origin: "Srikalahasti & Chanderi",
      count: "40+ Products",
      desc: "Vegetable dyed hand-drawn Kalamkari and pure heritage silks.",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Pottery & Terracotta",
      origin: "Bankura & Gorakhpur",
      count: "28+ Products",
      desc: "Kiln-fired river silt pottery, auspicious diyas, and terracotta horses.",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Bamboo & Cane Crafts",
      origin: "Assam & Northeast",
      count: "22+ Products",
      desc: "Eco-friendly wild bamboo utility homeware, planters, and lamps.",
      image: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. LUXURY FRAMED HERO SECTION (Folk & Fable Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="p-4 sm:p-7 rounded-[2.5rem] bg-[#9C4221] shadow-2xl">
          <div className="rounded-[2rem] bg-[#FAF7F2] p-6 sm:p-12 lg:p-14 border border-[#E6DED3] shadow-inner relative overflow-hidden">
            {/* Top Micro Navigation */}
            <div className="flex items-center justify-between pb-8 border-b border-[#E6DED3]/60 mb-8 sm:mb-12">
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#261E18] tracking-tight">KalaConnect</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#9C4221]/10 text-[#9C4221] font-bold">GI Authenticated</span>
              </div>
              <div className="hidden sm:flex items-center space-x-6 text-xs font-semibold text-[#615447]">
                <Link href="/marketplace?tab=products" className="hover:text-[#9C4221] transition-colors">Shop</Link>
                <Link href="/marketplace?tab=stores" className="hover:text-[#9C4221] transition-colors">Makers</Link>
                <Link href="/about" className="hover:text-[#9C4221] transition-colors">About</Link>
                <Link href="/orders" className="hover:text-[#9C4221] transition-colors">Tracking</Link>
                <Link href="/cart" className="hover:text-[#9C4221] transition-colors font-bold text-[#261E18]">Cart</Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Editorial Copy */}
              <div className="lg:col-span-7 space-y-6">
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#261E18] uppercase tracking-tight leading-[1.1]">
                  CURATED CRAFTS,<br />
                  FROM OUR HANDS<br />
                  TO YOUR HOME.
                </h1>

                <p className="text-sm sm:text-base text-[#615447] leading-relaxed max-w-xl">
                  Explore a world of one-of-a-kind artisanal goods, connecting you directly with the makers who pour their passion into every piece. Sustainable, ethical, and beautifully unique.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/marketplace?tab=products"
                    className="px-7 py-3.5 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#9C4221]/20 transition-all hover:translate-y-[-1px]"
                  >
                    SHOP THE COLLECTION
                  </Link>

                  <Link
                    href="/about"
                    className="text-xs sm:text-sm font-semibold text-[#261E18] underline underline-offset-8 hover:text-[#9C4221] transition-colors flex items-center space-x-1"
                  >
                    <span>Watch Our Story</span>
                  </Link>
                </div>
              </div>

              {/* Right Floating Mastercraft Visual */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-sm lg:max-w-none">
                  {/* Sage Green Accent Border Card */}
                  <div className="absolute inset-0 -m-3 sm:-m-4 rounded-3xl bg-[#6B7B61] -rotate-1 transition-transform" />
                  
                  {/* Main Image Container */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white aspect-[4/5] bg-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80"
                      alt="Master artisan shaping clay on potter wheel"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#2F6A4F] text-[10px] font-bold uppercase tracking-wider w-max mb-1.5">
                        GI Certified Guild
                      </span>
                      <p className="font-serif font-bold text-lg">Bankura Terracotta Potter</p>
                      <p className="text-[11px] text-stone-200">Ancestral clay kiln firing & manual wheel shaping</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "FIND ANYTHING HANDMADE" SEARCH & DISCOVERY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-[11px] font-mono tracking-widest uppercase text-[#8C7E6F] font-semibold">
            30,000 SELLERS • WORLDWIDE
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#261E18]">
            Find anything handmade.
          </h2>
          <p className="text-sm text-[#786C5E]">
            Handmade goods, vintage finds, and original art — direct from independent makers.
          </p>

          {/* Large Pill Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-4 max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-full border border-[#D5C9B8] shadow-md p-1.5 hover:border-[#9C4221] transition-all focus-within:ring-2 focus-within:ring-[#9C4221]/20">
              <Search className="w-5 h-5 text-stone-400 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search authentic Indian crafts, GI toys, sarees..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-transparent text-[#261E18] focus:outline-none placeholder:text-stone-400"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#261E18] hover:bg-[#9C4221] text-white text-xs font-semibold transition-colors shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Popular Right Now Tags */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[11px] uppercase tracking-wider text-[#8C7E6F] font-semibold mr-1">
              Popular right now:
            </span>
            {popularTags.map((tag, idx) => (
              <Link
                key={idx}
                href={`/marketplace?search=${encodeURIComponent(tag.query)}`}
                className="px-3 py-1 rounded-full bg-white border border-[#E6DED3] text-[#4A3E31] hover:border-[#9C4221] hover:text-[#9C4221] transition-colors text-[11px] font-medium shadow-2xs"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>

        {/* SHOP BY CATEGORY (Round Card Slider) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C7E6F] font-bold">
              SHOP BY CATEGORY
            </span>
            <Link href="/marketplace?tab=products" className="text-xs font-bold text-[#9C4221] hover:underline flex items-center space-x-1">
              <span>View all categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {roundCategories.map((c, idx) => (
              <Link
                key={idx}
                href={`/marketplace?category=${encodeURIComponent(c.query)}`}
                className="group flex flex-col items-center space-y-2 text-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-[#E6DED3] bg-stone-100 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-semibold text-[#3D3128] group-hover:text-[#9C4221] transition-colors">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* TRENDING: WHAT BUYERS ARE LOVING THIS WEEK */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C7E6F] font-bold block">
                TRENDING
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#261E18]">
                What buyers are loving this week.
              </h3>
            </div>
            <Link
              href="/marketplace?tab=products"
              className="text-xs font-bold text-[#261E18] hover:text-[#9C4221] flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="group bg-white rounded-3xl border border-[#E6DED3] overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-square overflow-hidden bg-stone-100">
                  <img
                    src={p.images?.[0]?.image_url || p.image || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80"}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => toggleFavorite(p.id, e)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm text-stone-700 hover:text-red-500 shadow-sm transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${favorites[p.id] ? "fill-red-500 text-red-500" : ""}`} />
                  </button>
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">
                    {p.region || "Verified Craft"}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <p className="text-[11px] text-[#786C5E] font-medium">{p.store_name || "Artisan Workshop"}</p>
                  <h4 className="font-serif font-bold text-sm text-[#261E18] line-clamp-1 group-hover:text-[#9C4221] transition-colors">
                    {p.name}
                  </h4>
                  <div className="pt-2 flex items-center justify-between border-t border-[#F0EBE1]">
                    <span className="font-serif font-bold text-base text-[#9C4221]">
                      ₹{Number(p.price || 0).toLocaleString("en-IN")}
                    </span>
                    <Link
                      href={`/products/${p.id}`}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D5C9B8] text-xs font-semibold text-[#261E18] hover:bg-[#9C4221] hover:text-white hover:border-[#9C4221] transition-all"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED REGIONAL CRAFTS CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#9C4221]">
              Indigenous Traditions
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#261E18] mt-1">
              Explore Artisan Specialties
            </h2>
            <p className="text-sm text-[#786C5E] mt-1">
              Curated regional craft specialties protected by Geographical Indications and ancestral mastercraft.
            </p>
          </div>
          <Link
            href="/marketplace?tab=products"
            className="mt-4 md:mt-0 text-xs font-bold text-[#9C4221] hover:text-[#7B341E] flex items-center space-x-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {craftCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/marketplace?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-2xl overflow-hidden border border-[#E6DED3] hover:shadow-xl transition-all hover:translate-y-[-2px] flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-stone-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-[#2D241E] px-2.5 py-1 rounded-full shadow-sm">
                  {cat.origin}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#261E18] group-hover:text-[#9C4221] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#786C5E] mt-1.5 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center justify-between text-xs font-semibold text-[#9C4221]">
                  <span>{cat.count}</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. POPULAR ARTISAN STORES */}
      <section className="bg-[#F5EFE6] py-16 border-y border-[#E6DED3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2F6A4F]">
                Verified Master Guilds
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#261E18] mt-1">
                Popular Artisan Stores
              </h2>
              <p className="text-sm text-[#786C5E] mt-1">
                Browse verified independent digital storefronts operated directly by master craftsmen and artisan cooperatives.
              </p>
            </div>
            <Link
              href="/marketplace?tab=stores"
              className="mt-4 md:mt-0 text-xs font-bold text-[#2F6A4F] hover:text-[#22543D] flex items-center space-x-1"
            >
              <span>Explore All Stores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E6DED3] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-32 bg-stone-200">
                    <img
                      src={store.banner_url || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80"}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-md bg-white">
                      <img
                        src={store.logo_url || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=150&q=80"}
                        alt={store.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {store.verification_badge && (
                      <span className="absolute top-3 right-3 bg-[#2F6A4F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <div className="pt-7 px-5 pb-4">
                    <h3 className="font-serif text-base font-bold text-[#261E18]">
                      {store.name}
                    </h3>
                    <p className="text-xs text-[#786C5E] flex items-center space-x-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#9C4221] shrink-0" />
                      <span className="truncate">{store.location}</span>
                    </p>
                    <p className="text-xs text-[#615447] mt-3 line-clamp-2 leading-relaxed">
                      {store.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-[#F0EBE1] flex items-center justify-between">
                  <span className="text-xs text-[#8C7E6F] font-medium">
                    {store.product_count} Creations
                  </span>
                  <Link
                    href={`/store/${store.slug}`}
                    className="text-xs font-bold text-[#9C4221] hover:text-[#7B341E] flex items-center space-x-1"
                  >
                    <span>View Store</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW KALACONNECT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9C4221]">
            Transparent Heritage
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#261E18] mt-1">
            How KalaConnect Works
          </h2>
          <p className="text-sm text-[#786C5E] mt-2">
            Bridging indigenous artisan clusters with mindful collectors through multi-layered verification and AI intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] relative shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#9C4221]/10 text-[#9C4221] font-bold font-serif text-lg flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-serif text-lg font-bold text-[#261E18]">Artisan Onboarding</h3>
            <p className="text-xs text-[#786C5E] mt-2 leading-relaxed">
              Traditional makers submit workshop photographs, raw material sourcing evidence, and regional craft certificates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] relative shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#2F6A4F]/10 text-[#2F6A4F] font-bold font-serif text-lg flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-serif text-lg font-bold text-[#261E18]">AI & Human Verification</h3>
            <p className="text-xs text-[#786C5E] mt-2 leading-relaxed">
              Gemini Vision analyzes tools and techniques. Mandatory platform admin review ensures strictly zero factory mass replicas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] relative shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#B7791F] font-bold font-serif text-lg flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-serif text-lg font-bold text-[#261E18]">Digital Storefront</h3>
            <p className="text-xs text-[#786C5E] mt-2 leading-relaxed">
              Artisans launch custom storefronts. AI demand forecasting helps anticipate festive rushes like Diwali and Sankranti.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] relative shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#553C9A]/10 text-purple-700 font-bold font-serif text-lg flex items-center justify-center mb-4">
              4
            </div>
            <h3 className="font-serif text-lg font-bold text-[#261E18]">Direct Cultural Trade</h3>
            <p className="text-xs text-[#786C5E] mt-2 leading-relaxed">
              Buyers receive genuine authenticated handmade items with regional provenance certificates and fair wages to makers.
            </p>
          </div>
        </div>
      </section>

      {/* 6. WHY SHOP AUTHENTIC HANDMADE */}
      <section className="bg-gradient-to-br from-[#261E18] to-[#1C1612] text-white py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Preserving Heritage
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Why Shop Authentic Handmade Products?
              </h2>
              <p className="text-stone-300 text-sm leading-relaxed">
                When you purchase from KalaConnect, you do not simply acquire a product—you sustain living ancestry. Every purchase guarantees living wages to rural craftsmen and preserves cultural traditions from extinction.
              </p>

              <div className="space-y-4 pt-2 text-xs">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2F6A4F] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Direct-to-Artisan Economics</h4>
                    <p className="text-stone-400 mt-0.5">85%+ of sale price remitted directly to the artisan workshop without predatory middleman markups.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2F6A4F] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Geographical Indication (GI) Authenticity</h4>
                    <p className="text-stone-400 mt-0.5">Every product is verified against government craft registries and regional origin documentation.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2F6A4F] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Eco-Friendly & Non-Toxic Materials</h4>
                    <p className="text-stone-400 mt-0.5">Crafted with seasoned softwoods, organic vegetable dyes, and zero synthetic plastics.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden border border-stone-700 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"
                  alt="Traditional handloom craftsmanship"
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ARTISAN REGISTRATION CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] rounded-3xl border-2 border-dashed border-[#9C4221]/30 p-8 sm:p-12 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#9C4221] text-white flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="font-serif text-3xl font-bold text-[#261E18]">
              Are You a Traditional Artisan or Craft Cooperative?
            </h2>
            <p className="text-sm text-[#786C5E] leading-relaxed">
              Join KalaConnect AI today to build your verified digital storefront, gain access to customers nationwide, and utilize AI intelligence for seasonal demand forecasting and production planning.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/vendor/onboarding"
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white font-semibold text-sm shadow-md transition-all"
            >
              <span>Start 5-Step Artisan Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
