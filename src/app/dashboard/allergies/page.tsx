"use client";

import { useEffect, useState } from "react";
import { EmptyState, PageWrapper } from "@/components/PageWrapper";
import { useI18n } from "@/i18n/I18nProvider";
import { pickLocalized, pickLocalizedName } from "@/utils/locale-content";
import { translateSeverity } from "@/utils/health-profile";

interface AllergyItem {
  ingredientId: number;
  nameEn: string;
  nameTr: string;
  severity?: string | null;
  notesTr?: string | null;
  notesEn?: string | null;
}

export default function MyAllergiesPage() {
  const { t, locale } = useI18n();
  const [allergies, setAllergies] = useState<AllergyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/allergies")
      .then((r) => r.json())
      .then((data) => setAllergies(data.allergies ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper title={t.myAllergies} subtitle={t.myAllergiesSubtitle}>
      {loading ? (
        <p>{t.loading}</p>
      ) : allergies.length === 0 ? (
        <EmptyState message={t.noData} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {allergies.map((allergy) => (
            <div
              key={allergy.ingredientId}
              className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900">
                {pickLocalizedName(locale, allergy.nameTr, allergy.nameEn)}
              </h3>
              {allergy.severity ? (
                <span className="mt-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  {translateSeverity(allergy.severity, t)}
                </span>
              ) : null}
              {pickLocalized(locale, allergy.notesTr, allergy.notesEn) ? (
                <p className="mt-2 text-sm text-slate-600">
                  {pickLocalized(locale, allergy.notesTr, allergy.notesEn)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
