import { executeMutation, executeQuery } from "@/lib/db";
import type {
  AllergyAddedBy,
  AllergyApprovalStatus,
  UserAllergy,
} from "@/types/allergy";
import type { ActiveIngredient } from "@/types/medicine";

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
  NOTES_TR?: string | null;
  NOTES_EN?: string | null;
  NAME_EN: string;
  NAME_TR: string;
  DESCRIPTION_EN?: string | null;
  DESCRIPTION_TR?: string | null;
  APPROVAL_STATUS?: string | null;
  ADDED_BY?: string | null;
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

function mapAllergyRow(row: DbUserAllergyRow) {
  return {
    userId: row.USER_ID,
    ingredientId: row.INGREDIENT_ID,
    severity: row.SEVERITY as UserAllergy["severity"],
    notes: row.NOTES,
    notesTr: row.NOTES_TR,
    notesEn: row.NOTES_EN,
    nameEn: row.NAME_EN,
    nameTr: row.NAME_TR,
    descriptionEn: row.DESCRIPTION_EN,
    descriptionTr: row.DESCRIPTION_TR,
    approvalStatus: (row.APPROVAL_STATUS ?? "APPROVED") as AllergyApprovalStatus,
    addedBy: (row.ADDED_BY ?? "PATIENT") as AllergyAddedBy,
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
  Array<UserAllergy & ActiveIngredient & { approvalStatus: AllergyApprovalStatus; addedBy: AllergyAddedBy }>
> {
  const rows = await executeQuery<DbUserAllergyRow>(
    `
    SELECT
      ua.user_id,
      ua.ingredient_id,
      ua.severity,
      ua.notes,
      ua.notes_tr,
      ua.notes_en,
      NVL(ua.approval_status, 'APPROVED') AS approval_status,
      NVL(ua.added_by, 'PATIENT') AS added_by,
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

  return rows.map(mapAllergyRow);
}

export async function getUserAllergyIngredientIds(
  userId: number
): Promise<number[]> {
  const rows = await executeQuery<{ INGREDIENT_ID: number }>(
    `
    SELECT ingredient_id
    FROM user_allergies
    WHERE user_id = :userId
      AND NVL(approval_status, 'APPROVED') = 'APPROVED'
    `,
    { userId }
  );

  return rows.map((row) => row.INGREDIENT_ID);
}

export async function addUserAllergy(input: {
  userId: number;
  ingredientId: number;
  severity?: "MILD" | "MODERATE" | "SEVERE";
  addedBy: AllergyAddedBy;
  approvalStatus: AllergyApprovalStatus;
  approvedByDoctorId?: number | null;
}): Promise<void> {
  const existing = await executeQuery<{ CNT: number }>(
    `
    SELECT COUNT(*) AS cnt FROM user_allergies
    WHERE user_id = :userId AND ingredient_id = :ingredientId
    `,
    { userId: input.userId, ingredientId: input.ingredientId }
  );

  if ((existing[0]?.CNT ?? 0) > 0) {
    throw new Error("ALLERGY_ALREADY_EXISTS");
  }

  const ingredient = await executeQuery<{ INGREDIENT_ID: number }>(
    `SELECT ingredient_id FROM active_ingredients WHERE ingredient_id = :ingredientId`,
    { ingredientId: input.ingredientId }
  );

  if (!ingredient[0]) {
    throw new Error("INGREDIENT_NOT_FOUND");
  }

  await executeMutation(
    `
    INSERT INTO user_allergies (
      user_id, ingredient_id, severity,
      added_by, approval_status, approved_by_doctor_id
    )
    VALUES (
      :userId, :ingredientId, :severity,
      :addedBy, :approvalStatus, :approvedByDoctorId
    )
    `,
    {
      userId: input.userId,
      ingredientId: input.ingredientId,
      severity: input.severity ?? "MILD",
      addedBy: input.addedBy,
      approvalStatus: input.approvalStatus,
      approvedByDoctorId: input.approvedByDoctorId ?? null,
    }
  );

  if (input.approvalStatus === "APPROVED") {
    await executeMutation(
      `
      UPDATE user_allergies SET approved_at = SYSTIMESTAMP
      WHERE user_id = :userId AND ingredient_id = :ingredientId
      `,
      { userId: input.userId, ingredientId: input.ingredientId }
    );
  }
}

export async function removeUserAllergy(
  userId: number,
  ingredientId: number
): Promise<boolean> {
  const affected = await executeMutation(
    `
    DELETE FROM user_allergies
    WHERE user_id = :userId AND ingredient_id = :ingredientId
    `,
    { userId, ingredientId }
  );
  return affected > 0;
}

export async function approveUserAllergy(
  userId: number,
  ingredientId: number,
  doctorId: number
): Promise<boolean> {
  const affected = await executeMutation(
    `
    UPDATE user_allergies SET
      approval_status = 'APPROVED',
      approved_by_doctor_id = :doctorId,
      approved_at = SYSTIMESTAMP
    WHERE user_id = :userId
      AND ingredient_id = :ingredientId
      AND approval_status = 'PENDING'
    `,
    { userId, ingredientId, doctorId }
  );
  return affected > 0;
}

export async function listPendingAllergiesForDoctor(doctorId: number) {
  const rows = await executeQuery<Record<string, unknown>>(
    `
    SELECT ua.user_id AS patient_id, ua.ingredient_id, ua.severity,
           NVL(ua.approval_status, 'PENDING') AS approval_status,
           NVL(ua.added_by, 'PATIENT') AS added_by,
           ai.name_tr, ai.name_en,
           u.name, u.surname
    FROM user_allergies ua
    JOIN active_ingredients ai ON ai.ingredient_id = ua.ingredient_id
    JOIN users u ON u.user_id = ua.user_id
    JOIN doctor_patients dp ON dp.patient_id = ua.user_id AND dp.doctor_id = :doctorId
    WHERE ua.approval_status = 'PENDING'
    ORDER BY ua.user_id, ua.ingredient_id
    `,
    { doctorId }
  );

  return rows.map((row) => ({
    patientId: Number(row.PATIENT_ID),
    ingredientId: Number(row.INGREDIENT_ID),
    severity: row.SEVERITY as string | null,
    approvalStatus: "PENDING" as const,
    addedBy: "PATIENT" as const,
    nameTr: String(row.NAME_TR),
    nameEn: String(row.NAME_EN),
    patientName: String(row.NAME),
    patientSurname: String(row.SURNAME),
  }));
}

export async function listPatientAllergiesForDoctor(patientId: number) {
  const rows = await executeQuery<Record<string, unknown>>(
    `
    SELECT ua.ingredient_id, ua.severity,
           NVL(ua.approval_status, 'APPROVED') AS approval_status,
           NVL(ua.added_by, 'PATIENT') AS added_by,
           ai.name_tr, ai.name_en
    FROM user_allergies ua
    JOIN active_ingredients ai ON ai.ingredient_id = ua.ingredient_id
    WHERE ua.user_id = :patientId
    ORDER BY ua.ingredient_id
    `,
    { patientId }
  );

  return rows.map((row) => ({
    ingredientId: Number(row.INGREDIENT_ID),
    severity: row.SEVERITY as string | null,
    approvalStatus: String(row.APPROVAL_STATUS) as AllergyApprovalStatus,
    addedBy: String(row.ADDED_BY) as AllergyAddedBy,
    nameTr: String(row.NAME_TR),
    nameEn: String(row.NAME_EN),
  }));
}
