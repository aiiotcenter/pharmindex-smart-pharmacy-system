import { buildAuthCookie, login } from "@/services/auth.service";
import { loginSchema } from "@/utils/validation";
import {
  internalError,
  jsonError,
  jsonOk,
  validationError,
} from "@/server/http/responses";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten());
    }

    const result = await login(parsed.data);
    const response = jsonOk({
      user: result.user,
      message: "LOGIN_SUCCESS",
    });

    const cookie = buildAuthCookie(result.token);
    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "INVALID_CREDENTIALS") {
      return jsonError(message, 401);
    }

    return internalError();
  }
}
