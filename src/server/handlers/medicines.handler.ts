import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { searchMedicines } from "@/services/medicine.service";
import { internalError, jsonOk, unauthorized } from "@/server/http/responses";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token || !(await verifyToken(token))) {
      return unauthorized();
    }

    const search =
      new URL(request.url).searchParams.get("search") ?? undefined;
    const medicines = await searchMedicines(search);

    return jsonOk({ medicines });
  } catch {
    return internalError();
  }
}
