"use client";

import { useState } from "react";
import { loginDoctor } from "@/features/doctor/api/login";
import { useDoctorAuth } from "@/features/doctor/hooks/doctor-auth-context";
import { saveDoctorSession } from "@/features/doctor/session";

export function useDoctorLogin() {
  const { setSession } = useDoctorAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(email: string, password: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const session = await loginDoctor(email, password);
      saveDoctorSession(session);
      setSession(session);
      return true;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to log in to the Doctor Portal");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, error, submit };
}
