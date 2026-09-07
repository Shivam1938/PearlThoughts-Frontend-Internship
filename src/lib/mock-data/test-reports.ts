export type TestReport = {
  id: string;
  patientId: string;
  name: string;
  date: string;
};

export const testReports: TestReport[] = [
  { id: "report-1", patientId: "user-001", name: "Complete Blood Count", date: "2026-08-29" },
  { id: "report-2", patientId: "user-001", name: "Allergy Panel", date: "2026-08-30" },
];
