"use client";

import { useState } from "react";
import { signup } from "@/features/auth/api/signup";
import { saveSession } from "@/features/auth/session";
import { useAuth } from "@/features/auth/hooks/auth-context";
import type { User } from "@/features/auth/types";

type SignupState = {
  isLoading: boolean;
  error: string | null;
  user: User | null;
};

export function useSignup() {
  const { setSession } = useAuth();
  const [state, setState] = useState<SignupState>({ isLoading: false, error: null, user: null });

  async function submit(name: string, email: string, password: string): Promise<boolean> {
    setState({ isLoading: true, error: null, user: null });

    try {
      const session = await signup(name, email, password);
      saveSession(session);
      setSession(session);
      setState({ isLoading: false, error: null, user: session.user });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create account";
      setState({ isLoading: false, error: message, user: null });
      return false;
    }
  }

  return { ...state, submit };
}