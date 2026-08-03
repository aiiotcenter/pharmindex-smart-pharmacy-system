"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ViewMode } from "@/lib/roles";
import type { User } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  viewMode: ViewMode | null;
  isAdmin: boolean;
  isDoctor: boolean;
  isPatientView: boolean;
  refresh: () => Promise<void>;
  switchViewMode: (mode: ViewMode) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        setUser(null);
        setViewMode(null);
        return;
      }
      const data = await response.json();
      setUser(data.user ?? null);
      setViewMode(data.viewMode ?? null);
    } catch {
      setUser(null);
      setViewMode(null);
    } finally {
      setLoading(false);
    }
  };

  const switchViewMode = async (mode: ViewMode) => {
    const response = await fetch("/api/auth/view-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    if (!response.ok) {
      throw new Error("switch failed");
    }
    const data = await response.json();
    setViewMode(data.viewMode ?? mode);
    await refresh();
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      viewMode,
      isAdmin: user?.roleId === 1 && viewMode !== "USER",
      isDoctor: user?.roleId === 2 && viewMode !== "USER",
      isPatientView:
        user?.roleId === 3 ||
        ((user?.roleId === 1 || user?.roleId === 2) && viewMode === "USER"),
      refresh,
      switchViewMode,
    }),
    [user, loading, viewMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
