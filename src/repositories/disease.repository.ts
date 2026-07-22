import { executeQuery } from "@/lib/db";
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
