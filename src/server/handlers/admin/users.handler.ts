import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import {
  forbidden,
  jsonOk,
  requireAdmin,
  requireAuth,
  unauthorized,
} from "@/server/http/responses";
import { listUsers } from "@/repositories/user.repository";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();
  if (!requireAdmin(auth)) return forbidden();

  const users = await listUsers();
  return jsonOk({ users });
}
