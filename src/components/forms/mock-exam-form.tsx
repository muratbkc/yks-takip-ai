"use client";

import { useStudyStore } from "@/store/use-study-store";
import type { Difficulty, LessonType, MockExamType } from "@/types";
import { getMaxQuestionCount } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { MinusCircle, PlusCircle, ArrowLeft } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  getDefaultLessonForField,
  getLessonGroupsForField,
} from "@/lib/lesson-catalog";

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
  examType: z.custom<MockExamType>(),
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
});

type FormValues = z.infer<typeof schema>;

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

interface MockExamFormProps {
  onSwitchToDailyLog: () => void;
}

export function MockExamForm({ onSwitchToDailyLog }: MockExamFormProps) {
  const addMockExam = useStudyStore((state) => state.addMockExam);
  const profile = useStudyStore((state) => state.profile);

  const lessonGroups = useMemo(
    () => getLessonGroupsForField(profile?.studyField),
    [profile?.studyField],
  );

  const defaultLesson = useMemo(
    () => getDefaultLessonForField(profile?.studyField),
    [profile?.studyField],
  );

  const defaultValues = useMemo<FormValues>(
    () => ({
      title: "Yeni Deneme",
      date: new Date().toISOString().split("T")[0],
      duration: 135,
      difficulty: "orta",
      examType: "TYT",
      summary: [{ lesson: defaultLesson, net: 30 }],
    }),
    [defaultLesson],
  );
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "summary",
  });

  const examType = watch("examType");

  const TYT_EXAM_LESSONS: LessonType[] = [
    "Türkçe",
    "Matematik",
    "Fizik",
    "Kimya",
    "Biyoloji",
    "Tarih",
    "Coğrafya",
    "Felsefe",
    "Din Kültürü",
  ];

  const lessonOptions = useMemo<LessonType[]>(() => {
    if (examType === "TYT") {
      return TYT_EXAM_LESSONS;
    }
    // Diğer tiplerde mevcut grup listesini düzleştir
    return Array.from(new Set(lessonGroups.flatMap((g) => g.lessons)));
  }, [examType, lessonGroups]);

  const onSubmit = (data: FormValues) => {
    const summary = data.summary.map(({ lesson, net }) => ({
      lesson: examType === "TYT" && lesson === "Geometri" ? ("Matematik" as LessonType) : lesson,
      net,
      correct: 0,
      wrong: 0,
      empty: 0,
    }));
    addMockExam({
      id: createId(),
      ...data,
      summary,
    });
    reset();
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToDailyLog}
            className="rounded-full bg-slate-200 p-2 text-slate-600 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Deneme Analizi
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Netlerini kaydet
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={() => append({ lesson: (examType === "TYT" ? ("Matematik" as LessonType) : defaultLesson), net: 0 })}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Süre (dk)
            <input
              type="number"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              {...register("duration", { valueAsNumber: true })}
            />
          </label>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Tür
            <select
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              {...register("examType")}
            >
              <option value="TYT">TYT</option>
              <option value="AYT">AYT</option>
              <option value="Ders">Ders</option>
            </select>
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
                  {examType === "TYT"
                    ? lessonOptions.map((lesson) => (
                        <option key={lesson} value={lesson}>
                          {lesson}
                        </option>
                      ))
                    : lessonGroups.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.lessons.map((lesson) => (
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

