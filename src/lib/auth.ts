import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SALT_ROUNDS = 12;
const TOKEN_COOKIE = "auth_token";

export interface JwtPayload {
  userId: number;
  username: string;
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

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    username: payload.username,
  })
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

    if (!userId || !username) {
      return null;
    }

    return { userId, username };
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
