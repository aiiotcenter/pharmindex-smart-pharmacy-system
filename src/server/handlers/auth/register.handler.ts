import { register } from "@/services/auth.service";
import { registerSchema } from "@/utils/validation";
import {
  internalError,
  jsonError,
  jsonOk,
  validationError,
} from "@/server/http/responses";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten());
    }

    const { confirmPassword: _confirmPassword, ...registerInput } = parsed.data;
    const result = await register(registerInput);

    return jsonOk({
      user: result.user,
      message: "REGISTER_SUCCESS",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "USERNAME_EXISTS" || message === "EMAIL_EXISTS") {
      return jsonError(message, 409);
    }

    return internalError();
  }
}
