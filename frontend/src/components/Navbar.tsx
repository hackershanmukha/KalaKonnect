"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import {
  Sparkles,
  ShoppingBag,
  Store,
  Compass,
  User,
  ShieldCheck,
  TrendingUp,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  Mail,
  ChevronRight,
  Plus,
  Package
} from "lucide-react";

export default function Navbar() {
  const { user, logout, cartCount, loginAsDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const router = useRouter();

  // Artisan Quick Search State (Used ONLY for Buyers & Guests)
  const [artisanSearch, setArtisanSearch] = useState("");
  const [artisanResults, setArtisanResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const isVendor = user?.roles.includes("vendor");
  const isAdmin = user?.roles.includes("admin");

  useEffect(() => {
    if (isVendor || !artisanSearch.trim()) {
      setArtisanResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await fetchApi(`/stores?search=${encodeURIComponent(artisanSearch.trim())}`);
        setArtisanResults(Array.isArray(data) ? data.slice(0, 5) : []);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error("Artisan search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [artisanSearch, isVendor]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleArtisanSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artisanSearch.trim()) return;
    setShowSearchDropdown(false);
    router.push(`/marketplace?tab=stores&search=${encodeURIComponent(artisanSearch.trim())}`);
  };

  const handleDemoSelect = async (email: string, redirectUrl: string) => {
    setDemoMenuOpen(false);
    try {
      await loginAsDemo(email);
      router.push(redirectUrl);
    } catch (e) {
      console.error("Demo login error:", e);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6DED3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href={isVendor ? "/vendor/dashboard" : "/"} className="flex items-center space-x-3 group shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#9C4221] to-[#7B341E] flex items-center justify-center text-white shadow-md shadow-[#9C4221]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-[#FCD34D]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#2D241E]">
                  KalaConnect
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#9C4221]/10 text-[#9C4221] border border-[#9C4221]/20">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-[#786C5E] font-medium tracking-wide hidden sm:block">
                {isVendor ? "Artisan Seller Studio" : "Authentic Crafts • Verified Artisans"}
              </p>
            </div>
          </Link>

          {/* Desktop Center Navigation */}
          {isVendor ? (
            /* ARTISAN ACCOUNT NAV: NO SEARCH OPTIONS! Focus exclusively on selling, listing products & replying to inquiries */
            <nav className="hidden md:flex items-center space-x-2 flex-1 justify-center max-w-2xl mx-4">
              <Link
                href="/vendor/dashboard"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#4A3E31] hover:text-[#9C4221] hover:bg-[#EBE3D5] transition-colors"
              >
                <Store className="w-4 h-4 text-[#9C4221]" />
                <span>Studio Hub</span>
              </Link>
              <Link
                href="/vendor/dashboard?action=add-product"
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#9C4221] hover:bg-[#7B341E] text-white shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Craft Listing</span>
              </Link>
              <Link
                href="/vendor/dashboard?tab=products"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#4A3E31] hover:text-[#9C4221] hover:bg-[#EBE3D5] transition-colors"
              >
                <Package className="w-4 h-4 text-[#786C5E]" />
                <span>My Products</span>
              </Link>
              <Link
                href="/vendor/dashboard?tab=inquiries"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#2F6A4F] bg-[#2F6A4F]/10 hover:bg-[#2F6A4F]/20 transition-colors border border-[#2F6A4F]/20"
              >
                <Mail className="w-4 h-4 text-[#2F6A4F]" />
                <span>Buyer Inquiries & Requests</span>
              </Link>
              <Link
                href="/vendor/dashboard?tab=orders"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#4A3E31] hover:text-[#9C4221] hover:bg-[#EBE3D5] transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-[#786C5E]" />
                <span>Orders</span>
              </Link>
            </nav>
          ) : (
            /* BUYER / GUEST NAV: Explore Marketplace + Quick Artisan Searchbar */
            <div className="hidden md:flex items-center flex-1 max-w-2xl mx-6 space-x-4">
              <Link
                href="/marketplace"
                className="text-[#594E42] hover:text-[#9C4221] font-medium text-xs sm:text-sm flex items-center space-x-1.5 transition-colors shrink-0"
              >
                <Compass className="w-4 h-4 text-[#9C4221]" />
                <span>Explore Marketplace</span>
              </Link>

              {/* ARTISAN QUICK SEARCHBAR FOR BUYERS */}
              <div ref={searchRef} className="relative flex-1">
                <form onSubmit={handleArtisanSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={artisanSearch}
                    onChange={(e) => setArtisanSearch(e.target.value)}
                    onFocus={() => {
                      if (artisanResults.length > 0) setShowSearchDropdown(true);
                    }}
                    placeholder="Search artisans (e.g. Ramesh, Kalamkari, Anita)..."
                    className="w-full pl-9 pr-8 py-2 rounded-full border border-[#D5C9B8] bg-white text-xs text-[#261E18] placeholder-[#9E9080] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30 focus:border-[#9C4221] shadow-inner transition-all"
                  />
                  <Search className="w-4 h-4 text-[#9C4221] absolute left-3 top-2.5 pointer-events-none" />
                  {artisanSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setArtisanSearch("");
                        setShowSearchDropdown(false);
                      }}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>

                {/* Instant Artisan Results Dropdown */}
                {showSearchDropdown && (
                  <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#E6DED3] overflow-hidden z-50 divide-y divide-[#F0EBE1] animate-fade-in">
                    <div className="p-2.5 bg-[#FAF7F2] flex items-center justify-between text-[11px] font-bold text-[#786C5E] border-b border-[#E6DED3]">
                      <span>Matching Verified Artisans</span>
                      <button
                        onClick={handleArtisanSearchSubmit}
                        className="text-[#9C4221] hover:underline"
                      >
                        View in Stores Tab &rarr;
                      </button>
                    </div>

                    {artisanResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#786C5E]">
                        {isSearching ? "Searching authentic artisan guilds..." : `No artisans found matching "${artisanSearch}"`}
                      </div>
                    ) : (
                      artisanResults.map((store) => (
                        <div
                          key={store.id}
                          className="p-3 hover:bg-[#FAF7F2] transition-colors flex items-center justify-between gap-3 text-xs"
                        >
                          <Link
                            href={`/store/${store.slug}`}
                            onClick={() => setShowSearchDropdown(false)}
                            className="flex items-center space-x-3 flex-1 min-w-0"
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 border border-[#E6DED3] shrink-0">
                              <img
                                src={store.logo_url || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=100&q=80"}
                                alt={store.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <p className="font-bold text-[#261E18] truncate">{store.artisan_name}</p>
                                {store.verification_badge && (
                                  <span className="bg-[#2F6A4F] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center space-x-0.5">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    <span>Verified</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#786C5E] truncate">{store.name} • {store.region}</p>
                              <p className="text-[10px] text-[#9C4221] font-semibold">{store.craft_category}</p>
                            </div>
                          </Link>

                          {/* Quick Contact & Visit Actions */}
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <Link
                              href={`/store/${store.slug}?inquire=true`}
                              onClick={() => setShowSearchDropdown(false)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D5C9B8] hover:bg-[#EBE3D5] text-[#261E18] text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                              title="Direct Message / Mail to Artisan"
                            >
                              <Mail className="w-3 h-3 text-[#9C4221]" />
                              <span>Contact</span>
                            </Link>
                            <Link
                              href={`/store/${store.slug}`}
                              onClick={() => setShowSearchDropdown(false)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#9C4221] hover:bg-[#7B341E] text-white text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                            >
                              <span>Store</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Action Icons & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#EBE3D5] text-[#4A3E31] hover:bg-[#DDD3C2] transition-colors border border-[#D5C9B8]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B7791F]" />
                <span>Demo Accounts</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E6DED3] py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[#8C7E6F] uppercase tracking-wider border-b border-[#F0EBE1]">
                    Switch Demonstration Role
                  </div>
                  <button
                    onClick={() => handleDemoSelect("admin@kalaconnect.ai", "/admin/dashboard")}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#FAF7F2] flex items-center space-x-2 text-[#2D241E]"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    <div>
                      <p className="font-semibold">Administrator (Governance)</p>
                      <p className="text-[10px] text-[#786C5E]">Verify workshops & products</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSelect("ramesh@etikoppaka.com", "/vendor/dashboard")}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#FAF7F2] flex items-center space-x-2 text-[#2D241E]"
                  >
                    <Store className="w-4 h-4 text-[#9C4221]" />
                    <div>
                      <p className="font-semibold">Artisan (Etikoppaka)</p>
                      <p className="text-[10px] text-[#786C5E]">Manage crafts & reply to inquiries</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSelect("priya@customer.com", "/marketplace")}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#FAF7F2] flex items-center space-x-2 text-[#2D241E]"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#2F6A4F]" />
                    <div>
                      <p className="font-semibold">Customer (Priya Sharma)</p>
                      <p className="text-[10px] text-[#786C5E]">Search artisans & inquire</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Customer Orders / Inquiries link */}
            {user && !isVendor && !isAdmin && (
              <Link
                href="/orders"
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-[#4A3E31] hover:text-[#9C4221] hover:bg-[#EBE3D5] transition-colors flex items-center space-x-1"
                title="View your orders and responses from artisans"
              >
                <Package className="w-3.5 h-3.5 text-[#9C4221]" />
                <span>My Orders & Inquiries</span>
              </Link>
            )}

            {/* Shopping Cart Button (Buyer / Guest) */}
            {!isVendor && (
              <Link
                href="/cart"
                className="relative p-2.5 rounded-full hover:bg-[#EBE3D5] text-[#2D241E] transition-colors"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#9C4221] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#FAF7F2]">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Actions */}
            {user ? (
              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#553C9A] text-white hover:bg-[#44337A] transition-colors flex items-center space-x-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}

                <div className="flex items-center space-x-2 pl-2 border-l border-[#E6DED3]">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-[#4A3E31]">
                      {user.full_name}
                    </p>
                    <p className="text-[10px] text-[#786C5E]">
                      {isVendor ? "Verified Artisan" : isAdmin ? "Administrator" : "Craft Collector"}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 text-[#786C5E] hover:text-[#9C4221] rounded-md transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold px-3 py-2 text-[#4A3E31] hover:text-[#9C4221] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#9C4221] text-white hover:bg-[#7B341E] transition-colors shadow-sm"
                >
                  Join KalaConnect
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center space-x-3">
            {!isVendor && (
              <Link href="/cart" className="relative p-2 text-[#2D241E]">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#9C4221] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#4A3E31] hover:bg-[#EBE3D5]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#E6DED3] px-4 pt-2 pb-6 space-y-3">
          {/* If Artisan: NO SEARCH OPTIONS in mobile drawer either! */}
          {isVendor ? (
            <div className="space-y-2 pt-2">
              <div className="p-2 bg-[#EBE3D5] rounded-xl text-xs font-bold text-[#4A3E31]">
                Artisan Studio Workspace
              </div>
              <Link
                href="/vendor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#2F6A4F] font-semibold text-sm"
              >
                Studio Dashboard
              </Link>
              <Link
                href="/vendor/dashboard?action=add-product"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#9C4221] font-bold text-sm"
              >
                + Add New Craft Listing
              </Link>
              <Link
                href="/vendor/dashboard?tab=products"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#4A3E31] font-medium text-sm"
              >
                My Craft Listings
              </Link>
              <Link
                href="/vendor/dashboard?tab=inquiries"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#2F6A4F] font-semibold text-sm"
              >
                Buyer Inquiries & Custom Requests
              </Link>
              <Link
                href="/vendor/dashboard?tab=orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#4A3E31] font-medium text-sm"
              >
                Workshop Orders
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile Artisan Search FOR BUYERS ONLY */}
              <form onSubmit={handleArtisanSearchSubmit} className="relative pt-2">
                <input
                  type="text"
                  value={artisanSearch}
                  onChange={(e) => setArtisanSearch(e.target.value)}
                  placeholder="Search artisans (e.g. Ramesh)..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5C9B8] bg-white text-xs text-[#261E18]"
                />
                <Search className="w-4 h-4 text-[#9C4221] absolute left-3 top-4.5 pointer-events-none" />
              </form>

              <Link
                href="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#4A3E31] font-medium text-sm"
              >
                Explore Marketplace
              </Link>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#4A3E31] font-medium text-sm"
              >
                My Orders & Inquiries
              </Link>
              <Link
                href="/vendor/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#9C4221] font-semibold text-sm"
              >
                Become an Artisan Seller
              </Link>
            </>
          )}

          {user && isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-purple-700 font-semibold text-sm"
            >
              Administrator Dashboard
            </Link>
          )}

          <div className="pt-3 border-t border-[#E6DED3] flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-[#594E42]">Signed in as {user.full_name}</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-[#9C4221]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-3 w-full">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold border border-[#D5C9B8] rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold bg-[#9C4221] text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
