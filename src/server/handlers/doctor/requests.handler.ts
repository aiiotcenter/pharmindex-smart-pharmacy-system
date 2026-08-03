import type { NextRequest } from "next/server";
import { getAuthContext, isPatient } from "@/lib/api-auth";
import { listDoctors, createDoctorRequest } from "@/repositories/doctor.repository";
import {
  forbidden,
  internalError,
  jsonOk,
  requireAuth,
  unauthorized,
  validationError,
} from "@/server/http/responses";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  const doctors = await listDoctors();
  return jsonOk({ doctors });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();
  if (!isPatient(auth)) return forbidden();

  try {
    const body = await request.json();
    const doctorId = Number(body.doctorId);
    if (!doctorId) return validationError();
    await createDoctorRequest(auth.userId, doctorId);
    return jsonOk({ success: true }, 201);
  } catch {
    return internalError();
  }
}
