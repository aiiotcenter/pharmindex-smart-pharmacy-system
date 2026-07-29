"use client";

import { useEffect, useState } from "react";
import { EmptyState, InfoCard, PageWrapper } from "@/components/PageWrapper";
import { SpecialConditionsDisplay } from "@/components/SpecialConditionsDisplay";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { useI18n } from "@/i18n/I18nProvider";
import { defaultHealthProfile } from "@/types/health-profile";
import type { Disease } from "@/types/disease";
import { pickLocalized, pickLocalizedName } from "@/utils/locale-content";

export default function MyDiseasesPage() {
  const { t, locale } = useI18n();
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, loading: profileLoading } = useHealthProfile();

  useEffect(() => {
    fetch("/api/user/diseases")
      .then((r) => r.json())
      .then((data) => setDiseases(data.diseases ?? []))
      .finally(() => setLoading(false));
  }, []);

  const healthProfile = profile
    ? { ...defaultHealthProfile, ...profile }
    : defaultHealthProfile;

  return (
    <PageWrapper title={t.myDiseases} subtitle={t.myDiseasesSubtitle}>
      <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          {t.specialConditions}
        </h2>
        {profileLoading ? (
          <p className="text-sm text-slate-500">{t.loading}</p>
        ) : (
          <SpecialConditionsDisplay profile={healthProfile} />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          {t.diagnosedDiseases}
        </h2>
        {loading ? (
          <p>{t.loading}</p>
        ) : diseases.length === 0 ? (
          <EmptyState message={t.noData} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {diseases.map((disease) => (
              <InfoCard
                key={disease.diseaseId}
                title={pickLocalizedName(locale, disease.nameTr, disease.nameEn)}
                description={pickLocalized(
                  locale,
                  disease.descriptionTr,
                  disease.descriptionEn
                )}
              />
            ))}
          </div>
        )}
      </section>
    </PageWrapper>
  );
}
