"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { getActiveSpecialConditions } from "@/utils/health-profile";
import type { UserHealthProfile } from "@/types/health-profile";

export function SpecialConditionsDisplay({
  profile,
}: {
  profile: Omit<UserHealthProfile, "userId">;
}) {
  const { t } = useI18n();
  const conditions = getActiveSpecialConditions(profile, t);

  if (conditions.length === 0) {
    return (
      <p className="text-sm text-slate-500">{t.noSpecialConditions}</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {conditions.map((label) => (
        <span
          key={label}
          className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
