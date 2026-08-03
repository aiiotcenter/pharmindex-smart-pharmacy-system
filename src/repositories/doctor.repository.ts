import { executeMutation, executeQuery } from "@/lib/db";
import type {
  DoctorListItem,
  DoctorPatientRequest,
  DoctorPatientSummary,
  PatientMedicineItem,
} from "@/types/doctor";

export async function listDoctors(): Promise<DoctorListItem[]> {
  const rows = await executeQuery<Record<string, unknown>>(
    `SELECT user_id, username, name, surname, email FROM users WHERE role_id = 2 ORDER BY name`
  );
  return rows.map((row) => ({
    userId: Number(row.USER_ID),
    username: String(row.USERNAME),
    name: String(row.NAME),
    surname: String(row.SURNAME),
    email: String(row.EMAIL),
  }));
}

export async function createDoctorRequest(
  patientId: number,
  doctorId: number
): Promise<void> {
  const existing = await executeQuery<{ CNT: number }>(
    `
    SELECT COUNT(*) AS cnt FROM doctor_patient_requests
    WHERE patient_id = :patientId AND doctor_id = :doctorId AND status = 'PENDING'
    `,
    { patientId, doctorId }
  );
  if ((existing[0]?.CNT ?? 0) > 0) return;

  const linked = await executeQuery<{ CNT: number }>(
    `
    SELECT COUNT(*) AS cnt FROM doctor_patients
    WHERE patient_id = :patientId AND doctor_id = :doctorId
    `,
    { patientId, doctorId }
  );
  if ((linked[0]?.CNT ?? 0) > 0) return;

  await executeMutation(
    `
    INSERT INTO doctor_patient_requests (patient_id, doctor_id, status)
    VALUES (:patientId, :doctorId, 'PENDING')
    `,
    { patientId, doctorId }
  );
}

export async function listDoctorRequests(
  doctorId: number,
  status = "PENDING"
): Promise<DoctorPatientRequest[]> {
  const rows = await executeQuery<Record<string, unknown>>(
    `
    SELECT r.request_id, r.patient_id, r.doctor_id, r.status,
           r.requested_at, r.responded_at,
           u.name, u.surname, u.username
    FROM doctor_patient_requests r
    JOIN users u ON u.user_id = r.patient_id
    WHERE r.doctor_id = :doctorId AND r.status = :status
    ORDER BY r.requested_at DESC
    `,
    { doctorId, status }
  );

  return rows.map((row) => ({
    requestId: Number(row.REQUEST_ID),
    patientId: Number(row.PATIENT_ID),
    doctorId: Number(row.DOCTOR_ID),
    status: row.STATUS as DoctorPatientRequest["status"],
    requestedAt: String(row.REQUESTED_AT),
    respondedAt: row.RESPONDED_AT as string | null,
    patientName: String(row.NAME),
    patientSurname: String(row.SURNAME),
    patientUsername: String(row.USERNAME),
  }));
}

export async function respondDoctorRequest(
  requestId: number,
  doctorId: number,
  approve: boolean
): Promise<boolean> {
  const status = approve ? "APPROVED" : "REJECTED";
  const affected = await executeMutation(
    `
    UPDATE doctor_patient_requests SET
      status = :status,
      responded_at = SYSTIMESTAMP
    WHERE request_id = :requestId AND doctor_id = :doctorId AND status = 'PENDING'
    `,
    { requestId, doctorId, status }
  );

  if (affected === 0) return false;

  if (approve) {
    const rows = await executeQuery<{ PATIENT_ID: number }>(
      `SELECT patient_id FROM doctor_patient_requests WHERE request_id = :requestId`,
      { requestId }
    );
    const patientId = rows[0]?.PATIENT_ID;
    if (patientId) {
      const exists = await executeQuery<{ CNT: number }>(
        `
        SELECT COUNT(*) AS cnt FROM doctor_patients
        WHERE doctor_id = :doctorId AND patient_id = :patientId
        `,
        { doctorId, patientId }
      );
      if ((exists[0]?.CNT ?? 0) === 0) {
        await executeMutation(
          `
          INSERT INTO doctor_patients (doctor_id, patient_id)
          VALUES (:doctorId, :patientId)
          `,
          { doctorId, patientId }
        );
      }
    }
  }

  return true;
}

export async function listDoctorPatients(
  doctorId: number
): Promise<DoctorPatientSummary[]> {
  const rows = await executeQuery<Record<string, unknown>>(
    `
    SELECT u.user_id, u.username, u.name, u.surname, u.email, dp.linked_at
    FROM doctor_patients dp
    JOIN users u ON u.user_id = dp.patient_id
    WHERE dp.doctor_id = :doctorId
    ORDER BY u.name
    `,
    { doctorId }
  );

  return rows.map((row) => ({
    patientId: Number(row.USER_ID),
    username: String(row.USERNAME),
    name: String(row.NAME),
    surname: String(row.SURNAME),
    email: String(row.EMAIL),
    linkedAt: String(row.LINKED_AT),
  }));
}

export async function isDoctorPatient(
  doctorId: number,
  patientId: number
): Promise<boolean> {
  const rows = await executeQuery<{ CNT: number }>(
    `
    SELECT COUNT(*) AS cnt FROM doctor_patients
    WHERE doctor_id = :doctorId AND patient_id = :patientId
    `,
    { doctorId, patientId }
  );
  return (rows[0]?.CNT ?? 0) > 0;
}

export async function getPatientProfileForDoctor(patientId: number) {
  const userRows = await executeQuery<Record<string, unknown>>(
    `SELECT user_id, username, name, surname, email, birth_date, gender FROM users WHERE user_id = :patientId`,
    { patientId }
  );
  if (!userRows[0]) return null;

  const diseases = await executeQuery<Record<string, unknown>>(
    `
    SELECT d.disease_id, d.name_tr, d.name_en, d.description_tr, d.description_en
    FROM user_diseases ud
    JOIN diseases d ON d.disease_id = ud.disease_id
    WHERE ud.user_id = :patientId
    `,
    { patientId }
  );

  const allergies = await executeQuery<Record<string, unknown>>(
    `
    SELECT ai.ingredient_id, ai.name_tr, ai.name_en, ua.severity, ua.notes_tr, ua.notes_en
    FROM user_allergies ua
    JOIN active_ingredients ai ON ai.ingredient_id = ua.ingredient_id
    WHERE ua.user_id = :patientId
    `,
    { patientId }
  );

  const profile = await executeQuery<Record<string, unknown>>(
    `SELECT * FROM user_health_profile WHERE user_id = :patientId`,
    { patientId }
  );

  return {
    user: userRows[0],
    diseases,
    allergies,
    healthProfile: profile[0] ?? null,
  };
}

export async function listPatientMedicinesForDoctor(
  patientId: number
): Promise<PatientMedicineItem[]> {
  const rows = await executeQuery<Record<string, unknown>>(
    `
    SELECT um.user_medicine_id, m.medicine_id, m.name_tr, m.name_en,
           um.dosage_tr, um.dosage_en, um.start_date,
           NVL(um.approval_status, 'APPROVED') AS approval_status,
           NVL(um.added_by, 'PATIENT') AS added_by,
           um.is_active
    FROM user_medicines um
    JOIN medicines m ON m.medicine_id = um.medicine_id
    WHERE um.user_id = :patientId AND um.is_active = 1
    ORDER BY um.user_medicine_id DESC
    `,
    { patientId }
  );

  return rows.map((row) => ({
    userMedicineId: Number(row.USER_MEDICINE_ID),
    medicineId: Number(row.MEDICINE_ID),
    nameTr: String(row.NAME_TR),
    nameEn: String(row.NAME_EN),
    dosageTr: row.DOSAGE_TR as string | null,
    dosageEn: row.DOSAGE_EN as string | null,
    startDate: String(row.START_DATE),
    approvalStatus: row.APPROVAL_STATUS as PatientMedicineItem["approvalStatus"],
    addedBy: row.ADDED_BY as PatientMedicineItem["addedBy"],
    isActive: Number(row.IS_ACTIVE) === 1,
  }));
}

export async function listPendingMedicinesForDoctor(
  doctorId: number
): Promise<
  Array<PatientMedicineItem & { patientId: number; patientName: string; patientSurname: string }>
> {
  const rows = await executeQuery<Record<string, unknown>>(
    `
    SELECT um.user_medicine_id, um.user_id AS patient_id,
           m.medicine_id, m.name_tr, m.name_en,
           um.dosage_tr, um.dosage_en, um.start_date,
           um.approval_status, um.added_by, um.is_active,
           u.name, u.surname
    FROM user_medicines um
    JOIN medicines m ON m.medicine_id = um.medicine_id
    JOIN users u ON u.user_id = um.user_id
    JOIN doctor_patients dp ON dp.patient_id = um.user_id AND dp.doctor_id = :doctorId
    WHERE um.approval_status = 'PENDING' AND um.is_active = 1
    ORDER BY um.user_medicine_id DESC
    `,
    { doctorId }
  );

  return rows.map((row) => ({
    userMedicineId: Number(row.USER_MEDICINE_ID),
    patientId: Number(row.PATIENT_ID),
    medicineId: Number(row.MEDICINE_ID),
    nameTr: String(row.NAME_TR),
    nameEn: String(row.NAME_EN),
    dosageTr: row.DOSAGE_TR as string | null,
    dosageEn: row.DOSAGE_EN as string | null,
    startDate: String(row.START_DATE),
    approvalStatus: row.APPROVAL_STATUS as PatientMedicineItem["approvalStatus"],
    addedBy: row.ADDED_BY as PatientMedicineItem["addedBy"],
    isActive: Number(row.IS_ACTIVE) === 1,
    patientName: String(row.NAME),
    patientSurname: String(row.SURNAME),
  }));
}
