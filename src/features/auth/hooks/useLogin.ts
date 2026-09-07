"use client";

import { useState } from "react";
import { login } from "@/features/auth/api/login";
import { useAuth } from "@/features/auth/hooks/auth-context";
import { saveSession } from "@/features/auth/session";
import type { User } from "@/features/auth/types";

type LoginState = {
  isLoading: boolean;
  error: string | null;
  user: User | null;
};

export function useLogin() {
  const { setSession } = useAuth();
  const [state, setState] = useState<LoginState>({ isLoading: false, error: null, user: null });

  async function submit(email: string, password: string): Promise<boolean> {
    setState({ isLoading: true, error: null, user: null });

    try {
      const session = await login(email, password);
      saveSession(session);
      setSession(session);
      const user: User = session.user;
      setState({ isLoading: false, error: null, user });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to log in";
      setState({ isLoading: false, error: message, user: null });
      return false;
    }
  }

  return { ...state, submit };
}