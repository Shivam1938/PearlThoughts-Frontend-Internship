export type DoctorAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  phone: string;
  clinicAddress: string;
  bio: string;
  profileImage: string;
};

export type DoctorRegistrationRequest = Omit<DoctorAccount, "id">;

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
