import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import {
  canAccessAdminPanel,
  canAccessDoctorPanel,
  Role,
  type ViewMode,
  isPatientView as checkPatientView,
} from "@/lib/roles";
import { findUserById } from "@/repositories/user.repository";
import type { User } from "@/types/user";

export interface AuthContext {
  userId: number;
  username: string;
  roleId: number;
  viewMode?: ViewMode;
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
    roleId: user.roleId,
    viewMode: payload.viewMode,
    user,
  };
}

export function isAdmin(context: AuthContext | null): boolean {
  if (!context) return false;
  return canAccessAdminPanel(context.roleId, context.viewMode);
}

export function isDoctor(context: AuthContext | null): boolean {
  if (!context) return false;
  return canAccessDoctorPanel(context.roleId, context.viewMode);
}

export function isPatient(context: AuthContext | null): boolean {
  if (!context) return false;
  return checkPatientView(context.roleId, context.viewMode);
}
