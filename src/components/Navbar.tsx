"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

export function Navbar() {
  const { t } = useI18n();
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");
  const navClass = isDashboard
    ? "border-b border-slate-200 bg-white shadow-sm"
    : "border-b border-white/10 bg-slate-950/80 backdrop-blur-md";
  const brandClass = isDashboard ? "text-emerald-700" : "text-emerald-200";

  return (
    <nav className={navClass}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <Link
          href="/login"
          className={`text-sm font-semibold tracking-wide ${brandClass}`}
        >
          {t.appName}
        </Link>
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
