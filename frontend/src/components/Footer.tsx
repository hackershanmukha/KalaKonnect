import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Heart, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#261E18] text-[#D5C9B8] pt-16 pb-12 border-t border-[#3D3128]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#3D3128]">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#9C4221] flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 text-[#FCD34D]" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                KalaConnect <span className="text-[#9C4221] text-lg font-sans">AI</span>
              </span>
            </div>
            <p className="text-xs text-[#A89A8A] leading-relaxed">
              Empowering genuine handmade, handcrafted, traditional and GI-verified craft communities across India with ethical direct-to-consumer access and AI business intelligence.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#D4AF37]">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Artisan Origin Pledge</span>
            </div>
          </div>

          {/* Regional Heritage Categories */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Regional Crafts
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/marketplace?category=Wooden+Toys+%26+Crafts" className="hover:text-white transition-colors">
                  Etikoppaka & Kondapalli Woodcraft
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Handloom+%26+Textiles" className="hover:text-white transition-colors">
                  Kalamkari & Chanderi Handlooms
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Pottery+%26+Terracotta" className="hover:text-white transition-colors">
                  Bankura Terracotta & Clay Diyas
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Bamboo+%26+Cane+Crafts" className="hover:text-white transition-colors">
                  Assam Wild Bamboo & Cane Utilities
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  GI-Tagged Geographical Specialties
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Artisans */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Artisan Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/marketplace?tab=stores" className="hover:text-white transition-colors">
                  Explore Verified Stores
                </Link>
              </li>
              <li>
                <Link href="/vendor/onboarding" className="hover:text-white transition-colors text-[#F59E0B] font-medium">
                  Become a Verified Artisan
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Authenticity Verification Process
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  GI Tagged Crafts Directory
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Vendor & Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Heritage Protection Note */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Authenticity Safeguard
            </h4>
            <div className="bg-[#1C1612] p-4 rounded-xl border border-[#3D3128] space-y-2.5 text-xs">
              <p className="text-[#C5B8A8] leading-relaxed">
                KalaConnect AI strictly excludes mass-manufactured, machine-molded, or factory replicas. Every product undergoes strict workshop evidence evaluation.
              </p>
              <div className="flex items-center space-x-1.5 text-[11px] text-[#A89A8A]">
                <MapPin className="w-3.5 h-3.5 text-[#9C4221]" />
                <span>Direct from indigenous artisan clusters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C7E6F] space-y-4 sm:space-y-0">
          <p>
            &copy; 2026 KalaConnect AI. Authentic Crafts. Verified Artisans. Unique Discoveries.
          </p>
          <div className="flex items-center space-x-6 text-xs">
            <span className="flex items-center space-x-1 text-[#C5B8A8]">
              <span>Handcrafted with</span>
              <Heart className="w-3.5 h-3.5 text-[#9C4221] fill-current" />
              <span>for Indian Craft Traditions</span>
            </span>
            <Link href="/about" className="hover:text-white">Terms of Heritage</Link>
            <Link href="/about" className="hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

