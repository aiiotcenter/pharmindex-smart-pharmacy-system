export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface User {
  userId: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  birthDate: string;
  gender: Gender;
  createdAt?: string;
}

export interface UserRecord extends User {
  password: string;
}

export interface RegisterInput {
  username: string;
  password: string;
  name: string;
  surname: string;
  email: string;
  birthDate: string;
  gender: Gender;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
