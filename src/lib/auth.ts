import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { legacyRoleToId, Role, defaultPanelViewMode, type ViewMode } from "@/lib/roles";

const SALT_ROUNDS = 12;
const TOKEN_COOKIE = "auth_token";

export interface JwtPayload {
  userId: number;
  username: string;
  roleId: number;
  viewMode?: ViewMode;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return new TextEncoder().encode(secret);
}

function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN ?? "7d";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function defaultViewMode(roleId: number): ViewMode | undefined {
  return defaultPanelViewMode(roleId);
}

export async function signToken(payload: JwtPayload): Promise<string> {
  const body: Record<string, unknown> = {
    userId: payload.userId,
    username: payload.username,
    roleId: payload.roleId,
  };

  if (payload.viewMode) {
    body.viewMode = payload.viewMode;
  }

  return new SignJWT(body)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(getJwtExpiresIn())
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const userId = Number(payload.userId);
    const username = String(payload.username);

    let roleId = Number(payload.roleId);
    if (!roleId && payload.role) {
      roleId = legacyRoleToId(String(payload.role));
    }
    if (!roleId) {
      roleId = Role.USER;
    }

    if (!userId || !username) {
      return null;
    }

    const rawViewMode = payload.viewMode;
    const viewMode: ViewMode | undefined =
      rawViewMode === "ADMIN" || rawViewMode === "DOCTOR" || rawViewMode === "USER"
        ? rawViewMode
        : defaultViewMode(roleId);

    return {
      userId,
      username,
      roleId,
      viewMode:
        roleId === Role.ADMIN || roleId === Role.DOCTOR ? viewMode : undefined,
    };
  } catch {
    return null;
  }
}

export function getTokenCookieName(): string {
  return TOKEN_COOKIE;
}

export function getTokenMaxAgeSeconds(): number {
  const expiresIn = getJwtExpiresIn();
  if (expiresIn.endsWith("d")) {
    return Number(expiresIn.replace("d", "")) * 24 * 60 * 60;
  }
  if (expiresIn.endsWith("h")) {
    return Number(expiresIn.replace("h", "")) * 60 * 60;
  }
  return 7 * 24 * 60 * 60;
}
