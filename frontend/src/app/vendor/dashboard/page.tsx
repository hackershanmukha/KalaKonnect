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
  Mail,
  Search,
  Bell,
  ChevronDown,
  Check,
  ArrowUpRight,
  AlertCircle,
  Store
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

  // SaaS UI State (Image 3 & 4)
  const [revenueRange, setRevenueRange] = useState<"12M" | "6M" | "3M">("12M");
  const [selectedStore, setSelectedStore] = useState("Etikoppaka Wooden Crafts");
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [topSearch, setTopSearch] = useState("");
  const [activeForecastMonth, setActiveForecastMonth] = useState<number>(2); // March by default
  const [showTooltip, setShowTooltip] = useState(true);

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

      {/* Top Controls Bar (Image 3 InRetail/SaaS Style) */}
      <div className="bg-white p-4 rounded-3xl border border-[#E6DED3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={topSearch}
            onChange={(e) => setTopSearch(e.target.value)}
            placeholder="Search products, orders, SKUs..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] rounded-xl text-xs text-[#261E18] border border-[#E6DED3] focus:outline-none focus:border-[#9C4221] transition-all"
          />
        </div>

        <div className="flex items-center space-x-3 self-end md:self-auto">
          {/* Store Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C9B8] hover:bg-stone-50 text-xs font-semibold text-[#261E18] flex items-center space-x-2 shadow-2xs"
            >
              <Store className="w-3.5 h-3.5 text-[#9C4221]" />
              <span>{selectedStore}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>
            {isStoreMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-2xl border border-[#E6DED3] shadow-xl p-2 z-30 text-xs space-y-1 animate-in fade-in slide-in-from-top-1">
                {[
                  "Etikoppaka Wooden Crafts",
                  "Varma Heritage Woodcrafts",
                  "Kondapalli Traditional Workshop"
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedStore(s);
                      setIsStoreMenuOpen(false);
                      showToast(`Switched active storefront to: ${s}`);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                      selectedStore === s ? "bg-[#FAF7F2] font-bold text-[#9C4221]" : "hover:bg-stone-50 text-[#3D3128]"
                    }`}
                  >
                    <span>{s}</span>
                    {selectedStore === s && <Check className="w-3.5 h-3.5 text-[#9C4221]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <Link
            href="/orders?tab=alerts"
            className="p-2.5 rounded-xl border border-[#D5C9B8] bg-white text-[#4A3E31] hover:bg-stone-50 relative shadow-2xs"
            title="Automated Notifications"
          >
            <Bell className="w-4 h-4 text-[#786C5E]" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 ring-2 ring-white" />
          </Link>

          {/* Artisan Profile Avatar */}
          <div className="w-9 h-9 rounded-xl bg-[#9C4221] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            RV
          </div>

          <button
            onClick={() => setIsAddProductOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Craft</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB NAVIGATION */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[#E6DED3] text-xs font-bold">
        {[
          { key: "overview", label: "Dashboard", icon: TrendingUp },
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

      {/* TAB CONTENT: 1. OVERVIEW (Modern SaaS InRetail Style - Image 3) */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* 4 Stat Metric Cards (Image 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Total Revenue */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8C7E6F] uppercase tracking-wider">Total Revenue</span>
                <span className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +12.3%
                </span>
              </div>
              <p className="font-serif text-3xl font-bold text-[#261E18]">₹2,84,592</p>
              <p className="text-[10px] text-[#786C5E]">Direct artisan earnings remitted</p>
            </div>

            {/* 2. Total Orders */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8C7E6F] uppercase tracking-wider">Total Orders</span>
                <span className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +8.1%
                </span>
              </div>
              <p className="font-serif text-3xl font-bold text-[#261E18]">1,847</p>
              <p className="text-[10px] text-[#786C5E]">{orders.length} active in production</p>
            </div>

            {/* 3. Low Stock Items */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8C7E6F] uppercase tracking-wider">Low Stock Items</span>
                <span className="flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <AlertTriangle className="w-3 h-3 mr-0.5 text-amber-600" />
                  +5 items
                </span>
              </div>
              <p className="font-serif text-3xl font-bold text-[#9C4221]">23</p>
              <p className="text-[10px] text-amber-700 font-semibold">Replenishment needed for festive rush</p>
            </div>

            {/* 4. Active Products */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8C7E6F] uppercase tracking-wider">Active Products</span>
                <span className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Plus className="w-3 h-3 mr-0.5" />
                  +12 new
                </span>
              </div>
              <p className="font-serif text-3xl font-bold text-[#261E18]">856</p>
              <p className="text-[10px] text-[#2F6A4F] font-semibold">100% GI Authentic Listings</p>
            </div>
          </div>

          {/* Charts Row (Monthly Revenue & Inventory Trends - Image 3) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Monthly Revenue Bar Chart (Left Column - 7 spans) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#E6DED3] shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#261E18]">Monthly Revenue</h3>
                  <p className="text-xs text-[#786C5E]">Past {revenueRange === "12M" ? "12 months" : revenueRange === "6M" ? "6 months" : "3 months"} performance</p>
                </div>
                {/* Time Range Pills */}
                <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl text-xs font-bold border border-[#E6DED3]">
                  {(["12M", "6M", "3M"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRevenueRange(r)}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        revenueRange === r
                          ? "bg-[#9C4221] text-white shadow-xs"
                          : "text-[#786C5E] hover:text-[#261E18]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[10px] text-[#8C7E6F] font-mono border-b border-[#F0EBE1] pb-1">
                  <span>Scale</span>
                  <span>$100k</span>
                  <span>$75k</span>
                  <span>$50k</span>
                  <span>$25k</span>
                </div>
                <div className="h-48 flex items-end justify-between gap-2 pt-4 px-1">
                  {[
                    { month: "Jan", val: 42, label: "$42k" },
                    { month: "Feb", val: 36, label: "$36k" },
                    { month: "Mar", val: 58, label: "$58k" },
                    { month: "Apr", val: 52, label: "$52k" },
                    { month: "May", val: 66, label: "$66k" },
                    { month: "Jun", val: 74, label: "$74k" },
                    { month: "Jul", val: 78, label: "$78k" },
                    { month: "Aug", val: 84, label: "$84k" },
                    { month: "Sep", val: 82, label: "$82k" },
                    { month: "Oct", val: 91, label: "$91k" },
                    { month: "Nov", val: 96, label: "$96k" },
                    { month: "Dec", val: 100, label: "$100k" },
                  ]
                    .slice(revenueRange === "3M" ? -3 : revenueRange === "6M" ? -6 : 0)
                    .map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <div
                          className="w-full bg-[#EA580C] hover:bg-[#C2410C] rounded-t-lg transition-all duration-300 relative"
                          style={{ height: `${item.val}%` }}
                        >
                          {/* Tooltip on hover */}
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#261E18] text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#786C5E]">{item.month}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Inventory Trends Line Chart (Right Column - 5 spans) */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#E6DED3] shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#261E18]">Inventory Trends</h3>
                  <p className="text-xs text-[#786C5E]">Stock levels by craft category</p>
                </div>
                {/* Legend */}
                <div className="flex items-center space-x-3 text-[10px] font-bold">
                  <span className="flex items-center space-x-1 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>In Stock</span>
                  </span>
                  <span className="flex items-center space-x-1 text-amber-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span>Low Stock</span>
                  </span>
                  <span className="flex items-center space-x-1 text-red-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    <span>Out of Stock</span>
                  </span>
                </div>
              </div>

              {/* Multi-line Trend SVG */}
              <div className="h-48 relative flex items-center justify-center pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#F0EBE1" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#F0EBE1" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="300" y2="100" stroke="#F0EBE1" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="300" y2="140" stroke="#E6DED3" />

                  {/* Green line: In Stock (~750-850) */}
                  <path
                    d="M 10 35 Q 80 30 150 25 T 290 28"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Orange line: Low Stock (~80-120) */}
                  <path
                    d="M 10 120 Q 80 125 150 122 T 290 124"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Red line: Out of Stock (~5-20) */}
                  <path
                    d="M 10 142 Q 80 144 150 141 T 290 143"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                </svg>

                <div className="absolute bottom-0 inset-x-0 flex justify-between text-[9px] text-[#8C7E6F] font-mono pt-1">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                </div>
              </div>
            </div>
          </div>

          {/* "Needs Attention" Table (Image 3) */}
          <div className="bg-white rounded-3xl border border-[#E6DED3] overflow-hidden shadow-sm">
            <div className="p-5 sm:px-6 bg-[#FAF7F2] border-b border-[#E6DED3] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif font-bold text-base text-[#261E18]">Needs Attention</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  4 critical items
                </span>
              </div>
              <button
                onClick={() => setActiveTab("products")}
                className="text-xs font-bold text-[#9C4221] hover:underline"
              >
                View All &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2]/60 text-[#8C7E6F] uppercase text-[10px] font-bold tracking-wider border-b border-[#F0EBE1]">
                  <tr>
                    <th className="py-3 px-6">SKU</th>
                    <th className="py-3 px-6">Product Name</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6">Current Stock</th>
                    <th className="py-3 px-6">Reorder Point</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE1]">
                  {[
                    { sku: "ET-TOY-001", name: "Etikoppaka Hand-Turned Balancing Acrobat", cat: "Wooden Toys", stock: 8, reorder: 25, status: "Low Stock", badge: "bg-amber-100 text-amber-800" },
                    { sku: "KL-TEX-004", name: "Srikalahasti Tree of Life Kalamkari Wall Panel", cat: "Handloom", stock: 3, reorder: 15, status: "Critical", badge: "bg-red-100 text-red-800" },
                    { sku: "BK-POT-002", name: "Bankura Terracotta Auspicious Festive Horse", cat: "Pottery", stock: 6, reorder: 20, status: "Low Stock", badge: "bg-amber-100 text-amber-800" },
                    { sku: "KP-WD-009", name: "Kondapalli Bullock Cart with Farmers Tableau", cat: "Wooden Toys", stock: 2, reorder: 12, status: "Critical", badge: "bg-red-100 text-red-800" },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-[#261E18]">{row.sku}</td>
                      <td className="py-3.5 px-6 font-medium text-[#261E18]">{row.name}</td>
                      <td className="py-3.5 px-6 text-[#786C5E]">{row.cat}</td>
                      <td className="py-3.5 px-6 font-bold text-[#9C4221]">{row.stock} units</td>
                      <td className="py-3.5 px-6 text-[#786C5E]">{row.reorder} units</td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${row.badge}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => showToast(`Replenishment batch order scheduled for ${row.name}`)}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D5C9B8] hover:bg-[#9C4221] hover:text-white hover:border-[#9C4221] font-semibold text-xs text-[#261E18] transition-all"
                        >
                          Replenish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* TAB CONTENT: 4. AI DEMAND FORECASTING (Image 4 InventoryInsight Style) */}
      {activeTab === "forecasting" && (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#2F6A4F] uppercase">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Demand Forecasting Suite (Gemini 2.0 Flash)</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#261E18] mt-1">
                Demand Forecasting
              </h2>
              <p className="text-xs text-[#786C5E] mt-0.5">
                Predictive machine learning models calibrated with cultural festival calendars and artisan batch capacities.
              </p>
            </div>
            <button
              onClick={() => showToast("AI demand weights and seasonal priors refreshed!")}
              className="px-4 py-2.5 rounded-xl border border-[#D5C9B8] bg-white hover:bg-stone-50 text-xs font-bold text-[#261E18] flex items-center space-x-2 self-start sm:self-auto shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recalibrate Model</span>
            </button>
          </div>

          {/* Top 3 Cards Grid (Image 4) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* 1. Big Forecast Accuracy Card (4 cols) */}
            <div className="md:col-span-4 bg-gradient-to-br from-[#10B981] to-[#059669] p-7 rounded-3xl text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="w-24 h-24 rounded-full bg-white/10 absolute -bottom-6 -right-6 pointer-events-none" />
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Forecast Accuracy</p>
                <p className="font-serif text-6xl font-bold text-white tracking-tight">94%</p>
              </div>
              <div className="pt-4 border-t border-white/20 text-xs text-emerald-100 flex items-center justify-between">
                <span>Mean Absolute Error (MAPE): 5.8%</span>
                <span className="font-bold">High Precision</span>
              </div>
            </div>

            {/* 2. What's Driving Demand (4 cols) */}
            <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#261E18]">What&apos;s Driving Demand</h3>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">+40% Max</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-[#261E18] mb-1">
                    <span>Diwali & Festive Gifting</span>
                    <span className="text-emerald-600 font-bold">+40%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold text-[#261E18] mb-1">
                    <span>Wedding Season Orders</span>
                    <span className="text-emerald-600 font-bold">+25%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[60%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold text-[#261E18] mb-1">
                    <span>Direct Buyer Custom Inquiries</span>
                    <span className="text-emerald-600 font-bold">+18%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[45%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. What's Reducing Demand (4 cols) */}
            <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-[#E6DED3] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#261E18]">What&apos;s Reducing Demand</h3>
                <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">-15% Impact</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-[#261E18] mb-1">
                    <span>Raw Material Stockouts</span>
                    <span className="text-red-600 font-bold">-15%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full w-[50%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold text-[#261E18] mb-1">
                    <span>Monsoon Dispatch Bottlenecks</span>
                    <span className="text-red-600 font-bold">-8%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full w-[30%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold text-[#261E18] mb-1">
                    <span>Finished Product Price Adjustments</span>
                    <span className="text-amber-700 font-bold">-5%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full w-[20%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Forecast vs Actual Chart with Tooltip (Image 4) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6DED3] shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#261E18]">Demand Trajectory: Forecast vs. Actual</h3>
                <p className="text-xs text-[#786C5E]">Click or hover over any month to view verified AI causal factors</p>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-4 text-xs font-bold">
                <span className="flex items-center space-x-1.5 text-emerald-800">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                  <span>Actual Sales</span>
                </span>
                <span className="flex items-center space-x-1.5 text-emerald-600">
                  <span className="w-4 h-0.5 border-b-2 border-dashed border-emerald-500 inline-block" />
                  <span>AI Forecast</span>
                </span>
              </div>
            </div>

            {/* Time-Series Canvas */}
            <div className="relative pt-8 pb-4">
              {/* Floating Tooltip Card (Image 4 Exact Layout) */}
              {showTooltip && (
                <div
                  className="absolute z-20 bg-white rounded-2xl border border-stone-200 shadow-2xl p-4 w-72 text-xs space-y-2 pointer-events-auto animate-in fade-in zoom-in-95"
                  style={{
                    left: `${Math.min(75, Math.max(10, (activeForecastMonth / 8) * 85))}%`,
                    top: "-25px"
                  }}
                >
                  <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-1.5">
                    <span className="font-bold text-[#261E18]">
                      {[
                        "January 2026", "February 2026", "March 2026", "April 2026",
                        "May 2026", "June 2026", "July 2026", "August 2026", "September 2026"
                      ][activeForecastMonth]}
                    </span>
                    <button
                      onClick={() => setShowTooltip(false)}
                      className="text-stone-400 hover:text-stone-700 text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#8C7E6F] uppercase">Forecasted:</span>
                      <p className="font-serif font-bold text-emerald-700 text-sm">
                        {[310, 370, 451, 420, 430, 480, 530, 570, 650][activeForecastMonth]} units
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8C7E6F] uppercase">Actual Sales:</span>
                      <p className="font-serif font-bold text-[#261E18] text-sm">
                        {[320, 380, 462, 410, 440, 490, 520, 580, 640][activeForecastMonth]} units
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#F0EBE1] space-y-1 text-[11px]">
                    <span className="font-bold text-[#786C5E] uppercase text-[10px]">Explanation:</span>
                    <div className="text-emerald-700 font-medium flex items-center space-x-1">
                      <span>▲ Festive & Wedding Surge: Increased demand by +40%</span>
                    </div>
                    <div className="text-red-600 font-medium flex items-center space-x-1">
                      <span>▼ Raw Material Stockout: Reduced fulfillment by -10%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Chart SVG */}
              <div className="h-56 relative flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
                  {/* Grid Lines */}
                  {[30, 70, 110, 150, 190].map((y, idx) => (
                    <line key={idx} x1="30" y1={y} x2="770" y2={y} stroke="#F0EBE1" strokeDasharray="3 3" />
                  ))}

                  {/* Gradient Area under curve */}
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 50 160 Q 140 140 230 70 T 410 110 T 590 60 T 750 30 L 750 190 L 50 190 Z"
                    fill="url(#forecastGrad)"
                  />

                  {/* Actual Sales Line (Solid Emerald) */}
                  <path
                    d="M 50 160 Q 140 140 230 70 T 410 110 T 590 60 T 750 30"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Forecast Line (Dashed Emerald) */}
                  <path
                    d="M 50 165 Q 140 145 230 78 T 410 105 T 590 65 T 750 25"
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    strokeLinecap="round"
                  />

                  {/* Interactive Month Dots */}
                  {[
                    { x: 50, y: 160, m: 0 },
                    { x: 140, y: 140, m: 1 },
                    { x: 230, y: 70, m: 2 },
                    { x: 320, y: 100, m: 3 },
                    { x: 410, y: 110, m: 4 },
                    { x: 500, y: 80, m: 5 },
                    { x: 590, y: 60, m: 6 },
                    { x: 670, y: 45, m: 7 },
                    { x: 750, y: 30, m: 8 },
                  ].map((pt) => (
                    <g
                      key={pt.m}
                      onClick={() => {
                        setActiveForecastMonth(pt.m);
                        setShowTooltip(true);
                      }}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={activeForecastMonth === pt.m ? 7 : 5}
                        fill="#059669"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        className="transition-all hover:scale-125"
                      />
                      {activeForecastMonth === pt.m && (
                        <circle cx={pt.x} cy={pt.y} r="12" fill="#10B981" opacity="0.3" />
                      )}
                    </g>
                  ))}
                </svg>

                {/* X Axis Labels */}
                <div className="absolute bottom-0 inset-x-8 flex justify-between text-[11px] font-semibold text-[#8C7E6F]">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((month, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveForecastMonth(idx);
                        setShowTooltip(true);
                      }}
                      className={`hover:text-[#261E18] transition-colors ${
                        activeForecastMonth === idx ? "font-bold text-[#059669]" : ""
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Forecast Accuracy & Projections Table (Image 4) */}
          <div className="bg-white rounded-3xl border border-[#E6DED3] overflow-hidden shadow-sm">
            <div className="p-5 sm:px-6 bg-[#FAF7F2] border-b border-[#E6DED3] flex items-center justify-between text-xs">
              <span className="font-bold text-[#261E18]">Product Catalog Predictive Calibration</span>
              <span className="text-[#2F6A4F] font-semibold">Gemini Multi-Variate Confidence: 94%</span>
            </div>

            <div className="divide-y divide-[#F0EBE1] text-xs">
              {[
                { name: "Etikoppaka Hand-Turned Balancing Acrobat Toy", cat: "Wooden Toys", accuracy: 94, curStock: 35, predDemand: 68, safety: 20, risk: "High", badge: "bg-amber-100 text-amber-800" },
                { name: "Etikoppaka Wooden Toy Train Set (5 Carriages)", cat: "Wooden Toys", accuracy: 97, curStock: 18, predDemand: 45, safety: 15, risk: "Critical", badge: "bg-red-100 text-red-800" },
                { name: "Srikalahasti Tree of Life Kalamkari Wall Panel", cat: "Handloom", accuracy: 92, curStock: 12, predDemand: 28, safety: 10, risk: "High", badge: "bg-amber-100 text-amber-800" },
                { name: "Bankura Terracotta Auspicious Festive Horse", cat: "Pottery", accuracy: 96, curStock: 40, predDemand: 52, safety: 12, risk: "Low", badge: "bg-emerald-100 text-emerald-800" },
              ].map((p, idx) => (
                <div key={idx} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-serif font-bold text-sm text-[#261E18]">{p.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        {p.accuracy}% Accuracy
                      </span>
                    </div>
                    <p className="text-[#786C5E]">
                      Current Stock: <strong>{p.curStock} units</strong> • Category: {p.cat}
                    </p>
                  </div>

                  <div className="flex items-center space-x-6 text-right">
                    <div>
                      <p className="text-[10px] text-[#8C7E6F] uppercase">Expected Demand</p>
                      <p className="font-serif text-lg font-bold text-[#9C4221]">{p.predDemand} units</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8C7E6F] uppercase">Suggested Safety Stock</p>
                      <p className="font-bold text-[#261E18]">+{p.safety} units</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.badge}`}>
                      {p.risk.toUpperCase()} RISK
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

