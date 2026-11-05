import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Award,
  Heart,
  Store,
  Layers,
  ArrowRight
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#9C4221]/10 text-[#9C4221] text-xs font-bold tracking-wide border border-[#9C4221]/20">
          <Sparkles className="w-4 h-4" />
          <span>Authentic Crafts • Verified Artisans • Unique Discoveries</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#261E18]">
          The KalaConnect AI Philosophy
        </h1>
        <p className="text-sm sm:text-base text-[#786C5E] max-w-2xl mx-auto leading-relaxed">
          Unlike general e-commerce marketplaces flooded with mass-manufactured plastics and factory knock-offs, KalaConnect AI prioritizes product authenticity, artisan identity, regional heritage, and centuries of unique craftsmanship.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-[#E6DED3] shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2F6A4F]/10 text-[#2F6A4F] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#261E18]">Evidence-Based Verification</h3>
          <p className="text-xs text-[#786C5E] leading-relaxed">
            Every vendor must provide workshop photographs, natural raw material origin, and process documentation. Human administrators inspect and certify every single seller.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E6DED3] shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 text-[#B7791F] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#261E18]">Geographical Indications</h3>
          <p className="text-xs text-[#786C5E] leading-relaxed">
            We celebrate India&apos;s GI-tagged heritage: Etikoppaka lacquerware, Kondapalli softwood toys, Srikalahasti Kalamkari, Bankura terracotta, and Assam wild bamboo.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E6DED3] shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#9C4221]/10 text-[#9C4221] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#261E18]">AI Artisan Empowerment</h3>
          <p className="text-xs text-[#786C5E] leading-relaxed">
            Local craftspeople use machine learning forecasting, seasonal festival intelligence, and natural language advisors to plan production and prevent festival stockouts.
          </p>
        </div>
      </div>

      {/* Verification Standard Section */}
      <div className="bg-[#F5EFE6] p-8 sm:p-12 rounded-3xl border border-[#E6DED3] space-y-6">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#261E18]">
          Our Uncompromising Authenticity Rules
        </h2>
        <div className="space-y-4 text-xs sm:text-sm text-[#594E42] leading-relaxed">
          <p>
            • <strong>AI is assistive, not the final authority:</strong> While Gemini analyzes images for craft technique consistency, administrator approval is mandatory for all certifications.
          </p>
          <p>
            • <strong>No Factory Replicas:</strong> Unauthorized mass-produced goods, plastic casts, and industrial machine imitations are strictly blocked from the marketplace.
          </p>
          <p>
            • <strong>Artisan Cooperatives Welcome:</strong> Genuine rural producer companies, self-help groups (SHGs), and authorized craft guild representatives are fully supported.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap gap-4">
          <Link
            href="/marketplace?tab=stores"
            className="px-6 py-3.5 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-2"
          >
            <span>Explore Verified Stores</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/vendor/onboarding"
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 border border-[#D5C9B8] text-[#3D3128] text-xs font-semibold transition-all"
          >
            Apply as an Artisan Guild
          </Link>
        </div>
      </div>
    </div>
  );
}

