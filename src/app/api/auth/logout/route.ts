export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getTokenCookieName } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "LOGOUT_SUCCESS" });
  response.cookies.set(getTokenCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
