import { z } from "zod";
import { DOSAGE_FORM_KEYS } from "@/constants/dosage-forms";

const optionalBilingual = z.string().max(4000).optional().default("");

export const createMedicineSchema = z.object({
  nameEn: z.string().min(2).max(150),
  nameTr: z.string().min(2).max(150),
  dosageForm: z.enum(DOSAGE_FORM_KEYS),
  ingredientId: z.number().int().positive(),
  usesTr: optionalBilingual,
  usesEn: optionalBilingual,
  howToUseTr: optionalBilingual,
  howToUseEn: optionalBilingual,
  sideEffectsTr: optionalBilingual,
  sideEffectsEn: optionalBilingual,
  contraindicationsTr: optionalBilingual,
  contraindicationsEn: optionalBilingual,
  pregnancyTr: optionalBilingual,
  pregnancyEn: optionalBilingual,
  breastfeedingTr: optionalBilingual,
  breastfeedingEn: optionalBilingual,
  elderlyTr: optionalBilingual,
  elderlyEn: optionalBilingual,
  childrenTr: optionalBilingual,
  childrenEn: optionalBilingual,
  specialConditionsTr: optionalBilingual,
  specialConditionsEn: optionalBilingual,
});

export type CreateMedicineInput = z.infer<typeof createMedicineSchema>;

export const addPatientMedicineSchema = z.object({
  medicineId: z.number().int().positive(),
  dosageTr: z.string().max(500).optional(),
  dosageEn: z.string().max(500).optional(),
});

export const doctorAddPatientMedicineSchema = addPatientMedicineSchema.extend({
  patientId: z.number().int().positive(),
});

export const doctorAddPatientAllergySchema = z.object({
  patientId: z.number().int().positive(),
  ingredientId: z.number().int().positive(),
  severity: z.enum(["MILD", "MODERATE", "SEVERE"]).optional(),
});
