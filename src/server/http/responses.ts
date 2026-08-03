import { NextResponse } from "next/server";
import type { AuthContext } from "@/lib/api-auth";
import { isAdmin, isDoctor } from "@/lib/api-auth";

export function jsonOk<T extends Record<string, unknown>>(
  data: T,
  status = 200
): NextResponse {
  return NextResponse.json(data, { status });
}

export function jsonError(
  error: string,
  status: number,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    details ? { error, details } : { error },
    { status }
  );
}

export function unauthorized(): NextResponse {
  return jsonError("UNAUTHORIZED", 401);
}

export function forbidden(): NextResponse {
  return jsonError("FORBIDDEN", 403);
}

export function notFound(): NextResponse {
  return jsonError("NOT_FOUND", 404);
}

export function validationError(details?: unknown): NextResponse {
  return jsonError("VALIDATION_ERROR", 400, details);
}

export function internalError(): NextResponse {
  return jsonError("INTERNAL_ERROR", 500);
}

export function requireAuth(
  auth: AuthContext | null
): auth is AuthContext {
  return auth !== null;
}

export function requireAdmin(auth: AuthContext | null): auth is AuthContext {
  return isAdmin(auth);
}

export function requireDoctor(auth: AuthContext | null): auth is AuthContext {
  return isDoctor(auth);
}
