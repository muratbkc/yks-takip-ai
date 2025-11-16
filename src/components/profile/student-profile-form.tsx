"use client";

import { studyFieldLabels } from "@/lib/lesson-catalog";
import { useStudyStore } from "@/store/use-study-store";
import type { StudyField } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .max(80, "80 karakteri geçemez")
    .optional()
    .or(z.literal("")),
  studyField: z.enum(["sayisal", "esit-agirlik", "sozel"], {
    required_error: "Alan seçimi zorunlu",
  }),
});

type FormValues = z.infer<typeof schema>;

const fieldDescriptions: Record<StudyField, string> = {
  sayisal: "Matematik, Fizik, Kimya, Biyoloji odaklı",
  "esit-agirlik": "Matematik + Edebiyat/Sosyal ağırlıklı",
  sozel: "Edebiyat ve Sosyal Bilimler odaklı",
};

interface StudentProfileFormProps {
  variant?: "inline" | "onboarding";
  onSuccess?: () => void;
}

export function StudentProfileForm({
  variant = "inline",
  onSuccess,
}: StudentProfileFormProps) {
  const profile = useStudyStore((state) => state.profile);
  const updateProfile = useStudyStore((state) => state.updateProfile);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profile?.fullName ?? "",
      studyField: (profile?.studyField as StudyField | undefined) ?? undefined,
    },
  });

  const currentField = watch("studyField");

  useEffect(() => {
    reset({
      fullName: profile?.fullName ?? "",
      studyField: (profile?.studyField as StudyField | undefined) ?? undefined,
    });
  }, [profile?.fullName, profile?.studyField, reset]);

  const onSubmit = async (values: FormValues) => {
    setStatus("idle");
    try {
      await updateProfile({
        fullName: values.fullName?.trim(),
        studyField: values.studyField,
      });
      setStatus("success");
      onSuccess?.();
    } catch (error) {
      console.error(
        "Profil güncelleme formunda hata:",
        JSON.stringify(error, null, 2),
      );
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Ad Soyad (opsiyonel)
          <input
            type="text"
            placeholder="Örn: Elif Yılmaz"
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            {...register("fullName")}
          />
          {errors.fullName && (
            <span className="text-xs text-red-500">
              {errors.fullName.message}
            </span>
          )}
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Alan Seçimi <span className="text-red-500">*</span>
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(studyFieldLabels) as StudyField[]).map((field) => (
              <label
                key={field}
                className="cursor-pointer rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-medium text-slate-700 transition hover:border-indigo-300 data-[checked=true]:border-indigo-400 data-[checked=true]:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:data-[checked=true]:border-indigo-400 dark:data-[checked=true]:bg-indigo-500/10"
                data-checked={currentField === field || undefined}
              >
                <input
                  type="radio"
                  value={field}
                  className="hidden"
                  {...register("studyField")}
                />
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {studyFieldLabels[field]}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {fieldDescriptions[field]}
                </p>
              </label>
            ))}
          </div>
          {errors.studyField && (
            <p className="mt-1 text-xs text-red-500">
              {errors.studyField.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Kaydediliyor...
            </span>
          ) : variant === "onboarding" ? (
            "Profili tamamla"
          ) : (
            "Profilini Güncelle"
          )}
        </button>
        {status === "success" && (
          <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Kaydedildi!
          </p>
        )}
        {status === "error" && (
          <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <TriangleAlert className="h-4 w-4" /> Kaydedilirken bir hata oluştu.
          </p>
        )}
      </div>
    </form>
  );
}

