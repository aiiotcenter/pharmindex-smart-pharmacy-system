"use client";

import { useEffect, useState } from "react";
import { EmptyState, PageWrapper } from "@/components/PageWrapper";
import { useI18n } from "@/i18n/I18nProvider";
import { pickLocalizedName } from "@/utils/locale-content";
import {
  formatReminderSchedule,
  localizedDosage,
  localizedReminderNotes,
} from "@/utils/health-profile";

interface Reminder {
  scheduleId: number;
  medicineNameTr: string;
  medicineNameEn: string;
  frequencyType: string;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  timeOfDay: string;
  notesTr?: string | null;
  notesEn?: string | null;
  dosageTr?: string | null;
  dosageEn?: string | null;
}

export default function RemindersPage() {
  const { t, locale } = useI18n();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/reminders")
      .then((r) => r.json())
      .then((data) => setReminders(data.reminders ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper title={t.reminders} subtitle={t.remindersSubtitle}>
      {loading ? (
        <p>{t.loading}</p>
      ) : reminders.length === 0 ? (
        <EmptyState message={t.noData} />
      ) : (
        <div className="space-y-3">
          {reminders.map((item) => {
            const notes = localizedReminderNotes(
              locale,
              item.notesTr,
              item.notesEn
            );
            const dosage = localizedDosage(locale, item.dosageTr, item.dosageEn);

            return (
              <div
                key={item.scheduleId}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {pickLocalizedName(
                      locale,
                      item.medicineNameTr,
                      item.medicineNameEn
                    )}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatReminderSchedule(item, t)}
                    {dosage ? ` · ${t.dosageLabel}: ${dosage}` : ""}
                  </p>
                  {notes ? (
                    <p className="mt-1 text-xs text-slate-400">
                      {t.notesLabel}: {notes}
                    </p>
                  ) : null}
                </div>
                <span className="text-2xl">⏰</span>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
