"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { clearSession, loadSession, type AuthSession } from "@/features/auth/session";
import type { User } from "@/features/auth/types";

type AuthContextValue = {
  user: User | null;
  isReady: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const session = loadSession();
      if (session) setUser(session.user);
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  function setSession(session: AuthSession): void {
    setUser(session.user);
  }

  function logout(): void {
    clearSession();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, isReady, setSession, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}