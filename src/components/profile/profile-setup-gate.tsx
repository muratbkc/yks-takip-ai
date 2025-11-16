"use client";

import { StudentProfileForm } from "@/components/profile/student-profile-form";
import { studyFieldLabels } from "@/lib/lesson-catalog";

export function ProfileSetupGate() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950">
      <div className="w-full max-w-3xl space-y-6 rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/70 sm:p-10">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
            İlk Adım
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Alanını seç, planını kişiselleştir
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {`YKS'de çalıştığın alanı (${Object.values(studyFieldLabels).join(", ")}) seçtiğinde, ders listeleri ve öneriler otomatik olarak filtrelenecek.`}
          </p>
        </div>
        <StudentProfileForm variant="onboarding" />
      </div>
    </div>
  );
}

