"use client";

import React, { useState } from "react";
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
  FileCheck
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function VendorOnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState<any>(null);

  // Step 1: Personal info
  const [artisanName, setArtisanName] = useState(user?.full_name || "Ramesh Varma");
  const [phone, setPhone] = useState(user?.phone_number || "+91 94401 23456");
  const [email, setEmail] = useState(user?.email || "artisan@kalaconnect.ai");
  const [address, setAddress] = useState("Main Crafts Bazaar, Lathe Workshop 4");
  const [region, setRegion] = useState("Andhra Pradesh (Visakhapatnam)");
  const [district, setDistrict] = useState("Visakhapatnam");
  const [state, setState] = useState("Andhra Pradesh");

  // Step 2: Store info
  const [storeName, setStoreName] = useState("Varma Heritage Woodcrafts");
  const [storeDesc, setStoreDesc] = useState("Preserving traditional GI-tagged Etikoppaka non-toxic lacquerware wooden toys with organic vegetable dyes.");
  const [craftCategory, setCraftCategory] = useState("Wooden Toys & Crafts");
  const [location, setLocation] = useState("Etikoppaka Village, AP");
  const [logoUrl, setLogoUrl] = useState("https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80");
  const [bannerUrl, setBannerUrl] = useState("https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80");

  // Step 3: Artisan & Craftsmanship info
  const [artisanType, setArtisanType] = useState("individual");
  const [yearsExperience, setYearsExperience] = useState(18);
  const [specialization, setSpecialization] = useState("Natural Lacquer Lathe-Turned Woodcraft");
  const [bio, setBio] = useState("3rd generation master artisan utilizing natural tree lacquers and indigenous Ankudu softwood.");

  // Step 4: Verification Evidence (links/uploads)
  const [workshopPhoto, setWorkshopPhoto] = useState("https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80");
  const [rawMaterialsPhoto, setRawMaterialsPhoto] = useState("https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80");
  const [giCertificate, setGiCertificate] = useState("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80");

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        personal_info: {
          artisan_name: artisanName,
          phone,
          email,
          address,
          region,
          district,
          state,
        },
        store_info: {
          store_name: storeName,
          store_description: storeDesc,
          craft_category: craftCategory,
          location,
          logo_url: logoUrl,
          banner_url: bannerUrl,
        },
        craft_info: {
          artisan_type: artisanType,
          years_of_experience: Number(yearsExperience),
          craft_specialization: specialization,
          bio,
        },
        evidence: [
          {
            document_type: "workshop_photo",
            file_url: workshopPhoto,
            title: "Traditional Lathe & Workshop Space",
            notes: "Shows traditional hand tools and working space.",
          },
          {
            document_type: "raw_material",
            file_url: rawMaterialsPhoto,
            title: "Seasoned Ankudu Softwood Logs & Lacquer",
            notes: "Natural materials and botanical pigments.",
          },
          {
            document_type: "gi_certificate",
            file_url: giCertificate,
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
      await refreshUser();
    } catch (err: any) {
      alert(err.message || "Onboarding submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white rounded-3xl p-8 border border-[#E6DED3] shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#2F6A4F]/10 text-[#2F6A4F] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#261E18]">
              Application Submitted for Verification!
            </h2>
            <p className="text-xs text-[#786C5E] max-w-md mx-auto leading-relaxed">
              Your application <span className="font-mono font-bold text-[#261E18]">#{completed.application_id?.slice(0, 8)}</span> has been queued for platform administrator review.
            </p>
          </div>

          {/* AI Pre-Inspection Feedback */}
          {completed.ai_analysis && (
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DED3] text-left space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#9C4221] font-bold">
                <Sparkles className="w-4 h-4" />
                <span>AI Authenticity Assistant Assessment</span>
              </div>
              <p className="text-[#594E42] leading-relaxed">
                {completed.ai_analysis.summary}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-[#E6DED3] text-[11px] text-[#786C5E]">
                <span>Confidence Score: {(completed.ai_analysis.confidence_score * 100).toFixed(0)}%</span>
                <span className="font-semibold text-[#2F6A4F]">Status: Queued for Human Review</span>
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/vendor/dashboard")}
              className="px-6 py-3 rounded-xl bg-[#2F6A4F] hover:bg-[#22543D] text-white text-xs font-semibold"
            >
              Go to Vendor Dashboard
            </button>
            <button
              onClick={() => router.push("/marketplace")}
              className="px-6 py-3 rounded-xl bg-[#FAF7F2] border border-[#D5C9B8] text-[#3D3128] text-xs font-semibold"
            >
              Return to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#9C4221]">
          Dedicated Artisan Onboarding
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#261E18]">
          Register Your Artisan Workshop
        </h1>
        <p className="text-xs sm:text-sm text-[#786C5E] max-w-lg mx-auto">
          Complete the 5-step verification process to open your digital storefront and access AI business intelligence.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-between border-b border-[#E6DED3] pb-6">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === step
                  ? "bg-[#9C4221] text-white ring-4 ring-[#9C4221]/20"
                  : currentStep > step
                  ? "bg-[#2F6A4F] text-white"
                  : "bg-stone-200 text-[#786C5E]"
              }`}
            >
              {currentStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
            </div>
            <span className="text-[11px] font-semibold hidden sm:inline text-[#4A3E31]">
              {step === 1 && "Personal"}
              {step === 2 && "Store"}
              {step === 3 && "Craft"}
              {step === 4 && "Evidence"}
              {step === 5 && "Review"}
            </span>
          </div>
        ))}
      </div>

      {/* FORM BODY */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DED3] shadow-sm space-y-6">
        {/* STEP 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#261E18]">
              Step 1: Artisan Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Master Artisan Name</label>
                <input
                  type="text"
                  value={artisanName}
                  onChange={(e) => setArtisanName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Mobile Contact</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Region / Cluster</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[#4A3E31] font-semibold mb-1">Workshop Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Store Info */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#261E18]">
              Step 2: Store Information
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Store / Studio Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Craft Category</label>
                <select
                  value={craftCategory}
                  onChange={(e) => setCraftCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                >
                  <option value="Wooden Toys & Crafts">Wooden Toys & Crafts</option>
                  <option value="Handloom & Textiles">Handloom & Textiles</option>
                  <option value="Pottery & Terracotta">Pottery & Terracotta</option>
                  <option value="Bamboo & Cane Crafts">Bamboo & Cane Crafts</option>
                  <option value="Metal Crafts & Brass">Metal Crafts & Brass</option>
                </select>
              </div>
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Store Description & Heritage Story</label>
                <textarea
                  rows={3}
                  value={storeDesc}
                  onChange={(e) => setStoreDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Logo Image URL</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Craftsmanship Info */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#261E18]">
              Step 3: Artisan & Craftsmanship Information
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Artisan Entity Type</label>
                <select
                  value={artisanType}
                  onChange={(e) => setArtisanType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                >
                  <option value="individual">Individual Master Maker</option>
                  <option value="cooperative">Artisan Craft Cooperative</option>
                  <option value="authorized_seller">Authorized Guild Representative</option>
                </select>
              </div>
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Years of Craft Experience</label>
                <input
                  type="number"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Traditional Craft Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Artisan Heritage Background</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Verification Evidence */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#261E18]">
              Step 4: Authenticity & Workshop Evidence
            </h3>
            <p className="text-xs text-[#786C5E]">
              KalaConnect AI strictly excludes mass-manufactured goods. Please attach photographic evidence of your physical tools, raw materials, and workshop.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Workshop & Tools Photo URL</label>
                <input
                  type="text"
                  value={workshopPhoto}
                  onChange={(e) => setWorkshopPhoto(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Natural Raw Materials Photo URL</label>
                <input
                  type="text"
                  value={rawMaterialsPhoto}
                  onChange={(e) => setRawMaterialsPhoto(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">GI Certificate or Artisan ID URL</label>
                <input
                  type="text"
                  value={giCertificate}
                  onChange={(e) => setGiCertificate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Final Review & Submission */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#261E18]">
              Step 5: Review & Submit Application
            </h3>
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DED3] space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#E6DED3] pb-2">
                <span className="text-[#8C7E6F]">Artisan:</span>
                <span className="font-bold text-[#261E18]">{artisanName} ({artisanType})</span>
              </div>
              <div className="flex justify-between border-b border-[#E6DED3] pb-2">
                <span className="text-[#8C7E6F]">Store Name:</span>
                <span className="font-bold text-[#261E18]">{storeName}</span>
              </div>
              <div className="flex justify-between border-b border-[#E6DED3] pb-2">
                <span className="text-[#8C7E6F]">Category & Craft:</span>
                <span className="font-bold text-[#261E18]">{craftCategory} • {specialization}</span>
              </div>
              <div className="flex justify-between border-b border-[#E6DED3] pb-2">
                <span className="text-[#8C7E6F]">Region & Origin:</span>
                <span className="font-bold text-[#261E18]">{region}</span>
              </div>
              <div className="flex justify-between text-[#2F6A4F] font-semibold">
                <span>Evidence Attached:</span>
                <span>Workshop, Raw Materials & GI Certificate</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F5EFE6] border border-[#E6DED3] flex items-center space-x-2 text-[11px] text-[#786C5E]">
              <ShieldCheck className="w-4 h-4 text-[#2F6A4F] shrink-0" />
              <span>
                By submitting, you certify that all listed creations are authentically handmade without industrial molds.
              </span>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="pt-4 border-t border-[#E6DED3] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2.5 rounded-xl border border-[#D5C9B8] text-xs font-semibold text-[#4A3E31] flex items-center space-x-1.5 hover:bg-[#FAF7F2]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2.5 rounded-xl bg-[#9C4221] text-white text-xs font-semibold flex items-center space-x-1.5 hover:bg-[#7B341E]"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-6 py-3 rounded-xl bg-[#2F6A4F] hover:bg-[#22543D] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? "Analyzing & Submitting..." : "Submit Application"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

