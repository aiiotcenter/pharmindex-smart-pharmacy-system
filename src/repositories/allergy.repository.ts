import { executeQuery } from "@/lib/db";
import type { ActiveIngredient } from "@/types/medicine";
import type { UserAllergy } from "@/types/allergy";

interface DbIngredientRow {
  INGREDIENT_ID: number;
  NAME_EN: string;
  NAME_TR: string;
  DESCRIPTION_EN?: string | null;
  DESCRIPTION_TR?: string | null;
}

interface DbUserAllergyRow {
  USER_ID: number;
  INGREDIENT_ID: number;
  SEVERITY?: string | null;
  NOTES?: string | null;
  NAME_EN: string;
  NAME_TR: string;
  DESCRIPTION_EN?: string | null;
  DESCRIPTION_TR?: string | null;
}

function mapIngredient(row: DbIngredientRow): ActiveIngredient {
  return {
    ingredientId: row.INGREDIENT_ID,
    nameEn: row.NAME_EN,
    nameTr: row.NAME_TR,
    descriptionEn: row.DESCRIPTION_EN,
    descriptionTr: row.DESCRIPTION_TR,
  };
}

export async function listActiveIngredients(
  search?: string
): Promise<ActiveIngredient[]> {
  const rows = await executeQuery<DbIngredientRow>(
    `
    SELECT ingredient_id, name_en, name_tr, description_en, description_tr
    FROM active_ingredients
    WHERE (
      :search IS NULL
      OR LOWER(name_en) LIKE '%' || LOWER(:search) || '%'
      OR LOWER(name_tr) LIKE '%' || LOWER(:search) || '%'
    )
    ORDER BY ingredient_id
    `,
    { search: search ?? null }
  );

  return rows.map(mapIngredient);
}

export async function listUserAllergies(userId: number): Promise<
  Array<UserAllergy & ActiveIngredient>
> {
  const rows = await executeQuery<DbUserAllergyRow>(
    `
    SELECT
      ua.user_id,
      ua.ingredient_id,
      ua.severity,
      ua.notes,
      ai.name_en,
      ai.name_tr,
      ai.description_en,
      ai.description_tr
    FROM user_allergies ua
    JOIN active_ingredients ai ON ai.ingredient_id = ua.ingredient_id
    WHERE ua.user_id = :userId
    ORDER BY ai.ingredient_id
    `,
    { userId }
  );

  return rows.map((row) => ({
    userId: row.USER_ID,
    ingredientId: row.INGREDIENT_ID,
    severity: row.SEVERITY as UserAllergy["severity"],
    notes: row.NOTES,
    nameEn: row.NAME_EN,
    nameTr: row.NAME_TR,
    descriptionEn: row.DESCRIPTION_EN,
    descriptionTr: row.DESCRIPTION_TR,
  }));
}

export async function getUserAllergyIngredientIds(
  userId: number
): Promise<number[]> {
  const rows = await executeQuery<{ INGREDIENT_ID: number }>(
    `
    SELECT ingredient_id
    FROM user_allergies
    WHERE user_id = :userId
    `,
    { userId }
  );

  return rows.map((row) => row.INGREDIENT_ID);
}
