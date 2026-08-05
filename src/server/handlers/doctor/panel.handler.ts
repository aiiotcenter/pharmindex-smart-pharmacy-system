import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import {
  listDoctorRequests,
  listDoctorPatients,
  listPendingMedicinesForDoctor,
  respondDoctorRequest,
  getPatientDetailForDoctor,
  isDoctorPatient,
} from "@/repositories/doctor.repository";
import {
  addUserDisease,
  listDiseases,
  removeUserDisease,
} from "@/repositories/disease.repository";
import {
  addUserAllergy,
  approveUserAllergy,
  listPendingAllergiesForDoctor,
  removeUserAllergy,
} from "@/repositories/allergy.repository";
import {
  addUserMedicine,
  approveUserMedicine,
  removeUserMedicine,
} from "@/repositories/medicine.repository";
import {
  doctorAddPatientAllergySchema,
  doctorAddPatientMedicineSchema,
} from "@/server/schemas/medicine.schema";
import { doctorAddPatientDiseaseSchema } from "@/server/schemas/disease.schema";
import {
  provisionTreatmentForDiagnosis,
  removeTreatmentForDiagnosis,
} from "@/services/diagnosis-provisioning.service";
import {
  forbidden,
  internalError,
  jsonError,
  jsonOk,
  notFound,
  requireAuth,
  requireDoctor,
  unauthorized,
  validationError,
} from "@/server/http/responses";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();
  if (!requireDoctor(auth)) return forbidden();

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");

  if (view === "requests") {
    const requests = await listDoctorRequests(auth.userId);
    return jsonOk({ requests });
  }

  if (view === "pending-medicines") {
    const medicines = await listPendingMedicinesForDoctor(auth.userId);
    return jsonOk({ medicines });
  }

  if (view === "pending-allergies") {
    const allergies = await listPendingAllergiesForDoctor(auth.userId);
    return jsonOk({ allergies });
  }

  if (view === "disease-catalog") {
    const diseases = await listDiseases();
    return jsonOk({ diseases });
  }

  const patientId = Number(searchParams.get("patientId"));
  if (patientId) {
    const patient = await getPatientDetailForDoctor(auth.userId, patientId);
    if (!patient) return forbidden();
    return jsonOk({ patient });
  }

  const patients = await listDoctorPatients(auth.userId);
  return jsonOk({ patients });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();
  if (!requireDoctor(auth)) return forbidden();

  try {
    const body = await request.json();

    if (body.action === "respond-request") {
      const requestId = Number(body.requestId);
      const approve = Boolean(body.approve);
      if (!requestId) return validationError();
      const ok = await respondDoctorRequest(requestId, auth.userId, approve);
      return ok ? jsonOk({ success: true }) : notFound();
    }

    if (body.action === "approve-medicine") {
      const userMedicineId = Number(body.userMedicineId);
      if (!userMedicineId) return validationError();
      const ok = await approveUserMedicine(userMedicineId, auth.userId);
      return ok ? jsonOk({ success: true }) : notFound();
    }

    if (body.action === "approve-allergy") {
      const patientId = Number(body.patientId);
      const ingredientId = Number(body.ingredientId);
      if (!patientId || !ingredientId) return validationError();
      const allowed = await isDoctorPatient(auth.userId, patientId);
      if (!allowed) return forbidden();
      const ok = await approveUserAllergy(patientId, ingredientId, auth.userId);
      return ok ? jsonOk({ success: true }) : notFound();
    }

    if (body.action === "add-allergy") {
      const parsed = doctorAddPatientAllergySchema.safeParse(body);
      if (!parsed.success) return validationError(parsed.error.flatten());
      const allowed = await isDoctorPatient(auth.userId, parsed.data.patientId);
      if (!allowed) return forbidden();
      await addUserAllergy({
        userId: parsed.data.patientId,
        ingredientId: parsed.data.ingredientId,
        severity: parsed.data.severity,
        addedBy: "DOCTOR",
        approvalStatus: "APPROVED",
        approvedByDoctorId: auth.userId,
      });
      return jsonOk({ success: true }, 201);
    }

    if (body.action === "add-disease") {
      const parsed = doctorAddPatientDiseaseSchema.safeParse(body);
      if (!parsed.success) return validationError(parsed.error.flatten());
      const allowed = await isDoctorPatient(auth.userId, parsed.data.patientId);
      if (!allowed) return forbidden();
      await addUserDisease(parsed.data.patientId, parsed.data.diseaseId);
      const provision = await provisionTreatmentForDiagnosis(
        parsed.data.patientId,
        parsed.data.diseaseId,
        auth.userId
      );
      return jsonOk({ success: true, provision }, 201);
    }

    const parsed = doctorAddPatientMedicineSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const allowed = await isDoctorPatient(auth.userId, parsed.data.patientId);
    if (!allowed) return forbidden();

    const userMedicineId = await addUserMedicine({
      userId: parsed.data.patientId,
      medicineId: parsed.data.medicineId,
      dosageTr: parsed.data.dosageTr,
      dosageEn: parsed.data.dosageEn,
      addedBy: "DOCTOR",
      approvalStatus: "APPROVED",
      approvedByDoctorId: auth.userId,
    });

    return jsonOk({ userMedicineId }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "MEDICINE_NOT_FOUND" || message === "INGREDIENT_NOT_FOUND" || message === "DISEASE_NOT_FOUND") {
      return notFound();
    }
    if (
      message === "MEDICINE_ALREADY_ACTIVE" ||
      message === "ALLERGY_ALREADY_EXISTS" ||
      message === "DISEASE_ALREADY_EXISTS"
    ) {
      return jsonError(message, 409);
    }
    return internalError();
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();
  if (!requireDoctor(auth)) return forbidden();

  const userMedicineId = Number(new URL(request.url).searchParams.get("id"));
  const patientId = Number(new URL(request.url).searchParams.get("patientId"));
  const ingredientId = Number(
    new URL(request.url).searchParams.get("ingredientId")
  );
  const diseaseId = Number(new URL(request.url).searchParams.get("diseaseId"));

  if (!patientId) return validationError();

  const allowed = await isDoctorPatient(auth.userId, patientId);
  if (!allowed) return forbidden();

  if (diseaseId) {
    await removeTreatmentForDiagnosis(patientId, diseaseId);
    const ok = await removeUserDisease(patientId, diseaseId);
    return ok ? jsonOk({ success: true }) : notFound();
  }

  if (ingredientId) {
    const ok = await removeUserAllergy(patientId, ingredientId);
    return ok ? jsonOk({ success: true }) : notFound();
  }

  if (!userMedicineId) return validationError();

  const ok = await removeUserMedicine(userMedicineId);
  return ok ? jsonOk({ success: true }) : notFound();
}
