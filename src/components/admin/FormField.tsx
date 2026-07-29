import { DOSAGE_FORM_KEYS } from "@/constants/dosage-forms";

export function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  required = true,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  required = true,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      required={required}
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
    />
  );
}

export function DosageFormSelect({
  value,
  onChange,
  labels,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  labels: Record<(typeof DOSAGE_FORM_KEYS)[number], string>;
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
    >
      <option value="">{placeholder}</option>
      {DOSAGE_FORM_KEYS.map((key) => (
        <option key={key} value={key}>
          {labels[key]}
        </option>
      ))}
    </select>
  );
}
