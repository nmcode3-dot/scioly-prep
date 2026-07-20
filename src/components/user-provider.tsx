"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import {
  getCurrent,
  type PublicAccount,
} from "@/lib/account";

interface UserCtx {
  user: PublicAccount | null;
  loading: boolean;
  refresh: () => void;
  openAuth: (mode?: "login" | "signup") => void;
}

const Ctx = createContext<UserCtx>({
  user: null,
  loading: true,
  refresh: () => {},
  openAuth: () => {},
});

export function useUser() {
  return useContext(Ctx);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const refresh = useCallback(() => {
    setUser(getCurrent());
    setLoading(false);
  }, []);

  const openAuth = useCallback((mode: "login" | "signup" = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    const onFocus = () => refresh();
    window.addEventListener("scioly-account-change", onChange);
    window.addEventListener("storage", onChange);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("scioly-account-change", onChange);
      window.removeEventListener("storage", onChange);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return (
    <Ctx.Provider value={{ user, loading, refresh, openAuth }}>
      {children}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        key={authMode}
        initialMode={authMode}
      />
    </Ctx.Provider>
  );
}
