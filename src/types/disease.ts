export interface Disease {
  diseaseId: number;
  nameEn: string;
  nameTr: string;
  descriptionEn?: string | null;
  descriptionTr?: string | null;
}

export interface UserDisease {
  userId: number;
  diseaseId: number;
  diagnosedDate?: string | null;
}

export interface DiseaseMedicine {
  diseaseId: number;
  medicineId: number;
  recommendationNote?: string | null;
}
