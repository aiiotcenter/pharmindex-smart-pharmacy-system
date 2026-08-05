import { executeMutation, executeQuery } from "@/lib/db";

export interface ScheduleTemplate {
  frequencyType: "DAILY" | "WEEKLY" | "MONTHLY";
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  timeOfDay: string;
  notesTr: string;
  notesEn: string;
}

export function getDefaultScheduleTemplates(
  dosageForm?: string | null
): ScheduleTemplate[] {
  switch (dosageForm) {
    case "INHALER":
      return [
        {
          frequencyType: "DAILY",
          timeOfDay: "09:00",
          notesTr: "Sabah inhaler dozu",
          notesEn: "Morning inhaler dose",
        },
      ];
    case "SYRUP":
      return [
        {
          frequencyType: "DAILY",
          timeOfDay: "08:00",
          notesTr: "Kahvaltıdan sonra alın",
          notesEn: "Take after breakfast",
        },
        {
          frequencyType: "DAILY",
          timeOfDay: "20:00",
          notesTr: "Akşam dozu",
          notesEn: "Evening dose",
        },
      ];
    case "INJECTION":
      return [
        {
          frequencyType: "DAILY",
          timeOfDay: "08:00",
          notesTr: "Sabah enjeksiyon dozu",
          notesEn: "Morning injection dose",
        },
      ];
    case "CAPSULE":
      return [
        {
          frequencyType: "DAILY",
          timeOfDay: "09:00",
          notesTr: "Sabah aç veya tok karnına alın",
          notesEn: "Take in the morning with or without food",
        },
      ];
    default:
      return [
        {
          frequencyType: "DAILY",
          timeOfDay: "09:00",
          notesTr: "Sabah alın",
          notesEn: "Take in the morning",
        },
        {
          frequencyType: "DAILY",
          timeOfDay: "21:00",
          notesTr: "Akşam alın",
          notesEn: "Take in the evening",
        },
      ];
  }
}

export async function countSchedulesForUserMedicine(
  userMedicineId: number
): Promise<number> {
  const rows = await executeQuery<{ CNT: number }>(
    `
    SELECT COUNT(*) AS cnt FROM medicine_schedules
    WHERE user_medicine_id = :userMedicineId
    `,
    { userMedicineId }
  );
  return rows[0]?.CNT ?? 0;
}

export async function createMedicineSchedule(input: {
  userMedicineId: number;
  frequencyType: "DAILY" | "WEEKLY" | "MONTHLY";
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  timeOfDay: string;
  notesTr?: string | null;
  notesEn?: string | null;
}): Promise<void> {
  await executeMutation(
    `
    INSERT INTO medicine_schedules (
      user_medicine_id, frequency_type, day_of_week, day_of_month,
      time_of_day, notes, notes_tr, notes_en
    ) VALUES (
      :userMedicineId, :frequencyType, :dayOfWeek, :dayOfMonth,
      :timeOfDay, :notesEn, :notesTr, :notesEn
    )
    `,
    {
      userMedicineId: input.userMedicineId,
      frequencyType: input.frequencyType,
      dayOfWeek: input.dayOfWeek ?? null,
      dayOfMonth: input.dayOfMonth ?? null,
      timeOfDay: input.timeOfDay,
      notesTr: input.notesTr ?? null,
      notesEn: input.notesEn ?? null,
    }
  );
}

export async function createDefaultSchedulesForUserMedicine(
  userMedicineId: number,
  dosageForm?: string | null
): Promise<number> {
  const existing = await countSchedulesForUserMedicine(userMedicineId);
  if (existing > 0) return 0;

  const templates = getDefaultScheduleTemplates(dosageForm);
  for (const template of templates) {
    await createMedicineSchedule({
      userMedicineId,
      ...template,
    });
  }
  return templates.length;
}

export async function deleteSchedulesForUserMedicine(
  userMedicineId: number
): Promise<void> {
  await executeMutation(
    `DELETE FROM medicine_schedules WHERE user_medicine_id = :userMedicineId`,
    { userMedicineId }
  );
}

export interface UserReminder {
  scheduleId: number;
  medicineNameTr: string;
  medicineNameEn: string;
  frequencyType: string;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  timeOfDay: string;
  notesTr?: string | null;
  notesEn?: string | null;
  dosageTr?: string | null;
  dosageEn?: string | null;
}

export async function listUserReminders(
  userId: number
): Promise<UserReminder[]> {
  const rows = await executeQuery<{
    SCHEDULE_ID: number;
    NAME_TR: string;
    NAME_EN: string;
    FREQUENCY_TYPE: string;
    DAY_OF_WEEK?: number | null;
    DAY_OF_MONTH?: number | null;
    TIME_OF_DAY: string;
    NOTES_TR?: string | null;
    NOTES_EN?: string | null;
    DOSAGE_TR?: string | null;
    DOSAGE_EN?: string | null;
  }>(
    `
    SELECT
      ms.schedule_id,
      m.name_tr,
      m.name_en,
      ms.frequency_type,
      ms.day_of_week,
      ms.day_of_month,
      ms.time_of_day,
      ms.notes_tr,
      ms.notes_en,
      um.dosage_tr,
      um.dosage_en
    FROM medicine_schedules ms
    JOIN user_medicines um ON um.user_medicine_id = ms.user_medicine_id
    JOIN medicines m ON m.medicine_id = um.medicine_id
    WHERE um.user_id = :userId
      AND um.is_active = 1
    ORDER BY ms.time_of_day
    `,
    { userId }
  );

  return rows.map((row) => ({
    scheduleId: row.SCHEDULE_ID,
    medicineNameTr: row.NAME_TR,
    medicineNameEn: row.NAME_EN,
    frequencyType: row.FREQUENCY_TYPE,
    dayOfWeek: row.DAY_OF_WEEK,
    dayOfMonth: row.DAY_OF_MONTH,
    timeOfDay: row.TIME_OF_DAY,
    notesTr: row.NOTES_TR,
    notesEn: row.NOTES_EN,
    dosageTr: row.DOSAGE_TR,
    dosageEn: row.DOSAGE_EN,
  }));
}
