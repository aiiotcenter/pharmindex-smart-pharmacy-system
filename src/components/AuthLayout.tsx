"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerHref,
}: AuthLayoutProps) {
  const { t } = useI18n();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950">
      <header className="relative z-10 flex w-full items-start justify-between px-6 pt-8 sm:px-10 lg:px-20 lg:pt-10">
        <div className="pl-2 sm:pl-4 lg:pl-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
            {t.appName}
          </p>
          <p className="mt-1 text-sm text-emerald-100/70">{t.appTagline}</p>
        </div>
        <div className="pr-2 sm:pr-4 lg:pr-8">
          <LanguageSwitcher />
        </div>
      </header>

      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl flex-col px-4 py-6 lg:px-8">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden lg:block">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-white shadow-2xl backdrop-blur-md">
              <div className="mb-6 inline-flex rounded-2xl bg-emerald-500/20 p-4">
                <svg
                  viewBox="0 0 24 24"
                  className="h-10 w-10 text-emerald-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 3v18M7 8h10M7 16h10" strokeLinecap="round" />
                  <rect x="4" y="3" width="16" height="18" rx="3" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold leading-tight">{title}</h1>
              <p className="mt-4 max-w-md text-lg text-emerald-100/80">{subtitle}</p>
              <ul className="mt-8 space-y-3 text-sm text-emerald-50/80">
                <li>• Alerji ve ilaç etkileşim kontrolü</li>
                <li>• Kişisel hastalık ve ilaç takibi</li>
                <li>• Haftalık / aylık doz planlama</li>
              </ul>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur">
              <div className="mb-6 lg:hidden">
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
              </div>
              {children}
              <p className="mt-6 text-center text-sm text-slate-600">
                {footerText}{" "}
                <Link
                  href={footerHref}
                  className="font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  {footerLinkText}
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
