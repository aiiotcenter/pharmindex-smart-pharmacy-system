import type { NextRequest } from "next/server";
import {
  getUserHealthProfile,
  upsertUserHealthProfile,
} from "@/repositories/health-profile.repository";
import { getAuthContext } from "@/lib/api-auth";
import { jsonOk, requireAuth, unauthorized } from "@/server/http/responses";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  const profile = await getUserHealthProfile(auth.userId);
  return jsonOk({ profile });
}

export async function PUT(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  const body = await request.json();
  const profile = await upsertUserHealthProfile(auth.userId, {
    pregnancy: Boolean(body.pregnancy),
    breastfeeding: Boolean(body.breastfeeding),
    elderly: Boolean(body.elderly),
    menopause: Boolean(body.menopause),
    menstruation: Boolean(body.menstruation),
    pregnancyPlanning: Boolean(body.pregnancyPlanning),
    prostateHistory: Boolean(body.prostateHistory),
    testosteroneTherapy: Boolean(body.testosteroneTherapy),
  });

  return jsonOk({ profile });
}
