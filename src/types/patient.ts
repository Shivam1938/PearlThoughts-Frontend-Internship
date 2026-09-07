export type PatientProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  heightCm: number;
  weightKg: number;
  bloodGroup: string;
  medicalConditions: string[];
  allergies: string[];
  currentMedications: string[];
  insuranceProvider: string;
  insurancePolicyNumber: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
};

export type PatientProfileFields = Omit<PatientProfile, "id">;
