"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SpecialConditionsDisplay } from "@/components/SpecialConditionsDisplay";
import { useI18n } from "@/i18n/I18nProvider";
import type { PatientDetailForDoctor } from "@/types/doctor";
import { defaultHealthProfile } from "@/types/health-profile";
import { pickLocalized, pickLocalizedName } from "@/utils/locale-content";
import {
  getActiveSpecialConditions,
  translateGender,
  translateSeverity,
} from "@/utils/health-profile";

interface PatientDetailModalProps {
  patientId: number | null;
  onClose: () => void;
}

export function PatientDetailModal({ patientId, onClose }: PatientDetailModalProps) {
  const { t, locale } = useI18n();
  const [patient, setPatient] = useState<PatientDetailForDoctor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patientId) {
      setPatient(null);
      return;
    }

    setLoading(true);
    fetch(`/api/doctor/panel?patientId=${patientId}`)
      .then((r) => r.json())
      .then((data) => setPatient(data.patient ?? null))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (!patientId) return null;

  const healthProfile = patient?.healthProfile ?? defaultHealthProfile;
  const activeConditions = getActiveSpecialConditions(healthProfile, t);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-detail-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="patient-detail-title" className="text-lg font-bold text-slate-900">
              {loading ? t.loading : patient ? `${patient.name} ${patient.surname}` : t.noData}
            </h2>
            {patient ? (
              <p className="text-xs text-slate-500">@{patient.username}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-slate-500">{t.loading}</p>
          ) : !patient ? (
            <p className="text-slate-500">{t.noData}</p>
          ) : (
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
                  {t.patientPersonalInfo}
                </h3>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label={t.email} value={patient.email} />
                  <InfoRow
                    label={t.birthDate}
                    value={patient.birthDate ? patient.birthDate.slice(0, 10) : "—"}
                  />
                  <InfoRow
                    label={t.gender}
                    value={patient.gender ? translateGender(patient.gender, t) : "—"}
                  />
                  <InfoRow
                    label={t.linkedAt}
                    value={patient.linkedAt ? patient.linkedAt.slice(0, 10) : "—"}
                  />
                </dl>
              </section>

              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-800">
                  {t.specialConditions}
                </h3>
                {activeConditions.length > 0 ? (
                  <SpecialConditionsDisplay profile={healthProfile} />
                ) : (
                  <p className="text-sm text-slate-500">{t.noData}</p>
                )}
              </section>

              <section className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-800">
                    {t.diagnosedDiseases}
                  </h3>
                  <Link
                    href={`/dashboard/doctor/diagnosis?patientId=${patient.patientId}`}
                    className="text-xs font-medium text-blue-700 hover:underline"
                    onClick={onClose}
                  >
                    {t.addDiagnosis}
                  </Link>
                </div>
                {patient.diseases.length === 0 ? (
                  <p className="text-sm text-slate-500">{t.noData}</p>
                ) : (
                  <ul className="space-y-2">
                    {patient.diseases.map((disease) => (
                      <li
                        key={disease.diseaseId}
                        className="rounded-xl border border-white bg-white p-3 shadow-sm"
                      >
                        <p className="font-medium text-slate-900">
                          {pickLocalizedName(locale, disease.nameTr, disease.nameEn)}
                        </p>
                        {pickLocalized(locale, disease.descriptionTr, disease.descriptionEn) ? (
                          <p className="mt-1 text-xs text-slate-600">
                            {pickLocalized(locale, disease.descriptionTr, disease.descriptionEn)}
                          </p>
                        ) : null}
                        {disease.diagnosedDate ? (
                          <p className="mt-1 text-xs text-slate-500">
                            {t.diagnosedDate}: {disease.diagnosedDate.slice(0, 10)}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-red-200 bg-red-50/40 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-800">
                  {t.patientAllergies}
                </h3>
                {patient.allergies.length === 0 ? (
                  <p className="text-sm text-slate-500">{t.noData}</p>
                ) : (
                  <ul className="space-y-2">
                    {patient.allergies.map((allergy) => (
                      <li
                        key={allergy.ingredientId}
                        className="flex items-start justify-between gap-2 rounded-xl border border-white bg-white p-3 shadow-sm"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {pickLocalizedName(locale, allergy.nameTr, allergy.nameEn)}
                          </p>
                          {allergy.severity ? (
                            <p className="mt-1 text-xs text-red-700">
                              {translateSeverity(allergy.severity, t)}
                            </p>
                          ) : null}
                        </div>
                        {allergy.approvalStatus === "APPROVED" ? (
                          <span className="text-emerald-600">✓</span>
                        ) : (
                          <span className="text-xs text-amber-600">⏳</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-800">
                  {t.myMedicines}
                </h3>
                {patient.medicines.length === 0 ? (
                  <p className="text-sm text-slate-500">{t.noData}</p>
                ) : (
                  <ul className="space-y-2">
                    {patient.medicines.map((medicine) => (
                      <li
                        key={medicine.userMedicineId}
                        className="flex items-start justify-between gap-2 rounded-xl border border-white bg-white p-3 shadow-sm"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {pickLocalizedName(locale, medicine.nameTr, medicine.nameEn)}
                          </p>
                          {pickLocalized(locale, medicine.dosageTr, medicine.dosageEn) ? (
                            <p className="mt-1 text-xs text-slate-600">
                              {pickLocalized(locale, medicine.dosageTr, medicine.dosageEn)}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs text-slate-500">
                            {t.startDate}: {medicine.startDate.slice(0, 10)}
                          </p>
                        </div>
                        {medicine.approvalStatus === "APPROVED" ? (
                          <span className="text-emerald-600">✓</span>
                        ) : (
                          <span className="text-xs text-amber-600">⏳</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
