import type { DoctorProfileFields, DoctorUser } from "@/features/doctor/types";

type ProfileResponse = { doctor: DoctorUser };

export async function updateDoctorProfile(id: string, profile: DoctorProfileFields): Promise<DoctorUser> {
  const response = await fetch("/api/doctor/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...profile }) });
  const body: unknown = await response.json();
  if (!response.ok) throw new Error(typeof body === "object" && body !== null && typeof (body as { error?: unknown }).error === "string" ? (body as { error: string }).error : "Unable to save your profile");
  if (typeof body !== "object" || body === null || typeof (body as ProfileResponse).doctor !== "object" || (body as ProfileResponse).doctor === null) throw new Error("Profile response was invalid");
  return (body as ProfileResponse).doctor;
}
