import { executeQuery, executeMutation } from "@/lib/db";
import type { Medicine } from "@/types/medicine";

interface DbMedicineRow {
  MEDICINE_ID: number;
  NAME_EN: string;
  NAME_TR: string;
  DESCRIPTION_EN?: string | null;
  DESCRIPTION_TR?: string | null;
  DOSAGE_FORM?: string | null;
}

function mapMedicine(row: DbMedicineRow): Medicine {
  return {
    medicineId: row.MEDICINE_ID,
    nameEn: row.NAME_EN,
    nameTr: row.NAME_TR,
    descriptionEn: row.DESCRIPTION_EN,
    descriptionTr: row.DESCRIPTION_TR,
    dosageForm: row.DOSAGE_FORM,
  };
}

export async function listMedicines(search?: string): Promise<Medicine[]> {
  const rows = await executeQuery<DbMedicineRow>(
    `
    SELECT medicine_id, name_en, name_tr, description_en, description_tr, dosage_form
    FROM medicines
    WHERE (
      :search IS NULL
      OR LOWER(name_en) LIKE '%' || LOWER(:search) || '%'
      OR LOWER(name_tr) LIKE '%' || LOWER(:search) || '%'
    )
    ORDER BY medicine_id
    `,
    { search: search ?? null }
  );

  return rows.map(mapMedicine);
}

export async function findMedicineById(
  medicineId: number
): Promise<Medicine | null> {
  const rows = await executeQuery<DbMedicineRow>(
    `
    SELECT medicine_id, name_en, name_tr, description_en, description_tr, dosage_form
    FROM medicines
    WHERE medicine_id = :medicineId
    `,
    { medicineId }
  );

  return rows[0] ? mapMedicine(rows[0]) : null;
}

export async function listUserMedicines(userId: number): Promise<Medicine[]> {
  const rows = await executeQuery<DbMedicineRow>(
    `
    SELECT m.medicine_id, m.name_en, m.name_tr, m.description_en, m.description_tr, m.dosage_form
    FROM user_medicines um
    JOIN medicines m ON m.medicine_id = um.medicine_id
    WHERE um.user_id = :userId AND um.is_active = 1
    ORDER BY m.medicine_id
    `,
    { userId }
  );

  return rows.map(mapMedicine);
}

export async function getMedicineIngredientIds(
  medicineId: number
): Promise<number[]> {
  const rows = await executeQuery<{ INGREDIENT_ID: number }>(
    `
    SELECT ingredient_id
    FROM medicine_ingredients
    WHERE medicine_id = :medicineId
    `,
    { medicineId }
  );

  return rows.map((row) => row.INGREDIENT_ID);
}

export async function createMedicine(input: {
  nameEn: string;
  nameTr: string;
  dosageForm?: string;
  usesTr?: string;
  usesEn?: string;
  sideEffectsTr?: string;
  sideEffectsEn?: string;
}): Promise<Medicine> {
  await executeMutation(
    `
    INSERT INTO medicines (
      name_en, name_tr, dosage_form,
      uses_tr, uses_en, side_effects_tr, side_effects_en
    )
    VALUES (
      :nameEn, :nameTr, :dosageForm,
      :usesTr, :usesEn, :sideEffectsTr, :sideEffectsEn
    )
    `,
    {
      nameEn: input.nameEn,
      nameTr: input.nameTr,
      dosageForm: input.dosageForm ?? null,
      usesTr: input.usesTr ?? null,
      usesEn: input.usesEn ?? null,
      sideEffectsTr: input.sideEffectsTr ?? null,
      sideEffectsEn: input.sideEffectsEn ?? null,
    }
  );

  const rows = await executeQuery<DbMedicineRow>(
    `
    SELECT medicine_id, name_en, name_tr, description_en, description_tr, dosage_form
    FROM medicines
    WHERE medicine_id = (SELECT MAX(medicine_id) FROM medicines)
    `
  );

  if (!rows[0]) {
    throw new Error("Failed to create medicine.");
  }

  return mapMedicine(rows[0]);
}

export async function linkMedicineIngredient(
  medicineId: number,
  ingredientId: number,
  amountMg?: number | null
): Promise<void> {
  await executeMutation(
    `
    INSERT INTO medicine_ingredients (medicine_id, ingredient_id, amount_mg)
    VALUES (:medicineId, :ingredientId, :amountMg)
    `,
    {
      medicineId,
      ingredientId,
      amountMg: amountMg ?? null,
    }
  );
}

export async function deleteMedicine(medicineId: number): Promise<boolean> {
  const affected = await executeMutation(
    "DELETE FROM medicines WHERE medicine_id = :medicineId",
    { medicineId }
  );
  return affected > 0;
}
