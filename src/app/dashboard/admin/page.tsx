"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminMedicineForm } from "@/components/admin/AdminMedicineForm";
import { EmptyState, PageWrapper } from "@/components/PageWrapper";
import { useI18n } from "@/i18n/I18nProvider";
import { pickLocalizedName, translateDosageForm } from "@/utils/locale-content";
import type { ActiveIngredient, Medicine } from "@/types/medicine";
import type { User } from "@/types/user";

export default function AdminPage() {
  const { t, locale } = useI18n();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [ingredients, setIngredients] = useState<ActiveIngredient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [medRes, userRes] = await Promise.all([
        fetch("/api/admin/medicines"),
        fetch("/api/admin/users"),
      ]);
      const medData = await medRes.json();
      const userData = await userRes.json();
      setMedicines(medData.medicines ?? []);
      setIngredients(medData.ingredients ?? []);
      setUsers(userData.users ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (medicineId: number) => {
    const response = await fetch(`/api/admin/medicines?id=${medicineId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(t.successDelete);
    loadData();
  };

  return (
    <PageWrapper title={t.adminPanel}>
      <div className="grid gap-8 xl:grid-cols-2">
        <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {t.addMedicine}
          </h2>
          <AdminMedicineForm ingredients={ingredients} onSaved={loadData} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {t.adminMedicines}
          </h2>
          {loading ? (
            <p>{t.loading}</p>
          ) : medicines.length === 0 ? (
            <EmptyState message={t.noData} />
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {medicines.map((med) => (
                <div
                  key={med.medicineId}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {pickLocalizedName(locale, med.nameTr, med.nameEn)}
                    </p>
                    {med.dosageForm ? (
                      <p className="text-xs text-slate-500">
                        {translateDosageForm(med.dosageForm, t)}
                      </p>
                    ) : null}
                    <p className="text-xs text-slate-400">ID: {med.medicineId}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(med.medicineId)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                  >
                    {t.delete}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {t.adminUsers}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 pr-4">ID</th>
                <th className="pb-3 pr-4">{t.username}</th>
                <th className="pb-3 pr-4">{t.name}</th>
                <th className="pb-3 pr-4">{t.email}</th>
                <th className="pb-3">{t.role}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId} className="border-b border-slate-100">
                  <td className="py-3 pr-4">{user.userId}</td>
                  <td className="py-3 pr-4">{user.username}</td>
                  <td className="py-3 pr-4">
                    {user.name} {user.surname}
                  </td>
                  <td className="py-3 pr-4">{user.email}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageWrapper>
  );
}
