"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmptyState, PageWrapper } from "@/components/PageWrapper";
import { useI18n } from "@/i18n/I18nProvider";
import {
  pickLocalized,
  pickLocalizedName,
  translateDosageForm,
} from "@/utils/locale-content";
import type {
  EncyclopediaCategory,
  EncyclopediaDiseaseDetail,
  EncyclopediaIngredientDetail,
  EncyclopediaMedicineDetail,
  EncyclopediaSearchItem,
} from "@/types/encyclopedia";

function PipeList({ text }: { text?: string | null }) {
  if (!text) return null;
  const items = text.split("|").map((item) => item.trim()).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-2 text-sm text-slate-700">{children}</div>
    </section>
  );
}

function LinkChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
    >
      {label}
    </button>
  );
}

const categories: Array<{
  key: EncyclopediaCategory;
  labelKey:
    | "catAll"
    | "catMedicines"
    | "catDiseases"
    | "catAllergies"
    | "catIngredients";
  icon: string;
}> = [
  { key: "all", labelKey: "catAll", icon: "📚" },
  { key: "medicine", labelKey: "catMedicines", icon: "💊" },
  { key: "disease", labelKey: "catDiseases", icon: "🩺" },
  { key: "allergy", labelKey: "catAllergies", icon: "⚠️" },
  { key: "ingredient", labelKey: "catIngredients", icon: "🧪" },
];

export function HealthCenterClient() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<EncyclopediaCategory>("all");
  const [results, setResults] = useState<EncyclopediaSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [medicineDetail, setMedicineDetail] =
    useState<EncyclopediaMedicineDetail | null>(null);
  const [diseaseDetail, setDiseaseDetail] =
    useState<EncyclopediaDiseaseDetail | null>(null);
  const [ingredientDetail, setIngredientDetail] =
    useState<EncyclopediaIngredientDetail | null>(null);
  const [detailType, setDetailType] = useState<
    "medicine" | "disease" | "ingredient" | "allergy" | null
  >(null);

  const text = useCallback(
    (tr?: string | null, en?: string | null) => pickLocalized(locale, tr, en),
    [locale]
  );

  const loadList = useCallback(async (cat: EncyclopediaCategory, q: string) => {
    setLoading(true);
    try {
      const url = q.trim()
        ? `/api/encyclopedia?q=${encodeURIComponent(q)}&category=${cat}`
        : `/api/encyclopedia?category=${cat}`;
      const response = await fetch(url);
      const data = await response.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(
    async (type: string, id: number) => {
      setDetailLoading(true);
      setMedicineDetail(null);
      setDiseaseDetail(null);
      setIngredientDetail(null);
      try {
        const response = await fetch(
          `/api/encyclopedia?type=${type}&id=${id}`
        );
        if (!response.ok) return;
        const data = await response.json();
        const resolvedType = (data.detailType ?? type) as typeof detailType;
        setDetailType(resolvedType);
        if (resolvedType === "medicine") {
          setMedicineDetail(data.detail);
        } else if (resolvedType === "disease") {
          setDiseaseDetail(data.detail);
        } else {
          setIngredientDetail(data.detail);
        }
      } finally {
        setDetailLoading(false);
      }
    },
    []
  );

  const selectItem = useCallback(
    (item: EncyclopediaSearchItem) => {
      const apiType = item.type === "allergy" ? "allergy" : item.type;
      router.replace(
        `/dashboard/health-center?type=${apiType}&id=${item.id}&category=${category}`
      );
      loadDetail(apiType, item.id);
    },
    [category, loadDetail, router]
  );

  useEffect(() => {
    const type = searchParams.get("type");
    const id = Number(searchParams.get("id"));
    const cat = (searchParams.get("category") ?? "all") as EncyclopediaCategory;
    setCategory(cat);
    if (type && id) {
      loadDetail(type, id);
    }
  }, [searchParams, loadDetail]);

  useEffect(() => {
    const timer = setTimeout(() => loadList(category, query), 300);
    return () => clearTimeout(timer);
  }, [query, category, loadList]);

  useEffect(() => {
    loadList(category, "");
  }, [category, loadList]);

  const openMedicine = (id: number) => {
    router.replace(`/dashboard/health-center?type=medicine&id=${id}&category=${category}`);
    loadDetail("medicine", id);
  };

  const openIngredient = (id: number) => {
    router.replace(
      `/dashboard/health-center?type=ingredient&id=${id}&category=${category}`
    );
    loadDetail("ingredient", id);
  };

  return (
    <PageWrapper title={t.healthCenter} subtitle={t.healthCenterSubtitle}>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.searchPlaceholderFull}
          className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-14 pr-5 text-base text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setCategory(cat.key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              category === cat.key
                ? "bg-emerald-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50"
            }`}
          >
            {cat.icon} {t[cat.labelKey]}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-2 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t.searchResults}
          </h2>
          {loading ? (
            <p className="text-sm text-slate-500">{t.loading}</p>
          ) : results.length === 0 ? (
            <EmptyState message={t.noData} />
          ) : (
            <div className="max-h-[32rem] space-y-2 overflow-y-auto">
              {results.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => selectItem(item)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/50"
                >
                  <p className="font-semibold text-slate-900">
                    {pickLocalizedName(locale, item.nameTr, item.nameEn)}
                  </p>
                  {(item.subtitleTr || item.subtitleEn) && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {text(item.subtitleTr, item.subtitleEn)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {detailLoading ? (
            <p className="text-sm text-slate-500">{t.loading}</p>
          ) : !detailType ? (
            <EmptyState message={t.selectItemHint} />
          ) : detailType === "medicine" && medicineDetail ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">
                <p className="text-sm font-medium text-emerald-700">💊 {t.medicine}</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {pickLocalizedName(locale, medicineDetail.nameTr, medicineDetail.nameEn)}
                </h2>
                {medicineDetail.dosageForm ? (
                  <p className="mt-1 text-sm text-slate-600">
                    {translateDosageForm(medicineDetail.dosageForm, t)}
                  </p>
                ) : null}
                {text(medicineDetail.descriptionTr, medicineDetail.descriptionEn) ? (
                  <p className="mt-3 text-sm text-slate-700">
                    {text(medicineDetail.descriptionTr, medicineDetail.descriptionEn)}
                  </p>
                ) : null}
              </div>

              {medicineDetail.ingredients.length > 0 ? (
                <DetailSection title={t.activeIngredients}>
                  <div className="flex flex-wrap gap-2">
                    {medicineDetail.ingredients.map((ing) => (
                      <LinkChip
                        key={ing.ingredientId}
                        label={pickLocalizedName(locale, ing.nameTr, ing.nameEn)}
                        onClick={() => openIngredient(ing.ingredientId)}
                      />
                    ))}
                  </div>
                </DetailSection>
              ) : null}

              <DetailSection title={t.whatItDoes}>
                <PipeList text={text(medicineDetail.usesTr, medicineDetail.usesEn)} />
              </DetailSection>
              <DetailSection title={t.howToUse}>
                <p>{text(medicineDetail.howToUseTr, medicineDetail.howToUseEn)}</p>
              </DetailSection>
              <DetailSection title={t.sideEffects}>
                <PipeList
                  text={text(medicineDetail.sideEffectsTr, medicineDetail.sideEffectsEn)}
                />
              </DetailSection>
              <DetailSection title={t.whoShouldNotUse}>
                <PipeList
                  text={text(
                    medicineDetail.contraindicationsTr,
                    medicineDetail.contraindicationsEn
                  )}
                />
              </DetailSection>
              <DetailSection title={t.pregnancyUse}>
                <p>{text(medicineDetail.pregnancyTr, medicineDetail.pregnancyEn)}</p>
              </DetailSection>
              <DetailSection title={t.breastfeedingUse}>
                <p>
                  {text(medicineDetail.breastfeedingTr, medicineDetail.breastfeedingEn)}
                </p>
              </DetailSection>
              <DetailSection title={t.elderlyUse}>
                <p>{text(medicineDetail.elderlyTr, medicineDetail.elderlyEn)}</p>
              </DetailSection>
              <DetailSection title={t.childrenUse}>
                <p>{text(medicineDetail.childrenTr, medicineDetail.childrenEn)}</p>
              </DetailSection>
              <DetailSection title={t.specialConditions}>
                <PipeList
                  text={text(
                    medicineDetail.specialConditionsTr,
                    medicineDetail.specialConditionsEn
                  )}
                />
              </DetailSection>

              {medicineDetail.similarMedicines.length > 0 ? (
                <DetailSection title={t.similarMedicines}>
                  <div className="flex flex-wrap gap-2">
                    {medicineDetail.similarMedicines.map((med) => (
                      <LinkChip
                        key={med.medicineId}
                        label={pickLocalizedName(locale, med.nameTr, med.nameEn)}
                        onClick={() => openMedicine(med.medicineId)}
                      />
                    ))}
                  </div>
                </DetailSection>
              ) : null}
            </div>
          ) : detailType === "disease" && diseaseDetail ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6">
                <p className="text-sm font-medium text-blue-700">🩺 {t.disease}</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {pickLocalizedName(locale, diseaseDetail.nameTr, diseaseDetail.nameEn)}
                </h2>
                <p className="mt-3 text-sm text-slate-700">
                  {text(diseaseDetail.descriptionTr, diseaseDetail.descriptionEn)}
                </p>
              </div>

              <DetailSection title={t.symptoms}>
                <PipeList text={text(diseaseDetail.symptomsTr, diseaseDetail.symptomsEn)} />
              </DetailSection>
              <DetailSection title={t.treatment}>
                <PipeList text={text(diseaseDetail.treatmentTr, diseaseDetail.treatmentEn)} />
              </DetailSection>
              <DetailSection title={t.whenToUse}>
                <p>{text(diseaseDetail.whenToUseTr, diseaseDetail.whenToUseEn)}</p>
              </DetailSection>
              <DetailSection title={t.whenNotToUse}>
                <p>{text(diseaseDetail.whenNotToUseTr, diseaseDetail.whenNotToUseEn)}</p>
              </DetailSection>
              <DetailSection title={t.affectedPatients}>
                <p>
                  {text(
                    diseaseDetail.affectedPatientsTr,
                    diseaseDetail.affectedPatientsEn
                  )}
                </p>
              </DetailSection>

              {diseaseDetail.recommendedMedicines.length > 0 ? (
                <DetailSection title={t.recommendedMedicines}>
                  <div className="flex flex-wrap gap-2">
                    {diseaseDetail.recommendedMedicines.map((med) => (
                      <LinkChip
                        key={med.medicineId}
                        label={pickLocalizedName(locale, med.nameTr, med.nameEn)}
                        onClick={() => openMedicine(med.medicineId)}
                      />
                    ))}
                  </div>
                </DetailSection>
              ) : null}
            </div>
          ) : ingredientDetail ? (
            <div className="space-y-4">
              <div
                className={`rounded-2xl border p-6 ${
                  detailType === "allergy"
                    ? "border-red-200 bg-gradient-to-br from-red-50 to-white"
                    : "border-purple-200 bg-gradient-to-br from-purple-50 to-white"
                }`}
              >
                <p className="text-sm font-medium text-slate-700">
                  {detailType === "allergy" ? `⚠️ ${t.allergy}` : `🧪 ${t.ingredient}`}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {pickLocalizedName(locale, ingredientDetail.nameTr, ingredientDetail.nameEn)}
                </h2>
                <p className="mt-3 text-sm text-slate-700">
                  {text(ingredientDetail.descriptionTr, ingredientDetail.descriptionEn)}
                </p>
              </div>

              <DetailSection title={t.bodyEffects}>
                <PipeList
                  text={text(
                    ingredientDetail.bodyEffectsTr,
                    ingredientDetail.bodyEffectsEn
                  )}
                />
              </DetailSection>
              <DetailSection title={t.allergySymptoms}>
                <PipeList
                  text={text(
                    ingredientDetail.allergySymptomsTr,
                    ingredientDetail.allergySymptomsEn
                  )}
                />
              </DetailSection>
              <DetailSection title={t.medicinesContaining}>
                <div className="flex flex-wrap gap-2">
                  {ingredientDetail.containingMedicines.map((med) => (
                    <LinkChip
                      key={med.medicineId}
                      label={text(med.nameTr, med.nameEn)}
                      onClick={() => openMedicine(med.medicineId)}
                    />
                  ))}
                </div>
              </DetailSection>
            </div>
          ) : (
            <EmptyState message={t.noData} />
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
