import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getAuthContext } from "@/lib/api-auth";
import {
  canSwitchViewMode,
  panelViewModeForRole,
  type ViewMode,
} from "@/lib/roles";
import {
  buildAuthCookie,
  switchViewMode as switchViewModeService,
} from "@/services/auth.service";
import {
  forbidden,
  internalError,
  jsonOk,
  requireAuth,
  unauthorized,
  validationError,
} from "@/server/http/responses";

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();
  if (!canSwitchViewMode(auth.roleId)) return forbidden();

  try {
    const body = await request.json();
    const mode = body.mode as ViewMode;
    const panelMode = panelViewModeForRole(auth.roleId);

    if (mode !== "USER" && mode !== panelMode) {
      return validationError();
    }

    const result = await switchViewModeService(
      auth.userId,
      auth.username,
      auth.roleId,
      mode
    );

    const cookie = buildAuthCookie(result.token);
    const cookieStore = await cookies();
    cookieStore.set(cookie.name, cookie.value, cookie.options);

    return jsonOk({ viewMode: result.viewMode });
  } catch {
    return internalError();
  }
}
