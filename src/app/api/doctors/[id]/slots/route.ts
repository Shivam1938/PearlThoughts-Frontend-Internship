import { slots } from "@/lib/mock-data/slots";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const doctorSlots = slots.filter((slot) => slot.doctorId === id);

  return Response.json({
    data: doctorSlots,
    meta: { total: doctorSlots.length },
  });
}
