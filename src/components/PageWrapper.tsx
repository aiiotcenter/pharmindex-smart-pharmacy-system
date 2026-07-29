export function PageWrapper({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
      {message}
    </div>
  );
}

export function InfoCard({
  title,
  description,
  accent = "emerald",
}: {
  title: string;
  description?: string | null;
  accent?: "emerald" | "red" | "blue";
}) {
  const accentClass =
    accent === "red"
      ? "border-red-200 bg-red-50/50"
      : accent === "blue"
        ? "border-blue-200 bg-blue-50/50"
        : "border-slate-200 bg-white";

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${accentClass}`}>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}
