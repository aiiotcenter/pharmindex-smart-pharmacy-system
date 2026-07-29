import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import { listUserDiseases } from "@/repositories/disease.repository";
import { jsonOk, requireAuth, unauthorized } from "@/server/http/responses";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  const diseases = await listUserDiseases(auth.userId);
  return jsonOk({ diseases });
}
