"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";

export default function DashboardPage() {
  const { t } = useI18n();
  const { user } = useAuthContext();
  const [stats, setStats] = useState({ medicines: 0, diseases: 0, allergies: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/user/medicines").then((r) => r.json()),
      fetch("/api/user/diseases").then((r) => r.json()),
      fetch("/api/allergies").then((r) => r.json()),
    ]).then(([med, dis, all]) => {
      setStats({
        medicines: med.medicines?.length ?? 0,
        diseases: dis.diseases?.length ?? 0,
        allergies: all.allergies?.length ?? 0,
      });
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t.dashboardWelcome}, {user?.name ?? "..."}
        </h1>
        <p className="mt-2 text-slate-600">{t.dashboardSubtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t.statsMedicines} value={stats.medicines} icon="💊" />
        <StatCard label={t.statsDiseases} value={stats.diseases} icon="🩺" />
        <StatCard label={t.statsAllergies} value={stats.allergies} icon="⚠️" />
      </div>

      <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center">
        <p className="text-emerald-800">{t.dashboardSubtitle}</p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
