import { Suspense } from "react";
import { HealthCenterClient } from "./HealthCenterClient";

export default function HealthCenterPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          ...
        </div>
      }
    >
      <HealthCenterClient />
    </Suspense>
  );
}
