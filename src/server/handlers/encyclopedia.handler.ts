import type { NextRequest } from "next/server";
import {
  encyclopediaSearch,
  getDiseaseDetail,
  getIngredientDetail,
  getMedicineDetail,
  listByCategory,
} from "@/repositories/encyclopedia.repository";
import { getAuthContext } from "@/lib/api-auth";
import type { EncyclopediaCategory } from "@/types/encyclopedia";
import { jsonOk, notFound, requireAuth, unauthorized } from "@/server/http/responses";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const category = (searchParams.get("category") ?? "all") as EncyclopediaCategory;
  const type = searchParams.get("type");
  const id = Number(searchParams.get("id"));

  if (type && id) {
    if (type === "medicine") {
      const detail = await getMedicineDetail(id);
      return detail ? jsonOk({ detail }) : notFound();
    }
    if (type === "disease") {
      const detail = await getDiseaseDetail(id);
      return detail ? jsonOk({ detail }) : notFound();
    }
    if (type === "ingredient" || type === "allergy") {
      const detail = await getIngredientDetail(id);
      return detail ? jsonOk({ detail, detailType: type }) : notFound();
    }
  }

  if (query) {
    const results = await encyclopediaSearch(query, category);
    return jsonOk({ results });
  }

  if (category !== "all") {
    const results = await listByCategory(category);
    return jsonOk({ results });
  }

  return jsonOk({ results: [] });
}
