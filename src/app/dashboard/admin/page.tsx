"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminMedicineForm } from "@/components/admin/AdminMedicineForm";
import { EmptyState, PageWrapper } from "@/components/PageWrapper";
import { useI18n } from "@/i18n/I18nProvider";
import { Role } from "@/lib/roles";
import { pickLocalizedName, translateDosageForm } from "@/utils/locale-content";
import { translateRole } from "@/utils/health-profile";
import type { ActiveIngredient, Medicine } from "@/types/medicine";
import type { DoctorRoleRequest } from "@/types/doctor-role";
import type { User } from "@/types/user";

export default function AdminPage() {
  const { t, locale } = useI18n();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [ingredients, setIngredients] = useState<ActiveIngredient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [doctorRequests, setDoctorRequests] = useState<DoctorRoleRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [medRes, userRes, reqRes] = await Promise.all([
        fetch("/api/admin/medicines"),
        fetch("/api/admin/users"),
        fetch("/api/admin/doctor-applications?pending=1"),
      ]);
      const medData = await medRes.json();
      const userData = await userRes.json();
      const reqData = await reqRes.json();
      setMedicines(medData.medicines ?? []);
      setIngredients(medData.ingredients ?? []);
      setUsers(userData.users ?? []);
      setDoctorRequests(reqData.requests ?? []);
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

  const handleDoctorRequest = async (requestId: number, action: "approve" | "reject") => {
    const response = await fetch("/api/admin/doctor-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    if (!response.ok) {
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(action === "approve" ? t.approved : t.requestDeleted);
    loadData();
  };

  return (
    <PageWrapper title={t.adminPanel}>
      <section className="mb-8 rounded-2xl border border-violet-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {t.adminDoctorRequests}
        </h2>
        {doctorRequests.length === 0 ? (
          <EmptyState message={t.noData} />
        ) : (
          <div className="space-y-3">
            {doctorRequests.map((request) => (
              <div
                key={request.requestId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {request.name} {request.surname} ({request.username})
                  </p>
                  <p className="text-sm text-slate-500">{request.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDoctorRequest(request.requestId, "approve")}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    {t.approve}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDoctorRequest(request.requestId, "reject")}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                  >
                    {t.reject}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                        user.roleId === Role.ADMIN
                          ? "bg-amber-100 text-amber-700"
                          : user.roleId === Role.DOCTOR
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {translateRole(user.roleId, t)}
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
