export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { register } from "@/services/auth.service";
import { registerSchema } from "@/utils/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { confirmPassword: _confirmPassword, ...registerInput } = parsed.data;
    const result = await register(registerInput);

    return NextResponse.json({
      user: result.user,
      message: "REGISTER_SUCCESS",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "USERNAME_EXISTS" || message === "EMAIL_EXISTS") {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
