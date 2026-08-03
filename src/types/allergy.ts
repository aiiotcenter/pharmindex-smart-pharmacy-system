export type AllergyApprovalStatus = "PENDING" | "APPROVED";
export type AllergyAddedBy = "PATIENT" | "DOCTOR";

export interface UserAllergy {
  userId: number;
  ingredientId: number;
  severity?: "MILD" | "MODERATE" | "SEVERE" | null;
  notes?: string | null;
  notesTr?: string | null;
  notesEn?: string | null;
  approvalStatus?: AllergyApprovalStatus;
  addedBy?: AllergyAddedBy;
}

export interface PatientAllergyItem {
  ingredientId: number;
  nameTr: string;
  nameEn: string;
  severity?: string | null;
  approvalStatus: AllergyApprovalStatus;
  addedBy: AllergyAddedBy;
}
