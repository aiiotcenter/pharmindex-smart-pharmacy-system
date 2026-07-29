"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import type { EncyclopediaSearchItem } from "@/types/encyclopedia";

export function SearchBar() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EncyclopediaSearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const typeLabel = (type: EncyclopediaSearchItem["type"]) => {
    if (type === "medicine") return t.medicine;
    if (type === "disease") return t.disease;
    if (type === "allergy") return t.allergy;
    return t.ingredient;
  };

  const search = useCallback(async (value: string) => {
    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/encyclopedia?q=${encodeURIComponent(value)}&category=all`
      );
      if (!response.ok) {
        setResults([]);
        return;
      }
      const data = await response.json();
      setResults(data.results ?? []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: EncyclopediaSearchItem) => {
    setOpen(false);
    setQuery("");
    router.push(
      `/dashboard/health-center?type=${item.type}&id=${item.id}`
    );
  };

  return (
    <div ref={containerRef} className="relative mx-2 hidden w-full max-w-xl flex-1 sm:block">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => query && setOpen(true)}
          placeholder={t.searchPlaceholderFull}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        />
        {loading ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            ...
          </span>
        ) : null}
      </div>

      {open ? (
        <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">{t.searchNoResults}</p>
          ) : (
            results.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-emerald-50"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {typeLabel(item.type)}
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    {locale === "tr" ? item.nameTr : item.nameEn}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
