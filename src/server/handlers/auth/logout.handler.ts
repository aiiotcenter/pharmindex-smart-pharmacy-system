import { getTokenCookieName } from "@/lib/auth";
import { jsonOk } from "@/server/http/responses";

export async function POST() {
  const response = jsonOk({ message: "LOGOUT_SUCCESS" });
  response.cookies.set(getTokenCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
