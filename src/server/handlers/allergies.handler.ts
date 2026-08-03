import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/api-auth";
import {
  addUserAllergy,
  listActiveIngredients,
  listUserAllergies,
  removeUserAllergy,
} from "@/repositories/allergy.repository";
import {
  internalError,
  jsonError,
  jsonOk,
  notFound,
  requireAuth,
  unauthorized,
  validationError,
} from "@/server/http/responses";
import { z } from "zod";

const addAllergySchema = z.object({
  ingredientId: z.number().int().positive(),
  severity: z.enum(["MILD", "MODERATE", "SEVERE"]).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  const catalog = new URL(request.url).searchParams.get("catalog");
  if (catalog === "1") {
    const ingredients = await listActiveIngredients();
    return jsonOk({ ingredients });
  }

  const allergies = await listUserAllergies(auth.userId);
  return jsonOk({ allergies });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  try {
    const body = await request.json();
    const parsed = addAllergySchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten());

    await addUserAllergy({
      userId: auth.userId,
      ingredientId: parsed.data.ingredientId,
      severity: parsed.data.severity,
      addedBy: "PATIENT",
      approvalStatus: "PENDING",
    });

    return jsonOk({ success: true }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "INGREDIENT_NOT_FOUND") return notFound();
    if (message === "ALLERGY_ALREADY_EXISTS") {
      return jsonError("ALLERGY_ALREADY_EXISTS", 409);
    }
    return internalError();
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (!requireAuth(auth)) return unauthorized();

  const ingredientId = Number(
    new URL(request.url).searchParams.get("ingredientId")
  );
  if (!ingredientId) return validationError();

  const removed = await removeUserAllergy(auth.userId, ingredientId);
  return removed ? jsonOk({ success: true }) : notFound();
}
