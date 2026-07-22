"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthModal } from "@/components/auth-modal";

export interface CurrentUser {
  id: number;
  username: string;
  emoji: string;
  rating: number;
}

interface UserCtx {
  user: CurrentUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setCurrent: (u: CurrentUser) => void;
  openAuth: (mode?: "login" | "signup") => void;
}

const Ctx = createContext<UserCtx>({
  user: null,
  loading: true,
  refresh: async () => {},
  setCurrent: () => {},
  openAuth: () => {},
});

export function useUser() {
  return useContext(Ctx);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const setCurrent = useCallback((u: CurrentUser) => {
    setUser(u);
    setLoading(false);
  }, []);

  const openAuth = useCallback((mode: "login" | "signup" = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return (
    <Ctx.Provider value={{ user, loading, refresh, setCurrent, openAuth }}>
      {children}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} key={authMode} initialMode={authMode} />
    </Ctx.Provider>
  );
}
