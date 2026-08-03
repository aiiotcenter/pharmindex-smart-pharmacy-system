import {
  defaultViewMode,
  getTokenCookieName,
  getTokenMaxAgeSeconds,
  hashPassword,
  signToken,
  verifyPassword,
} from "@/lib/auth";
import { Role, panelViewModeForRole, type ViewMode } from "@/lib/roles";
import { createDoctorRoleRequest } from "@/repositories/doctor-role.repository";
import { getUserForLogin, registerUser } from "@/services/user.service";
import type { AuthResponse, LoginInput, RegisterInput } from "@/types/user";

export async function register(
  input: RegisterInput
): Promise<AuthResponse> {
  const hashedPassword = await hashPassword(input.password);
  const user = await registerUser({ ...input, password: hashedPassword });

  if (input.applyAsDoctor) {
    await createDoctorRoleRequest(user.userId);
  }

  const viewMode = defaultViewMode(user.roleId);
  const token = await signToken({
    userId: user.userId,
    username: user.username,
    roleId: user.roleId,
    viewMode,
  });

  return { user, token, viewMode };
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const userRecord = await getUserForLogin(input.username);

  if (!userRecord) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isValid = await verifyPassword(input.password, userRecord.password);
  if (!isValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const { password: _password, ...user } = userRecord;
  const viewMode = defaultViewMode(user.roleId);
  const token = await signToken({
    userId: user.userId,
    username: user.username,
    roleId: user.roleId,
    viewMode,
  });

  return { user, token, viewMode };
}

export async function switchViewMode(
  userId: number,
  username: string,
  roleId: number,
  viewMode: ViewMode
): Promise<{ token: string; viewMode: ViewMode }> {
  if (roleId !== Role.ADMIN && roleId !== Role.DOCTOR) {
    throw new Error("FORBIDDEN");
  }

  const panelMode = panelViewModeForRole(roleId);
  if (viewMode !== "USER" && viewMode !== panelMode) {
    throw new Error("INVALID_VIEW_MODE");
  }

  const token = await signToken({
    userId,
    username,
    roleId,
    viewMode,
  });

  return { token, viewMode };
}

export function buildAuthCookie(token: string): {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    path: string;
    maxAge: number;
  };
} {
  return {
    name: getTokenCookieName(),
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getTokenMaxAgeSeconds(),
    },
  };
}
