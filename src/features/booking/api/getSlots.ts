import type { Slot } from "@/types/slot";

type SlotsResponse = {
  data: Slot[];
};

function isSlotsResponse(value: unknown): value is SlotsResponse {
  return typeof value === "object" && value !== null && Array.isArray((value as { data?: unknown }).data);
}

export async function getSlots(doctorId: string): Promise<Slot[]> {
  const response = await fetch(`/api/doctors/${doctorId}/slots`, { cache: "no-store" });
  const body: unknown = await response.json();

  if (!response.ok) throw new Error("Unable to load available slots");
  if (!isSlotsResponse(body)) throw new Error("Slot data was invalid");

  return body.data;
}
