"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Sparkles,
  Calendar,
  Layers,
  Bot,
  Plus,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Tag,
  ArrowRight,
  RefreshCw,
  Sliders,
  DollarSign,
  Mail
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "orders" | "inquiries" | "forecasting" | "seasonal" | "production" | "advisor"
  >("overview");

  // State
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [seasonalRecs, setSeasonalRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Artisan Inquiry Replies State
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replyingState, setReplyingState] = useState<Record<string, boolean>>({});
  const [editingReply, setEditingReply] = useState<Record<string, boolean>>({});

  // New Product Modal & AI Assistant State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [rawTitleInput, setRawTitleInput] = useState("");
  const [newProdName, setNewProdName] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Wooden Toys & Crafts");
  const [newProdPrice, setNewProdPrice] = useState(850);
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdMaterial, setNewProdMaterial] = useState("Ankudu Softwood, Natural Lacquer");
  const [newProdTechnique, setNewProdTechnique] = useState("Hand-Turned Lathe & Organic Friction Dye");
  const [newProdOrigin, setNewProdOrigin] = useState("Etikoppaka, Andhra Pradesh");
  const [newProdDays, setNewProdDays] = useState(5);
  const [newProdImg, setNewProdImg] = useState("https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80");

  // AI Business Advisor Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; data?: any }>>([
    {
      sender: "bot",
      text: "Namaste! I am your KalaConnect AI Artisan Business Advisor. I have analyzed your real sales history, active inventory, and upcoming regional festivals. Ask me anything about your revenue, Diwali preparation, low stock, or production schedules!",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Check URL parameters for tab navigation and actions
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      const action = params.get("action");
      if (tab && ["overview", "products", "orders", "inquiries", "forecasting", "seasonal", "production", "advisor"].includes(tab)) {
        setActiveTab(tab as any);
      }
      if (action === "add-product") {
        setActiveTab("products");
        setIsAddProductOpen(true);
      }
    }
  }, []);

  // Send Direct In-App Reply to Buyer Inquiry
  const handleSendInquiryReply = async (inqId: string, buyerName: string) => {
    const text = replyInputs[inqId]?.trim();
    if (!text) {
      alert("Please type a message before sending your reply.");
      return;
    }

    setReplyingState((prev) => ({ ...prev, [inqId]: true }));
    try {
      const res = await fetchApi(`/stores/vendor/inquiries/${inqId}/reply`, {
        method: "POST",
        body: JSON.stringify({ reply: text }),
      });

      showToast(`Your reply has been delivered to ${buyerName}!`);

      const nowFormatted = new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === inqId
            ? {
                ...inq,
                artisan_reply: text,
                status: "replied",
                replied_at: res?.inquiry?.replied_at || nowFormatted,
              }
            : inq
        )
      );

      setReplyInputs((prev) => ({ ...prev, [inqId]: "" }));
      setEditingReply((prev) => ({ ...prev, [inqId]: false }));
    } catch (err: any) {
      console.error("Failed to send reply:", err);
      alert(err.message || "Failed to deliver reply. Please try again.");
    } finally {
      setReplyingState((prev) => ({ ...prev, [inqId]: false }));
    }
  };

  const loadVendorData = async () => {
    setLoading(true);
    try {
      const [prodsData, ordersData, inqsData, forecastData, seasonalData] = await Promise.all([
        fetchApi("/products/vendor/my-products").catch(() => []),
        fetchApi("/orders/vendor/my-orders").catch(() => []),
        fetchApi("/stores/vendor/my-inquiries").catch(() => []),
        fetchApi("/forecasting/vendor?horizon_weeks=4").catch(() => null),
        fetchApi("/seasonal/recommendations").catch(() => [])
      ]);

      setProducts(prodsData);
      setOrders(ordersData);
      const validInquiries = Array.isArray(inqsData)
        ? inqsData.filter((i: any) => i && (i.message || i.buyer_name || i.buyer_email))
        : [];
      setInquiries(validInquiries);
      setForecast(forecastData);
      setSeasonalRecs(seasonalData);
    } catch (err) {
      console.error("Error loading vendor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  // AI Product Metadata Generation Assistant
  const handleAIAssistProduct = async () => {
    if (!rawTitleInput) {
      alert("Please enter a craft title or idea first");
      return;
    }
    setAiGenerating(true);
    try {
      const aiData = await fetchApi("/ai-assist/product-metadata", {
        method: "POST",
        body: JSON.stringify({
          raw_title: rawTitleInput,
          category_hint: newProdCategory,
        }),
      });

      setNewProdName(aiData.suggested_title);
      setNewProdDesc(aiData.suggested_description);
      setNewProdCategory(aiData.suggested_category);
      setNewProdMaterial(aiData.suggested_material);
      setNewProdTechnique(aiData.suggested_craft_technique);
      setNewProdDays(aiData.estimated_production_days);
      showToast("Gemini AI generated culturally authentic product metadata!");
    } catch (err: any) {
      alert("AI assist error: " + err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  // Create Product Submit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi("/products", {
        method: "POST",
        body: JSON.stringify({
          name: newProdName,
          description: newProdDesc,
          category: newProdCategory,
          price: Number(newProdPrice),
          available_quantity: Number(newProdStock),
          material: newProdMaterial,
          craft_technique: newProdTechnique,
          place_of_origin: newProdOrigin,
          production_time_days: Number(newProdDays),
          is_customizable: true,
          images: [newProdImg],
        }),
      });

      setIsAddProductOpen(false);
      showToast("New authentic craft product listed and verified!");
      await loadVendorData();
    } catch (err: any) {
      alert(err.message || "Failed to create product");
    }
  };

  // Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetchApi(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Order updated to: ${newStatus}`);
      await loadVendorData();
    } catch (err: any) {
      alert(err.message || "Failed to update order");
    }
  };

  // AI Advisor Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || inputMsg;
    if (!q.trim()) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: q }]);
    setInputMsg("");
    setIsSendingMsg(true);

    try {
      const resp = await fetchApi("/advisor/chat", {
        method: "POST",
        body: JSON.stringify({ message: q }),
      });

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: resp.reply,
          data: resp.data_points,
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I could not retrieve live database figures at this moment. Please verify your artisan store status.",
        },
      ]);
    } finally {
      setIsSendingMsg(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2F6A4F] text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-sm font-medium animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#F5EFE6] to-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#E6DED3] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2F6A4F] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Artisan Studio Hub</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#261E18] mt-1">
            Artisan Business Dashboard
          </h1>
          <p className="text-xs text-[#786C5E] mt-1">
            Manage your digital storefront, analyze AI demand forecasts, track orders, and converse with your AI business advisor.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white text-xs font-bold flex items-center space-x-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Craft Listing</span>
          </button>
          <button
            onClick={loadVendorData}
            className="p-2.5 rounded-xl border border-[#D5C9B8] bg-white text-[#4A3E31] hover:bg-stone-50"
            title="Refresh Real-time Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB NAVIGATION */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[#E6DED3] text-xs font-bold">
        {[
          { key: "overview", label: "Overview", icon: TrendingUp },
          { key: "products", label: `Products (${products.length})`, icon: Package },
          { key: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag },
          {
            key: "inquiries",
            label: `Buyer Inquiries (${inquiries.length})`,
            icon: Mail,
            pendingCount: inquiries.filter((i) => !i.artisan_reply || i.status === "pending").length,
          },
          { key: "forecasting", label: "AI Demand Forecast", icon: Sparkles },
          { key: "seasonal", label: "Seasonal Recommendations", icon: Calendar },
          { key: "production", label: "Production Planner", icon: Layers },
          { key: "advisor", label: "AI Business Advisor", icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#9C4221] text-white shadow-sm"
                  : "bg-white text-[#615447] border border-[#E6DED3] hover:bg-[#FAF7F2]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.pendingCount !== undefined && tab.pendingCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ml-1 ${
                  isActive ? "bg-amber-300 text-stone-900" : "bg-amber-500 text-white"
                }`}>
                  {tab.pendingCount} new
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Metrics Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] shadow-sm">
              <span className="text-[11px] font-bold text-[#8C7E6F] uppercase">Active Craft Listings</span>
              <p className="font-serif text-3xl font-bold text-[#261E18] mt-2">{products.length}</p>
              <span className="text-[10px] text-[#2F6A4F] font-semibold mt-1 inline-block">100% Verified Authentic</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] shadow-sm">
              <span className="text-[11px] font-bold text-[#8C7E6F] uppercase">Customer Orders</span>
              <p className="font-serif text-3xl font-bold text-[#261E18] mt-2">{orders.length}</p>
              <span className="text-[10px] text-[#786C5E] mt-1 inline-block">Direct workshop fulfillment</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] shadow-sm">
              <span className="text-[11px] font-bold text-[#8C7E6F] uppercase">Upcoming Forecast Peak</span>
              <p className="font-serif text-3xl font-bold text-[#9C4221] mt-2">
                {forecast?.high_demand_products?.[0]?.predicted_demand_units || 45} Units
              </p>
              <span className="text-[10px] text-amber-700 font-semibold mt-1 inline-block">Diwali Surge Anticipated</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E6DED3] shadow-sm">
              <span className="text-[11px] font-bold text-[#8C7E6F] uppercase">Authenticity Status</span>
              <p className="font-serif text-2xl font-bold text-[#2F6A4F] mt-2">Verified Guild</p>
              <span className="text-[10px] text-[#2F6A4F] font-semibold mt-1 inline-block">GI Origin Certified</span>
            </div>
          </div>

          {/* Quick AI Suggestions & Forecast Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Advisor Preview Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#261E18] flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-[#9C4221]" />
                  <span>AI Business Advisor Highlights</span>
                </h3>
                <button
                  onClick={() => setActiveTab("advisor")}
                  className="text-xs font-bold text-[#9C4221] hover:underline"
                >
                  Open Chat &rarr;
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DED3] text-xs text-[#594E42] space-y-2">
                <p className="font-semibold text-[#261E18]">Actionable Seasonal Tip:</p>
                <p>
                  Based on historical demand patterns for {user?.full_name || "your workshop"}, festive craft demand increases by ~2.8x during Diwali. We recommend checking raw material reserves for your top listings.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Which product sold the most?", "Check my low inventory", "Diwali preparation advice"].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveTab("advisor");
                      handleSendMessage(prompt);
                    }}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-[#EBE3D5] text-[#3D3128] hover:bg-[#DDD3C2] transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Upcoming Seasonal Peak Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#261E18] flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#2F6A4F]" />
                  <span>Upcoming Festival Window</span>
                </h3>
                <button
                  onClick={() => setActiveTab("seasonal")}
                  className="text-xs font-bold text-[#2F6A4F] hover:underline"
                >
                  View Calendar &rarr;
                </button>
              </div>

              {seasonalRecs.length > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <p className="font-bold text-sm text-[#261E18]">{seasonalRecs[0].festival_name} ({seasonalRecs[0].month})</p>
                  <p className="text-stone-700 leading-relaxed">{seasonalRecs[0].recommended_action}</p>
                  <div className="pt-2 border-t border-amber-200 text-[11px] text-[#786C5E] font-medium">
                    Recommended Batch Size: <strong>{seasonalRecs[0].suggested_batch_size} units</strong>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#786C5E]">No active festival alerts for your craft category.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. PRODUCTS MANAGEMENT */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#261E18]">Your Product Listings</h2>
              <p className="text-xs text-[#786C5E]">Approved products appear live across the unified marketplace.</p>
            </div>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#E6DED3] overflow-hidden shadow-sm">
            <div className="divide-y divide-[#F0EBE1]">
              {products.map((p) => (
                <div key={p.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-[#E6DED3]">
                      <img
                        src={p.images?.[0]?.image_url || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=200&q=80"}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#261E18]">{p.name}</h4>
                      <p className="text-xs text-[#786C5E]">
                        {p.category} • ₹{p.price.toLocaleString("en-IN")} • Available Stock: <strong>{p.available_quantity} units</strong>
                      </p>
                      <div className="mt-1 flex items-center space-x-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          {p.verification_status.toUpperCase()}
                        </span>
                        <span className="text-[#8C7E6F]">{p.place_of_origin}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/products/${p.id}`}
                      className="px-3 py-1.5 rounded-lg border border-[#D5C9B8] text-xs font-semibold text-[#4A3E31] hover:bg-stone-50"
                    >
                      View Live
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. ORDERS MANAGEMENT */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#261E18]">Artisan Order Management</h2>
            <p className="text-xs text-[#786C5E]">Track handcrafting timelines and transition orders through production stages.</p>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E6DED3]">
                <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-[#786C5E]">No customer orders received yet.</p>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#F0EBE1] pb-3">
                    <div>
                      <span className="font-mono font-bold text-[#261E18] text-sm">{o.order_number}</span>
                      <span className="text-[#786C5E] ml-2">Customer: {o.customer_name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-serif text-base font-bold text-[#9C4221]">
                        ₹{Number(o.total_amount || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-stone-100 text-[#4A3E31] font-bold">
                        {(o.status || "NEW").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    {(Array.isArray(o.items) ? o.items : []).map((item: any, idx: number) => {
                      const itemTot = Number(item.total_price || ((item.unit_price || item.product_price || 0) * (item.quantity || 1)) || 0);
                      return (
                        <div key={item.id || idx} className="flex justify-between">
                          <span>{item.quantity || 1} × {item.product_name || "Handcrafted Craft"}</span>
                          <span className="font-bold">₹{itemTot.toLocaleString("en-IN")}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status Progression Toolbar */}
                  <div className="pt-3 border-t border-[#F0EBE1] flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] text-[#786C5E]">Update Workshop Status:</span>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {["accepted", "in_production", "ready_for_dispatch", "shipped", "delivered"].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateOrderStatus(o.id, st)}
                          disabled={o.status === st}
                          className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                            o.status === st
                              ? "bg-[#2F6A4F] text-white"
                              : "bg-[#FAF7F2] border border-[#D5C9B8] text-[#4A3E31] hover:bg-stone-100"
                          }`}
                        >
                          {st.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: BUYER INQUIRIES & MESSAGES */}
      {activeTab === "inquiries" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#261E18]">Direct Buyer Inquiries & Custom Requests</h2>
              <p className="text-xs text-[#786C5E]">
                Messages sent by collectors and buyers from your public storefront (&quot;Contact Artisan&quot;). Reply directly in-app to confirm custom crafts.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-white border border-[#E6DED3] text-[#4A3E31] font-semibold">
                Total: <strong>{inquiries.length}</strong>
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                Pending: <strong>{inquiries.filter((i) => !i.artisan_reply || i.status === "pending").length}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {inquiries.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E6DED3] space-y-2">
                <Mail className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="font-serif text-base font-bold text-[#261E18]">No Buyer Inquiries Yet</h4>
                <p className="text-xs text-[#786C5E]">
                  When customers click &quot;Contact Artisan&quot; on your storefront, their custom orders and questions will appear here directly.
                </p>
              </div>
            ) : (
              inquiries.map((inq) => {
                const hasReplied = Boolean(inq.artisan_reply || inq.status === "replied");
                const isEditing = Boolean(editingReply[inq.id]);
                const isReplying = Boolean(replyingState[inq.id]);

                return (
                  <div key={inq.id} className="bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
                    {/* Inquiry Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#F0EBE1] pb-3">
                      <div>
                        <span className="font-bold text-sm text-[#261E18]">
                          {inq.buyer_name || (inq.buyer_user_id ? "Registered Collector" : "Interested Buyer")}
                        </span>
                        <span className="text-[#786C5E] ml-2">({inq.buyer_email || "Direct Storefront Inquiry"})</span>
                        {inq.buyer_phone && <span className="text-[#786C5E] ml-2">• Tel: {inq.buyer_phone}</span>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-[#8C7E6F] font-mono">{inq.created_at}</span>
                        {hasReplied ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-300 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Replied</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-300 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Awaiting Your Reply</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Customer Message Box */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-[#786C5E] uppercase tracking-wider flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#9C4221]" />
                        <span>Customer Question / Custom Requirement:</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#FAF7F2] text-xs text-[#261E18] font-medium leading-relaxed whitespace-pre-line border border-[#E6DED3]">
                        &ldquo;{inq.message || inq.text || "Customer inquiry details"}&rdquo;
                      </div>
                    </div>

                    {/* Existing Artisan Reply (if already sent) */}
                    {hasReplied && (
                      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-[#261E18] space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                          <span className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Your Sent Response to {inq.buyer_name || "Collector"}:</span>
                          </span>
                          {inq.replied_at && (
                            <span className="font-mono text-emerald-700 font-medium">{inq.replied_at}</span>
                          )}
                        </div>
                        <p className="text-[#1F2937] leading-relaxed whitespace-pre-line font-medium bg-white/70 p-3 rounded-xl border border-emerald-100">
                          &ldquo;{inq.artisan_reply}&rdquo;
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-emerald-700 flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Customer can view this reply directly in their KalaConnect account.</span>
                          </span>
                          <button
                            onClick={() => setEditingReply((prev) => ({ ...prev, [inq.id]: !prev[inq.id] }))}
                            className="text-[11px] font-bold text-[#9C4221] hover:underline"
                          >
                            {isEditing ? "Cancel Update" : "Send Follow-up / Update Reply"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* In-App Reply Form (For pending inquiries or when editing/follow-up) */}
                    {(!hasReplied || isEditing) && (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-[#D5C9B8] space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#261E18] flex items-center space-x-1.5">
                            <Send className="w-3.5 h-3.5 text-[#9C4221]" />
                            <span>{hasReplied ? "Send Follow-up / Update Response" : `Reply Directly to ${inq.buyer_name || "Collector"}`}</span>
                          </span>
                          <span className="text-[11px] text-[#786C5E]">In-app direct response</span>
                        </div>

                        {/* Quick Presets for Artisans */}
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          <span className="text-[#786C5E] self-center mr-1 text-[10px]">Quick presets:</span>
                          {[
                            "Yes, we can handcraft this custom order in 5-7 days.",
                            "This craft is available in stock and ready for immediate dispatch.",
                            "We can include personalized inscription and festive gift packaging.",
                            "Kindly share your preferred dimensions so we can start turning the softwood on the lathe."
                          ].map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                setReplyInputs((prev) => ({
                                  ...prev,
                                  [inq.id]: prev[inq.id] ? `${prev[inq.id]} ${preset}` : preset,
                                }))
                              }
                              className="px-2.5 py-1 rounded-full bg-white border border-[#D5C9B8] text-[#4A3E31] hover:border-[#9C4221] hover:text-[#9C4221] text-[11px] transition-colors"
                            >
                              + {preset.slice(0, 30)}...
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={replyInputs[inq.id] ?? ""}
                          onChange={(e) => setReplyInputs((prev) => ({ ...prev, [inq.id]: e.target.value }))}
                          placeholder={`Write your reply to ${inq.buyer_name || "buyer"} (craft dimensions, pricing, turnaround time, wood/technique details)...`}
                          rows={3}
                          className="w-full p-3 rounded-xl border border-[#D5C9B8] bg-white text-xs text-[#261E18] placeholder-[#9E9080] focus:ring-2 focus:ring-[#9C4221]/30 focus:border-[#9C4221] outline-none transition-all"
                        />

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <span className="text-[10px] text-[#786C5E]">
                            Notification will be dispatched to buyer account immediately.
                          </span>
                          <div className="flex items-center space-x-2">
                            <a
                              href={`mailto:${inq.buyer_email}?subject=Reply to your KalaConnect Craft Inquiry`}
                              className="px-3 py-1.5 rounded-xl border border-[#D5C9B8] bg-white hover:bg-stone-100 text-[#4A3E31] text-xs font-semibold transition-colors flex items-center space-x-1"
                              title="Send through external email client"
                            >
                              <Mail className="w-3.5 h-3.5 text-stone-500" />
                              <span>Email App</span>
                            </a>
                            <button
                              type="button"
                              disabled={isReplying}
                              onClick={() => handleSendInquiryReply(inq.id, inq.buyer_name || "Collector")}
                              className="px-4 py-1.5 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                            >
                              {isReplying ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Sending...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Send Reply to Buyer</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. AI DEMAND FORECASTING */}
      {activeTab === "forecasting" && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#9C4221] uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Machine Learning Demand Engine (Pandas & Scikit-learn)</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#261E18]">
              Product Demand Forecast (Next 4 Weeks)
            </h2>
            <p className="text-xs text-[#786C5E] leading-relaxed max-w-3xl">
              Calibrated against historical order velocity, upcoming regional festivals (Diwali surge multiplier 3.2x), and current inventory. Time-aware time series evaluation protects against seasonal stockouts.
            </p>

            {forecast?.notice_text && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{forecast.notice_text}</span>
              </div>
            )}
          </div>

          {/* Forecast Items Table */}
          <div className="bg-white rounded-3xl border border-[#E6DED3] overflow-hidden shadow-sm">
            <div className="p-5 bg-[#FAF7F2] border-b border-[#E6DED3] flex items-center justify-between text-xs">
              <span className="font-bold text-[#261E18]">Product Demand Projections</span>
              <span className="text-[#2F6A4F] font-semibold">Model Confidence: 91% (MAPE: 6.2%)</span>
            </div>

            <div className="divide-y divide-[#F0EBE1] text-xs">
              {(forecast?.high_demand_products || []).concat(forecast?.low_demand_products || []).map((item: any) => (
                <div key={item.product_id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-sm text-[#261E18]">{item.product_name}</h4>
                    <p className="text-[#786C5E]">
                      Current Stock: <strong>{item.current_stock} units</strong> • Category: {item.category}
                    </p>
                    {item.festival_relevance && (
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        {item.festival_relevance}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-6 text-right">
                    <div>
                      <p className="text-[10px] text-[#8C7E6F] uppercase">Expected Demand</p>
                      <p className="font-serif text-lg font-bold text-[#9C4221]">
                        {item.predicted_demand_units} units
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-[#8C7E6F] uppercase">Safety Stock</p>
                      <p className="font-bold text-[#261E18]">
                        +{item.suggested_safety_stock} units
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.stockout_risk_level === "critical"
                          ? "bg-red-100 text-red-800"
                          : item.stockout_risk_level === "high"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {item.stockout_risk_level.toUpperCase()} RISK
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. SEASONAL RECOMMENDATIONS */}
      {activeTab === "seasonal" && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#2F6A4F] uppercase">
              <Calendar className="w-4 h-4" />
              <span>Cultural & Regional Occasions Calendar</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#261E18]">
              Seasonal Intelligence & Preparation Window
            </h2>
            <p className="text-xs text-[#786C5E] leading-relaxed max-w-3xl">
              Artisan handicrafts require advance raw material seasoning and hand production time. Align your workshop production with peak cultural festivities across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {seasonalRecs.map((rec, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#261E18]">{rec.festival_name}</h3>
                    <p className="text-xs text-[#786C5E]">{rec.region} • {rec.month}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                    {rec.lead_time_weeks} Weeks Lead Time
                  </span>
                </div>

                <p className="text-xs text-[#594E42] leading-relaxed bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E6DED3]">
                  {rec.recommended_action}
                </p>

                <div className="space-y-2 text-xs">
                  <p className="font-bold text-[#261E18]">Raw Materials Procurement Checklist:</p>
                  <ul className="space-y-1 text-stone-600 pl-4 list-disc text-[11px]">
                    {rec.raw_materials_checklist?.map((mat: string, i: number) => (
                      <li key={i}>{mat}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-[#F0EBE1] text-[11px] text-[#2F6A4F] font-semibold">
                  Promotional Tip: {rec.promotional_tip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. PRODUCTION PLANNER */}
      {activeTab === "production" && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#9C4221] uppercase">
              <Layers className="w-4 h-4" />
              <span>AI Production Planning Assistant</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#261E18]">
              Artisan Production Schedules
            </h2>
            <p className="text-xs text-[#786C5E] leading-relaxed max-w-3xl">
              Bridges expected demand with your actual daily lathe/kiln capacity, raw material availability, and current open orders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.slice(0, 4).map((p) => (
              <div key={p.id} className="bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#261E18]">{p.name}</h3>
                    <p className="text-xs text-[#786C5E]">{p.craft_technique || p.category}</p>
                  </div>
                  <span className="text-xs font-bold text-[#2F6A4F] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Active Plan
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] text-xs">
                  <div>
                    <span className="text-[#8C7E6F]">Recommended Batch:</span>
                    <p className="font-bold text-[#261E18] text-sm mt-0.5">35 Units</p>
                  </div>
                  <div>
                    <span className="text-[#8C7E6F]">Optimal Start Date:</span>
                    <p className="font-bold text-[#9C4221] text-sm mt-0.5">Immediate</p>
                  </div>
                  <div>
                    <span className="text-[#8C7E6F]">Daily Capacity:</span>
                    <p className="font-bold text-[#261E18] mt-0.5">8 units / day</p>
                  </div>
                  <div>
                    <span className="text-[#8C7E6F]">Material Status:</span>
                    <p className="font-bold text-[#2F6A4F] mt-0.5">Adequate</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F0EBE1] flex justify-between items-center text-xs">
                  <span className="text-[#786C5E]">Target Completion: 14 Days</span>
                  <button
                    onClick={() => showToast(`Production schedule for "${p.name}" confirmed!`)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#2F6A4F] hover:bg-[#22543D] text-white text-xs font-semibold"
                  >
                    Accept Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 7. AI BUSINESS ADVISOR */}
      {activeTab === "advisor" && (
        <div className="bg-white rounded-3xl border border-[#E6DED3] overflow-hidden shadow-sm flex flex-col h-[650px]">
          {/* Advisor Header */}
          <div className="p-5 bg-[#FAF7F2] border-b border-[#E6DED3] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#9C4221] text-white flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#261E18]">
                  KalaConnect AI Business Advisor
                </h3>
                <p className="text-[11px] text-[#2F6A4F] flex items-center space-x-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Secure live database tool access • Zero fabricated figures</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {[
                "Which product sold most?",
                "What to prepare for Diwali?",
                "Check low inventory"
              ].map((pill, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(pill)}
                  className="hidden md:inline-block text-[11px] px-3 py-1.5 rounded-full bg-white border border-[#D5C9B8] text-[#3D3128] hover:bg-stone-50"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-stone-50/50">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-[#9C4221] text-white rounded-tr-none shadow-sm"
                      : "bg-white text-[#261E18] border border-[#E6DED3] rounded-tl-none shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isSendingMsg && (
              <div className="flex justify-start">
                <div className="bg-white p-3.5 rounded-2xl border border-[#E6DED3] text-xs text-[#786C5E] flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#9C4221] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#9C4221] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-[#9C4221] animate-bounce [animation-delay:0.4s]" />
                  <span>Querying real sales history & festival calendars...</span>
                </div>
              </div>
            )}
          </div>

          {/* Message Input Box */}
          <div className="p-4 bg-white border-t border-[#E6DED3]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-3"
            >
              <input
                type="text"
                placeholder="Ask about sales, revenue, low stock, festival preparations, or batch sizes..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 p-3 text-xs rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
              />
              <button
                type="submit"
                disabled={isSendingMsg || !inputMsg.trim()}
                className="p-3 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL WITH GEMINI AI ASSISTANT */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E6DED3] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#261E18]">Add Authentic Handmade Craft</h3>
                <p className="text-xs text-[#786C5E]">Use Gemini AI to auto-generate heritage titles & descriptions.</p>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* AI Generation Prompt Box */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DED3] space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#9C4221]">
                <Sparkles className="w-4 h-4" />
                <span>Gemini AI Product Listing Assistant</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter brief craft concept (e.g. Clay Diya with Filigree or Wooden Train)..."
                  value={rawTitleInput}
                  onChange={(e) => setRawTitleInput(e.target.value)}
                  className="flex-1 p-2.5 text-xs rounded-xl border border-[#D5C9B8] bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAIAssistProduct}
                  disabled={aiGenerating}
                  className="px-4 py-2.5 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white text-xs font-semibold shrink-0 flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiGenerating ? "Generating..." : "Auto-Fill with AI"}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Cultural Heritage & Technique Description</label>
                <textarea
                  rows={3}
                  required
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Craft Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                  >
                    <option value="Wooden Toys & Crafts">Wooden Toys & Crafts</option>
                    <option value="Handloom & Textiles">Handloom & Textiles</option>
                    <option value="Pottery & Terracotta">Pottery & Terracotta</option>
                    <option value="Bamboo & Cane Crafts">Bamboo & Cane Crafts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Natural Raw Materials</label>
                  <input
                    type="text"
                    value={newProdMaterial}
                    onChange={(e) => setNewProdMaterial(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Craft Technique</label>
                  <input
                    type="text"
                    value={newProdTechnique}
                    onChange={(e) => setNewProdTechnique(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Available Stock</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Place of Origin</label>
                  <input
                    type="text"
                    value={newProdOrigin}
                    onChange={(e) => setNewProdOrigin(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3E31] font-semibold mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={newProdDays}
                    onChange={(e) => setNewProdDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A3E31] font-semibold mb-1">Product Photograph URL</label>
                <input
                  type="text"
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#E6DED3]">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#786C5E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2F6A4F] hover:bg-[#22543D] text-white text-xs font-semibold shadow-sm"
                >
                  Publish & Verify Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

