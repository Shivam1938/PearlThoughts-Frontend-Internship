import { availabilitySlots } from "@/lib/mock-data/availability";

export async function GET(request: Request) {
  const doctorId = new URL(request.url).searchParams.get("doctorId");
  const data = doctorId ? availabilitySlots.filter((slot) => slot.doctorId === doctorId) : [];
  return Response.json({ data, meta: { total: data.length } });
}
