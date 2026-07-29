import { executeMutation, executeQuery } from "@/lib/db";

import type { UserHealthProfile } from "@/types/health-profile";
import { defaultHealthProfile } from "@/types/health-profile";

export type { UserHealthProfile };

function mapProfile(row: Record<string, unknown>): UserHealthProfile {
  return {
    userId: Number(row.USER_ID),
    pregnancy: Number(row.PREGNANCY) === 1,
    breastfeeding: Number(row.BREASTFEEDING) === 1,
    elderly: Number(row.ELDERLY) === 1,
    menopause: Number(row.MENOPAUSE) === 1,
    menstruation: Number(row.MENSTRUATION) === 1,
    pregnancyPlanning: Number(row.PREGNANCY_PLANNING) === 1,
    prostateHistory: Number(row.PROSTATE_HISTORY) === 1,
    testosteroneTherapy: Number(row.TESTOSTERONE_THERAPY) === 1,
  };
}

export async function getUserHealthProfile(
  userId: number
): Promise<UserHealthProfile> {
  const rows = await executeQuery<Record<string, unknown>>(
    `SELECT * FROM user_health_profile WHERE user_id = :userId`,
    { userId }
  );

  if (!rows[0]) {
    return { userId, ...defaultHealthProfile };
  }

  return mapProfile(rows[0]);
}

export async function upsertUserHealthProfile(
  userId: number,
  profile: Omit<UserHealthProfile, "userId">
): Promise<UserHealthProfile> {
  const existing = await executeQuery<{ CNT: number }>(
    `SELECT COUNT(*) AS cnt FROM user_health_profile WHERE user_id = :userId`,
    { userId }
  );

  const binds = {
    userId,
    pregnancy: profile.pregnancy ? 1 : 0,
    breastfeeding: profile.breastfeeding ? 1 : 0,
    elderly: profile.elderly ? 1 : 0,
    menopause: profile.menopause ? 1 : 0,
    menstruation: profile.menstruation ? 1 : 0,
    pregnancyPlanning: profile.pregnancyPlanning ? 1 : 0,
    prostateHistory: profile.prostateHistory ? 1 : 0,
    testosteroneTherapy: profile.testosteroneTherapy ? 1 : 0,
  };

  if ((existing[0]?.CNT ?? 0) > 0) {
    await executeMutation(
      `
      UPDATE user_health_profile SET
        pregnancy = :pregnancy, breastfeeding = :breastfeeding, elderly = :elderly,
        menopause = :menopause, menstruation = :menstruation,
        pregnancy_planning = :pregnancyPlanning, prostate_history = :prostateHistory,
        testosterone_therapy = :testosteroneTherapy
      WHERE user_id = :userId
      `,
      binds
    );
  } else {
    await executeMutation(
      `
      INSERT INTO user_health_profile (
        user_id, pregnancy, breastfeeding, elderly, menopause, menstruation,
        pregnancy_planning, prostate_history, testosterone_therapy
      ) VALUES (
        :userId, :pregnancy, :breastfeeding, :elderly, :menopause, :menstruation,
        :pregnancyPlanning, :prostateHistory, :testosteroneTherapy
      )
      `,
      binds
    );
  }

  return getUserHealthProfile(userId);
}
