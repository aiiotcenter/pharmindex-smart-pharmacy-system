import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import {
  forbidden,
  internalError,
  jsonOk,
  notFound,
  requireAdmin,
  requireAuth,
  unauthorized,
  validationError,
} from "@/server/http/responses";
import { createMedicineSchema } from "@/server/schemas/medicine.schema";
import {
  addMedicine,
  getAdminMedicineFormData,
  removeMedicine,
} from "@/services/admin-medicine.service";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();
  if (!requireAdmin(auth)) return forbidden();

  const data = await getAdminMedicineFormData();
  return jsonOk(data);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();
  if (!requireAdmin(auth)) return forbidden();

  try {
    const body = await request.json();
    const parsed = createMedicineSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten());
    }

    const medicine = await addMedicine(parsed.data);
    return jsonOk({ medicine }, 201);
  } catch {
    return internalError();
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();
  if (!requireAdmin(auth)) return forbidden();

  const medicineId = Number(new URL(request.url).searchParams.get("id"));
  if (!medicineId) {
    return validationError();
  }

  try {
    const deleted = await removeMedicine(medicineId);
    if (!deleted) return notFound();
    return jsonOk({ message: "DELETED" });
  } catch {
    return internalError();
  }
}
