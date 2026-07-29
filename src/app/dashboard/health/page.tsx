"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InfoCard, PageWrapper } from "@/components/PageWrapper";
import { SpecialConditionsDisplay } from "@/components/SpecialConditionsDisplay";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages";
import {
  defaultHealthProfile,
  SPECIAL_CONDITION_KEYS,
  type SpecialConditionKey,
} from "@/types/health-profile";
import { pickLocalized, pickLocalizedName } from "@/utils/locale-content";
import { translateSeverity } from "@/utils/health-profile";

const conditionLabelKeys: Record<SpecialConditionKey, MessageKey> = {
  pregnancy: "pregnancy",
  breastfeeding: "breastfeeding",
  elderly: "elderly",
  menopause: "menopause",
  menstruation: "menstruation",
  pregnancyPlanning: "pregnancyPlanning",
  prostateHistory: "prostateHistory",
  testosteroneTherapy: "testosteroneTherapy",
};

export default function HealthPage() {
  const { t, locale } = useI18n();
  const [profile, setProfile] = useState(defaultHealthProfile);
  const [saving, setSaving] = useState(false);
  const [diseases, setDiseases] = useState<
    Array<{
      nameTr: string;
      nameEn: string;
      descriptionTr?: string | null;
      descriptionEn?: string | null;
    }>
  >([]);
  const [allergies, setAllergies] = useState<
    Array<{
      nameTr: string;
      nameEn: string;
      severity?: string | null;
      notesTr?: string | null;
      notesEn?: string | null;
    }>
  >([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/health-profile").then((r) => r.json()),
      fetch("/api/user/diseases").then((r) => r.json()),
      fetch("/api/allergies").then((r) => r.json()),
    ]).then(([profileData, dis, all]) => {
      if (profileData.profile) {
        setProfile({ ...defaultHealthProfile, ...profileData.profile });
      }
      setDiseases(dis.diseases ?? []);
      setAllergies(all.allergies ?? []);
    });
  }, []);

  const toggleField = (key: SpecialConditionKey) => {
    setProfile((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/health-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error("save failed");
      toast.success(t.successSave);
    } catch {
      toast.error(t.errorGeneric);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper title={t.healthInfo} subtitle={t.healthSubtitle}>
      <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {t.specialConditionsTitle}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{t.specialConditionsSubtitle}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SPECIAL_CONDITION_KEYS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-50/50"
            >
              <input
                type="checkbox"
                checked={profile[key]}
                onChange={() => toggleField(key)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-800">
                {t[conditionLabelKeys[key]]}
              </span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? t.loading : t.save}
        </button>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            {t.profileSpecialConditions}
          </h3>
          <SpecialConditionsDisplay profile={profile} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-800">
            {t.myDiseases}
          </h2>
          <div className="space-y-3">
            {diseases.length === 0 ? (
              <p className="text-sm text-slate-500">{t.noData}</p>
            ) : (
              diseases.map((d, i) => (
                <InfoCard
                  key={i}
                  title={pickLocalizedName(locale, d.nameTr, d.nameEn)}
                  description={pickLocalized(
                    locale,
                    d.descriptionTr,
                    d.descriptionEn
                  )}
                />
              ))
            )}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-800">
            {t.myAllergies}
          </h2>
          <div className="space-y-3">
            {allergies.length === 0 ? (
              <p className="text-sm text-slate-500">{t.noData}</p>
            ) : (
              allergies.map((a, i) => (
                <InfoCard
                  key={i}
                  title={pickLocalizedName(locale, a.nameTr, a.nameEn)}
                  description={
                    [
                      a.severity ? translateSeverity(a.severity, t) : null,
                      pickLocalized(locale, a.notesTr, a.notesEn) || null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || undefined
                  }
                  accent="red"
                />
              ))
            )}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
