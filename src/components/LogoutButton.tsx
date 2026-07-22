"use client";

import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";

export function LogoutButton() {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname.startsWith("/dashboard")) {
    return null;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="fixed bottom-6 left-6 z-50 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-lg transition hover:bg-red-50 hover:text-red-700"
    >
      {t.logout}
    </button>
  );
}
