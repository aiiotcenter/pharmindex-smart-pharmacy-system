"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useI18n } from "@/i18n/I18nProvider";

const navItems = [
  { href: "/dashboard", labelKey: "dashboard" as const, icon: "🏠" },
  { href: "/dashboard/medicines", labelKey: "myMedicines" as const, icon: "💊" },
  { href: "/dashboard/diseases", labelKey: "myDiseases" as const, icon: "🩺" },
  { href: "/dashboard/allergies", labelKey: "myAllergies" as const, icon: "⚠️" },
  { href: "/dashboard/reminders", labelKey: "reminders" as const, icon: "⏰" },
  { href: "/dashboard/health-center", labelKey: "healthCenter" as const, icon: "🔍" },
  { href: "/dashboard/health-profile", labelKey: "healthProfile" as const, icon: "❤️" },
];

const doctorNavItems = [
  { href: "/dashboard/doctor", labelKey: "doctorPanel" as const, icon: "🩺" },
  { href: "/dashboard/doctor/patients", labelKey: "myPatients" as const, icon: "👥" },
  { href: "/dashboard/doctor/diagnosis", labelKey: "addDiagnosis" as const, icon: "📋" },
];

export function Sidebar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isDoctor, isPatientView } = useAuthContext();
  const { open, close } = useSidebar();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleNavClick = () => {
    close();
  };

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={close}
          aria-hidden
        />
      ) : null}

      <aside
        className={`fixed left-0 top-14 z-50 flex h-[calc(100vh-3.5rem)] w-64 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4 lg:hidden">
          <span className="font-bold text-emerald-700">{t.appName}</span>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {isPatientView
            ? navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{t[item.labelKey]}</span>
                  </Link>
                );
              })
            : null}

          {isDoctor ? (
            <div className={isPatientView ? "mt-4 space-y-1" : "space-y-1"}>
              {doctorNavItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard/doctor" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-blue-200 text-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{t[item.labelKey]}</span>
                  </Link>
                );
              })}
            </div>
          ) : null}

          {isAdmin ? (
            <Link
              href="/dashboard/admin"
              onClick={handleNavClick}
              className={`${isPatientView ? "mt-4" : ""} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                pathname.startsWith("/dashboard/admin")
                  ? "bg-amber-500 text-white shadow-sm"
                  : "border border-amber-200 text-amber-700 hover:bg-amber-50"
              }`}
            >
              <span>➕</span>
              <span>{t.adminPanel}</span>
            </Link>
          ) : null}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <span>🚪</span>
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
