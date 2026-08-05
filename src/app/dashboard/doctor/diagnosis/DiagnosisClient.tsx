"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { EmptyState, PageWrapper } from "@/components/PageWrapper";
import { useI18n } from "@/i18n/I18nProvider";
import type { DoctorPatientSummary } from "@/types/doctor";
import type { Disease } from "@/types/disease";
import { pickLocalized, pickLocalizedName } from "@/utils/locale-content";

interface PatientDisease {
  diseaseId: number;
  nameTr: string;
  nameEn: string;
  descriptionTr?: string | null;
  descriptionEn?: string | null;
  diagnosedDate?: string | null;
}

export function DiagnosisClient() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const initialPatientId = searchParams.get("patientId") ?? "";

  const [patients, setPatients] = useState<DoctorPatientSummary[]>([]);
  const [catalog, setCatalog] = useState<Disease[]>([]);
  const [selectedPatient, setSelectedPatient] = useState(initialPatientId);
  const [selectedDisease, setSelectedDisease] = useState("");
  const [patientDiseases, setPatientDiseases] = useState<PatientDisease[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadBase = useCallback(async () => {
    setLoading(true);
    try {
      const [patRes, catRes] = await Promise.all([
        fetch("/api/doctor/panel"),
        fetch("/api/doctor/panel?view=disease-catalog"),
      ]);
      const patData = await patRes.json();
      const catData = await catRes.json();
      setPatients(patData.patients ?? []);
      setCatalog(catData.diseases ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPatientDiseases = useCallback(async (patientId: string) => {
    if (!patientId) {
      setPatientDiseases([]);
      return;
    }
    const res = await fetch(`/api/doctor/panel?patientId=${patientId}`);
    const data = await res.json();
    setPatientDiseases(data.patient?.diseases ?? []);
  }, []);

  useEffect(() => {
    loadBase();
  }, [loadBase]);

  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatient(initialPatientId);
    }
  }, [initialPatientId]);

  useEffect(() => {
    loadPatientDiseases(selectedPatient);
  }, [selectedPatient, loadPatientDiseases]);

  const handleAddDiagnosis = async () => {
    if (!selectedPatient || !selectedDisease) {
      toast.error(t.selectPatientAndDisease);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/doctor/panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-disease",
          patientId: Number(selectedPatient),
          diseaseId: Number(selectedDisease),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "DISEASE_ALREADY_EXISTS") {
          toast.error(t.diseaseAlreadyAdded);
          return;
        }
        toast.error(t.errorGeneric);
        return;
      }
      toast.success(t.diagnosisAdded);
      const provision = data.provision as
        | { schedulesAdded?: number; medicinesAdded?: number }
        | undefined;
      if ((provision?.schedulesAdded ?? 0) > 0) {
        toast.success(t.remindersAutoCreated);
      }
      setSelectedDisease("");
      loadPatientDiseases(selectedPatient);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDiagnosis = async (diseaseId: number) => {
    if (!selectedPatient) return;
    const res = await fetch(
      `/api/doctor/panel?patientId=${selectedPatient}&diseaseId=${diseaseId}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(t.diagnosisRemoved);
    loadPatientDiseases(selectedPatient);
  };

  const selectedPatientInfo = patients.find(
    (p) => p.patientId === Number(selectedPatient)
  );

  return (
    <PageWrapper title={t.addDiagnosis} subtitle={t.addDiagnosisSubtitle}>
      {loading ? (
        <p>{t.loading}</p>
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">{t.selectPatient}</h2>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="">{t.selectPatient}</option>
              {patients.map((patient) => (
                <option key={patient.patientId} value={patient.patientId}>
                  {patient.name} {patient.surname} (@{patient.username})
                </option>
              ))}
            </select>
          </section>

          {!selectedPatient ? (
            <EmptyState message={t.selectPatientHint} />
          ) : (
            <>
              {selectedPatientInfo ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <span className="font-medium">
                    {selectedPatientInfo.name} {selectedPatientInfo.surname}
                  </span>
                  <span className="text-slate-500"> — {selectedPatientInfo.email}</span>
                </div>
              ) : null}

              <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">{t.addDiagnosis}</h2>
                <div className="flex flex-wrap gap-3">
                  <select
                    value={selectedDisease}
                    onChange={(e) => setSelectedDisease(e.target.value)}
                    className="min-w-[220px] flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  >
                    <option value="">{t.selectDisease}</option>
                    {catalog
                      .filter(
                        (disease) =>
                          !patientDiseases.some(
                            (active) => active.diseaseId === disease.diseaseId
                          )
                      )
                      .map((disease) => (
                        <option key={disease.diseaseId} value={disease.diseaseId}>
                          {pickLocalizedName(locale, disease.nameTr, disease.nameEn)}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddDiagnosis}
                    disabled={saving}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {t.addDiagnosis}
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  {t.currentDiagnoses}
                </h2>
                {patientDiseases.length === 0 ? (
                  <EmptyState message={t.noData} />
                ) : (
                  <div className="space-y-3">
                    {patientDiseases.map((disease) => (
                      <div
                        key={disease.diseaseId}
                        className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-4"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {pickLocalizedName(locale, disease.nameTr, disease.nameEn)}
                          </p>
                          {pickLocalized(locale, disease.descriptionTr, disease.descriptionEn) ? (
                            <p className="mt-1 text-sm text-slate-600">
                              {pickLocalized(locale, disease.descriptionTr, disease.descriptionEn)}
                            </p>
                          ) : null}
                          {disease.diagnosedDate ? (
                            <p className="mt-1 text-xs text-slate-500">
                              {t.diagnosedDate}: {disease.diagnosedDate.slice(0, 10)}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDiagnosis(disease.diseaseId)}
                          className="shrink-0 text-xs font-medium text-red-600 hover:text-red-800"
                        >
                          {t.removeDiagnosis}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
