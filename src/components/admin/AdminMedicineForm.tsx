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
import type { ActiveIngredient } from "@/types/medicine";

export interface AdminMedicineFormState {
  nameTr: string;
  nameEn: string;
  dosageForm: string;
  ingredientId: string;
  usesTr: string;
  usesEn: string;
  sideEffectsTr: string;
  sideEffectsEn: string;
}

const emptyForm: AdminMedicineFormState = {
  nameTr: "",
  nameEn: "",
  dosageForm: "",
  ingredientId: "",
  usesTr: "",
  usesEn: "",
  sideEffectsTr: "",
  sideEffectsEn: "",
};

export function AdminMedicineForm({
  ingredients,
  onSaved,
}: {
  ingredients: ActiveIngredient[];
  onSaved: () => void;
}) {
  const { t, locale } = useI18n();
  const [form, setForm] = useState<AdminMedicineFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/admin/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameTr: form.nameTr,
          nameEn: form.nameEn,
          dosageForm: form.dosageForm,
          ingredientId: Number(form.ingredientId),
          usesTr: form.usesTr,
          usesEn: form.usesEn,
          sideEffectsTr: form.sideEffectsTr,
          sideEffectsEn: form.sideEffectsEn,
        }),
      });

      if (!response.ok) {
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormField label={t.nameTr}>
        <TextInput
          value={form.nameTr}
          onChange={(value) => setForm({ ...form, nameTr: value })}
        />
      </FormField>

      <FormField label={t.nameEn}>
        <TextInput
          value={form.nameEn}
          onChange={(value) => setForm({ ...form, nameEn: value })}
        />
      </FormField>

      <FormField label={t.medicineType}>
        <DosageFormSelect
          value={form.dosageForm}
          onChange={(value) => setForm({ ...form, dosageForm: value })}
          labels={t.dosageForms}
          placeholder={t.selectOption}
        />
      </FormField>

      <FormField label={t.activeIngredient}>
        <select
          value={form.ingredientId}
          onChange={(event) =>
            setForm({ ...form, ingredientId: event.target.value })
          }
          required
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
        >
          <option value="">{t.selectOption}</option>
          {ingredients.map((ingredient) => (
            <option key={ingredient.ingredientId} value={ingredient.ingredientId}>
              {locale === "tr" ? ingredient.nameTr : ingredient.nameEn}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={t.formUsesTr} hint={t.pipeSeparatedHint}>
        <TextArea
          value={form.usesTr}
          onChange={(value) => setForm({ ...form, usesTr: value })}
        />
      </FormField>

      <FormField label={t.formUsesEn} hint={t.pipeSeparatedHint}>
        <TextArea
          value={form.usesEn}
          onChange={(value) => setForm({ ...form, usesEn: value })}
        />
      </FormField>

      <FormField label={t.formSideEffectsTr} hint={t.pipeSeparatedHint}>
        <TextArea
          value={form.sideEffectsTr}
          onChange={(value) => setForm({ ...form, sideEffectsTr: value })}
        />
      </FormField>

      <FormField label={t.formSideEffectsEn} hint={t.pipeSeparatedHint}>
        <TextArea
          value={form.sideEffectsEn}
          onChange={(value) => setForm({ ...form, sideEffectsEn: value })}
        />
      </FormField>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
      >
        {saving ? t.loading : t.save}
      </button>
    </form>
  );
}
