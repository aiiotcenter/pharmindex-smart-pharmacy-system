"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";
import { useI18n } from "@/i18n/I18nProvider";
import { GENDERS } from "@/lib/constants";
import { registerSchema } from "@/utils/validation";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    surname: "",
    email: "",
    birthDate: "",
    gender: "MALE" as (typeof GENDERS)[number],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (field: keyof typeof form, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    },
    []
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() ?? "form";
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error(t.errorValidation);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data.error === "USERNAME_EXISTS"
            ? t.errorUsernameExists
            : data.error === "EMAIL_EXISTS"
              ? t.errorEmailExists
              : t.errorGeneric;
        toast.error(message);
        setLoading(false);
        return;
      }

      toast.success(t.successRegister);
      router.push("/login");
    } catch {
      toast.error(t.errorGeneric);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t.createAccount}
      subtitle={t.registerSubtitle}
      footerText={t.hasAccount}
      footerLinkText={t.login}
      footerHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t.name}
            value={form.name}
            error={errors.name}
            onChange={(value) => handleChange("name", value)}
          />
          <Field
            label={t.surname}
            value={form.surname}
            error={errors.surname}
            onChange={(value) => handleChange("surname", value)}
          />
        </div>

        <Field
          label={t.username}
          value={form.username}
          error={errors.username}
          onChange={(value) => handleChange("username", value)}
        />

        <Field
          label={t.email}
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(value) => handleChange("email", value)}
        />

        <Field
          label={t.birthDate}
          type="date"
          value={form.birthDate}
          error={errors.birthDate}
          onChange={(value) => handleChange("birthDate", value)}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t.gender}
          </label>
          <select
            value={form.gender}
            onChange={(event) => handleChange("gender", event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="MALE">{t.male}</option>
            <option value="FEMALE">{t.female}</option>
            <option value="OTHER">{t.other}</option>
          </select>
        </div>

        <Field
          label={t.password}
          type="password"
          value={form.password}
          error={errors.password}
          onChange={(value) => handleChange("password", value)}
        />

        <Field
          label={t.confirmPassword}
          type="password"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          onChange={(value) => handleChange("confirmPassword", value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? t.loading : t.register}
        </button>
      </form>
    </AuthLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
