"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { AuthResponse, UserProfile } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    router.push(data.user.role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
    return data;
  }, [router]);

  const register = useCallback(async (payload: {
    email: string;
    password: string;
    name: string;
    organizationName?: string;
  }) => {
    const body = { ...payload };
    if (!body.organizationName?.trim()) delete body.organizationName;
    const { data } = await api.post<AuthResponse>("/auth/register", body);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    router.push("/dashboard");
    return data;
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }, [router]);

  return { user, loading, login, register, logout };
}
