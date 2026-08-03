import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import { Role } from "@/lib/roles";
import {
  createDoctorRoleRequest,
  getDoctorRoleRequestForUser,
} from "@/repositories/doctor-role.repository";
import {
  forbidden,
  internalError,
  jsonError,
  jsonOk,
  requireAuth,
  unauthorized,
} from "@/server/http/responses";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  const application = await getDoctorRoleRequestForUser(auth.userId);
  return jsonOk({ application });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();
  if (auth.roleId !== Role.USER) return forbidden();

  try {
    await createDoctorRoleRequest(auth.userId);
    return jsonOk({ success: true }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "REQUEST_EXISTS") {
      return jsonError("REQUEST_EXISTS", 409);
    }
    if (message === "ALREADY_DOCTOR") {
      return jsonError("ALREADY_DOCTOR", 409);
    }
    return internalError();
  }
}
