import { globalSearch } from "@/repositories/search.repository";

export async function searchAll(query: string) {
  return globalSearch(query);
}
