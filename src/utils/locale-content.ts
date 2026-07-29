import type { Locale, Messages } from "@/i18n/messages";
import { normalizeDosageFormKey } from "@/constants/dosage-forms";

export function pickLocalized(
  locale: Locale,
  tr?: string | null,
  en?: string | null
): string {
  const trValue = tr?.trim() ?? "";
  const enValue = en?.trim() ?? "";

  if (locale === "tr") {
    return trValue || enValue;
  }

  return enValue || trValue;
}

export function pickLocalizedName(
  locale: Locale,
  nameTr: string,
  nameEn: string
): string {
  return locale === "tr" ? nameTr : nameEn;
}

export function translateDosageForm(
  form: string | null | undefined,
  t: Messages
): string {
  if (!form) return "";

  const key = normalizeDosageFormKey(form);
  if (key && key in t.dosageForms) {
    return t.dosageForms[key as keyof typeof t.dosageForms];
  }

  return form;
}
