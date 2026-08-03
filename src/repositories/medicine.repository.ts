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
  howToUseTr?: string;
  howToUseEn?: string;
  sideEffectsTr?: string;
  sideEffectsEn?: string;
  contraindicationsTr?: string;
  contraindicationsEn?: string;
  pregnancyTr?: string;
  pregnancyEn?: string;
  breastfeedingTr?: string;
  breastfeedingEn?: string;
  elderlyTr?: string;
  elderlyEn?: string;
  childrenTr?: string;
  childrenEn?: string;
  specialConditionsTr?: string;
  specialConditionsEn?: string;
}): Promise<Medicine> {
  await executeMutation(
    `
    INSERT INTO medicines (
      name_en, name_tr, dosage_form,
      uses_tr, uses_en, how_to_use_tr, how_to_use_en,
      side_effects_tr, side_effects_en,
      contraindications_tr, contraindications_en,
      pregnancy_tr, pregnancy_en, breastfeeding_tr, breastfeeding_en,
      elderly_tr, elderly_en, children_tr, children_en,
      special_conditions_tr, special_conditions_en
    )
    VALUES (
      :nameEn, :nameTr, :dosageForm,
      :usesTr, :usesEn, :howToUseTr, :howToUseEn,
      :sideEffectsTr, :sideEffectsEn,
      :contraindicationsTr, :contraindicationsEn,
      :pregnancyTr, :pregnancyEn, :breastfeedingTr, :breastfeedingEn,
      :elderlyTr, :elderlyEn, :childrenTr, :childrenEn,
      :specialConditionsTr, :specialConditionsEn
    )
    `,
    {
      nameEn: input.nameEn,
      nameTr: input.nameTr,
      dosageForm: input.dosageForm ?? null,
      usesTr: input.usesTr ?? null,
      usesEn: input.usesEn ?? null,
      howToUseTr: input.howToUseTr ?? null,
      howToUseEn: input.howToUseEn ?? null,
      sideEffectsTr: input.sideEffectsTr ?? null,
      sideEffectsEn: input.sideEffectsEn ?? null,
      contraindicationsTr: input.contraindicationsTr ?? null,
      contraindicationsEn: input.contraindicationsEn ?? null,
      pregnancyTr: input.pregnancyTr ?? null,
      pregnancyEn: input.pregnancyEn ?? null,
      breastfeedingTr: input.breastfeedingTr ?? null,
      breastfeedingEn: input.breastfeedingEn ?? null,
      elderlyTr: input.elderlyTr ?? null,
      elderlyEn: input.elderlyEn ?? null,
      childrenTr: input.childrenTr ?? null,
      childrenEn: input.childrenEn ?? null,
      specialConditionsTr: input.specialConditionsTr ?? null,
      specialConditionsEn: input.specialConditionsEn ?? null,
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

export async function listUserMedicinesWithStatus(
  userId: number
): Promise<
  Array<{
    userMedicineId: number;
    medicineId: number;
    nameTr: string;
    nameEn: string;
    descriptionTr?: string | null;
    descriptionEn?: string | null;
    dosageTr?: string | null;
    dosageEn?: string | null;
    approvalStatus: string;
    addedBy: string;
    isActive: boolean;
  }>
> {
  const rows = await executeQuery<Record<string, unknown>>(
    `
    SELECT um.user_medicine_id, m.medicine_id, m.name_tr, m.name_en,
           m.description_tr, m.description_en,
           um.dosage_tr, um.dosage_en,
           NVL(um.approval_status, 'APPROVED') AS approval_status,
           NVL(um.added_by, 'PATIENT') AS added_by,
           um.is_active
    FROM user_medicines um
    JOIN medicines m ON m.medicine_id = um.medicine_id
    WHERE um.user_id = :userId AND um.is_active = 1
    ORDER BY um.user_medicine_id DESC
    `,
    { userId }
  );

  return rows.map((row) => ({
    userMedicineId: Number(row.USER_MEDICINE_ID),
    medicineId: Number(row.MEDICINE_ID),
    nameTr: String(row.NAME_TR),
    nameEn: String(row.NAME_EN),
    descriptionTr: row.DESCRIPTION_TR as string | null,
    descriptionEn: row.DESCRIPTION_EN as string | null,
    dosageTr: row.DOSAGE_TR as string | null,
    dosageEn: row.DOSAGE_EN as string | null,
    approvalStatus: String(row.APPROVAL_STATUS),
    addedBy: String(row.ADDED_BY),
    isActive: Number(row.IS_ACTIVE) === 1,
  }));
}

export async function findActiveUserMedicine(
  userId: number,
  medicineId: number
): Promise<number | null> {
  const rows = await executeQuery<{ USER_MEDICINE_ID: number }>(
    `
    SELECT user_medicine_id
    FROM user_medicines
    WHERE user_id = :userId
      AND medicine_id = :medicineId
      AND is_active = 1
    `,
    { userId, medicineId }
  );
  return rows[0]?.USER_MEDICINE_ID ?? null;
}

export async function addUserMedicine(input: {
  userId: number;
  medicineId: number;
  dosageTr?: string | null;
  dosageEn?: string | null;
  addedBy: "PATIENT" | "DOCTOR";
  approvalStatus: "PENDING" | "APPROVED";
  approvedByDoctorId?: number | null;
}): Promise<number> {
  const medicine = await findMedicineById(input.medicineId);
  if (!medicine) {
    throw new Error("MEDICINE_NOT_FOUND");
  }

  const existing = await findActiveUserMedicine(input.userId, input.medicineId);
  if (existing) {
    throw new Error("MEDICINE_ALREADY_ACTIVE");
  }

  await executeMutation(
    `
    INSERT INTO user_medicines (
      user_id, medicine_id, start_date, dosage, dosage_tr, dosage_en,
      is_active, added_by, approval_status, approved_by_doctor_id
    ) VALUES (
      :userId, :medicineId, SYSDATE, :dosageEn, :dosageTr, :dosageEn,
      1, :addedBy, :approvalStatus, :approvedByDoctorId
    )
    `,
    {
      userId: input.userId,
      medicineId: input.medicineId,
      dosageTr: input.dosageTr ?? null,
      dosageEn: input.dosageEn ?? null,
      addedBy: input.addedBy,
      approvalStatus: input.approvalStatus,
      approvedByDoctorId: input.approvedByDoctorId ?? null,
    }
  );

  const rows = await executeQuery<{ ID: number }>(
    `SELECT MAX(user_medicine_id) AS id FROM user_medicines WHERE user_id = :userId`,
    { userId: input.userId }
  );
  const userMedicineId = rows[0]?.ID ?? 0;

  if (input.approvalStatus === "APPROVED" && userMedicineId) {
    await executeMutation(
      `UPDATE user_medicines SET approved_at = SYSTIMESTAMP WHERE user_medicine_id = :userMedicineId`,
      { userMedicineId }
    );
  }

  return userMedicineId;
}

export async function removeUserMedicine(userMedicineId: number): Promise<boolean> {
  const affected = await executeMutation(
    `UPDATE user_medicines SET is_active = 0 WHERE user_medicine_id = :userMedicineId`,
    { userMedicineId }
  );
  return affected > 0;
}

export async function approveUserMedicine(
  userMedicineId: number,
  doctorId: number
): Promise<boolean> {
  const affected = await executeMutation(
    `
    UPDATE user_medicines SET
      approval_status = 'APPROVED',
      approved_by_doctor_id = :doctorId,
      approved_at = SYSTIMESTAMP
    WHERE user_medicine_id = :userMedicineId
    `,
    { userMedicineId, doctorId }
  );
  return affected > 0;
}

export async function deleteMedicine(medicineId: number): Promise<boolean> {
  const affected = await executeMutation(
    "DELETE FROM medicines WHERE medicine_id = :medicineId",
    { medicineId }
  );
  return affected > 0;
}
