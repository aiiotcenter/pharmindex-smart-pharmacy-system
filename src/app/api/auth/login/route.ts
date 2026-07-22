export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { buildAuthCookie, login } from "@/services/auth.service";
import { loginSchema } from "@/utils/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await login(parsed.data);
    const response = NextResponse.json({
      user: result.user,
      message: "LOGIN_SUCCESS",
    });

    const cookie = buildAuthCookie(result.token);
    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "INVALID_CREDENTIALS") {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
