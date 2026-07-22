export interface Medicine {
  medicineId: number;
  nameEn: string;
  nameTr: string;
  descriptionEn?: string | null;
  descriptionTr?: string | null;
  dosageForm?: string | null;
}

export interface UserMedicine {
  userMedicineId: number;
  userId: number;
  medicineId: number;
  startDate: string;
  endDate?: string | null;
  dosage?: string | null;
  isActive: boolean;
}

export interface MedicineSchedule {
  scheduleId: number;
  userMedicineId: number;
  frequencyType: "DAILY" | "WEEKLY" | "MONTHLY";
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  timeOfDay: string;
  notes?: string | null;
}

export interface ActiveIngredient {
  ingredientId: number;
  nameEn: string;
  nameTr: string;
  descriptionEn?: string | null;
  descriptionTr?: string | null;
}
