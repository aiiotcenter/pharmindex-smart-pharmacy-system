import {
  getTokenCookieName,
  getTokenMaxAgeSeconds,
  hashPassword,
  signToken,
  verifyPassword,
} from "@/lib/auth";
import { getUserForLogin, registerUser } from "@/services/user.service";
import type { AuthResponse, LoginInput, RegisterInput } from "@/types/user";

export async function register(
  input: RegisterInput  
): Promise<AuthResponse> {
  const hashedPassword = await hashPassword(input.password);
  const user = await registerUser({ ...input, password: hashedPassword });
  const token = await signToken({ userId: user.userId, username: user.username });

  return { user, token };
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
  const token = await signToken({ userId: user.userId, username: user.username });

  return { user, token };
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
