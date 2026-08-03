"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SpecialConditionsDisplay } from "@/components/SpecialConditionsDisplay";
import { PageWrapper } from "@/components/PageWrapper";
import { useAuthContext } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import { Role } from "@/lib/roles";
import type { MessageKey } from "@/i18n/messages";
import {
  defaultHealthProfile,
  SPECIAL_CONDITION_KEYS,
  type SpecialConditionKey,
} from "@/types/health-profile";
import type { DoctorListItem } from "@/types/doctor";
import type { DoctorRoleRequest } from "@/types/doctor-role";
import { translateGender, translateRole } from "@/utils/health-profile";

const conditionLabelKeys: Record<SpecialConditionKey, MessageKey> = {
  pregnancy: "pregnancy",
  breastfeeding: "breastfeeding",
  elderly: "elderly",
  menopause: "menopause",
  menstruation: "menstruation",
  pregnancyPlanning: "pregnancyPlanning",
  prostateHistory: "prostateHistory",
  testosteroneTherapy: "testosteroneTherapy",
};

export default function HealthProfilePage() {
  const { t } = useI18n();
  const { user, isPatientView } = useAuthContext();
  const [profile, setProfile] = useState(defaultHealthProfile);
  const [saving, setSaving] = useState(false);
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [doctorApplication, setDoctorApplication] = useState<DoctorRoleRequest | null>(null);

  useEffect(() => {
    fetch("/api/user/health-profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) setProfile({ ...defaultHealthProfile, ...data.profile });
      });
    fetch("/api/doctor/requests")
      .then((r) => r.json())
      .then((data) => setDoctors(data.doctors ?? []));
    fetch("/api/user/doctor-application")
      .then((r) => r.json())
      .then((data) => setDoctorApplication(data.application ?? null));
  }, []);

  const toggleField = (key: SpecialConditionKey) => {
    setProfile((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/health-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error("fail");
      toast.success(t.successSave);
    } catch {
      toast.error(t.errorGeneric);
    } finally {
      setSaving(false);
    }
  };

  const handleDoctorRequest = async () => {
    if (!selectedDoctor) return;
    const response = await fetch("/api/doctor/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId: Number(selectedDoctor) }),
    });
    if (!response.ok) {
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(t.requestSent);
    setSelectedDoctor("");
  };

  const handleDoctorRoleApply = async () => {
    const response = await fetch("/api/user/doctor-application", {
      method: "POST",
    });
    if (!response.ok) {
      toast.error(t.errorGeneric);
      return;
    }
    toast.success(t.requestSent);
    const data = await fetch("/api/user/doctor-application").then((r) => r.json());
    setDoctorApplication(data.application ?? null);
  };

  if (!user) {
    return (
      <PageWrapper title={t.healthProfile}>
        <p>{t.loading}</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={t.healthProfile} subtitle={t.healthProfileSubtitle}>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{t.profile}</h2>
          <dl className="space-y-3 text-sm">
            <Row label={t.username} value={user.username} />
            <Row label={t.name} value={`${user.name} ${user.surname}`} />
            <Row label={t.email} value={user.email} />
            <Row label={t.birthDate} value={user.birthDate} />
            <Row label={t.gender} value={translateGender(user.gender, t)} />
            <Row label={t.role} value={translateRole(user.roleId, t)} />
          </dl>
        </section>

        <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{t.specialConditionsTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{t.specialConditionsSubtitle}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {SPECIAL_CONDITION_KEYS.map((key) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={profile[key]}
                  onChange={() => toggleField(key)}
                  className="text-emerald-600"
                />
                {t[conditionLabelKeys[key]]}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? t.loading : t.save}
          </button>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <SpecialConditionsDisplay profile={profile} />
          </div>
        </section>
      </div>

      {user.roleId === Role.USER && !doctorApplication ? (
        <section className="rounded-2xl border border-violet-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">{t.applyDoctorRole}</h2>
          <p className="mb-4 text-sm text-slate-600">{t.doctorRoleApplyInfo}</p>
          <button
            type="button"
            onClick={handleDoctorRoleApply}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            {t.applyAsDoctor}
          </button>
        </section>
      ) : null}

      {doctorApplication?.status === "PENDING" ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {t.doctorRolePending}
        </section>
      ) : null}

      {doctorApplication?.status === "REJECTED" ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t.doctorRoleRejected}
        </section>
      ) : null}

      {isPatientView ? (
        <section className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">{t.registerToDoctor}</h2>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">{t.selectDoctor}</option>
              {doctors.map((doctor) => (
                <option key={doctor.userId} value={doctor.userId}>
                  Dr. {doctor.name} {doctor.surname}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDoctorRequest}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t.registerToDoctor}
            </button>
          </div>
        </section>
      ) : null}
    </PageWrapper>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
