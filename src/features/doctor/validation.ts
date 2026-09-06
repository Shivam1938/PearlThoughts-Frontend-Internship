import type { DoctorRegistrationFormErrors } from "@/features/doctor/types";

type DoctorRegistrationFields = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  specialization: string;
  qualification: string;
  experienceYears: string;
  phone: string;
  clinicAddress: string;
  bio: string;
  profileImage: string;
};

export function validateDoctorRegistration(fields: DoctorRegistrationFields): DoctorRegistrationFormErrors {
  const errors: DoctorRegistrationFormErrors = {};

  if (!fields.name.trim()) errors.name = "Full name is required";
  if (!fields.email.trim()) errors.email = "Email is required";
  else if (!isValidEmail(fields.email)) errors.email = "Enter a valid email address";
  if (!fields.password) errors.password = "Password is required";
  else if (fields.password.length < 8) errors.password = "Password must be at least 8 characters";
  if (!fields.confirmPassword) errors.confirmPassword = "Please confirm your password";
  else if (fields.password !== fields.confirmPassword) errors.confirmPassword = "Passwords do not match";
  if (!fields.specialization.trim()) errors.specialization = "Specialization is required";
  if (!fields.qualification.trim()) errors.qualification = "Qualification is required";

  const years = Number(fields.experienceYears);
  if (!fields.experienceYears.trim()) errors.experienceYears = "Experience is required";
  else if (!Number.isInteger(years) || years < 0 || years > 70) errors.experienceYears = "Enter whole years between 0 and 70";

  if (!fields.phone.trim()) errors.phone = "Phone number is required";
  else if (!/^[0-9+()\-\s]{7,20}$/.test(fields.phone)) errors.phone = "Enter a valid phone number";
  if (fields.clinicAddress.trim().length < 8) errors.clinicAddress = "Enter your clinic address";
  if (fields.bio.trim().length < 20) errors.bio = "Tell patients about your experience (at least 20 characters)";
  if (!isHttpUrl(fields.profileImage)) errors.profileImage = "Enter a valid image URL";

  return errors;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
