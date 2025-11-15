"use client";

import { useStudyStore } from "@/store/use-study-store";
import type { Difficulty, LessonType } from "@/types";
import { getMaxQuestionCount } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const difficultyLabels: Record<Difficulty, string> = {
  kolay: "Kolay",
  orta: "Orta",
  zor: "Zor",
};

const schema = z.object({
  title: z.string().min(3),
  date: z.string(),
  duration: z.number().min(60).max(240),
  difficulty: z.custom<Difficulty>(),
  summary: z
    .array(
      z.object({
        lesson: z.custom<LessonType>(),
        net: z.number().min(0),
      }),
    )
    .min(1)
    .refine(
      (items) =>
        items.every(
          (item) => item.net <= getMaxQuestionCount(item.lesson as string),
        ),
      {
        message: "Net sayısı dersin maksimum soru sayısını aşamaz",
      },
    ),
  weakTopics: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// 2026 YKS Ders Listesi - Kategorize ve Sıralı
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

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function MockExamForm() {
  const addMockExam = useStudyStore((state) => state.addMockExam);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "Yeni Deneme",
      date: new Date().toISOString().split("T")[0],
      duration: 135,
      difficulty: "orta",
      summary: [{ lesson: "Türkçe", net: 30 }],
      weakTopics: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "summary",
  });

  const onSubmit = (data: FormValues) => {
    const weakTopics = data.weakTopics
      ?.split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);
    addMockExam({
      id: createId(),
      ...data,
      weakTopics,
    });
    reset();
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between pb-4">
        <div>
          <p className="text-sm text-slate-500">Deneme Analizi</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Netlerini kaydet
          </h2>
        </div>
        <button
          type="button"
          onClick={() => append({ lesson: "Türkçe", net: 0 })}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <PlusCircle className="h-4 w-4" /> Ders ekle
        </button>
      </div>
      <form
        className="space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Deneme adı
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              {...register("title")}
            />
          </label>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Tarih
            <input
              type="date"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              {...register("date")}
            />
          </label>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Süre (dk)
            <input
              type="number"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              {...register("duration", { valueAsNumber: true })}
            />
          </label>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Zorluk
            <select
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              {...register("difficulty")}
            >
              {Object.entries(difficultyLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Zayıf Konular
            <input
              placeholder="Virgülle ayır"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              {...register("weakTopics")}
            />
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Ders Bazlı Netler
          </p>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-[1.5fr_1fr_auto] items-end gap-3 rounded-2xl border border-slate-100 bg-white/50 p-3 dark:border-slate-800 dark:bg-slate-900/40"
            >
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Ders
                <select
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                  {...register(`summary.${index}.lesson` as const)}
                >
                  {Object.entries(lessonsByCategory).map(([category, lessons]) => (
                    <optgroup key={category} label={category}>
                      {lessons.map((lesson) => (
                        <option key={lesson} value={lesson}>
                          {lesson}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Net
                <input
                  type="number"
                  step="0.25"
                  max={getMaxQuestionCount(fields[index]?.lesson || "Türkçe")}
                  placeholder={`Max: ${getMaxQuestionCount(fields[index]?.lesson || "Türkçe")}`}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                  {...register(`summary.${index}.net` as const, {
                    valueAsNumber: true,
                  })}
                />
              </label>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mb-1 inline-flex items-center justify-center rounded-2xl border border-red-200 px-2 py-2 text-sm text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
                >
                  <MinusCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.summary && (
          <p className="text-xs text-red-500">
            {errors.summary.root?.message ?? "En az bir ders ekleyin"}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          Deneme Kaydet
        </button>
      </form>
    </div>
  );
}

