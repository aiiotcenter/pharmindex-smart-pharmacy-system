"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { SupportedLocale } from "@/lib/constants";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const options: Array<{ value: SupportedLocale; label: string }> = [
    { value: "tr", label: "TR" },
    { value: "en", label: "EN" },
  ];

  return (
    <div className="flex overflow-hidden rounded-lg border border-emerald-200/70 bg-white/70 shadow-sm backdrop-blur">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLocale(option.value)}
          className={`px-3 py-1.5 text-xs font-semibold transition ${
            locale === option.value
              ? "bg-emerald-600 text-white"
              : "text-slate-600 hover:bg-emerald-50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
