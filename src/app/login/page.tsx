"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";
import { useI18n } from "@/i18n/I18nProvider";
import { loginSchema } from "@/utils/validation";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (field: "username" | "password", value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    },
    []
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setErrors({ form: t.errorValidation });
      toast.error(t.errorValidation);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data.error === "INVALID_CREDENTIALS"
            ? t.errorInvalidCredentials
            : t.errorGeneric;
        toast.error(message);
        return;
      }

      toast.success(t.successLogin);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t.welcomeBack}
      subtitle={t.loginSubtitle}
      footerText={t.noAccount}
      footerLinkText={t.register}
      footerHref="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t.username}
          </label>
          <input
            type="text"
            value={form.username}
            onChange={(event) => handleChange("username", event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t.password}
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(event) => handleChange("password", event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            autoComplete="current-password"
          />
        </div>

        {errors.form ? (
          <p className="text-sm text-red-600">{errors.form}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? t.loading : t.login}
        </button>
      </form>
    </AuthLayout>
  );
}
