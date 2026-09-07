import { testReports } from "@/lib/mock-data/test-reports";

export async function GET(request: Request) {
  const patientId = new URL(request.url).searchParams.get("patientId");
  const data = testReports.filter((report) => !patientId || report.patientId === patientId);
  return Response.json({ data, meta: { total: data.length } });
}
