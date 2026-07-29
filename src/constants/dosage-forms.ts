export const DOSAGE_FORM_KEYS = [
  "TABLET",
  "SYRUP",
  "CAPSULE",
  "INHALER",
  "DROPS",
  "CREAM",
  "INJECTION",
] as const;

export type DosageFormKey = (typeof DOSAGE_FORM_KEYS)[number];

const LEGACY_MAP: Record<string, DosageFormKey> = {
  Tablet: "TABLET",
  Şurup: "SYRUP",
  Syrup: "SYRUP",
  Kapsül: "CAPSULE",
  Capsule: "CAPSULE",
  İnhaler: "INHALER",
  Inhaler: "INHALER",
  Damla: "DROPS",
  Drops: "DROPS",
  Krem: "CREAM",
  Cream: "CREAM",
};

export function normalizeDosageFormKey(value: string): DosageFormKey | null {
  if ((DOSAGE_FORM_KEYS as readonly string[]).includes(value)) {
    return value as DosageFormKey;
  }
  return LEGACY_MAP[value] ?? null;
}
