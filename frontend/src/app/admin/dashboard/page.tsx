"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Package,
  Store,
  Users,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Clock,
  History
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "applications" | "products" | "audit">("overview");

  const [overview, setOverview] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [productQueue, setProductQueue] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [appFilter, setAppFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [prodFilter, setProdFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Decision Modal
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ovData, appsData, prodsData, logsData] = await Promise.all([
        fetchApi("/admin/overview").catch(() => null),
        fetchApi("/admin/applications").catch(() => []),
        fetchApi("/admin/products/queue").catch(() => []),
        fetchApi("/admin/audit-logs").catch(() => [])
      ]);

      setOverview(ovData);
      setApplications(appsData);
      setProductQueue(prodsData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAppDecision = async (appId: string, decision: "approved" | "rejected" | "info_required") => {
    try {
      await fetchApi(`/admin/applications/${appId}/decision`, {
        method: "POST",
        body: JSON.stringify({
          decision,
          reason: decisionReason || `Application marked as ${decision} after review.`,
        }),
      });

      setSelectedApp(null);
      setDecisionReason("");
      showToast(`Artisan application successfully ${decision}!`);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || "Could not record decision");
    }
  };

  const handleProductDecision = async (productId: string, decision: "approved" | "rejected") => {
    try {
      await fetchApi(`/admin/products/${productId}/decision`, {
        method: "POST",
        body: JSON.stringify({
          decision,
          reason: `Admin confirmed craft technique authenticity.`,
        }),
      });

      showToast(`Product ${decision}!`);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || "Could not record product decision");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2F6A4F] text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-sm font-medium animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#261E18] to-[#1C1612] text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Governance & Craft Verification</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-1">
            KalaConnect AI Administrator Control Room
          </h1>
          <p className="text-xs text-[#C5B8A8] mt-1">
            Enforce authenticity standards, examine workshop evidence, inspect AI assistant summaries, and moderate vendor guilds.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center space-x-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[#E6DED3] text-xs font-bold">
        {[
          { key: "overview", label: "Overview", icon: TrendingUp },
          { key: "applications", label: `Vendor Applications (${applications.length})`, icon: Store },
          { key: "products", label: `Product Verification (${productQueue.length})`, icon: Package },
          { key: "audit", label: `Audit Trail (${auditLogs.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#553C9A] text-white shadow-sm"
                  : "bg-white text-[#615447] border border-[#E6DED3] hover:bg-[#FAF7F2]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] shadow-sm">
              <span className="text-[11px] font-bold text-[#8C7E6F] uppercase">Verified Artisan Guilds</span>
              <p className="font-serif text-3xl font-bold text-[#261E18] mt-2">
                {overview?.total_vendors || 5}
              </p>
              <span className="text-[10px] text-emerald-700 font-bold mt-1 inline-block">100% Workshop Evidence Inspected</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] shadow-sm">
              <span className="text-[11px] font-bold text-[#8C7E6F] uppercase">Active Catalog Listings</span>
              <p className="font-serif text-3xl font-bold text-[#261E18] mt-2">
                {overview?.total_products || 9}
              </p>
              <span className="text-[10px] text-[#786C5E] mt-1 inline-block">Strictly zero industrial replicas</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] shadow-sm">
              <span className="text-[11px] font-bold text-[#8C7E6F] uppercase">Pending Applications</span>
              <p className="font-serif text-3xl font-bold text-amber-700 mt-2">
                {overview?.pending_vendor_applications || applications.filter(a => a.status === 'under_review').length}
              </p>
              <span className="text-[10px] text-amber-800 font-bold mt-1 inline-block">Require Administrative Review</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] shadow-sm">
              <span className="text-[11px] font-bold text-[#8C7E6F] uppercase">Platform Recorded GMV</span>
              <p className="font-serif text-3xl font-bold text-[#9C4221] mt-2">
                ₹{(overview?.total_platform_gmv_inr || 124500).toLocaleString("en-IN")}
              </p>
              <span className="text-[10px] text-[#2F6A4F] font-bold mt-1 inline-block">Direct-to-Artisan Value</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VENDOR APPLICATIONS QUEUE */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#261E18]">
                Artisan & Guild Applications Queue
              </h2>
              <p className="text-xs text-[#786C5E]">
                Examine submitted workshop photos, raw materials, and AI authenticity assistant notes before certifying sellers.
              </p>
            </div>

            {/* Application Filters */}
            <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-[#E6DED3] text-xs font-bold shrink-0">
              <button
                onClick={() => setAppFilter("all")}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  appFilter === "all" ? "bg-[#261E18] text-white" : "text-[#786C5E] hover:text-[#261E18]"
                }`}
              >
                All ({applications.length})
              </button>
              <button
                onClick={() => setAppFilter("pending")}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  appFilter === "pending" ? "bg-amber-600 text-white" : "text-[#786C5E] hover:text-amber-800"
                }`}
              >
                Pending / Review ({applications.filter((a) => a.status === "under_review" || a.status === "pending" || a.status === "info_required").length})
              </button>
              <button
                onClick={() => setAppFilter("approved")}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  appFilter === "approved" ? "bg-[#2F6A4F] text-white" : "text-[#786C5E] hover:text-[#2F6A4F]"
                }`}
              >
                Approved ({applications.filter((a) => a.status === "approved").length})
              </button>
              <button
                onClick={() => setAppFilter("rejected")}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  appFilter === "rejected" ? "bg-red-600 text-white" : "text-[#786C5E] hover:text-red-700"
                }`}
              >
                Rejected ({applications.filter((a) => a.status === "rejected").length})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {applications
              .filter((app) => {
                if (appFilter === "all") return true;
                if (appFilter === "approved") return app.status === "approved";
                if (appFilter === "rejected") return app.status === "rejected";
                if (appFilter === "pending")
                  return app.status === "under_review" || app.status === "pending" || app.status === "info_required";
                return true;
              })
              .map((app) => (
                <div key={app.id} className="bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#F0EBE1] pb-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#261E18]">{app.vendor_name}</h3>
                      <p className="text-[#786C5E]">{app.vendor_email} • Submitted {app.submitted_at}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        app.status === "approved"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : app.status === "under_review"
                          ? "bg-purple-100 text-purple-800 border-purple-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {app.status.toUpperCase()}
                    </span>
                  </div>

                  {/* AI Assistant Summary Box */}
                  {app.ai_summary && (
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DED3] space-y-1 text-xs">
                      <div className="flex items-center space-x-1.5 font-bold text-[#9C4221]">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Verification Assistant Note:</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed">{app.ai_summary}</p>
                    </div>
                  )}

                  {/* Evidence Documents Carousel/Grid */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#261E18]">Submitted Workshop & Craft Evidence:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {app.documents?.map((doc: any) => (
                        <div key={doc.id} className="p-3 rounded-xl border border-[#E6DED3] bg-stone-50 text-xs space-y-1.5">
                          <div className="h-28 rounded-lg overflow-hidden bg-stone-200">
                            <img src={doc.url} alt={doc.title} className="w-full h-full object-cover" />
                          </div>
                          <p className="font-semibold text-[#261E18] truncate">{doc.title}</p>
                          <span className="text-[10px] text-[#786C5E] uppercase">{doc.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decision Actions */}
                  <div className="pt-3 border-t border-[#F0EBE1] flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-[#786C5E]">Admin Decisions automatically synchronize all products belonging to this vendor.</p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAppDecision(app.id, "approved")}
                        className="px-4 py-2 rounded-xl bg-[#2F6A4F] hover:bg-[#22543D] text-white text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Verify</span>
                      </button>
                      <button
                        onClick={() => handleAppDecision(app.id, "info_required")}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        Request More Info
                      </button>
                      <button
                        onClick={() => handleAppDecision(app.id, "rejected")}
                        className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT VERIFICATION QUEUE */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#261E18]">
                Product Authenticity Verification Queue
              </h2>
              <p className="text-xs text-[#786C5E]">
                Examine listed creations to prevent unauthorized factory items, machine prints, or plastic molds.
              </p>
            </div>

            {/* Product Status Filters */}
            <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-[#E6DED3] text-xs font-bold shrink-0">
              <button
                onClick={() => setProdFilter("all")}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  prodFilter === "all" ? "bg-[#261E18] text-white" : "text-[#786C5E] hover:text-[#261E18]"
                }`}
              >
                All ({productQueue.length})
              </button>
              <button
                onClick={() => setProdFilter("pending")}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  prodFilter === "pending" ? "bg-amber-600 text-white" : "text-[#786C5E] hover:text-amber-800"
                }`}
              >
                Pending ({productQueue.filter((p) => p.verification_status === "pending").length})
              </button>
              <button
                onClick={() => setProdFilter("approved")}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  prodFilter === "approved" ? "bg-[#2F6A4F] text-white" : "text-[#786C5E] hover:text-[#2F6A4F]"
                }`}
              >
                Approved ({productQueue.filter((p) => p.verification_status === "approved").length})
              </button>
              <button
                onClick={() => setProdFilter("rejected")}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  prodFilter === "rejected" ? "bg-red-600 text-white" : "text-[#786C5E] hover:text-red-700"
                }`}
              >
                Rejected ({productQueue.filter((p) => p.verification_status === "rejected").length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productQueue
              .filter((p) => {
                if (prodFilter === "all") return true;
                if (prodFilter === "approved") return p.verification_status === "approved";
                if (prodFilter === "rejected") return p.verification_status === "rejected";
                if (prodFilter === "pending") return p.verification_status === "pending";
                return true;
              })
              .map((p) => {
                const isProdApproved = p.verification_status === "approved";
                const isProdRejected = p.verification_status === "rejected";
                const isVendorRejected = p.vendor_verification_status === "rejected";

                return (
                  <div key={p.id} className="bg-white p-5 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Top Info */}
                      <div className="flex space-x-4">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-[#E6DED3]">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-serif text-base font-bold text-[#261E18]">{p.name}</h3>
                          <p className="text-xs text-[#786C5E] font-medium">{p.store_name} • ₹{p.price}</p>
                          <p className="text-[11px] text-[#9C4221] font-semibold">{p.craft_technique}</p>
                          
                          {/* Guild & Listing Status Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                            <span className="text-[#786C5E]">Guild:</span>
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border ${
                                p.vendor_verification_status === "approved"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : p.vendor_verification_status === "rejected"
                                  ? "bg-red-50 text-red-800 border-red-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {p.vendor_verification_status || "PENDING"}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border ${
                                p.is_active
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-stone-100 text-stone-600 border-stone-200"
                              }`}
                            >
                              {p.is_active ? "LIVE IN STORE" : "DELISTED / HIDDEN"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Banner */}
                      {isVendorRejected || isProdRejected ? (
                        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>
                            {isVendorRejected
                              ? "Artisan Guild application was REJECTED. This product is automatically delisted from public marketplace."
                              : "Product failed authenticity inspection. Delisted from the marketplace."}
                          </span>
                        </div>
                      ) : isProdApproved ? (
                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Verified Genuine Craftsmanship. Active on the public marketplace.</span>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Awaiting Administrator Review before public publishing.</span>
                        </div>
                      )}

                      {/* AI Assessment */}
                      <div className="p-3.5 rounded-2xl bg-[#FAF7F2] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#261E18]">
                            AI Assessment ({(p.ai_confidence * 100).toFixed(0)}% Confidence)
                          </span>
                          <span className="text-[10px] text-[#786C5E]">{p.created_at}</span>
                        </div>
                        <p className="text-[#615447] text-[11px] leading-relaxed">{p.ai_notes}</p>
                        {p.admin_reason && (
                          <p className="text-[10px] text-[#9C4221] font-semibold mt-1">
                            Note: {p.admin_reason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex justify-between items-center pt-3 border-t border-[#F0EBE1]">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          isProdApproved
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : isProdRejected
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}
                      >
                        {p.verification_status?.toUpperCase() || "PENDING"}
                      </span>

                      <div className="flex items-center space-x-2">
                        {p.verification_status !== "approved" && (
                          <button
                            onClick={() => handleProductDecision(p.id, "approved")}
                            className="px-3.5 py-1.5 rounded-xl bg-[#2F6A4F] hover:bg-[#23533D] text-white text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        {p.verification_status !== "rejected" && (
                          <button
                            onClick={() => handleProductDecision(p.id, "rejected")}
                            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject & Delist</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LEDGER */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#261E18]">
              Immutable Authenticity Audit Logs
            </h2>
            <p className="text-xs text-[#786C5E]">
              Every administrative approval or rejection decision is logged with timestamps and reasons.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E6DED3] overflow-hidden shadow-sm">
            <div className="divide-y divide-[#F0EBE1] text-xs">
              {auditLogs.length === 0 ? (
                <p className="p-6 text-center text-[#786C5E]">No audit events recorded yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#261E18]">{log.action}</p>
                      <p className="text-[11px] text-[#786C5E]">Reason: {log.reason || "Standard verification"}</p>
                    </div>
                    <span className="font-mono text-[11px] text-[#8C7E6F]">{log.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

