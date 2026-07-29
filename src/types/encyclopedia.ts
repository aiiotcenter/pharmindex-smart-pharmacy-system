export interface EncyclopediaMedicineDetail {
  medicineId: number;
  nameEn: string;
  nameTr: string;
  descriptionEn?: string | null;
  descriptionTr?: string | null;
  dosageForm?: string | null;
  usesEn?: string | null;
  usesTr?: string | null;
  howToUseEn?: string | null;
  howToUseTr?: string | null;
  sideEffectsEn?: string | null;
  sideEffectsTr?: string | null;
  contraindicationsEn?: string | null;
  contraindicationsTr?: string | null;
  pregnancyEn?: string | null;
  pregnancyTr?: string | null;
  breastfeedingEn?: string | null;
  breastfeedingTr?: string | null;
  elderlyEn?: string | null;
  elderlyTr?: string | null;
  childrenEn?: string | null;
  childrenTr?: string | null;
  specialConditionsEn?: string | null;
  specialConditionsTr?: string | null;
  ingredients: Array<{ ingredientId: number; nameEn: string; nameTr: string; amountMg?: number | null }>;
  similarMedicines: Array<{ medicineId: number; nameEn: string; nameTr: string }>;
}

export interface EncyclopediaDiseaseDetail {
  diseaseId: number;
  nameEn: string;
  nameTr: string;
  descriptionEn?: string | null;
  descriptionTr?: string | null;
  symptomsEn?: string | null;
  symptomsTr?: string | null;
  treatmentEn?: string | null;
  treatmentTr?: string | null;
  whenToUseEn?: string | null;
  whenToUseTr?: string | null;
  whenNotToUseEn?: string | null;
  whenNotToUseTr?: string | null;
  affectedPatientsEn?: string | null;
  affectedPatientsTr?: string | null;
  recommendedMedicines: Array<{ medicineId: number; nameEn: string; nameTr: string; note?: string | null }>;
}

export interface EncyclopediaIngredientDetail {
  ingredientId: number;
  nameEn: string;
  nameTr: string;
  descriptionEn?: string | null;
  descriptionTr?: string | null;
  bodyEffectsEn?: string | null;
  bodyEffectsTr?: string | null;
  allergySymptomsEn?: string | null;
  allergySymptomsTr?: string | null;
  containingMedicines: Array<{ medicineId: number; nameEn: string; nameTr: string }>;
}

export type EncyclopediaCategory =
  | "all"
  | "medicine"
  | "disease"
  | "allergy"
  | "ingredient";

export interface EncyclopediaSearchItem {
  type: "medicine" | "disease" | "ingredient" | "allergy";
  id: number;
  nameEn: string;
  nameTr: string;
  subtitleEn?: string | null;
  subtitleTr?: string | null;
}
