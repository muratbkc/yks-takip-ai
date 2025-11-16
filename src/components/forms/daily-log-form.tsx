"use client";

import { useStudyStore } from "@/store/use-study-store";
import {
  getDefaultLessonForField,
  getLessonGroupsForField,
  TYT_LESSONS,
  AYT_SAY_LESSONS,
  AYT_EA_LESSONS,
  AYT_SOZ_LESSONS
} from "@/lib/lesson-catalog";
import type { Difficulty, LessonType, StudyEntry, StudyType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getMaxQuestionCount } from "@/lib/utils";
import type { MockExamType } from "@/types"; // MockExamType import edildi

const studyTypeLabels: Record<StudyType, string> = {
  "tyt-deneme": "TYT Denemesi",
  "ayt-deneme": "AYT Denemesi",
  "ders-deneme": "Ders Bazlı Deneme",
  "soru-cozumu": "Soru Çözümü",
  "konu-calismasi": "Konu Çalışması",
  tekrar: "Tekrar",
};

const dailyLogStudyTypes = {
    "soru-cozumu": "Soru Çözümü",
    "konu-calismasi": "Konu Çalışması",
    tekrar: "Tekrar",
};

const timeSlotLabels: Record<StudyEntry["timeSlot"], string> = {
  sabah: "Sabah",
  öğlen: "Öğlen",
  akşam: "Akşam",
};

const difficultyLabels: Record<Difficulty, string> = {
    kolay: "Kolay",
    orta: "Orta",
    zor: "Zor",
};

const createId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

// --- Form Şemaları (Yeniden Yapılandırıldı) ---
const logEntrySchema = z.object({
  studyType: z.custom<StudyType>(),
  lesson: z.custom<LessonType>(),
  subTopic: z.string().optional(),
  minutes: z.number().min(5).max(600),
  questionCount: z.number().min(0).max(500),
  timeSlot: z.enum(["sabah", "öğlen", "akşam"]),
});

const mockSummarySchema = z.object({
  lesson: z.custom<LessonType>(),
  correct: z.number({ invalid_type_error: "Sayı girin" }).min(0),
  wrong: z.number({ invalid_type_error: "Sayı girin" }).min(0),
  empty: z.number({ invalid_type_error: "Sayı girin" }).min(0),
  net: z.number(),
});

const logFormSchema = z.object({
    formType: z.literal("log"),
    date: z.string().min(1, "Tarih gerekli"),
    lessons: z.array(logEntrySchema).min(1, "En az bir ders eklemelisiniz."),
    notes: z.string().optional(),
});

const mockFormSchema = z.object({
    formType: z.literal("mock"),
    date: z.string().min(1, "Tarih gerekli"),
    title: z.string().min(3, "Deneme adı en az 3 karakter olmalıdır."),
    examType: z.custom<MockExamType>((val) => val && val !== "Ders", {
        message: "Lütfen bir deneme türü seçin (TYT/AYT).",
    }).or(z.literal("Ders")),
    duration: z.number({ required_error: "Süre zorunludur.", invalid_type_error: "Geçerli bir süre girin." }).min(1, "Süre en az 1 dakika olmalıdır."),
    difficulty: z.custom<Difficulty>(),
    summary: z.array(mockSummarySchema).min(1, "En az bir ders sonucu eklemelisiniz."),
    weakTopics: z.string().optional(),
}).refine((data) => {
    // Toplam soru sayısı kontrolü
    return data.summary.every(item => {
        const maxQuestions = getMaxQuestionCount(item.lesson);
        return (item.correct + item.wrong + item.empty) <= maxQuestions;
    });
}, {
    message: "Toplam soru sayısı, dersin maksimum soru sayısını aşamaz.",
    path: ["summary"],
});


const formSchema = z.discriminatedUnion("formType", [
  logFormSchema,
  mockFormSchema,
]);

type FormValues = z.infer<typeof formSchema>;

export function DailyLogForm() {
  const { addStudyEntry, addMockExam, profile } = useStudyStore();
  const [success, setSuccess] = useState<string | null>(null);

  const lessonGroups = useMemo(
    () => getLessonGroupsForField(profile?.studyField),
    [profile?.studyField],
  );

  const defaultLesson = useMemo(
    () => getDefaultLessonForField(profile?.studyField),
    [profile?.studyField],
  );

  const defaultLogValues: FormValues = useMemo(() => ({
    formType: "log",
      date: new Date().toISOString().split("T")[0],
      lessons: [
        {
          studyType: "soru-cozumu",
          lesson: defaultLesson,
          subTopic: "",
          minutes: 60,
          questionCount: 40,
          timeSlot: "öğlen",
        },
      ],
      notes: "",
  }), [defaultLesson]);

  const defaultMockValues: FormValues = useMemo(() => ({
    formType: "mock",
    examType: "Ders", // Varsayılan deneme türü
    date: new Date().toISOString().split("T")[0],
    title: "Yeni Deneme",
    duration: 165,
    difficulty: "orta",
    summary: [], // Başlangıçta boş
    weakTopics: "",
    notes: "",
  }), []);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultLogValues,
  });

  const {
    fields: lessonFields,
    append: appendLesson,
    remove: removeLesson,
  } = useFieldArray({ control, name: "lessons" });

  const {
    fields: summaryFields,
    append: appendSummary,
    remove: removeSummary,
  } = useFieldArray({ control, name: "summary" });

  const formType = watch("formType");
  const examType = watch("examType"); // Bu satır eklenecek

  const summaryValues = watch("summary");

  useEffect(() => {
      if (summaryValues) {
          summaryValues.forEach((field, index) => {
              const correct = field.correct || 0;
              const wrong = field.wrong || 0;
              const net = correct - wrong / 4;
              // setValue anlık güncellemelerde re-render tetiklemeyebilir,
              // ama form gönderiminde doğru değeri alır.
              // Anlık gösterim için watch yeterlidir.
              if (field.net !== net) {
                  setValue(`summary.${index}.net`, net, { shouldValidate: true });
              }
          });
      }
  }, [summaryValues, setValue]);

  useEffect(() => {
      if (formType !== 'mock') return;

      let lessonsToPopulate: LessonType[] = [];

      if (examType === "TYT") {
          lessonsToPopulate = TYT_LESSONS;
      } else if (examType === "AYT") {
          switch (profile?.studyField) {
              case "sayisal": lessonsToPopulate = AYT_SAY_LESSONS; break;
              case "esit-agirlik": lessonsToPopulate = AYT_EA_LESSONS; break;
              case "sozel": lessonsToPopulate = AYT_SOZ_LESSONS; break;
              default: lessonsToPopulate = [];
          }
      }

      // `summary`'i yeni ders listesiyle güncelle
      const newSummary = lessonsToPopulate.map(lesson => ({
          lesson,
          correct: 0,
          wrong: 0,
          empty: getMaxQuestionCount(lesson), // Başlangıçta hepsi boş
          net: 0,
      }));

      if (examType === "TYT" || examType === "AYT") {
          setValue("summary", newSummary);
      } else {
          // "Ders" seçilirse ve listede önceden doldurulmuş dersler varsa temizle
          const currentLessons = control._formValues.summary?.map(s => s.lesson) ?? [];
          const isPrePopulated = [...TYT_LESSONS, ...AYT_SAY_LESSONS, ...AYT_EA_LESSONS, ...AYT_SOZ_LESSONS].includes(currentLessons[0]);
          if(isPrePopulated && currentLessons.length > 1) {
              setValue("summary", []);
          }
      }

  }, [examType, profile?.studyField, setValue, formType, control]);

  const handleTabChange = (tab: "log" | "mock") => {
    const currentDate = control._formValues.date || new Date().toISOString().split("T")[0];
    if (tab === 'log') {
        reset({...defaultLogValues, date: currentDate});
    } else {
        reset({...defaultMockValues, date: currentDate});
    }
    setValue('formType', tab);
  };

  const onSubmit = (data: FormValues) => {
    if (data.formType === "log" && data.lessons) {
    data.lessons.forEach((lessonData) => {
      addStudyEntry({
        id: createId(),
        date: data.date,
          ...lessonData,
        notes: data.notes,
        });
      });
      setSuccess(`${data.lessons.length} ders kaydedildi.`);
      reset(defaultLogValues);
    } else if (data.formType === "mock") {
      const weakTopics = data.weakTopics
        ?.split(",")
        .map((topic) => topic.trim())
        .filter(Boolean);
      addMockExam({
        id: createId(),
        title: data.title,
        date: data.date,
        examType: data.examType,
        duration: data.duration,
        difficulty: data.difficulty,
        summary: data.summary,
        weakTopics: data.weakTopics || undefined,
      });
      setSuccess(`"${data.title}" denemesi kaydedildi.`);
      reset(defaultLogValues);
    }
    setTimeout(() => setSuccess(null), 4000);
  };

  return (
    <div className="glass rounded-3xl p-6">
        <Tabs defaultValue="log" className="w-full" onValueChange={(value) => handleTabChange(value as "log" | "mock")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="log">Günlük Çalışma Kaydı</TabsTrigger>
                <TabsTrigger value="mock">Deneme Analizi</TabsTrigger>
            </TabsList>
        {success && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            {success}
          </div>
        )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TabsContent value="log">
                    {/* GÜNLÜK ÇALIŞMA FORMU İÇERİĞİ */}
                    <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
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
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Çalıştığın Dersler ({lessonFields.length})
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                    appendLesson({
                                        studyType: "soru-cozumu",
                                        lesson: defaultLesson,
                                        subTopic: "",
                                        minutes: 60,
                                        questionCount: 40,
                                        timeSlot: "öğlen",
                                    })
                                    }
                                    className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                                >
                                    <PlusCircle className="h-4 w-4" /> Ders Ekle
                                </button>
          </div>

                            {lessonFields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-2xl border-2 border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Ders {index + 1}
                </h4>
                                    {lessonFields.length > 1 && (
                  <button
                    type="button"
                                        onClick={() => removeLesson(index)}
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
                                            {...register(`lessons.${index}.studyType`)}
                  >
                                            {Object.entries(dailyLogStudyTypes).map(([value, label]) => (
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
                                            {...register(`lessons.${index}.lesson`)}
                  >
                    {lessonGroups.map((group) => (
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
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Süre (dakika)
                  <input
                    type="number"
                    min={5}
                    placeholder="60"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                            {...register(`lessons.${index}.minutes`, { valueAsNumber: true })}
                  />
                </label>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Soru Sayısı
                  <input
                    type="number"
                    min={0}
                    placeholder="40"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                            {...register(`lessons.${index}.questionCount`, { valueAsNumber: true })}
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
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="mock">
                    {/* DENEME ANALİZ FORMU İÇERİĞİ */}
                     <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 md:col-span-2">
                                Deneme Adı
                                <input {...register("title")} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900" />
                                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                            </label>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Deneme Türü
                                <select
                                    {...register("examType")}
                                    className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <option value="Ders">Ders Bazlı Deneme</option>
                                    <option value="TYT">TYT Genel Deneme</option>
                                    <option value="AYT">AYT Alan Denemesi</option>
                                </select>
                            </label>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Tarih
                                <input type="date" {...register("date")} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"/>
                            </label>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Süre (dk)
                                <input type="number" {...register("duration", { valueAsNumber: true })} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"/>
                                {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration.message}</p>}
                            </label>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Zorluk
                                <select {...register("difficulty")} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
                                    {Object.entries(difficultyLabels).map(([value, label]) => (
                                        <option key={value} value={value as Difficulty}>{label}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block">
                            Zayıf Konular (virgülle ayır)
                            <input {...register("weakTopics")} placeholder="Örn: İntegral, Paragraf" className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900"/>
                        </label>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Ders Bazlı Sonuçlar</p>
                                {examType === "Ders" && (
                                    <button type="button" onClick={() => appendSummary({ lesson: defaultLesson, correct: 0, wrong: 0, empty: 0, net: 0 })} className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20">
                                    <PlusCircle className="h-4 w-4" /> Ders ekle
                                </button>
                                )}
                            </div>
                            {summaryFields.map((field, index) => {
                                const watchedField = summaryValues && summaryValues[index] ? summaryValues[index] : { correct: 0, wrong: 0, empty: 0 };
                                const calculatedNet = (watchedField.correct || 0) - (watchedField.wrong || 0) / 4;
                                const maxQuestions = getMaxQuestionCount(watchedField.lesson || defaultLesson);
                                const totalQuestions = (watchedField.correct || 0) + (watchedField.wrong || 0) + (watchedField.empty || 0);

                                return (
                                <div key={field.id} className="rounded-2xl border border-slate-100 bg-white/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                                     <div className="flex items-center justify-between mb-3">
                                        {examType === "Ders" ? (
                                            <select {...register(`summary.${index}.lesson`)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                                                {lessonGroups.map((group) => (
                                                    <optgroup key={group.label} label={group.label}>
                                                    {group.lessons.map((lesson) => <option key={lesson} value={lesson}>{lesson}</option>)}
                                                    </optgroup>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="font-semibold">{summaryValues?.[index]?.lesson}</span>
                                        )}
                                        {examType === "Ders" && (
                                            <button type="button" onClick={() => removeSummary(index)} className="mb-1 inline-flex items-center justify-center rounded-xl border border-red-200 p-2 text-sm text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10">
                                        <MinusCircle className="h-4 w-4" />
                                        </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                         <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                            Doğru
                                            <input type="number" {...register(`summary.${index}.correct`, { valueAsNumber: true })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"/>
                                        </label>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                            Yanlış
                                            <input type="number" {...register(`summary.${index}.wrong`, { valueAsNumber: true })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"/>
                </label>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                            Boş
                                            <input type="number" {...register(`summary.${index}.empty`, { valueAsNumber: true })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"/>
                </label>
                                        <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                            Net
                                            <div className="mt-1 flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                                                {calculatedNet.toFixed(2)}
                                            </div>
              </div>
            </div>
                                    <div className="mt-2 text-right text-xs font-medium text-slate-500">
                                        <span className={cn(totalQuestions > maxQuestions ? 'text-red-500' : '')}>
                                            Toplam: {totalQuestions} / {maxQuestions}
                                        </span>
                                    </div>
                                     {errors.summary?.[index]?.correct && <p className="text-xs text-red-500 mt-1">{errors.summary[index]?.correct?.message}</p>}
                                </div>
                            )})}
                            {errors.summary && !errors.summary.root && <p className="text-xs text-red-500 mt-1">{errors.summary.message}</p>}
                        </div>
        </div>
                </TabsContent>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
                    {isSubmitting ? "Kaydediliyor..." : "Kaydı Gönder"}
        </button>
      </form>
        </Tabs>
    </div>
  );
}

