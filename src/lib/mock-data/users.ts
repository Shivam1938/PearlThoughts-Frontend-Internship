export type MockUser = {
  id: string;
  email: string;
  password: string;
  name: string;
};

export const users: MockUser[] = [
  {
    id: "user-001",
    email: "patient@example.com",
    password: "password123",
    name: "Alex Morgan",
  },
  {
    id: "user-002",
    email: "sam@example.com",
    password: "password456",
    name: "Sam Taylor",
  },
];