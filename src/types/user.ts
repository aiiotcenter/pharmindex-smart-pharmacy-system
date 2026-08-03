import type { RoleId } from "@/lib/roles";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface User {
  userId: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  birthDate: string;
  gender: Gender;
  roleId: RoleId;
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
  applyAsDoctor?: boolean;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  viewMode?: "ADMIN" | "DOCTOR" | "USER";
}
