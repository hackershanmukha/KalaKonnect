"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Store,
  Calendar,
  AlertCircle,
  Mail,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { fetchApi } from "@/lib/api";

function CustomerOrdersContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const placedOrderNumber = searchParams.get("placed");
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"orders" | "inquiries">(
    tabParam === "inquiries" ? "inquiries" : "orders"
  );

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersData, inqsData] = await Promise.all([
          fetchApi("/orders/my-orders").catch(() => []),
          fetchApi("/stores/customer/my-inquiries").catch(() => [])
        ]);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setInquiries(Array.isArray(inqsData) ? inqsData : []);
      } catch (err) {
        console.error("Orders/Inquiries load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">Received by Artisan</span>;
      case "accepted":
        return <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">Order Accepted</span>;
      case "in_production":
        return <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">Handcrafting in Progress</span>;
      case "ready_for_dispatch":
        return <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">Quality Checked & Packed</span>;
      case "shipped":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">In Transit with Courier</span>;
      case "delivered":
        return <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold border border-green-300">Delivered</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold">{status}</span>;
    }
  };

  const repliedInquiriesCount = inquiries.filter((i) => i.artisan_reply || i.status === "replied").length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {placedOrderNumber && (
        <div className="p-6 rounded-3xl bg-[#2F6A4F] text-white shadow-xl flex items-start space-x-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-300 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-serif text-xl font-bold">Order Confirmed Successfully!</h2>
            <p className="text-xs text-emerald-100 mt-1">
              Order <span className="font-mono font-bold text-white">#{placedOrderNumber}</span> has been dispatched to the master artisan workshop. A notification and production timeline have been created.
            </p>
          </div>
        </div>
      )}

      {/* Page Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#261E18]">Your Purchases & Artisan Inquiries</h1>
          <p className="text-xs text-[#786C5E] mt-1">
            Track workshop order production milestones and view direct responses from master craftsmen.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-stone-100 p-1.5 rounded-2xl border border-[#E6DED3] self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === "orders"
                ? "bg-white text-[#261E18] shadow-sm"
                : "text-[#786C5E] hover:text-[#261E18]"
            }`}
          >
            <Package className="w-4 h-4 text-[#9C4221]" />
            <span>Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === "inquiries"
                ? "bg-white text-[#261E18] shadow-sm"
                : "text-[#786C5E] hover:text-[#261E18]"
            }`}
          >
            <Mail className="w-4 h-4 text-[#2F6A4F]" />
            <span>Artisan Replies ({inquiries.length})</span>
            {repliedInquiriesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold ml-1">
                {repliedInquiriesCount} replied
              </span>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#9C4221] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-[#786C5E]">Retrieving your account data...</p>
        </div>
      ) : activeTab === "orders" ? (
        /* TAB 1: ORDERS */
        orders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E6DED3] space-y-3">
            <Package className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#261E18]">No Orders Placed Yet</h3>
            <p className="text-xs text-[#786C5E]">Browse the marketplace to discover authentic Indian handicrafts.</p>
            <div className="pt-2">
              <Link
                href="/marketplace?tab=products"
                className="inline-block px-5 py-2.5 rounded-xl bg-[#9C4221] text-white text-xs font-semibold"
              >
                Explore Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#E6DED3] shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-5 sm:px-6 bg-[#FAF7F2] border-b border-[#E6DED3] flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-[#8C7E6F]">Order Number:</span>{" "}
                    <span className="font-mono font-bold text-[#261E18]">{order.order_number || order.id || "KC-ORDER"}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Store className="w-4 h-4 text-[#9C4221]" />
                    <span className="font-semibold text-[#261E18]">{order.store_name || "Authentic Artisan Workshop"}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(order.status || "new")}
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-6 space-y-4">
                  <div className="divide-y divide-[#F0EBE1]">
                    {(Array.isArray(order.items) ? order.items : []).map((item: any, idx: number) => {
                      const unitPrice = Number(item.unit_price || item.product_price || 0);
                      const quantity = Number(item.quantity || 1);
                      const totalPrice = Number(item.total_price || (unitPrice * quantity) || 0);
                      return (
                        <div key={item.id || idx} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-serif font-bold text-sm text-[#261E18]">
                              {item.product_name || "Handcrafted Craft Piece"}
                            </p>
                            <p className="text-[11px] text-[#786C5E] mt-0.5">
                              Quantity: {quantity} × ₹{unitPrice.toLocaleString("en-IN")}
                            </p>
                            {item.customization_notes && (
                              <p className="text-[11px] text-[#9C4221] italic mt-0.5">
                                Custom notes: {item.customization_notes}
                              </p>
                            )}
                          </div>
                          <span className="font-bold text-[#261E18] font-serif">
                            ₹{totalPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tracking Milestones */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DED3] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#615447]">
                      <span className="flex items-center space-x-1.5 font-semibold text-[#261E18]">
                        <Calendar className="w-4 h-4 text-[#9C4221]" />
                        <span>Estimated Workshop Dispatch:</span>
                      </span>
                      <span className="font-bold text-[#9C4221]">
                        {order.estimated_dispatch_date
                          ? (() => {
                              try {
                                const d = new Date(order.estimated_dispatch_date);
                                return isNaN(d.getTime()) ? "7 Days Handcrafting Period" : d.toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                });
                              } catch {
                                return "7 Days Handcrafting Period";
                              }
                            })()
                          : "7 Days Handcrafting Period"}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#786C5E]">
                      Delivery to: {order.delivery_address || "Shipping address on file"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#F0EBE1] text-xs">
                    <span className="text-[#8C7E6F]">
                      Payment Mode: <strong className="text-emerald-700 uppercase">{order.payment_method || "UPI / Card"}</strong> ({order.payment_status || "simulated_paid"})
                    </span>
                    <div className="text-right">
                      <span className="text-xs text-[#8C7E6F]">Total Paid: </span>
                      <span className="font-serif text-lg font-bold text-[#9C4221]">
                        ₹{Number(order.total_amount ?? 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* TAB 2: INQUIRIES & ARTISAN REPLIES */
        inquiries.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E6DED3] space-y-3">
            <Mail className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#261E18]">No Inquiries Sent Yet</h3>
            <p className="text-xs text-[#786C5E]">
              You can search for any verified artisan using the top searchbar and click &quot;Contact&quot; to ask about custom designs, dimensions, or festival orders.
            </p>
            <div className="pt-2">
              <Link
                href="/marketplace?tab=stores"
                className="inline-block px-5 py-2.5 rounded-xl bg-[#9C4221] text-white text-xs font-semibold"
              >
                Browse Artisan Studios
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {inquiries.map((inq) => {
              const hasReplied = Boolean(inq.artisan_reply || inq.status === "replied");

              return (
                <div
                  key={inq.id}
                  className="bg-white rounded-3xl border border-[#E6DED3] shadow-sm overflow-hidden space-y-4 p-6"
                >
                  {/* Inquiry Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#F0EBE1] pb-3">
                    <div className="flex items-center space-x-2">
                      <Store className="w-4 h-4 text-[#9C4221]" />
                      <span className="font-bold text-sm text-[#261E18]">
                        {inq.store_name}
                      </span>
                      <span className="text-[#786C5E]">• {inq.artisan_name}</span>
                      <span className="text-[11px] text-[#9C4221] font-semibold bg-[#9C4221]/10 px-2 py-0.5 rounded-full">
                        {inq.craft_category || inq.region}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-[#8C7E6F] font-mono">{inq.created_at}</span>
                      {hasReplied ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-300 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Artisan Replied</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-300 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Awaiting Workshop Reply</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer's Original Message */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-[#786C5E] uppercase tracking-wider">
                      Your Message / Custom Requirement:
                    </div>
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] text-xs text-[#261E18] font-medium leading-relaxed whitespace-pre-line border border-[#E6DED3]">
                      &ldquo;{inq.message}&rdquo;
                    </div>
                  </div>

                  {/* Master Artisan's Reply */}
                  {hasReplied ? (
                    <div className="p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs text-[#261E18] space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                        <span className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Direct Response from Master Artisan ({inq.artisan_name}):</span>
                        </span>
                        {inq.replied_at && (
                          <span className="font-mono text-emerald-700 font-medium text-[11px]">{inq.replied_at}</span>
                        )}
                      </div>
                      <div className="p-3.5 bg-white rounded-xl border border-emerald-100 text-stone-900 font-medium leading-relaxed whitespace-pre-line shadow-sm">
                        &ldquo;{inq.artisan_reply}&rdquo;
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-emerald-700 flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified craft correspondence with GI authentic workshop</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/store/${inq.store_slug || "etikoppaka-wooden-crafts"}`}
                            className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-semibold transition-colors"
                          >
                            Visit Artisan Store
                          </Link>
                          <Link
                            href={`/store/${inq.store_slug || "etikoppaka-wooden-crafts"}?inquire=true`}
                            className="px-3.5 py-1.5 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white text-xs font-bold transition-colors flex items-center space-x-1 shadow-sm"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Reply / Message Again</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          Master craftsman <strong>{inq.artisan_name}</strong> has received your inquiry. Artisans generally reply within 24-48 hours with craft availability and custom turnaround.
                        </span>
                      </div>
                      <Link
                        href={`/store/${inq.store_slug || "etikoppaka-wooden-crafts"}`}
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-semibold shrink-0"
                      >
                        Visit Storefront
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class OrdersErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Orders ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto my-20 p-8 bg-white rounded-3xl border border-[#E6DED3] text-center space-y-4 shadow-sm">
          <Package className="w-12 h-12 text-[#9C4221] mx-auto" />
          <h2 className="font-serif text-xl font-bold text-[#261E18]">Orders & Purchases</h2>
          <p className="text-xs text-[#786C5E]">
            Your artisan order was registered successfully. Click below to view your orders list or continue browsing.
          </p>
          <div className="flex justify-center space-x-3 pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/orders";
              }}
              className="px-5 py-2.5 rounded-xl bg-[#9C4221] text-white text-xs font-semibold hover:bg-[#7B341E] transition-colors"
            >
              Refresh Orders
            </button>
            <Link
              href="/marketplace?tab=products"
              className="px-5 py-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] text-[#4A3E31] text-xs font-semibold hover:bg-stone-100 transition-colors"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function CustomerOrdersPage() {
  return (
    <OrdersErrorBoundary>
      <Suspense fallback={<div className="py-24 text-center text-xs text-stone-500">Loading orders & inquiries...</div>}>
        <CustomerOrdersContent />
      </Suspense>
    </OrdersErrorBoundary>
  );
}
