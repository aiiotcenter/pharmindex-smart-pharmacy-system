import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import { listUserMedicines } from "@/repositories/medicine.repository";
import { jsonOk, requireAuth, unauthorized } from "@/server/http/responses";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  const medicines = await listUserMedicines(auth.userId);
  return jsonOk({ medicines });
}
