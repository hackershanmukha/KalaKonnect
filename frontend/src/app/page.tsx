"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Users
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function LandingPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [storesData, prodsData] = await Promise.all([
          fetchApi("/stores"),
          fetchApi("/products?sort_by=newest")
        ]);
        setStores(storesData.slice(0, 4));
        setProducts(prodsData.slice(0, 6));
      } catch (err) {
        console.error("Error loading landing page data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5EFE6] via-[#FAF7F2] to-[#FAF7F2] pt-12 pb-20 border-b border-[#E6DED3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#9C4221]/10 text-[#9C4221] text-xs font-bold tracking-wide border border-[#9C4221]/20">
                <Sparkles className="w-4 h-4 text-[#C05621]" />
                <span>Exclusively for Genuine Handmade & Region-Specific Crafts</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#261E18] leading-[1.15]">
                Discover the Beauty of{" "}
                <span className="text-[#9C4221] italic underline decoration-[#D4AF37]/40 decoration-wavy underline-offset-8">
                  Authentic Handmade
                </span>{" "}
                Products
              </h1>

              <p className="text-base sm:text-lg text-[#615447] leading-relaxed max-w-2xl">
                Explore unique regional crafts, support traditional master artisans, and discover certified heritage creations made with ancestral creativity, culture, and pure craftsmanship.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/marketplace?tab=products"
                  className="px-6 py-3.5 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white font-semibold text-sm shadow-lg shadow-[#9C4221]/25 flex items-center space-x-2 transition-all hover:translate-y-[-1px]"
                >
                  <span>Explore Handmade Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/vendor/onboarding"
                  className="px-6 py-3.5 rounded-xl bg-[#EBE3D5] hover:bg-[#DDD3C2] text-[#3D3128] font-semibold text-sm border border-[#D5C9B8] flex items-center space-x-2 transition-all hover:translate-y-[-1px]"
                >
                  <Store className="w-4 h-4 text-[#2F6A4F]" />
                  <span>Become an Artisan Seller</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#E6DED3] text-xs text-[#615447]">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-[#2F6A4F] shrink-0" />
                  <span className="font-medium">100% Workshop Evidence Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-[#B7791F] shrink-0" />
                  <span className="font-medium">GI-Tagged Heritage Origin</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HeartHandshake className="w-5 h-5 text-[#9C4221] shrink-0" />
                  <span className="font-medium">Fair Direct Artisan Remittance</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=900&q=80"
                    alt="Authentic Indian wooden handicraft"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-[#2F6A4F] text-[11px] font-bold uppercase tracking-wider mb-2 w-max">
                      GI Tagged Heritage
                    </span>
                    <h3 className="font-serif text-xl font-bold">Etikoppaka Lacquered Woodcraft</h3>
                    <p className="text-xs text-stone-200 mt-1">400-year traditional lathe-turned organic natural toys</p>
                  </div>
                </div>

                {/* Floating Verified Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-[#E6DED3] flex items-center space-x-3 max-w-xs animate-bounce-short">
                  <div className="w-10 h-10 rounded-full bg-[#2F6A4F]/10 flex items-center justify-center text-[#2F6A4F]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2D241E]">Authenticity Assured</p>
                    <p className="text-[10px] text-[#786C5E]">Admin + AI evidence inspected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED REGIONAL CRAFTS CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#9C4221]">
              Indigenous Traditions
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#261E18] mt-1">
              Explore Artisan Categories
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

      {/* 3. POPULAR ARTISAN STORES */}
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

      {/* 4. HOW KALACONNECT WORKS */}
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

      {/* 5. WHY SHOP AUTHENTIC HANDMADE */}
      <section className="bg-gradient-to-br from-[#261E18] to-[#1C1612] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Preserving Heritage
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Why Shop Authentic Handmade Products?
              </h2>
              <p className="text-sm text-[#C5B8A8] leading-relaxed">
                When you purchase through KalaConnect AI, you aren&apos;t just buying an object; you are preserving centuries of living cultural memory, supporting hereditary craft families, and adopting sustainable eco-conscious living.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2F6A4F] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Zero Factory Replicas</h4>
                    <p className="text-xs text-[#A89A8A]">Strict evidence inspection blocks industrial plastic and resin replicas.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Geographical Origin Verification</h4>
                    <p className="text-xs text-[#A89A8A]">Crafts are sourced directly from authorized clusters (Etikoppaka, Kondapalli, Srikalahasti).</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-[#9C4221] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">AI-Powered Artisan Empowerment</h4>
                    <p className="text-xs text-[#A89A8A]">Local makers leverage ML demand predictions to plan raw materials and prevent festival stockouts.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#332820] p-8 rounded-3xl border border-[#4A3B30] space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-[#9C4221] flex items-center justify-center text-white">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">Authenticity Guarantee</h3>
                  <p className="text-xs text-[#C5B8A8]">Inspected by human admins + AI verification</p>
                </div>
              </div>

              <blockquote className="text-sm italic text-[#D5C9B8] leading-relaxed border-l-2 border-[#D4AF37] pl-4">
                &ldquo;By purchasing directly from rural artisans, 88% of your funds reach the master craftspeople who create these wonders, rather than middle-tier middlemen.&rdquo;
              </blockquote>

              <div className="pt-2">
                <Link
                  href="/marketplace?tab=products"
                  className="w-full block text-center py-3.5 rounded-xl bg-[#D4AF37] text-[#261E18] font-bold text-sm hover:bg-[#C29E2E] transition-colors"
                >
                  Explore Authentic Catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SAMPLE CUSTOMER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9C4221]">
            Verified Buyer Voices
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#261E18] mt-1">
            Customer Testimonials
          </h2>
          <p className="text-xs text-[#8C7E6F] mt-1">
            (Sample demonstration reviews representative of platform experiences)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] shadow-sm flex flex-col justify-between">
            <p className="text-xs text-[#594E42] italic leading-relaxed">
              &ldquo;The Etikoppaka wooden acrobat toy arrived with a certificate of authentic vegetal lacquer. Knowing it is safe for my toddler and supported a village lathe artisan made it priceless.&rdquo;
            </p>
            <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#9C4221]/10 flex items-center justify-center font-bold text-xs text-[#9C4221]">
                PS
              </div>
              <div>
                <p className="text-xs font-bold text-[#2D241E]">Priya Sharma</p>
                <p className="text-[10px] text-[#786C5E]">Verified Buyer • Bengaluru</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] shadow-sm flex flex-col justify-between">
            <p className="text-xs text-[#594E42] italic leading-relaxed">
              &ldquo;The hand-drawn Kalamkari Tree of Life tapestry has genuine river-wash earthy scents and intricate pen-work. You can tell this wasn&apos;t printed on an industrial digital press.&rdquo;
            </p>
            <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#2F6A4F]/10 flex items-center justify-center font-bold text-xs text-[#2F6A4F]">
                AK
              </div>
              <div>
                <p className="text-xs font-bold text-[#2D241E]">Arun Krishnamurthy</p>
                <p className="text-[10px] text-[#786C5E]">Verified Buyer • Chennai</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] shadow-sm flex flex-col justify-between">
            <p className="text-xs text-[#594E42] italic leading-relaxed">
              &ldquo;As a traditional potter, the Diwali demand forecasting feature warned me to order extra alluvial clay 4 weeks early. KalaConnect helped me fulfill 120 more diya sets without shortages!&rdquo;
            </p>
            <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center font-bold text-xs text-[#B7791F]">
                AP
              </div>
              <div>
                <p className="text-xs font-bold text-[#2D241E]">Anita Pal</p>
                <p className="text-[10px] text-[#786C5E]">Terracotta Artisan • Bankura</p>
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
