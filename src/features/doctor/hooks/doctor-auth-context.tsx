"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { clearDoctorSession, loadDoctorSession, saveDoctorSession, type DoctorSession } from "@/features/doctor/session";
import type { DoctorUser } from "@/features/doctor/types";

type DoctorAuthContextValue = {
  doctor: DoctorUser | null;
  isReady: boolean;
  setSession: (session: DoctorSession) => void;
  updateDoctor: (doctor: DoctorUser) => void;
  logout: () => void;
};

const DoctorAuthContext = createContext<DoctorAuthContextValue | undefined>(undefined);

export function DoctorAuthProvider({ children }: { children: ReactNode }) {
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const session = loadDoctorSession();
      if (session) setDoctor(session.doctor);
      setIsReady(true);
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  function setSession(session: DoctorSession): void {
    setDoctor(session.doctor);
  }

  function updateDoctor(nextDoctor: DoctorUser): void {
    const session = loadDoctorSession();
    if (session) saveDoctorSession({ ...session, doctor: nextDoctor });
    setDoctor(nextDoctor);
  }

  function logout(): void {
    clearDoctorSession();
    setDoctor(null);
  }

  return <DoctorAuthContext.Provider value={{ doctor, isReady, setSession, updateDoctor, logout }}>{children}</DoctorAuthContext.Provider>;
}

export function useDoctorAuth(): DoctorAuthContextValue {
  const context = useContext(DoctorAuthContext);
  if (!context) throw new Error("useDoctorAuth must be used within DoctorAuthProvider");
  return context;
}
