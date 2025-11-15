"use client";

import { useStudyStore } from "@/store/use-study-store";
import type { LessonType, StudyType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const studyTypeLabels: Record<StudyType, string> = {
  "tyt-deneme": "TYT Denemesi",
  "ayt-deneme": "AYT Denemesi",
  "ders-deneme": "Ders Bazlı Deneme",
  "soru-cozumu": "Soru Çözümü",
  "konu-calismasi": "Konu Çalışması",
  tekrar: "Tekrar",
};

// 2026 YKS Ders Listesi - Kategorize
const lessonsByCategory: Record<string, LessonType[]> = {
  "TYT Dersleri": [
    "Türkçe",
    "Matematik",
    "Geometri",
    "Fizik",
    "Kimya",
    "Biyoloji",
    "Tarih",
    "Coğrafya",
    "Felsefe",
    "Din Kültürü",
  ],
  "AYT - Sayısal": [
    "AYT Matematik",
    "AYT Fizik",
    "AYT Kimya",
    "AYT Biyoloji",
  ],
  "AYT - Sözel/EA": [
    "AYT Edebiyat",
    "AYT Tarih-1",
    "AYT Tarih-2",
    "AYT Coğrafya-1",
    "AYT Coğrafya-2",
    "AYT Felsefe",
    "AYT Din Kültürü",
    "AYT Psikoloji",
    "AYT Sosyoloji",
    "AYT Mantık",
  ],
};

const formSchema = z.object({
  date: z.string().min(1, "Tarih gerekli"),
  timeSlot: z.enum(["sabah", "öğlen", "akşam"]),
  lessons: z
    .array(
      z.object({
        studyType: z.custom<StudyType>(),
        lesson: z.custom<LessonType>(),
        subTopic: z.string().optional(),
        minutes: z.number().min(5).max(600),
        questionCount: z.number().min(0).max(500),
      }),
    )
    .min(1, "En az bir ders eklemelisin"),
  notes: z.string().optional(),
  netTyt: z.number().min(0).max(120).optional(),
  netAyt: z.number().min(0).max(80).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function DailyLogForm() {
  const addStudyEntry = useStudyStore((state) => state.addStudyEntry);
  const [success, setSuccess] = useState<string | null>(null);

  const defaultValues = useMemo<FormValues>(
    () => ({
      date: new Date().toISOString().split("T")[0],
      timeSlot: "öğlen",
      lessons: [
        {
          studyType: "soru-cozumu",
          lesson: "Matematik",
          subTopic: "",
          minutes: 60,
          questionCount: 40,
        },
      ],
      notes: "",
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lessons",
  });

  // İlk dersin studyType'ını takip et (deneme tipinde net girişi için)
  const firstStudyType = useWatch({
    control,
    name: "lessons.0.studyType",
  });

  const isDeneme =
    firstStudyType === "tyt-deneme" ||
    firstStudyType === "ayt-deneme" ||
    firstStudyType === "ders-deneme";

  const onSubmit = (data: FormValues) => {
    const netValue =
      isDeneme && ((data.netTyt ?? 0) > 0 || (data.netAyt ?? 0) > 0)
        ? { tyt: data.netTyt ?? 0, ayt: data.netAyt ?? 0 }
        : undefined;

    // Her dersi ayrı entry olarak kaydet
    data.lessons.forEach((lessonData) => {
      addStudyEntry({
        id: createId(),
        date: data.date,
        lesson: lessonData.lesson,
        subTopic: lessonData.subTopic,
        minutes: lessonData.minutes,
        questionCount: lessonData.questionCount,
        notes: data.notes,
        studyType: lessonData.studyType,
        timeSlot: data.timeSlot,
        net: netValue,
      });
    });

    const totalMinutes = data.lessons.reduce(
      (sum, l) => sum + l.minutes,
      0,
    );
    const totalQuestions = data.lessons.reduce(
      (sum, l) => sum + l.questionCount,
      0,
    );

    setSuccess(
      `${data.lessons.length} ders kaydedildi! (${totalMinutes} dk, ${totalQuestions} soru)`,
    );
    reset(defaultValues);
    setTimeout(() => setSuccess(null), 4000);
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex flex-col gap-3 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Günlük Çalışma Kaydı
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Bugünün performansını kaydet
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              append({
                studyType: "soru-cozumu",
                lesson: "Matematik",
                subTopic: "",
                minutes: 60,
                questionCount: 40,
              })
            }
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
          >
            <PlusCircle className="h-4 w-4" /> Ders Ekle
          </button>
        </div>
        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            {success}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Genel Bilgiler */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Tarih
            <input
              type="date"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register("date")}
            />
            {errors.date && (
              <span className="text-xs text-red-500">{errors.date.message}</span>
            )}
          </label>

          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Günün Saati
            <select
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register("timeSlot")}
            >
              <option value="sabah">Sabah</option>
              <option value="öğlen">Öğlen</option>
              <option value="akşam">Akşam</option>
            </select>
          </label>
        </div>

        {/* Ders Kartları */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Çalıştığın Dersler ({fields.length})
            </p>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-2xl border-2 border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Ders {index + 1}
                </h4>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <MinusCircle className="h-3 w-3" /> Kaldır
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Çalışma Türü
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    {...register(`lessons.${index}.studyType` as const)}
                  >
                    {Object.entries(studyTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Ders
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    {...register(`lessons.${index}.lesson` as const)}
                  >
                    {Object.entries(lessonsByCategory).map(
                      ([category, lessons]) => (
                        <optgroup key={category} label={category}>
                          {lessons.map((lesson) => (
                            <option key={lesson} value={lesson}>
                              {lesson}
                            </option>
                          ))}
                        </optgroup>
                      ),
                    )}
                  </select>
                </label>

                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Süre (dakika)
                  <input
                    type="number"
                    min={5}
                    placeholder="60"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    {...register(`lessons.${index}.minutes` as const, {
                      valueAsNumber: true,
                    })}
                  />
                </label>

                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Soru Sayısı
                  <input
                    type="number"
                    min={0}
                    placeholder="40"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    {...register(`lessons.${index}.questionCount` as const, {
                      valueAsNumber: true,
                    })}
                  />
                </label>

                <label className="col-span-full text-xs font-medium text-slate-600 dark:text-slate-300">
                  Alt Konu (opsiyonel)
                  <input
                    type="text"
                    placeholder="Örn: Paragraf, İntegral, Osmanlı Dönemi..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    {...register(`lessons.${index}.subTopic` as const)}
                  />
                </label>
              </div>
            </div>
          ))}

          {errors.lessons && (
            <p className="text-xs text-red-500">
              {errors.lessons.root?.message ?? "En az bir ders eklemelisin"}
            </p>
          )}
        </div>

        {/* Notlar ve Net Girişi */}
        <div className="grid grid-cols-1 gap-4">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Notlar (tüm dersler için)
            <textarea
              rows={2}
              placeholder="Bugünkü hissiyatın, akılda kalan kritik noktalar..."
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register("notes")}
            />
          </label>

          {isDeneme && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                Deneme Net Girişi
              </p>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  TYT Net
                  <input
                    type="number"
                    step="0.25"
                    min={0}
                    max={120}
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    {...register("netTyt", {
                      setValueAs: (value) =>
                        value === "" || value === null
                          ? undefined
                          : Number(value),
                    })}
                  />
                </label>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  AYT Net
                  <input
                    type="number"
                    step="0.25"
                    min={0}
                    max={80}
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    {...register("netAyt", {
                      setValueAs: (value) =>
                        value === "" || value === null
                          ? undefined
                          : Number(value),
                    })}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Kaydediliyor..."
            : `${fields.length} Ders Kaydet (${fields.reduce((sum, _, i) => {
                const minutes =
                  typeof control._formValues.lessons?.[i]?.minutes ===
                  "number"
                    ? control._formValues.lessons[i].minutes
                    : 0;
                return sum + minutes;
              }, 0)} dk)`}
        </button>
      </form>
    </div>
  );
}

