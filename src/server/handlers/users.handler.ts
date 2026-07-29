import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAllUsers } from "@/services/user.service";
import { internalError, jsonOk, unauthorized } from "@/server/http/responses";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token || !(await verifyToken(token))) {
      return unauthorized();
    }

    const users = await getAllUsers();
    return jsonOk({ users });
  } catch {
    return internalError();
  }
}
