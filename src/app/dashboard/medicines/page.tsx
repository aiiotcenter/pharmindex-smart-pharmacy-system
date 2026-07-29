"use client";

import { useEffect, useState } from "react";
import { EmptyState, InfoCard, PageWrapper } from "@/components/PageWrapper";
import { useI18n } from "@/i18n/I18nProvider";
import type { Medicine } from "@/types/medicine";
import { pickLocalized, pickLocalizedName } from "@/utils/locale-content";

export default function MyMedicinesPage() {
  const { t, locale } = useI18n();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/medicines")
      .then((r) => r.json())
      .then((data) => setMedicines(data.medicines ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper title={t.myMedicines} subtitle={t.myMedicinesSubtitle}>
      {loading ? (
        <p>{t.loading}</p>
      ) : medicines.length === 0 ? (
        <EmptyState message={t.noData} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {medicines.map((med) => (
            <InfoCard
              key={med.medicineId}
              title={pickLocalizedName(locale, med.nameTr, med.nameEn)}
              description={pickLocalized(
                locale,
                med.descriptionTr,
                med.descriptionEn
              )}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
