import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import {
  addUserMedicine,
  listUserMedicinesWithStatus,
  removeUserMedicine,
} from "@/repositories/medicine.repository";
import { listMedicines } from "@/repositories/medicine.repository";
import { addPatientMedicineSchema } from "@/server/schemas/medicine.schema";
import {
  forbidden,
  internalError,
  jsonError,
  jsonOk,
  notFound,
  requireAuth,
  unauthorized,
  validationError,
} from "@/server/http/responses";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  const catalog = new URL(request.url).searchParams.get("catalog");
  if (catalog === "1") {
    const medicines = await listMedicines();
    return jsonOk({ medicines });
  }

  const medicines = await listUserMedicinesWithStatus(auth.userId);
  return jsonOk({ medicines });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  try {
    const body = await request.json();
    const parsed = addPatientMedicineSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    const userMedicineId = await addUserMedicine({
      userId: auth.userId,
      medicineId: parsed.data.medicineId,
      dosageTr: parsed.data.dosageTr,
      dosageEn: parsed.data.dosageEn,
      addedBy: "PATIENT",
      approvalStatus: "PENDING",
    });

    return jsonOk({ userMedicineId }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "MEDICINE_NOT_FOUND") return notFound();
    if (message === "MEDICINE_ALREADY_ACTIVE") {
      return jsonError("MEDICINE_ALREADY_ACTIVE", 409);
    }
    return internalError();
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  const userMedicineId = Number(new URL(request.url).searchParams.get("id"));
  if (!userMedicineId) return validationError();

  const ok = await removeUserMedicine(userMedicineId);
  return ok ? jsonOk({ success: true }) : notFound();
}
