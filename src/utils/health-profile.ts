import type { Messages, MessageKey } from "@/i18n/messages";
import type { Locale } from "@/i18n/messages";
import type {
  SpecialConditionKey,
  UserHealthProfile,
} from "@/types/health-profile";
import { SPECIAL_CONDITION_KEYS } from "@/types/health-profile";
import { pickLocalized } from "@/utils/locale-content";

const CONDITION_LABEL_KEYS: Record<SpecialConditionKey, MessageKey> = {
  pregnancy: "pregnancy",
  breastfeeding: "breastfeeding",
  elderly: "elderly",
  menopause: "menopause",
  menstruation: "menstruation",
  pregnancyPlanning: "pregnancyPlanning",
  prostateHistory: "prostateHistory",
  testosteroneTherapy: "testosteroneTherapy",
};

export function getActiveSpecialConditions(
  profile: Omit<UserHealthProfile, "userId">,
  t: Messages
): string[] {
  return SPECIAL_CONDITION_KEYS.filter((key) => profile[key]).map(
    (key) => t[CONDITION_LABEL_KEYS[key]]
  );
}

export function translateFrequency(
  frequency: string,
  t: Messages
): string {
  const map: Record<string, string> = {
    DAILY: t.frequencyDaily,
    WEEKLY: t.frequencyWeekly,
    MONTHLY: t.frequencyMonthly,
  };
  return map[frequency] ?? frequency;
}

export function translateSeverity(severity: string, t: Messages): string {
  const map: Record<string, string> = {
    MILD: t.severityMild,
    MODERATE: t.severityModerate,
    SEVERE: t.severitySevere,
  };
  return map[severity] ?? severity;
}

export function translateGender(gender: string, t: Messages): string {
  const map: Record<string, string> = {
    MALE: t.male,
    FEMALE: t.female,
    OTHER: t.other,
  };
  return map[gender] ?? gender;
}

export function translateRole(role: string, t: Messages): string {
  const map: Record<string, string> = {
    USER: t.roleUser,
    ADMIN: t.roleAdmin,
  };
  return map[role] ?? role;
}

export function translateWeekDay(day: number, t: Messages): string {
  const days: Record<number, string> = {
    1: t.weekDay1,
    2: t.weekDay2,
    3: t.weekDay3,
    4: t.weekDay4,
    5: t.weekDay5,
    6: t.weekDay6,
    7: t.weekDay7,
  };
  return days[day] ?? String(day);
}

export function formatReminderSchedule(
  item: {
    frequencyType: string;
    dayOfWeek?: number | null;
    dayOfMonth?: number | null;
    timeOfDay: string;
  },
  t: Messages
): string {
  const frequency = translateFrequency(item.frequencyType, t);

  if (item.frequencyType === "WEEKLY" && item.dayOfWeek) {
    return `${frequency} · ${translateWeekDay(item.dayOfWeek, t)} · ${item.timeOfDay}`;
  }

  if (item.frequencyType === "MONTHLY" && item.dayOfMonth) {
    return `${frequency} · ${t.dayOfMonth} ${item.dayOfMonth} · ${item.timeOfDay}`;
  }

  return `${frequency} · ${item.timeOfDay}`;
}

export function localizedReminderNotes(
  locale: Locale,
  notesTr?: string | null,
  notesEn?: string | null
): string | null {
  const value = pickLocalized(locale, notesTr, notesEn);
  return value || null;
}

export function localizedDosage(
  locale: Locale,
  dosageTr?: string | null,
  dosageEn?: string | null
): string | null {
  const value = pickLocalized(locale, dosageTr, dosageEn);
  return value || null;
}
