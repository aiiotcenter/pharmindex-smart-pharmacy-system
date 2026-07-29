import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { findUserById } from "@/repositories/user.repository";
import type { User, UserRole } from "@/types/user";

export interface AuthContext {
  userId: number;
  username: string;
  role: UserRole;
  user: User;
}

export async function getAuthContext(
  request: NextRequest
): Promise<AuthContext | null> {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await findUserById(payload.userId);
  if (!user) {
    return null;
  }

  return {
    userId: user.userId,
    username: user.username,
    role: user.role,
    user,
  };
}

export function isAdmin(context: AuthContext | null): boolean {
  return context?.role === "ADMIN";
}
