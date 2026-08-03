"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchBar } from "@/components/SearchBar";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useI18n } from "@/i18n/I18nProvider";
import { panelViewModeForRole, Role } from "@/lib/roles";

export function DashboardNavbar() {
  const { t } = useI18n();
  const router = useRouter();
  const { toggle } = useSidebar();
  const { user, viewMode, switchViewMode } = useAuthContext();

  const canSwitch =
    user?.roleId === Role.ADMIN || user?.roleId === Role.DOCTOR;
  const panelMode = user ? panelViewModeForRole(user.roleId) : null;
  const inUserView = viewMode === "USER";

  const handleViewSwitch = async () => {
    if (!panelMode) return;
    try {
      const nextMode = inUserView ? panelMode : "USER";
      await switchViewMode(nextMode);
      toast.success(
        nextMode === "USER" ? t.switchedToUserView : t.switchedToPanelView
      );
      router.push(nextMode === "USER" ? "/dashboard" : `/dashboard/${nextMode === "ADMIN" ? "admin" : "doctor"}`);
    } catch {
      toast.error(t.errorGeneric);
    }
  };

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
          {canSwitch ? (
            <button
              type="button"
              onClick={handleViewSwitch}
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100"
            >
              {inUserView ? t.switchToPanelView : t.switchToUserView}
            </button>
          ) : null}
          <LanguageSwitcher />
        </div>
      </div>
      {canSwitch && inUserView ? (
        <div className="border-t border-amber-100 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
          {t.viewingAsUser}
        </div>
      ) : null}
    </header>
  );
}
