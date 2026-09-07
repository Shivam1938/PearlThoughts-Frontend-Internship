import type { Doctor } from "@/types/doctor";

type DoctorsResponse = {
  data: Doctor[];
};

function isDoctorsResponse(value: unknown): value is DoctorsResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { data?: unknown }).data)
  );
}

export async function getDoctors(): Promise<Doctor[]> {
  const response = await fetch("/api/doctors", { cache: "no-store" });
  const body: unknown = await response.json();

  if (!response.ok) throw new Error("Unable to load doctors");
  if (!isDoctorsResponse(body)) throw new Error("Doctor data was invalid");

  return body.data;
}
