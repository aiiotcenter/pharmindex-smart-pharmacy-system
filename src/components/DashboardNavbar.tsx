"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchBar } from "@/components/SearchBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useI18n } from "@/i18n/I18nProvider";

export function DashboardNavbar() {
  const { t } = useI18n();
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <button
          type="button"
          onClick={toggle}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          type="button"
          onClick={toggle}
          className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:block"
          aria-label="Menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link
          href="/dashboard"
          className="shrink-0 text-lg font-bold text-emerald-700"
        >
          {t.appName}
        </Link>

        <SearchBar />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/register"
            className="hidden rounded-lg border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 sm:inline-block"
          >
            {t.memberRegister}
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            {t.memberLogin}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
