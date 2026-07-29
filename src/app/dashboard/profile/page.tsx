"use client";

import { PageWrapper } from "@/components/PageWrapper";
import { SpecialConditionsDisplay } from "@/components/SpecialConditionsDisplay";
import { useAuthContext } from "@/contexts/AuthContext";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { useI18n } from "@/i18n/I18nProvider";
import { defaultHealthProfile } from "@/types/health-profile";
import { translateGender, translateRole } from "@/utils/health-profile";

export default function ProfilePage() {
  const { t } = useI18n();
  const { user } = useAuthContext();
  const { profile, loading } = useHealthProfile();

  if (!user) {
    return (
      <PageWrapper title={t.profile}>
        <p>{t.loading}</p>
      </PageWrapper>
    );
  }

  const healthProfile = profile
    ? { ...defaultHealthProfile, ...profile }
    : defaultHealthProfile;

  return (
    <PageWrapper title={t.profile} subtitle={t.profileSubtitle}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {t.profile}
          </h2>
          <dl className="space-y-4 text-sm">
            <ProfileField label={t.username} value={user.username} />
            <ProfileField label={t.name} value={user.name} />
            <ProfileField label={t.surname} value={user.surname} />
            <ProfileField label={t.email} value={user.email} />
            <ProfileField label={t.birthDate} value={user.birthDate} />
            <ProfileField
              label={t.gender}
              value={translateGender(user.gender, t)}
            />
            <ProfileField label={t.role} value={translateRole(user.role, t)} />
          </dl>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {t.profileSpecialConditions}
          </h2>
          {loading ? (
            <p className="text-sm text-slate-500">{t.loading}</p>
          ) : (
            <SpecialConditionsDisplay profile={healthProfile} />
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-3 last:border-0">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="text-slate-900">{value}</dd>
    </div>
  );
}
