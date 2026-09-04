import { doctors } from "@/lib/mock-data/doctors";

export async function GET() {
  return Response.json({
    data: doctors,
    meta: { total: doctors.length },
  });
}
