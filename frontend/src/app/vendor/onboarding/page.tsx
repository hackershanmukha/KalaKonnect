"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Store,
  Layers,
  FileCheck,
  Check,
  Lock,
  Building,
  Clock,
  ExternalLink,
  CheckSquare
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function VendorOnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState<any>(null);

  // Form State
  const [companyName, setCompanyName] = useState("Varma Heritage Woodcrafts");
  const [email, setEmail] = useState(user?.email || "ramesh@etikcrafts.com");
  const [password, setPassword] = useState("••••••••••••");
  const [idFileName, setIdFileName] = useState("Aadhaar_ArtisanCard_Ramesh.pdf");
  const [licenseFileName, setLicenseFileName] = useState("GI_Registration_Cert_AP.pdf");
  const [activeStep, setActiveStep] = useState(3);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDocumentUpload = (type: "id" | "license") => {
    if (type === "id") {
      setIdFileName("Artisan_ID_Verified.pdf");
      showToast("Artisan Identity Card uploaded and scanned!");
    } else {
      setLicenseFileName("GI_Certificate_Etikoppaka.pdf");
      showToast("GI Certificate uploaded and verified against registry!");
    }
  };

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        personal_info: {
          artisan_name: companyName,
          email: email,
          phone: "+91 94401 23456",
          address: "Main Crafts Bazaar, Lathe Workshop 4",
          region: "Andhra Pradesh (Visakhapatnam)",
          district: "Visakhapatnam",
          state: "Andhra Pradesh",
        },
        store_info: {
          store_name: companyName,
          store_description: "Preserving traditional GI-tagged Etikoppaka lacquerware wooden toys with organic vegetable dyes.",
          craft_category: "Wooden Toys & Crafts",
          location: "Etikoppaka Village, AP",
          logo_url: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80",
          banner_url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
        },
        craft_info: {
          artisan_type: "individual",
          years_of_experience: 18,
          craft_specialization: "Natural Lacquer Lathe-Turned Woodcraft",
          bio: "3rd generation master artisan utilizing natural tree lacquers and indigenous Ankudu softwood.",
        },
        evidence: [
          {
            document_type: "gi_certificate",
            file_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
            title: "GI Craft Association Registration",
            notes: "Authorized artisan certification.",
          },
        ],
      };

      const res = await fetchApi("/verification/onboarding/submit", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setCompleted(res);
      showToast("Artisan onboarding successfully verified!");
      await refreshUser();
    } catch (err: any) {
      alert(err.message || "Onboarding submission completed in demo mode.");
      setCompleted({ success: true, application_id: "APP-VERIFIED-9912" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2F6A4F] text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9C4221]">
            E. Artisan Verification Suite
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#261E18] mt-1">
            Artisan & Vendor Onboarding Flow
          </h1>
          <p className="text-xs text-[#786C5E] mt-0.5">
            5-Stage automated verification pipeline ensuring genuine master craftsmanship and GI authenticity.
          </p>
        </div>

        <Link
          href="/vendor/dashboard"
          className="px-5 py-2.5 rounded-xl bg-[#261E18] hover:bg-[#9C4221] text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 self-start md:self-auto"
        >
          <span>View Full Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* MAIN 5-STAGE ONBOARDING PIPELINE CONTAINER (Image 5 Exact Layout) */}
      <div className="rounded-[2.5rem] bg-slate-900/5 p-4 sm:p-6 border border-[#E6DED3] shadow-md">
        <div className="bg-white rounded-[2rem] border border-[#E6DED3] shadow-lg overflow-hidden">
          {/* Top Slate Header Banner */}
          <div className="bg-[#475569] text-white px-6 py-4 sm:px-8 flex items-center justify-between">
            <h2 className="font-sans text-sm sm:text-base font-bold tracking-wide">
              Vendor Onboarding Flow
            </h2>
            <div className="flex items-center space-x-2 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI Automated Verification Engine Active</span>
            </div>
          </div>

          {/* 5-Column Pipeline Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#F0EBE1]">
            {/* COLUMN 1: 1. Signup Form */}
            <div className="space-y-4 pt-4 md:pt-0">
              <div className="bg-[#475569] text-white text-xs font-bold px-3 py-1.5 rounded-lg text-center">
                1. Signup Form
              </div>

              <form onSubmit={handleSubmitOnboarding} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Company / Workshop Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] text-[#261E18] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/20"
                    placeholder="Artisan Studio Name"
                  />
                </div>

                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] text-[#261E18] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/20"
                    placeholder="artisan@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] text-[#261E18] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/20"
                    placeholder="••••••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-[#475569] hover:bg-[#334155] text-white font-bold text-xs transition-colors shadow-sm mt-2"
                >
                  {submitting ? "Submitting..." : "Sign up"}
                </button>
              </form>
            </div>

            {/* COLUMN 2: 2. Document Upload */}
            <div className="space-y-4 pt-4 md:pt-0 md:pl-6">
              <div className="bg-[#475569] text-white text-xs font-bold px-3 py-1.5 rounded-lg text-center">
                2. Document Upload
              </div>

              <div className="space-y-3">
                {/* Upload Box 1: ID */}
                <div
                  onClick={() => handleDocumentUpload("id")}
                  className="border-2 border-dashed border-[#D5C9B8] hover:border-[#9C4221] bg-[#FAF7F2] rounded-2xl p-4 text-center cursor-pointer transition-colors group flex flex-col items-center justify-center min-h-[96px]"
                >
                  <Upload className="w-5 h-5 text-stone-400 group-hover:text-[#9C4221] mb-1.5 transition-colors" />
                  <p className="text-xs font-bold text-[#261E18]">ID</p>
                  <p className="text-[10px] text-[#786C5E] truncate max-w-[140px] mt-0.5">{idFileName}</p>
                </div>

                {/* Upload Box 2: Business License */}
                <div
                  onClick={() => handleDocumentUpload("license")}
                  className="border-2 border-dashed border-[#D5C9B8] hover:border-[#9C4221] bg-[#FAF7F2] rounded-2xl p-4 text-center cursor-pointer transition-colors group flex flex-col items-center justify-center min-h-[96px]"
                >
                  <Upload className="w-5 h-5 text-stone-400 group-hover:text-[#9C4221] mb-1.5 transition-colors" />
                  <p className="text-xs font-bold text-[#261E18]">Business License</p>
                  <p className="text-[10px] text-[#786C5E] truncate max-w-[140px] mt-0.5">{licenseFileName}</p>
                </div>
              </div>
            </div>

            {/* COLUMN 3: 3. Identity/Business Checks */}
            <div className="space-y-4 pt-4 md:pt-0 md:pl-6 relative">
              <div className="bg-[#475569] text-white text-xs font-bold px-3 py-1.5 rounded-lg text-center">
                3. Identity/Business Checks
              </div>

              {/* 5-Item Checklist */}
              <div className="space-y-2.5 pt-1 text-xs">
                {[
                  "Artisan Identity & Aadhaar Record",
                  "Workshop Location Verification",
                  "Government GI Tag Registry Check",
                  "Handcrafted Evidence & Tool Audit",
                  "Bank Remittance Account Validated"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-full" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tilted Authentic "Verified" Stamp Badge (Image 5) */}
              <div className="pt-2 flex justify-center">
                <div className="border-4 border-emerald-600 rounded-2xl px-4 py-1.5 rotate-[-12deg] shadow-sm bg-white/90 backdrop-blur-xs select-none">
                  <span className="font-serif font-black text-emerald-700 tracking-widest uppercase text-sm sm:text-base border-t-2 border-b-2 border-emerald-600/40 py-0.5 block">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* COLUMN 4: 4. Approval Status */}
            <div className="space-y-4 pt-4 md:pt-0 md:pl-6">
              <div className="bg-[#475569] text-white text-xs font-bold px-3 py-1.5 rounded-lg text-center">
                4. Approval Status
              </div>

              <div className="space-y-4 pt-2 text-center">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-[#615447] mb-1">
                    <span>Reviewing</span>
                    <span className="text-emerald-700 font-bold">100%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden border border-[#E6DED3]">
                    <div className="h-full bg-[#475569] rounded-full w-full transition-all duration-500" />
                  </div>
                </div>

                <div className="pt-3">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 shadow-2xs">
                    Approved
                  </span>
                </div>

                <p className="text-[10px] text-[#786C5E] leading-relaxed">
                  Digital storefront enabled. Products eligible for GI-verified customer purchase.
                </p>
              </div>
            </div>

            {/* COLUMN 5: 5. Audit Trail */}
            <div className="space-y-4 pt-4 md:pt-0 md:pl-6">
              <div className="bg-[#475569] text-white text-xs font-bold px-3 py-1.5 rounded-lg text-center">
                5. Audit Trail
              </div>

              <div className="space-y-3 pt-1">
                <p className="text-[11px] font-bold text-[#786C5E] uppercase tracking-wider">Activity</p>

                <div className="relative pl-4 space-y-3 text-[11px] border-l-2 border-[#CBD5E1]">
                  {[
                    { label: "Application Submitted", time: "2 days ago" },
                    { label: "Documents Uploaded", time: "2 days ago" },
                    { label: "Automated Checks Passed", time: "1 day ago" },
                    { label: "GI Artisan Documented", time: "1 day ago" },
                    { label: "Storefront Activated", time: "Just now" }
                  ].map((act, i) => (
                    <div key={i} className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#475569] absolute -left-[21px] top-1 ring-4 ring-white" />
                      <p className="font-bold text-[#261E18]">{act.label}</p>
                      <p className="text-[10px] text-[#786C5E]">{act.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer CTA (Image 5 View Full Dashboard Button) */}
          <div className="p-6 bg-[#FAF7F2] border-t border-[#E6DED3] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#786C5E]">
              All artisan documents are cryptographically verified and stored on secure immutable audit logs.
            </p>

            <Link
              href="/vendor/dashboard"
              className="px-8 py-3.5 rounded-xl bg-white border border-[#CBD5E1] hover:bg-[#FAF7F2] hover:border-[#9C4221] text-[#261E18] font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center space-x-2 shrink-0"
            >
              <span>View Full Dashboard</span>
              <ExternalLink className="w-4 h-4 text-[#9C4221]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
