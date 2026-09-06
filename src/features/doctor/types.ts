export type DoctorAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  age: number;
  phone: string;
  clinicAddress: string;
  bio: string;
  profileImage: string;
  licenseDocument: string;
};

export type DoctorRegistrationRequest = Omit<DoctorAccount, "id" | "profileImage" | "age" | "licenseDocument">;

export type DoctorRegistrationResponse = {
  doctor: Omit<DoctorAccount, "password">;
};

export type DoctorUser = Omit<DoctorAccount, "password">;

export type DoctorLoginRequest = {
  email: string;
  password: string;
};

export type DoctorLoginResponse = {
  doctor: DoctorUser;
  token: string;
};

export type DoctorRegistrationFormErrors = Partial<Record<keyof DoctorRegistrationRequest | "confirmPassword", string>>;

export type DoctorProfileFields = Pick<DoctorUser, "name" | "email" | "specialization" | "qualification" | "experienceYears" | "age" | "phone" | "clinicAddress" | "bio" | "profileImage" | "licenseDocument">;

export type DoctorAvailabilitySlot = {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrenceRule?: { frequency: "weekly"; daysOfWeek: number[]; endDate: string };
  status: "available" | "booked";
  appointmentId?: string;
};
