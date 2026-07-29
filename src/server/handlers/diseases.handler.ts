import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { internalError, jsonOk, unauthorized } from "@/server/http/responses";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token || !(await verifyToken(token))) {
      return unauthorized();
    }

    const search = new URL(request.url).searchParams.get("search");

    const rows = await executeQuery(
      `
      SELECT disease_id, name_en, name_tr, description_en, description_tr
      FROM diseases
      WHERE (
        :search IS NULL
        OR LOWER(name_en) LIKE '%' || LOWER(:search) || '%'
        OR LOWER(name_tr) LIKE '%' || LOWER(:search) || '%'
      )
      ORDER BY disease_id
      `,
      { search: search ?? null }
    );

    return jsonOk({ diseases: rows });
  } catch {
    return internalError();
  }
}
