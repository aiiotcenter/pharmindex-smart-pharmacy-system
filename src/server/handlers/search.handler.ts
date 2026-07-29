import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import { searchAll } from "@/services/search.service";
import { jsonOk, requireAuth, unauthorized } from "@/server/http/responses";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  const query = new URL(request.url).searchParams.get("q") ?? "";
  const results = await searchAll(query);
  return jsonOk({ results });
}
