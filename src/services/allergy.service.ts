import { listUserAllergies } from "@/repositories/allergy.repository";

export async function getUserAllergies(userId: number) {
  return listUserAllergies(userId);
}
