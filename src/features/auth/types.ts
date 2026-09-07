export type User = {
  id: string;
  email: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type SignupRequest = {
  name: string;
  email: string;
  password: string;
};

export type SignupResponse = LoginResponse;