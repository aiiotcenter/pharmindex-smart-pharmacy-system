import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import { listUserReminders } from "@/repositories/schedule.repository";
import { jsonOk, requireAuth, unauthorized } from "@/server/http/responses";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  const reminders = await listUserReminders(auth.userId);
  return jsonOk({ reminders });
}
