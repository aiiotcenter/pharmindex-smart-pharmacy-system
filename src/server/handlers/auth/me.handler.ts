import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import { jsonOk, requireAuth, unauthorized } from "@/server/http/responses";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();
  return jsonOk({ user: auth.user });
}
