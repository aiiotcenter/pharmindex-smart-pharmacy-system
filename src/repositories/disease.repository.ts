import { executeMutation, executeQuery } from "@/lib/db";
import type { Disease } from "@/types/disease";

interface DbDiseaseRow {
  DISEASE_ID: number;
  NAME_EN: string;
  NAME_TR: string;
  DESCRIPTION_EN?: string | null;
  DESCRIPTION_TR?: string | null;
}

function mapDisease(row: DbDiseaseRow): Disease {
  return {
    diseaseId: row.DISEASE_ID,
    nameEn: row.NAME_EN,
    nameTr: row.NAME_TR,
    descriptionEn: row.DESCRIPTION_EN,
    descriptionTr: row.DESCRIPTION_TR,
  };
}

export async function listDiseases(search?: string): Promise<Disease[]> {
  const rows = await executeQuery<DbDiseaseRow>(
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

  return rows.map(mapDisease);
}

export async function findDiseaseById(diseaseId: number): Promise<Disease | null> {
  const rows = await executeQuery<DbDiseaseRow>(
    `
    SELECT disease_id, name_en, name_tr, description_en, description_tr
    FROM diseases
    WHERE disease_id = :diseaseId
    `,
    { diseaseId }
  );

  return rows[0] ? mapDisease(rows[0]) : null;
}

export async function listUserDiseases(userId: number): Promise<Disease[]> {
  const rows = await executeQuery<DbDiseaseRow>(
    `
    SELECT d.disease_id, d.name_en, d.name_tr, d.description_en, d.description_tr
    FROM user_diseases ud
    JOIN diseases d ON d.disease_id = ud.disease_id
    WHERE ud.user_id = :userId
    ORDER BY d.disease_id
    `,
    { userId }
  );

  return rows.map(mapDisease);
}

interface DbUserDiseaseRow extends DbDiseaseRow {
  DIAGNOSED_DATE?: string | null;
}

export async function listUserDiseasesDetailed(userId: number) {
  const rows = await executeQuery<DbUserDiseaseRow>(
    `
    SELECT d.disease_id, d.name_en, d.name_tr, d.description_en, d.description_tr,
           ud.diagnosed_date
    FROM user_diseases ud
    JOIN diseases d ON d.disease_id = ud.disease_id
    WHERE ud.user_id = :userId
    ORDER BY d.disease_id
    `,
    { userId }
  );

  return rows.map((row) => ({
    ...mapDisease(row),
    diagnosedDate: row.DIAGNOSED_DATE ?? null,
  }));
}

export async function addUserDisease(
  userId: number,
  diseaseId: number
): Promise<void> {
  const disease = await findDiseaseById(diseaseId);
  if (!disease) throw new Error("DISEASE_NOT_FOUND");

  const existing = await executeQuery<{ CNT: number }>(
    `
    SELECT COUNT(*) AS cnt FROM user_diseases
    WHERE user_id = :userId AND disease_id = :diseaseId
    `,
    { userId, diseaseId }
  );
  if ((existing[0]?.CNT ?? 0) > 0) {
    throw new Error("DISEASE_ALREADY_EXISTS");
  }

  await executeMutation(
    `
    INSERT INTO user_diseases (user_id, disease_id, diagnosed_date)
    VALUES (:userId, :diseaseId, TRUNC(SYSDATE))
    `,
    { userId, diseaseId }
  );
}

export async function removeUserDisease(
  userId: number,
  diseaseId: number
): Promise<boolean> {
  const affected = await executeMutation(
    `
    DELETE FROM user_diseases
    WHERE user_id = :userId AND disease_id = :diseaseId
    `,
    { userId, diseaseId }
  );
  return affected > 0;
}

export async function listMedicinesForDisease(diseaseId: number) {
  const rows = await executeQuery<{
    MEDICINE_ID: number;
    NAME_TR: string;
    NAME_EN: string;
    DOSAGE_FORM?: string | null;
    RECOMMENDATION_NOTE?: string | null;
  }>(
    `
    SELECT m.medicine_id, m.name_tr, m.name_en, m.dosage_form, dm.recommendation_note
    FROM disease_medicines dm
    JOIN medicines m ON m.medicine_id = dm.medicine_id
    WHERE dm.disease_id = :diseaseId
    ORDER BY m.medicine_id
    `,
    { diseaseId }
  );

  return rows.map((row) => ({
    medicineId: row.MEDICINE_ID,
    nameTr: row.NAME_TR,
    nameEn: row.NAME_EN,
    dosageForm: row.DOSAGE_FORM,
    recommendationNote: row.RECOMMENDATION_NOTE,
  }));
}

export async function isMedicineLinkedToOtherUserDiseases(
  userId: number,
  medicineId: number,
  excludeDiseaseId: number
): Promise<boolean> {
  const rows = await executeQuery<{ CNT: number }>(
    `
    SELECT COUNT(*) AS cnt
    FROM disease_medicines dm
    JOIN user_diseases ud ON ud.disease_id = dm.disease_id
    WHERE ud.user_id = :userId
      AND dm.medicine_id = :medicineId
      AND ud.disease_id <> :excludeDiseaseId
    `,
    { userId, medicineId, excludeDiseaseId }
  );
  return (rows[0]?.CNT ?? 0) > 0;
}
