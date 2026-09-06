"use client";

import { useState } from "react";
import { registerDoctor } from "@/features/doctor/api/register";
import type { DoctorRegistrationRequest } from "@/features/doctor/types";

export function useDoctorRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(request: DoctorRegistrationRequest): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      await registerDoctor(request);
      return true;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create your doctor account");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, error, submit };
}
