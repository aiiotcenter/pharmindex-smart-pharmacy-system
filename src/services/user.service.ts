import {
  createUser,
  emailExists,
  findUserById,
  findUserByUsername,
  listUsers,
  usernameExists,
} from "@/repositories/user.repository";
import type { RegisterInput, User } from "@/types/user";

export async function getUserById(userId: number): Promise<User | null> {
  return findUserById(userId);
}

export async function getAllUsers(): Promise<User[]> {
  return listUsers();
}

export async function registerUser(input: RegisterInput): Promise<User> {
  if (await usernameExists(input.username)) {
    throw new Error("USERNAME_EXISTS");
  }

  if (await emailExists(input.email)) {
    throw new Error("EMAIL_EXISTS");
  }

  return createUser(input);
}

export async function getUserForLogin(username: string) {
  return findUserByUsername(username);
}
