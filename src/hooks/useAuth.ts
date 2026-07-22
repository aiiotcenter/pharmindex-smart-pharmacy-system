"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthUser {
  userId: number;
  username: string;
  name: string;
  surname: string;
  email: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();
      setUser(data.users?.[0] ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    document.cookie = "auth_token=; path=/; max-age=0";
    setUser(null);
    router.push("/login");
  }, [router]);

  return { user, loading, refresh, logout };
}
