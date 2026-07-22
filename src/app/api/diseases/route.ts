export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { executeQuery } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

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

    return NextResponse.json({ diseases: rows });
  } catch {
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
