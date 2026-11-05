"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  Store,
  ShoppingBag,
  ArrowRight,
  Lock,
  Mail
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      if (user.roles.includes("admin")) {
        router.push("/admin/dashboard");
      } else if (user.roles.includes("vendor")) {
        router.push("/vendor/dashboard");
      } else {
        router.push("/marketplace");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, redirectPath: string) => {
    setLoading(true);
    setError(null);
    try {
      await loginAsDemo(demoEmail);
      router.push(redirectPath);
    } catch (err: any) {
      setError("Demo login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-[#E6DED3] shadow-lg">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9C4221] to-[#7B341E] text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-6 h-6 text-[#FCD34D]" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#261E18]">
            Sign in to KalaConnect
          </h2>
          <p className="text-xs text-[#786C5E]">
            Authentic Crafts • Verified Artisans • Unique Discoveries
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#4A3E31] font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#8C7E6F]" />
              <input
                type="email"
                required
                placeholder="name@artisan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4A3E31] font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#8C7E6F]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#9C4221] hover:bg-[#7B341E] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Platform"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="pt-4 border-t border-[#E6DED3] space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C7E6F] text-center">
            Or 1-Click Login as Seeded Demo Account
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin("admin@kalaconnect.ai", "/admin/dashboard")}
              className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-semibold flex items-center space-x-1.5 justify-center transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin</span>
            </button>

            <button
              onClick={() => handleDemoLogin("ramesh@etikoppaka.com", "/vendor/dashboard")}
              className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold flex items-center space-x-1.5 justify-center transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-[#9C4221]" />
              <span>Artisan</span>
            </button>

            <button
              onClick={() => handleDemoLogin("lakshmi@kalamkari.com", "/vendor/dashboard")}
              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-semibold flex items-center space-x-1.5 justify-center transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-[#2F6A4F]" />
              <span>Textile Studio</span>
            </button>

            <button
              onClick={() => handleDemoLogin("priya@customer.com", "/marketplace")}
              className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-[#D5C9B8] text-[#261E18] font-semibold flex items-center space-x-1.5 justify-center transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#4A3E31]" />
              <span>Customer</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#786C5E]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-[#9C4221] hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

