"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageWrapper } from "@/components/PageWrapper";
import { useI18n } from "@/i18n/I18nProvider";
import type { DoctorPatientSummary } from "@/types/doctor";
import type { ActiveIngredient, Medicine } from "@/types/medicine";
import { pickLocalizedName } from "@/utils/locale-content";

interface PendingMedicine {
  userMedicineId: number;
  patientId: number;
  patientName: string;
  patientSurname: string;
  nameTr: string;
  nameEn: string;
}

interface PendingAllergy {
  patientId: number;
  ingredientId: number;
  patientName: string;
  patientSurname: string;
  nameTr: string;
  nameEn: string;
}

interface PatientRequest {
  requestId: number;
  patientName: string;
  patientSurname: string;
  patientUsername: string;
}

interface PatientAllergy {
  ingredientId: number;
  nameTr: string;
  nameEn: string;
  approvalStatus: string;
}

export default function DoctorPanelPage() {
  const { t, locale } = useI18n();
  const [patients, setPatients] = useState<DoctorPatientSummary[]>([]);
  const [requests, setRequests] = useState<PatientRequest[]>([]);
  const [pending, setPending] = useState<PendingMedicine[]>([]);
  const [pendingAllergies, setPendingAllergies] = useState<PendingAllergy[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [patientMedicines, setPatientMedicines] = useState<
    Array<{ userMedicineId: number; nameTr: string; nameEn: string; approvalStatus: string }>
  >([]);
  const [patientAllergies, setPatientAllergies] = useState<PatientAllergy[]>([]);
  const [catalog, setCatalog] = useState<Medicine[]>([]);
  const [ingredients, setIngredients] = useState<ActiveIngredient[]>([]);
  const [medicineId, setMedicineId] = useState("");
  const [ingredientId, setIngredientId] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [patRes, reqRes, pendRes, pendAllRes, catRes, ingRes] = await Promise.all([
        fetch("/api/doctor/panel"),
        fetch("/api/doctor/panel?view=requests"),
        fetch("/api/doctor/panel?view=pending-medicines"),
        fetch("/api/doctor/panel?view=pending-allergies"),
        fetch("/api/user/medicines?catalog=1"),
        fetch("/api/allergies?catalog=1"),
      ]);
      const patData = await patRes.json();
      const reqData = await reqRes.json();
      const pendData = await pendRes.json();
      const pendAllData = await pendAllRes.json();
      const catData = await catRes.json();
      const ingData = await ingRes.json();
      setPatients(patData.patients ?? []);
      setRequests(reqData.requests ?? []);
      setPending(pendData.medicines ?? []);
      setPendingAllergies(pendAllData.allergies ?? []);
      setCatalog(catData.medicines ?? []);
      setIngredients(ingData.ingredients ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPatient = async (patientId: number) => {
    setSelectedPatient(patientId);
    const res = await fetch(`/api/doctor/panel?patientId=${patientId}`);
    const data = await res.json();
    setPatientMedicines(data.patient?.medicines ?? []);
    setPatientAllergies(data.patient?.allergies ?? []);
  };

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const respondRequest = async (requestId: number, approve: boolean) => {
    const res = await fetch("/api/doctor/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "respond-request", requestId, approve }),
    });
    if (!res.ok) {
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(approve ? t.requestApproved : t.requestDeleted);
    loadAll();
  };

  const approveMedicine = async (userMedicineId: number) => {
    const res = await fetch("/api/doctor/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve-medicine", userMedicineId }),
    });
    if (!res.ok) {
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(t.approved);
    loadAll();
    if (selectedPatient) loadPatient(selectedPatient);
  };

  const approveAllergy = async (patientId: number, allergyIngredientId: number) => {
    const res = await fetch("/api/doctor/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve-allergy",
        patientId,
        ingredientId: allergyIngredientId,
      }),
    });
    if (!res.ok) {
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(t.approved);
    loadAll();
    if (selectedPatient) loadPatient(selectedPatient);
  };

  const addMedicineToPatient = async () => {
    if (!selectedPatient || !medicineId) return;
    const res = await fetch("/api/doctor/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: selectedPatient,
        medicineId: Number(medicineId),
      }),
    });
    if (!res.ok) {
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(t.successSave);
    setMedicineId("");
    loadPatient(selectedPatient);
    loadAll();
  };

  const addAllergyToPatient = async () => {
    if (!selectedPatient || !ingredientId) return;
    const res = await fetch("/api/doctor/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add-allergy",
        patientId: selectedPatient,
        ingredientId: Number(ingredientId),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.error === "ALLERGY_ALREADY_EXISTS") {
        toast.error(t.allergyAlreadyAdded);
        return;
      }
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(t.successSave);
    setIngredientId("");
    loadPatient(selectedPatient);
    loadAll();
  };

  const removeMedicine = async (userMedicineId: number) => {
    if (!selectedPatient) return;
    const res = await fetch(
      `/api/doctor/panel?id=${userMedicineId}&patientId=${selectedPatient}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(t.successDelete);
    loadPatient(selectedPatient);
  };

  const removeAllergy = async (allergyIngredientId: number) => {
    if (!selectedPatient) return;
    const res = await fetch(
      `/api/doctor/panel?patientId=${selectedPatient}&ingredientId=${allergyIngredientId}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(t.successDelete);
    loadPatient(selectedPatient);
    loadAll();
  };

  return (
    <PageWrapper title={t.doctorPanel} subtitle={t.doctorPanelSubtitle}>
      {loading ? (
        <p>{t.loading}</p>
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">{t.patientRequests}</h2>
            {requests.length === 0 ? (
              <EmptyState message={t.noData} />
            ) : (
              <div className="space-y-2">
                {requests.map((req) => (
                  <div
                    key={req.requestId}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {req.patientName} {req.patientSurname}
                      </p>
                      <p className="text-xs text-slate-500">@{req.patientUsername}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => respondRequest(req.requestId, true)}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white"
                      >
                        {t.approve}
                      </button>
                      <button
                        type="button"
                        onClick={() => respondRequest(req.requestId, false)}
                        className="rounded-lg bg-red-100 px-3 py-1 text-xs text-red-700"
                      >
                        {t.reject}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">{t.pendingMedicines}</h2>
            {pending.length === 0 ? (
              <EmptyState message={t.noData} />
            ) : (
              <div className="space-y-2">
                {pending.map((med) => (
                  <div
                    key={med.userMedicineId}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {pickLocalizedName(locale, med.nameTr, med.nameEn)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {med.patientName} {med.patientSurname}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => approveMedicine(med.userMedicineId)}
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white"
                    >
                      ✓ {t.approve}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">{t.pendingAllergies}</h2>
            {pendingAllergies.length === 0 ? (
              <EmptyState message={t.noData} />
            ) : (
              <div className="space-y-2">
                {pendingAllergies.map((allergy) => (
                  <div
                    key={`${allergy.patientId}-${allergy.ingredientId}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {pickLocalizedName(locale, allergy.nameTr, allergy.nameEn)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {allergy.patientName} {allergy.patientSurname}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        approveAllergy(allergy.patientId, allergy.ingredientId)
                      }
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white"
                    >
                      ✓ {t.approve}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">{t.myPatients}</h2>
              {patients.length === 0 ? (
                <EmptyState message={t.noData} />
              ) : (
                <div className="space-y-2">
                  {patients.map((patient) => (
                    <button
                      key={patient.patientId}
                      type="button"
                      onClick={() => loadPatient(patient.patientId)}
                      className={`w-full rounded-xl border p-3 text-left ${
                        selectedPatient === patient.patientId
                          ? "border-blue-400 bg-blue-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <p className="font-medium">
                        {patient.name} {patient.surname}
                      </p>
                      <p className="text-xs text-slate-500">{patient.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">{t.patientDetails}</h2>
              {!selectedPatient ? (
                <EmptyState message={t.selectOption} />
              ) : (
                <>
                  <div className="mb-4 flex gap-2">
                    <select
                      value={medicineId}
                      onChange={(e) => setMedicineId(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="">{t.selectMedicine}</option>
                      {catalog.map((med) => (
                        <option key={med.medicineId} value={med.medicineId}>
                          {pickLocalizedName(locale, med.nameTr, med.nameEn)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addMedicineToPatient}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
                    >
                      {t.addMedicineToPatient}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {patientMedicines.map((med) => (
                      <div
                        key={med.userMedicineId}
                        className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                      >
                        <div className="flex items-center gap-2">
                          {med.approvalStatus === "APPROVED" ? (
                            <span className="text-emerald-600">✓</span>
                          ) : (
                            <span className="text-amber-500">⏳</span>
                          )}
                          <span className="text-sm font-medium">
                            {pickLocalizedName(locale, med.nameTr, med.nameEn)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedicine(med.userMedicineId)}
                          className="text-xs text-red-600"
                        >
                          {t.remove}
                        </button>
                      </div>
                    ))}
                  </div>

                  <h3 className="mb-2 mt-6 text-sm font-semibold text-slate-800">
                    {t.patientAllergies}
                  </h3>
                  <div className="mb-4 flex gap-2">
                    <select
                      value={ingredientId}
                      onChange={(e) => setIngredientId(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="">{t.selectIngredient}</option>
                      {ingredients
                        .filter(
                          (ing) =>
                            !patientAllergies.some(
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
                      onClick={addAllergyToPatient}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
                    >
                      {t.addAllergyToPatient}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {patientAllergies.length === 0 ? (
                      <EmptyState message={t.noData} />
                    ) : (
                      patientAllergies.map((allergy) => (
                        <div
                          key={allergy.ingredientId}
                          className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                        >
                          <div className="flex items-center gap-2">
                            {allergy.approvalStatus === "APPROVED" ? (
                              <span className="text-emerald-600">✓</span>
                            ) : (
                              <span className="text-amber-500">⏳</span>
                            )}
                            <span className="text-sm font-medium">
                              {pickLocalizedName(locale, allergy.nameTr, allergy.nameEn)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAllergy(allergy.ingredientId)}
                            className="text-xs text-red-600"
                          >
                            {t.remove}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
