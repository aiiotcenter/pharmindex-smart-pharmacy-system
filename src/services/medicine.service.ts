import {
  findMedicineById,
  getMedicineIngredientIds,
  listMedicines,
  listUserMedicines,
} from "@/repositories/medicine.repository";
import { getUserAllergyIngredientIds } from "@/repositories/allergy.repository";
import type { Medicine } from "@/types/medicine";

export async function searchMedicines(search?: string): Promise<Medicine[]> {
  return listMedicines(search);
}

export async function getUserMedicines(userId: number): Promise<Medicine[]> {
  return listUserMedicines(userId);
}

export async function checkMedicineAllergyConflict(
  userId: number,
  medicineId: number
): Promise<{
  hasConflict: boolean;
  conflictingIngredientIds: number[];
}> {
  const [allergyIds, ingredientIds] = await Promise.all([
    getUserAllergyIngredientIds(userId),
    getMedicineIngredientIds(medicineId),
  ]);

  const allergySet = new Set(allergyIds);
  const conflictingIngredientIds = ingredientIds.filter((id) =>
    allergySet.has(id)
  );

  return {
    hasConflict: conflictingIngredientIds.length > 0,
    conflictingIngredientIds,
  };
}

export async function getMedicineDetails(medicineId: number) {
  return findMedicineById(medicineId);
}
