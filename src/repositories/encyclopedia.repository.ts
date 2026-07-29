import { executeQuery } from "@/lib/db";
import { buildSearchPattern } from "@/utils/search";
import type {
  EncyclopediaCategory,
  EncyclopediaDiseaseDetail,
  EncyclopediaIngredientDetail,
  EncyclopediaMedicineDetail,
  EncyclopediaSearchItem,
} from "@/types/encyclopedia";

const TRANSLATE_FROM = "ıİşŞğĞüÜöÖçÇ";
const TRANSLATE_TO = "iissgguuoocc";

function searchCondition(columns: string[]): string {
  return columns
    .map(
      (col) =>
        `LOWER(TRANSLATE(NVL(${col}, ' '), '${TRANSLATE_FROM}', '${TRANSLATE_TO}')) LIKE :pattern`
    )
    .join(" OR ");
}

export async function encyclopediaSearch(
  query: string,
  category: EncyclopediaCategory = "all"
): Promise<EncyclopediaSearchItem[]> {
  const pattern = buildSearchPattern(query);
  if (!pattern) {
    return [];
  }

  const parts: string[] = [];

  if (category === "all" || category === "medicine") {
    parts.push(`
      SELECT 'medicine' AS item_type, medicine_id AS item_id, name_en, name_tr,
             dosage_form AS subtitle_en, dosage_form AS subtitle_tr
      FROM medicines
      WHERE ${searchCondition(["name_en", "name_tr", "description_en", "description_tr", "uses_en", "uses_tr"])}
    `);
  }

  if (category === "all" || category === "disease") {
    parts.push(`
      SELECT 'disease' AS item_type, disease_id AS item_id, name_en, name_tr,
             description_en AS subtitle_en, description_tr AS subtitle_tr
      FROM diseases
      WHERE ${searchCondition(["name_en", "name_tr", "description_en", "description_tr", "symptoms_en", "symptoms_tr"])}
    `);
  }

  if (category === "all" || category === "ingredient") {
    parts.push(`
      SELECT 'ingredient' AS item_type, ingredient_id AS item_id, name_en, name_tr,
             description_en AS subtitle_en, description_tr AS subtitle_tr
      FROM active_ingredients
      WHERE ${searchCondition(["name_en", "name_tr", "description_en", "description_tr", "body_effects_en", "body_effects_tr"])}
    `);
  }

  if (category === "all" || category === "allergy") {
    parts.push(`
      SELECT 'allergy' AS item_type, ingredient_id AS item_id, name_en, name_tr,
             allergy_symptoms_en AS subtitle_en, allergy_symptoms_tr AS subtitle_tr
      FROM active_ingredients
      WHERE allergy_symptoms_tr IS NOT NULL
        AND (${searchCondition(["name_en", "name_tr", "allergy_symptoms_en", "allergy_symptoms_tr", "body_effects_en", "body_effects_tr"])})
    `);
  }

  const rows = await executeQuery<{
    ITEM_TYPE: string;
    ITEM_ID: number;
    NAME_EN: string;
    NAME_TR: string;
    SUBTITLE_EN?: string | null;
    SUBTITLE_TR?: string | null;
  }>(parts.join(" UNION ALL "), { pattern });

  const seen = new Set<string>();
  return rows
    .map((row) => ({
      type: row.ITEM_TYPE as EncyclopediaSearchItem["type"],
      id: row.ITEM_ID,
      nameEn: row.NAME_EN,
      nameTr: row.NAME_TR,
      subtitleEn: row.SUBTITLE_EN,
      subtitleTr: row.SUBTITLE_TR,
    }))
    .filter((item) => {
      const key = `${item.type}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export async function getMedicineDetail(
  medicineId: number
): Promise<EncyclopediaMedicineDetail | null> {
  const rows = await executeQuery<Record<string, unknown>>(
    `
    SELECT medicine_id, name_en, name_tr, description_en, description_tr, dosage_form,
           uses_tr, uses_en, how_to_use_tr, how_to_use_en,
           side_effects_tr, side_effects_en, contraindications_tr, contraindications_en,
           pregnancy_tr, pregnancy_en, breastfeeding_tr, breastfeeding_en,
           elderly_tr, elderly_en, children_tr, children_en,
           special_conditions_tr, special_conditions_en
    FROM medicines WHERE medicine_id = :medicineId
    `,
    { medicineId }
  );

  if (!rows[0]) return null;
  const row = rows[0];

  const ingredients = await executeQuery<{
    INGREDIENT_ID: number;
    NAME_EN: string;
    NAME_TR: string;
    AMOUNT_MG?: number | null;
  }>(
    `
    SELECT ai.ingredient_id, ai.name_en, ai.name_tr, mi.amount_mg
    FROM medicine_ingredients mi
    JOIN active_ingredients ai ON ai.ingredient_id = mi.ingredient_id
    WHERE mi.medicine_id = :medicineId
    `,
    { medicineId }
  );

  const similar = await executeQuery<{
    MEDICINE_ID: number;
    NAME_EN: string;
    NAME_TR: string;
  }>(
    `
    SELECT m.medicine_id, m.name_en, m.name_tr
    FROM medicine_similar ms
    JOIN medicines m ON m.medicine_id = ms.similar_medicine_id
    WHERE ms.medicine_id = :medicineId
    `,
    { medicineId }
  );

  return {
    medicineId: Number(row.MEDICINE_ID),
    nameEn: String(row.NAME_EN),
    nameTr: String(row.NAME_TR),
    descriptionEn: row.DESCRIPTION_EN as string | null,
    descriptionTr: row.DESCRIPTION_TR as string | null,
    dosageForm: row.DOSAGE_FORM as string | null,
    usesEn: row.USES_EN as string | null,
    usesTr: row.USES_TR as string | null,
    howToUseEn: row.HOW_TO_USE_EN as string | null,
    howToUseTr: row.HOW_TO_USE_TR as string | null,
    sideEffectsEn: row.SIDE_EFFECTS_EN as string | null,
    sideEffectsTr: row.SIDE_EFFECTS_TR as string | null,
    contraindicationsEn: row.CONTRAINDICATIONS_EN as string | null,
    contraindicationsTr: row.CONTRAINDICATIONS_TR as string | null,
    pregnancyEn: row.PREGNANCY_EN as string | null,
    pregnancyTr: row.PREGNANCY_TR as string | null,
    breastfeedingEn: row.BREASTFEEDING_EN as string | null,
    breastfeedingTr: row.BREASTFEEDING_TR as string | null,
    elderlyEn: row.ELDERLY_EN as string | null,
    elderlyTr: row.ELDERLY_TR as string | null,
    childrenEn: row.CHILDREN_EN as string | null,
    childrenTr: row.CHILDREN_TR as string | null,
    specialConditionsEn: row.SPECIAL_CONDITIONS_EN as string | null,
    specialConditionsTr: row.SPECIAL_CONDITIONS_TR as string | null,
    ingredients: ingredients.map((i) => ({
      ingredientId: i.INGREDIENT_ID,
      nameEn: i.NAME_EN,
      nameTr: i.NAME_TR,
      amountMg: i.AMOUNT_MG,
    })),
    similarMedicines: similar.map((s) => ({
      medicineId: s.MEDICINE_ID,
      nameEn: s.NAME_EN,
      nameTr: s.NAME_TR,
    })),
  };
}

export async function getDiseaseDetail(
  diseaseId: number
): Promise<EncyclopediaDiseaseDetail | null> {
  const rows = await executeQuery<Record<string, unknown>>(
    `
    SELECT disease_id, name_en, name_tr, description_en, description_tr,
           symptoms_tr, symptoms_en, treatment_tr, treatment_en,
           when_to_use_tr, when_to_use_en, when_not_to_use_tr, when_not_to_use_en,
           affected_patients_tr, affected_patients_en
    FROM diseases WHERE disease_id = :diseaseId
    `,
    { diseaseId }
  );

  if (!rows[0]) return null;
  const row = rows[0];

  const medicines = await executeQuery<{
    MEDICINE_ID: number;
    NAME_EN: string;
    NAME_TR: string;
    RECOMMENDATION_NOTE?: string | null;
  }>(
    `
    SELECT m.medicine_id, m.name_en, m.name_tr, dm.recommendation_note
    FROM disease_medicines dm
    JOIN medicines m ON m.medicine_id = dm.medicine_id
    WHERE dm.disease_id = :diseaseId
    `,
    { diseaseId }
  );

  return {
    diseaseId: Number(row.DISEASE_ID),
    nameEn: String(row.NAME_EN),
    nameTr: String(row.NAME_TR),
    descriptionEn: row.DESCRIPTION_EN as string | null,
    descriptionTr: row.DESCRIPTION_TR as string | null,
    symptomsEn: row.SYMPTOMS_EN as string | null,
    symptomsTr: row.SYMPTOMS_TR as string | null,
    treatmentEn: row.TREATMENT_EN as string | null,
    treatmentTr: row.TREATMENT_TR as string | null,
    whenToUseEn: row.WHEN_TO_USE_EN as string | null,
    whenToUseTr: row.WHEN_TO_USE_TR as string | null,
    whenNotToUseEn: row.WHEN_NOT_TO_USE_EN as string | null,
    whenNotToUseTr: row.WHEN_NOT_TO_USE_TR as string | null,
    affectedPatientsEn: row.AFFECTED_PATIENTS_EN as string | null,
    affectedPatientsTr: row.AFFECTED_PATIENTS_TR as string | null,
    recommendedMedicines: medicines.map((m) => ({
      medicineId: m.MEDICINE_ID,
      nameEn: m.NAME_EN,
      nameTr: m.NAME_TR,
      note: m.RECOMMENDATION_NOTE,
    })),
  };
}

export async function getIngredientDetail(
  ingredientId: number
): Promise<EncyclopediaIngredientDetail | null> {
  const rows = await executeQuery<Record<string, unknown>>(
    `
    SELECT ingredient_id, name_en, name_tr, description_en, description_tr,
           body_effects_tr, body_effects_en, allergy_symptoms_tr, allergy_symptoms_en
    FROM active_ingredients WHERE ingredient_id = :ingredientId
    `,
    { ingredientId }
  );

  if (!rows[0]) return null;
  const row = rows[0];

  const medicines = await executeQuery<{
    MEDICINE_ID: number;
    NAME_EN: string;
    NAME_TR: string;
  }>(
    `
    SELECT m.medicine_id, m.name_en, m.name_tr
    FROM medicine_ingredients mi
    JOIN medicines m ON m.medicine_id = mi.medicine_id
    WHERE mi.ingredient_id = :ingredientId
    `,
    { ingredientId }
  );

  return {
    ingredientId: Number(row.INGREDIENT_ID),
    nameEn: String(row.NAME_EN),
    nameTr: String(row.NAME_TR),
    descriptionEn: row.DESCRIPTION_EN as string | null,
    descriptionTr: row.DESCRIPTION_TR as string | null,
    bodyEffectsEn: row.BODY_EFFECTS_EN as string | null,
    bodyEffectsTr: row.BODY_EFFECTS_TR as string | null,
    allergySymptomsEn: row.ALLERGY_SYMPTOMS_EN as string | null,
    allergySymptomsTr: row.ALLERGY_SYMPTOMS_TR as string | null,
    containingMedicines: medicines.map((m) => ({
      medicineId: m.MEDICINE_ID,
      nameEn: m.NAME_EN,
      nameTr: m.NAME_TR,
    })),
  };
}

export async function listByCategory(
  category: Exclude<EncyclopediaCategory, "all">
): Promise<EncyclopediaSearchItem[]> {
  if (category === "medicine") {
    const rows = await executeQuery<{ MEDICINE_ID: number; NAME_EN: string; NAME_TR: string; DOSAGE_FORM?: string }>(
      `SELECT medicine_id, name_en, name_tr, dosage_form FROM medicines ORDER BY name_tr`
    );
    return rows.map((r) => ({
      type: "medicine" as const,
      id: r.MEDICINE_ID,
      nameEn: r.NAME_EN,
      nameTr: r.NAME_TR,
      subtitleEn: r.DOSAGE_FORM,
      subtitleTr: r.DOSAGE_FORM,
    }));
  }
  if (category === "disease") {
    const rows = await executeQuery<{ DISEASE_ID: number; NAME_EN: string; NAME_TR: string; DESCRIPTION_TR?: string }>(
      `SELECT disease_id, name_en, name_tr, description_tr FROM diseases ORDER BY name_tr`
    );
    return rows.map((r) => ({
      type: "disease" as const,
      id: r.DISEASE_ID,
      nameEn: r.NAME_EN,
      nameTr: r.NAME_TR,
      subtitleTr: r.DESCRIPTION_TR,
      subtitleEn: r.DESCRIPTION_TR,
    }));
  }
  if (category === "allergy") {
    const allergyRows = await executeQuery<{
      INGREDIENT_ID: number;
      NAME_EN: string;
      NAME_TR: string;
      ALLERGY_SYMPTOMS_TR?: string;
    }>(
      `SELECT ingredient_id, name_en, name_tr, allergy_symptoms_tr
       FROM active_ingredients
       WHERE allergy_symptoms_tr IS NOT NULL
       ORDER BY name_tr`
    );
    return allergyRows.map((r) => ({
      type: "allergy" as const,
      id: r.INGREDIENT_ID,
      nameEn: r.NAME_EN,
      nameTr: r.NAME_TR,
      subtitleTr: r.ALLERGY_SYMPTOMS_TR,
      subtitleEn: r.ALLERGY_SYMPTOMS_TR,
    }));
  }

  const rows = await executeQuery<{ INGREDIENT_ID: number; NAME_EN: string; NAME_TR: string; DESCRIPTION_TR?: string }>(
    `SELECT ingredient_id, name_en, name_tr, description_tr FROM active_ingredients ORDER BY name_tr`
  );
  return rows.map((r) => ({
    type: "ingredient" as const,
    id: r.INGREDIENT_ID,
    nameEn: r.NAME_EN,
    nameTr: r.NAME_TR,
    subtitleTr: r.DESCRIPTION_TR,
    subtitleEn: r.DESCRIPTION_TR,
  }));
}
