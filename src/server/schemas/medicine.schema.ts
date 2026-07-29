import { z } from "zod";
import { DOSAGE_FORM_KEYS } from "@/constants/dosage-forms";

export const createMedicineSchema = z.object({
  nameEn: z.string().min(2).max(150),
  nameTr: z.string().min(2).max(150),
  dosageForm: z.enum(DOSAGE_FORM_KEYS),
  ingredientId: z.number().int().positive(),
  usesTr: z.string().min(2).max(4000),
  usesEn: z.string().min(2).max(4000),
  sideEffectsTr: z.string().min(2).max(4000),
  sideEffectsEn: z.string().min(2).max(4000),
});

export type CreateMedicineInput = z.infer<typeof createMedicineSchema>;
