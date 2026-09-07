export type Medicine = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
};

export type Prescription = {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  medicines: Medicine[];
  instructions: string;
  createdAt: string;
  updatedAt: string;
};

export type PrescriptionFormValues = Pick<Prescription, "diagnosis" | "instructions" | "medicines">;
