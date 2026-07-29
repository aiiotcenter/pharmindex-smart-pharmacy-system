import {
  createMedicine,
  deleteMedicine,
  linkMedicineIngredient,
  listMedicines,
} from "@/repositories/medicine.repository";
import { listActiveIngredients } from "@/repositories/allergy.repository";
import type { CreateMedicineInput } from "@/server/schemas/medicine.schema";

export async function getAdminMedicineFormData() {
  const [medicines, ingredients] = await Promise.all([
    listMedicines(),
    listActiveIngredients(),
  ]);

  return { medicines, ingredients };
}

export async function addMedicine(input: CreateMedicineInput) {
  const medicine = await createMedicine({
    nameEn: input.nameEn,
    nameTr: input.nameTr,
    dosageForm: input.dosageForm,
    usesTr: input.usesTr,
    usesEn: input.usesEn,
    sideEffectsTr: input.sideEffectsTr,
    sideEffectsEn: input.sideEffectsEn,
  });

  await linkMedicineIngredient(medicine.medicineId, input.ingredientId);

  return medicine;
}

export async function removeMedicine(medicineId: number) {
  return deleteMedicine(medicineId);
}
