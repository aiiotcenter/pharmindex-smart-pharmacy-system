"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DosageFormSelect,
  FormField,
  TextArea,
  TextInput,
} from "@/components/admin/FormField";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages";
import type { ActiveIngredient } from "@/types/medicine";

type BilingualKey =
  | "usesTr"
  | "usesEn"
  | "howToUseTr"
  | "howToUseEn"
  | "sideEffectsTr"
  | "sideEffectsEn"
  | "contraindicationsTr"
  | "contraindicationsEn"
  | "pregnancyTr"
  | "pregnancyEn"
  | "breastfeedingTr"
  | "breastfeedingEn"
  | "elderlyTr"
  | "elderlyEn"
  | "childrenTr"
  | "childrenEn"
  | "specialConditionsTr"
  | "specialConditionsEn";

const bilingualFields: Array<{ tr: BilingualKey; en: BilingualKey; labelKey: MessageKey }> = [
  { tr: "usesTr", en: "usesEn", labelKey: "whatItDoes" },
  { tr: "howToUseTr", en: "howToUseEn", labelKey: "howToUse" },
  { tr: "sideEffectsTr", en: "sideEffectsEn", labelKey: "sideEffects" },
  { tr: "contraindicationsTr", en: "contraindicationsEn", labelKey: "whoShouldNotUse" },
  { tr: "pregnancyTr", en: "pregnancyEn", labelKey: "pregnancyUse" },
  { tr: "breastfeedingTr", en: "breastfeedingEn", labelKey: "breastfeedingUse" },
  { tr: "elderlyTr", en: "elderlyEn", labelKey: "elderlyUse" },
  { tr: "childrenTr", en: "childrenEn", labelKey: "childrenUse" },
  { tr: "specialConditionsTr", en: "specialConditionsEn", labelKey: "specialConditions" },
];

const emptyForm: Record<BilingualKey | "nameTr" | "nameEn" | "dosageForm" | "ingredientId", string> = {
  nameTr: "",
  nameEn: "",
  dosageForm: "",
  ingredientId: "",
  usesTr: "",
  usesEn: "",
  howToUseTr: "",
  howToUseEn: "",
  sideEffectsTr: "",
  sideEffectsEn: "",
  contraindicationsTr: "",
  contraindicationsEn: "",
  pregnancyTr: "",
  pregnancyEn: "",
  breastfeedingTr: "",
  breastfeedingEn: "",
  elderlyTr: "",
  elderlyEn: "",
  childrenTr: "",
  childrenEn: "",
  specialConditionsTr: "",
  specialConditionsEn: "",
};

export function AdminMedicineForm({
  ingredients,
  onSaved,
}: {
  ingredients: ActiveIngredient[];
  onSaved: () => void;
}) {
  const { t, locale } = useI18n();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.dosageForm) {
      toast.error(t.errorValidation);
      return;
    }
    if (!form.ingredientId) {
      toast.error(t.errorValidation);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ingredientId: Number(form.ingredientId),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 403) {
          toast.error(t.errorForbidden);
          return;
        }
        if (data.details?.fieldErrors) {
          toast.error(t.errorValidation);
          return;
        }
        toast.error(t.errorGeneric);
        return;
      }

      toast.success(t.successSave);
      setForm(emptyForm);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-3 overflow-y-auto pr-2">
      <FormField label={t.nameTr}>
        <TextInput value={form.nameTr} onChange={(v) => setForm({ ...form, nameTr: v })} />
      </FormField>
      <FormField label={t.nameEn}>
        <TextInput value={form.nameEn} onChange={(v) => setForm({ ...form, nameEn: v })} />
      </FormField>
      <FormField label={t.medicineType}>
        <DosageFormSelect
          value={form.dosageForm}
          onChange={(v) => setForm({ ...form, dosageForm: v })}
          labels={t.dosageForms}
          placeholder={t.selectOption}
        />
      </FormField>
      <FormField label={t.activeIngredients}>
        <select
          value={form.ingredientId}
          onChange={(e) => setForm({ ...form, ingredientId: e.target.value })}
          required
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
        >
          <option value="">{t.selectOption}</option>
          {ingredients.map((ing) => (
            <option key={ing.ingredientId} value={ing.ingredientId}>
              {locale === "tr" ? ing.nameTr : ing.nameEn}
            </option>
          ))}
        </select>
      </FormField>

      {bilingualFields.map((field) => (
        <div key={field.tr} className="grid gap-3 sm:grid-cols-2">
          <FormField label={`${t[field.labelKey]} (TR)`} hint={t.pipeSeparatedHint}>
            <TextArea
              value={form[field.tr]}
              onChange={(v) => setForm({ ...form, [field.tr]: v })}
            />
          </FormField>
          <FormField label={`${t[field.labelKey]} (EN)`} hint={t.pipeSeparatedHint}>
            <TextArea
              value={form[field.en]}
              onChange={(v) => setForm({ ...form, [field.en]: v })}
            />
          </FormField>
        </div>
      ))}

      <button
        type="submit"
        disabled={saving}
        className="sticky bottom-0 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
      >
        {saving ? t.loading : t.save}
      </button>
    </form>
  );
}
