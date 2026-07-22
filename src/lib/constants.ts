export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;

export const FREQUENCY_TYPES = ["DAILY", "WEEKLY", "MONTHLY"] as const;

export const ALLERGY_SEVERITIES = ["MILD", "MODERATE", "SEVERE"] as const;

export const AUTH_TOKEN_COOKIE = "auth_token";

export const SUPPORTED_LOCALES = ["tr", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "tr";

export const LOCALE_COOKIE = "locale";
