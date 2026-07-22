"use client";

import { Navbar } from "@/components/Navbar";
import { useI18n } from "@/i18n/I18nProvider";

export default function DashboardPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900">{t.dashboard}</h1>
      </header>
      <main className="mx-auto flex max-w-5xl items-center justify-center px-6 py-24">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center shadow-sm">
          <p className="text-slate-600">{t.dashboardPlaceholder}</p>
        </div>
      </main>
    </div>
  );
}
