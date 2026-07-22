export interface UserAllergy {
  userId: number;
  ingredientId: number;
  severity?: "MILD" | "MODERATE" | "SEVERE" | null;
  notes?: string | null;
}
