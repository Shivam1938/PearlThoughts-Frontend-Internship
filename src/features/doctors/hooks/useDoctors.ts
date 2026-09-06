"use client";

import { useEffect, useState } from "react";
import { getDoctors } from "@/features/doctors/api/getDoctors";
import { loadDirectoryDoctors } from "@/features/doctor/directory";
import type { Doctor } from "@/types/doctor";

type DoctorsState = {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
};

export function useDoctors(): DoctorsState {
  const [state, setState] = useState<DoctorsState>({
    doctors: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isActive = true;

    getDoctors()
      .then((doctors) => {
        if (isActive) {
          const allDoctors = [...doctors, ...loadDirectoryDoctors()];
          setState({ doctors: allDoctors.filter((doctor, index) => allDoctors.findIndex((item) => item.id === doctor.id) === index), isLoading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setState({
          doctors: [],
          isLoading: false,
          error: error instanceof Error ? error.message : "Unable to load doctors",
        });
      });

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
