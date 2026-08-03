"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState, InfoCard, PageWrapper } from "@/components/PageWrapper";
import { useI18n } from "@/i18n/I18nProvider";
import type { ActiveIngredient, Medicine } from "@/types/medicine";
import { pickLocalized, pickLocalizedName } from "@/utils/locale-content";
import { translateSeverity } from "@/utils/health-profile";

interface UserMedicineRow {
  userMedicineId: number;
  medicineId: number;
  nameTr: string;
  nameEn: string;
  descriptionTr?: string | null;
  descriptionEn?: string | null;
  approvalStatus: string;
}

interface AllergyRow {
  ingredientId: number;
  nameTr: string;
  nameEn: string;
  severity?: string | null;
  notesTr?: string | null;
  notesEn?: string | null;
  approvalStatus: string;
}

export default function MyMedicinesPage() {
  const { t, locale } = useI18n();
  const [medicines, setMedicines] = useState<UserMedicineRow[]>([]);
  const [allergies, setAllergies] = useState<AllergyRow[]>([]);
  const [catalog, setCatalog] = useState<Medicine[]>([]);
  const [ingredients, setIngredients] = useState<ActiveIngredient[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [medRes, catRes, allergyRes, ingRes] = await Promise.all([
        fetch("/api/user/medicines"),
        fetch("/api/user/medicines?catalog=1"),
        fetch("/api/allergies"),
        fetch("/api/allergies?catalog=1"),
      ]);
      const medData = await medRes.json();
      const catData = await catRes.json();
      const allergyData = await allergyRes.json();
      const ingData = await ingRes.json();
      setMedicines(medData.medicines ?? []);
      setCatalog(catData.medicines ?? []);
      setAllergies(allergyData.allergies ?? []);
      setIngredients(ingData.ingredients ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMedicine = async () => {
    if (!selectedMedicine) {
      toast.error(t.selectMedicine);
      return;
    }
    const response = await fetch("/api/user/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicineId: Number(selectedMedicine) }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.error === "MEDICINE_ALREADY_ACTIVE") {
        toast.error(t.medicineAlreadyAdded);
        return;
      }
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(t.pending);
    setSelectedMedicine("");
    loadData();
  };

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
    <PageWrapper title={t.myMedicines} subtitle={t.myMedicinesSubtitle}>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">{t.addMyMedicine}</h2>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">{t.selectMedicine}</option>
              {catalog
                .filter(
                  (med) =>
                    !medicines.some(
                      (active) =>
                        active.medicineId === med.medicineId &&
                        active.approvalStatus !== "REJECTED"
                    )
                )
                .map((med) => (
                  <option key={med.medicineId} value={med.medicineId}>
                    {pickLocalizedName(locale, med.nameTr, med.nameEn)}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              {t.addMyMedicine}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
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
      </div>

      {loading ? (
        <p className="mt-4">{t.loading}</p>
      ) : (
        <>
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">{t.myMedicines}</h2>
            {medicines.length === 0 ? (
              <EmptyState message={t.noData} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {medicines.map((med) => (
                  <div key={med.userMedicineId} className="relative">
                    {med.approvalStatus === "APPROVED" ? (
                      <span className="absolute right-3 top-3 text-lg text-emerald-600" title={t.approved}>
                        ✓
                      </span>
                    ) : (
                      <span className="absolute right-3 top-3 text-xs font-medium text-amber-600">
                        ⏳ {t.pending}
                      </span>
                    )}
                    <InfoCard
                      title={pickLocalizedName(locale, med.nameTr, med.nameEn)}
                      description={pickLocalized(locale, med.descriptionTr, med.descriptionEn)}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">{t.myAllergies}</h2>
            {allergies.length === 0 ? (
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
          </section>
        </>
      )}
    </PageWrapper>
  );
}
