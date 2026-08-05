import { Suspense } from "react";
import { DiagnosisClient } from "./DiagnosisClient";

export default function DoctorDiagnosisPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          ...
        </div>
      }
    >
      <DiagnosisClient />
    </Suspense>
  );
}
