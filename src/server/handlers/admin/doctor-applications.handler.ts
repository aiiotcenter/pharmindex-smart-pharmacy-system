import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import {
  approveDoctorRoleRequest,
  listAllDoctorRoleRequests,
  listPendingDoctorRoleRequests,
  rejectDoctorRoleRequest,
} from "@/repositories/doctor-role.repository";
import {
  forbidden,
  internalError,
  jsonOk,
  requireAdmin,
  requireAuth,
  unauthorized,
  validationError,
} from "@/server/http/responses";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();
  if (!requireAdmin(auth)) return forbidden();

  const pendingOnly = request.nextUrl.searchParams.get("pending") === "1";
  const requests = pendingOnly
    ? await listPendingDoctorRoleRequests()
    : await listAllDoctorRoleRequests();

  return jsonOk({ requests });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();
  if (!requireAdmin(auth)) return forbidden();

  try {
    const body = await request.json();
    const requestId = Number(body.requestId);
    const action = body.action;

    if (!requestId || (action !== "approve" && action !== "reject")) {
      return validationError();
    }

    if (action === "approve") {
      await approveDoctorRoleRequest(requestId, auth.userId);
    } else {
      await rejectDoctorRoleRequest(requestId, auth.userId);
    }

    return jsonOk({ success: true });
  } catch {
    return internalError();
  }
}
