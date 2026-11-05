"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  roles: string[];
  has_store: boolean;
  store_id?: string;
  store_slug?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  cartCount: number;
  login: (email: string, pass: string) => Promise<UserProfile>;
  loginAsDemo: (accountEmail: string) => Promise<UserProfile>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = async () => {
    try {
      const cart = await fetchApi("/orders/cart");
      setCartCount(cart.item_count || 0);
    } catch {
      setCartCount(0);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await fetchApi("/auth/me");
      setUser(userData);
      await refreshCart();
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem("kalaconnect_token");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("kalaconnect_token");
    if (savedToken) {
      setToken(savedToken);
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    const data = await fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: pass }),
    });
    localStorage.setItem("kalaconnect_token", data.access_token);
    localStorage.setItem("kalaconnect_user_cache", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    await refreshCart();
    return data.user;
  };

  const loginAsDemo = async (accountEmail: string): Promise<UserProfile> => {
    const passwords: Record<string, string> = {
      "admin@kalaconnect.ai": "Admin@123",
      "ramesh@etikoppaka.com": "Artisan@123",
      "lakshmi@kalamkari.com": "Artisan@123",
      "suresh@kondapalli.com": "Artisan@123",
      "anita@terracotta.com": "Artisan@123",
      "biren@bamboo.com": "Artisan@123",
      "priya@customer.com": "Customer@123",
    };
    const pass = passwords[accountEmail] || "Artisan@123";
    return login(accountEmail, pass);
  };

  const logout = () => {
    localStorage.removeItem("kalaconnect_token");
    setToken(null);
    setUser(null);
    setCartCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        cartCount,
        login,
        loginAsDemo,
        logout,
        refreshUser,
        refreshCart,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

