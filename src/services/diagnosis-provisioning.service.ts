import {
  isMedicineLinkedToOtherUserDiseases,
  listMedicinesForDisease,
} from "@/repositories/disease.repository";
import {
  addUserMedicine,
  findActiveUserMedicine,
  removeUserMedicine,
} from "@/repositories/medicine.repository";
import { createDefaultSchedulesForUserMedicine } from "@/repositories/schedule.repository";
import { checkMedicineAllergyConflict } from "@/services/medicine.service";

export interface DiagnosisProvisionResult {
  medicinesAdded: number;
  schedulesAdded: number;
  skippedAllergies: number;
  skippedExisting: number;
}

export async function provisionTreatmentForDiagnosis(
  userId: number,
  diseaseId: number,
  doctorId: number
): Promise<DiagnosisProvisionResult> {
  const medicines = await listMedicinesForDisease(diseaseId);
  const result: DiagnosisProvisionResult = {
    medicinesAdded: 0,
    schedulesAdded: 0,
    skippedAllergies: 0,
    skippedExisting: 0,
  };

  for (const medicine of medicines) {
    const conflict = await checkMedicineAllergyConflict(userId, medicine.medicineId);
    if (conflict.hasConflict) {
      result.skippedAllergies += 1;
      continue;
    }

    let userMedicineId = await findActiveUserMedicine(userId, medicine.medicineId);

    if (!userMedicineId) {
      try {
        userMedicineId = await addUserMedicine({
          userId,
          medicineId: medicine.medicineId,
          dosageTr: medicine.recommendationNote ?? "Doktor önerisiyle",
          dosageEn: medicine.recommendationNote ?? "As prescribed by doctor",
          addedBy: "DOCTOR",
          approvalStatus: "APPROVED",
          approvedByDoctorId: doctorId,
        });
        result.medicinesAdded += 1;
      } catch (error) {
        if (error instanceof Error && error.message === "MEDICINE_ALREADY_ACTIVE") {
          userMedicineId = await findActiveUserMedicine(userId, medicine.medicineId);
          result.skippedExisting += 1;
        } else {
          throw error;
        }
      }
    } else {
      result.skippedExisting += 1;
    }

    if (userMedicineId) {
      const addedSchedules = await createDefaultSchedulesForUserMedicine(
        userMedicineId,
        medicine.dosageForm
      );
      result.schedulesAdded += addedSchedules;
    }
  }

  return result;
}

export async function removeTreatmentForDiagnosis(
  userId: number,
  diseaseId: number
): Promise<number> {
  const medicines = await listMedicinesForDisease(diseaseId);
  let removed = 0;

  for (const medicine of medicines) {
    const stillNeeded = await isMedicineLinkedToOtherUserDiseases(
      userId,
      medicine.medicineId,
      diseaseId
    );
    if (stillNeeded) continue;

    const userMedicineId = await findActiveUserMedicine(userId, medicine.medicineId);
    if (!userMedicineId) continue;

    const ok = await removeUserMedicine(userMedicineId);
    if (ok) removed += 1;
  }

  return removed;
}
