"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Store,
  ShoppingBag,
  ArrowRight,
  User,
  Mail,
  Lock,
  Phone
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone_number: phone,
          password,
          role,
        }),
      });

      // Login after registration
      const user = await login(email, password);
      if (role === "vendor") {
        router.push("/vendor/onboarding");
      } else {
        router.push("/marketplace");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
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
            Join KalaConnect AI
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

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          {/* Role Selector */}
          <div>
            <label className="block text-[#4A3E31] font-semibold mb-1.5">I want to join as:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  role === "customer"
                    ? "border-[#9C4221] bg-[#FAF7F2] text-[#9C4221] font-bold"
                    : "border-[#E6DED3] text-[#615447] hover:bg-stone-50"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Customer / Buyer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  role === "vendor"
                    ? "border-[#9C4221] bg-[#FAF7F2] text-[#9C4221] font-bold"
                    : "border-[#E6DED3] text-[#615447] hover:bg-stone-50"
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Artisan / Vendor</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#4A3E31] font-semibold mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-[#8C7E6F]" />
              <input
                type="text"
                required
                placeholder="Ramesh Varma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4A3E31] font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#8C7E6F]" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4A3E31] font-semibold mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#8C7E6F]" />
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#9C4221]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4A3E31] font-semibold mb-1">Create Password</label>
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
            <span>{loading ? "Creating Account..." : "Register Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#786C5E] pt-2">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#9C4221] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

