import { executeQuery } from "@/lib/db";
import { listUserDiseases } from "@/repositories/disease.repository";
import type { Medicine } from "@/types/medicine";

interface RecommendedMedicineRow {
  MEDICINE_ID: number;
  NAME_EN: string;
  NAME_TR: string;
  DESCRIPTION_EN?: string | null;
  DESCRIPTION_TR?: string | null;
  DOSAGE_FORM?: string | null;
  RECOMMENDATION_NOTE?: string | null;
}

export async function getRecommendedMedicinesForUser(
  userId: number
): Promise<Array<Medicine & { recommendationNote?: string | null }>> {
  const userDiseases = await listUserDiseases(userId);
  if (userDiseases.length === 0) {
    return [];
  }

  const diseaseIds = userDiseases.map((disease) => disease.diseaseId);
  const placeholders = diseaseIds.map((_, index) => `:id${index}`).join(", ");
  const binds: Record<string, number> = {};
  diseaseIds.forEach((id, index) => {
    binds[`id${index}`] = id;
  });

  const rows = await executeQuery<RecommendedMedicineRow>(
    `
    SELECT DISTINCT
      m.medicine_id,
      m.name_en,
      m.name_tr,
      m.description_en,
      m.description_tr,
      m.dosage_form,
      dm.recommendation_note
    FROM disease_medicines dm
    JOIN medicines m ON m.medicine_id = dm.medicine_id
    WHERE dm.disease_id IN (${placeholders})
    ORDER BY m.medicine_id
    `,
    binds
  );

  return rows.map((row) => ({
    medicineId: row.MEDICINE_ID,
    nameEn: row.NAME_EN,
    nameTr: row.NAME_TR,
    descriptionEn: row.DESCRIPTION_EN,
    descriptionTr: row.DESCRIPTION_TR,
    dosageForm: row.DOSAGE_FORM,
    recommendationNote: row.RECOMMENDATION_NOTE,
  }));
}
