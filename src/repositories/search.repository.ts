import { executeQuery } from "@/lib/db";
import { buildSearchPattern } from "@/utils/search";

export interface SearchResultItem {
  type: "medicine" | "disease" | "ingredient";
  id: number;
  nameEn: string;
  nameTr: string;
  descriptionEn?: string | null;
  descriptionTr?: string | null;
}

interface SearchRow {
  ITEM_TYPE: string;
  ITEM_ID: number;
  NAME_EN: string;
  NAME_TR: string;
  DESCRIPTION_EN?: string | null;
  DESCRIPTION_TR?: string | null;
}

const SEARCH_SQL = `
  SELECT 'medicine' AS item_type, medicine_id AS item_id, name_en, name_tr, description_en, description_tr
  FROM medicines
  WHERE :pattern IS NOT NULL AND (
    LOWER(TRANSLATE(name_en, 'ıİşŞğĞüÜöÖçÇ', 'iissgguuoocc')) LIKE :pattern
    OR LOWER(TRANSLATE(name_tr, 'ıİşŞğĞüÜöÖçÇ', 'iissgguuoocc')) LIKE :pattern
    OR LOWER(TRANSLATE(NVL(description_en, ' '), 'ıİşŞğĞüÜöÖçÇ', 'iissgguuoocc')) LIKE :pattern
    OR LOWER(TRANSLATE(NVL(description_tr, ' '), 'ıİşŞğĞüÜöÖçÇ', 'iissgguuoocc')) LIKE :pattern
  )
  UNION ALL
  SELECT 'disease', disease_id, name_en, name_tr, description_en, description_tr
  FROM diseases
  WHERE :pattern IS NOT NULL AND (
    LOWER(TRANSLATE(name_en, 'ıİşŞğĞüÜöÖçÇ', 'iissgguuoocc')) LIKE :pattern
    OR LOWER(TRANSLATE(name_tr, 'ıİşŞğĞüÜöÖçÇ', 'iissgguuoocc')) LIKE :pattern
    OR LOWER(TRANSLATE(NVL(description_en, ' '), 'ıİşŞğĞüÜöÖçÇ', 'iissgguuoocc')) LIKE :pattern
    OR LOWER(TRANSLATE(NVL(description_tr, ' '), 'ıİşŞğĞüÜöÖçÇ', 'iissgguuoocc')) LIKE :pattern
  )
  UNION ALL
  SELECT 'ingredient', ingredient_id, name_en, name_tr, description_en, description_tr
  FROM active_ingredients
  WHERE :pattern IS NOT NULL AND (
    LOWER(TRANSLATE(name_en, 'ıİşŞğĞüÜöÖçÇ', 'iissgguuoocc')) LIKE :pattern
    OR LOWER(TRANSLATE(name_tr, 'ıİşŞğĞüÜöÖçÇ', 'iissgguuoocc')) LIKE :pattern
    OR LOWER(TRANSLATE(NVL(description_en, ' '), 'ıİşŞğĞüÜöÖçÇ', 'iissgguuoocc')) LIKE :pattern
    OR LOWER(TRANSLATE(NVL(description_tr, ' '), 'ıİşŞğĞüÜöÖçÇ', 'iissgguuoocc')) LIKE :pattern
  )
`;

export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  const pattern = buildSearchPattern(query);
  if (!pattern) {
    return [];
  }

  const rows = await executeQuery<SearchRow>(SEARCH_SQL, { pattern });

  return rows.map((row) => ({
    type: row.ITEM_TYPE as SearchResultItem["type"],
    id: row.ITEM_ID,
    nameEn: row.NAME_EN,
    nameTr: row.NAME_TR,
    descriptionEn: row.DESCRIPTION_EN,
    descriptionTr: row.DESCRIPTION_TR,
  }));
}
