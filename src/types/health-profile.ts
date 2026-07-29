export interface UserHealthProfile {
  userId: number;
  pregnancy: boolean;
  breastfeeding: boolean;
  elderly: boolean;
  menopause: boolean;
  menstruation: boolean;
  pregnancyPlanning: boolean;
  prostateHistory: boolean;
  testosteroneTherapy: boolean;
}

export const SPECIAL_CONDITION_KEYS = [
  "pregnancy",
  "breastfeeding",
  "elderly",
  "menopause",
  "menstruation",
  "pregnancyPlanning",
  "prostateHistory",
  "testosteroneTherapy",
] as const;

export type SpecialConditionKey = (typeof SPECIAL_CONDITION_KEYS)[number];

export const defaultHealthProfile: Omit<UserHealthProfile, "userId"> = {
  pregnancy: false,
  breastfeeding: false,
  elderly: false,
  menopause: false,
  menstruation: false,
  pregnancyPlanning: false,
  prostateHistory: false,
  testosteroneTherapy: false,
};
