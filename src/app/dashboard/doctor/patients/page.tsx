"use client";

import { useCallback, useEffect, useState } from "react";
import { PatientDetailModal } from "@/components/doctor/PatientDetailModal";
import { EmptyState, PageWrapper } from "@/components/PageWrapper";
import { useI18n } from "@/i18n/I18nProvider";
import type { DoctorPatientSummary } from "@/types/doctor";

export default function DoctorPatientsPage() {
  const { t } = useI18n();
  const [patients, setPatients] = useState<DoctorPatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doctor/panel");
      const data = await res.json();
      setPatients(data.patients ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return (
    <PageWrapper title={t.myPatients} subtitle={t.myPatientsSubtitle}>
      {loading ? (
        <p>{t.loading}</p>
      ) : patients.length === 0 ? (
        <EmptyState message={t.noData} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <button
              key={patient.patientId}
              type="button"
              onClick={() => setSelectedPatientId(patient.patientId)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40"
            >
              <p className="text-lg font-semibold text-slate-900">
                {patient.name} {patient.surname}
              </p>
              <p className="mt-1 text-sm text-slate-600">{patient.email}</p>
              <p className="mt-1 text-xs text-slate-500">@{patient.username}</p>
              <p className="mt-3 text-xs font-medium text-blue-700">{t.viewPatientDetail}</p>
            </button>
          ))}
        </div>
      )}

      <PatientDetailModal
        patientId={selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
      />
    </PageWrapper>
  );
}
