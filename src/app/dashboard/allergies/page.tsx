"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageWrapper } from "@/components/PageWrapper";
import { useI18n } from "@/i18n/I18nProvider";
import type { ActiveIngredient } from "@/types/medicine";
import { pickLocalized, pickLocalizedName } from "@/utils/locale-content";
import { translateSeverity } from "@/utils/health-profile";

interface AllergyItem {
  ingredientId: number;
  nameEn: string;
  nameTr: string;
  severity?: string | null;
  notesTr?: string | null;
  notesEn?: string | null;
  approvalStatus: string;
}

export default function MyAllergiesPage() {
  const { t, locale } = useI18n();
  const [allergies, setAllergies] = useState<AllergyItem[]>([]);
  const [ingredients, setIngredients] = useState<ActiveIngredient[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allergyRes, ingRes] = await Promise.all([
        fetch("/api/allergies"),
        fetch("/api/allergies?catalog=1"),
      ]);
      const allergyData = await allergyRes.json();
      const ingData = await ingRes.json();
      setAllergies(allergyData.allergies ?? []);
      setIngredients(ingData.ingredients ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddAllergy = async () => {
    if (!selectedIngredient) {
      toast.error(t.selectIngredient);
      return;
    }
    const response = await fetch("/api/allergies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredientId: Number(selectedIngredient) }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.error === "ALLERGY_ALREADY_EXISTS") {
        toast.error(t.allergyAlreadyAdded);
        return;
      }
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(t.pending);
    setSelectedIngredient("");
    loadData();
  };

  const handleRemoveAllergy = async (ingredientId: number) => {
    const response = await fetch(`/api/allergies?ingredientId=${ingredientId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(t.allergyRemoved);
    loadData();
  };

  return (
    <PageWrapper title={t.myAllergies} subtitle={t.myAllergiesSubtitle}>
      <section className="mb-6 rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">{t.addMyAllergy}</h2>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedIngredient}
            onChange={(e) => setSelectedIngredient(e.target.value)}
            className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">{t.selectIngredient}</option>
            {ingredients
              .filter(
                (ing) =>
                  !allergies.some(
                    (allergy) => allergy.ingredientId === ing.ingredientId
                  )
              )
              .map((ing) => (
                <option key={ing.ingredientId} value={ing.ingredientId}>
                  {pickLocalizedName(locale, ing.nameTr, ing.nameEn)}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={handleAddAllergy}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            {t.addMyAllergy}
          </button>
        </div>
      </section>

      {loading ? (
        <p>{t.loading}</p>
      ) : allergies.length === 0 ? (
        <EmptyState message={t.noData} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {allergies.map((allergy) => (
            <div
              key={allergy.ingredientId}
              className="relative rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm"
            >
              {allergy.approvalStatus === "APPROVED" ? (
                <span
                  className="absolute right-3 top-3 text-lg text-emerald-600"
                  title={t.approved}
                >
                  ✓
                </span>
              ) : (
                <span className="absolute right-3 top-3 text-xs font-medium text-amber-600">
                  ⏳ {t.pending}
                </span>
              )}
              <h3 className="pr-16 font-semibold text-slate-900">
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
              <button
                type="button"
                onClick={() => handleRemoveAllergy(allergy.ingredientId)}
                className="mt-3 text-xs font-medium text-red-600 hover:text-red-800"
              >
                {t.remove}
              </button>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
