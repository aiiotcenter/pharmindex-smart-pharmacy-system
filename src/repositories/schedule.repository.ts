import { executeQuery } from "@/lib/db";

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
