export type MedicineApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type MedicineAddedBy = "PATIENT" | "DOCTOR";
export type DoctorRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface DoctorPatientRequest {
  requestId: number;
  patientId: number;
  doctorId: number;
  status: DoctorRequestStatus;
  requestedAt: string;
  respondedAt?: string | null;
  patientName?: string;
  patientSurname?: string;
  patientUsername?: string;
  doctorName?: string;
  doctorSurname?: string;
}

export interface DoctorPatientSummary {
  patientId: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  linkedAt: string;
}

export interface PatientMedicineItem {
  userMedicineId: number;
  medicineId: number;
  nameTr: string;
  nameEn: string;
  dosageTr?: string | null;
  dosageEn?: string | null;
  startDate: string;
  approvalStatus: MedicineApprovalStatus;
  addedBy: MedicineAddedBy;
  isActive: boolean;
}

export interface PendingPatientAllergyItem {
  ingredientId: number;
  patientId: number;
  patientName: string;
  patientSurname: string;
  nameTr: string;
  nameEn: string;
  severity?: string | null;
  approvalStatus: "PENDING";
  addedBy: "PATIENT";
}

export interface DoctorListItem {
  userId: number;
  username: string;
  name: string;
  surname: string;
  email: string;
}

export interface PatientDiseaseItem {
  diseaseId: number;
  nameTr: string;
  nameEn: string;
  descriptionTr?: string | null;
  descriptionEn?: string | null;
  diagnosedDate?: string | null;
}

export interface PatientAllergyItem {
  ingredientId: number;
  nameTr: string;
  nameEn: string;
  severity?: string | null;
  notesTr?: string | null;
  notesEn?: string | null;
  approvalStatus: string;
  addedBy: string;
}

export interface PatientDetailForDoctor {
  patientId: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  birthDate?: string | null;
  gender?: string | null;
  linkedAt?: string | null;
  healthProfile: {
    pregnancy: boolean;
    breastfeeding: boolean;
    elderly: boolean;
    menopause: boolean;
    menstruation: boolean;
    pregnancyPlanning: boolean;
    prostateHistory: boolean;
    testosteroneTherapy: boolean;
  };
  diseases: PatientDiseaseItem[];
  allergies: PatientAllergyItem[];
  medicines: PatientMedicineItem[];
}
