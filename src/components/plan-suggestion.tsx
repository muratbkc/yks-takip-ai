"use client";

import { differenceInDays, subDays } from "date-fns";
import { Lightbulb } from "lucide-react";
import { useMemo } from "react";
import { useStudyStore } from "@/store/use-study-store";

const suggestionTemplates = [
  "Bugün {lesson} için {questions} soru + {minutes} dk konu tekrar yap.",
  "{lesson} dersinde açığın var. {minutes} dk odak, ardından {questions} soru öneriyorum.",
  "Son günlerde {lesson} ihmal edildi. {questions} soru çöz ve notlarını gözden geçir.",
];

// Deterministik template seçimi (hydration hatası olmaması için)
const pickTemplate = (lesson: string, daysAgo: number) => {
  // Ders adı ve gün sayısına göre deterministik index hesapla
  const hash = lesson.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = (hash + daysAgo) % suggestionTemplates.length;
  return suggestionTemplates[index];
};

const formatSuggestion = (
  lesson: string,
  minutes: number,
  questions: number,
  daysAgo: number,
) => {
  return pickTemplate(lesson, daysAgo)
    .replace("{lesson}", lesson)
    .replace("{minutes}", `${minutes}`)
    .replace("{questions}", `${questions}`);
};

export function PlanSuggestion() {
  const studyEntries = useStudyStore((state) => state.studyEntries);

  const suggestion = useMemo(() => {
    if (!studyEntries.length) return "Henüz veri yok, ilk kaydı oluştur.";
    const endDate = new Date();
    const startDate = subDays(endDate, 6);

    const filtered = studyEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    const byLesson = filtered.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.lesson] = (acc[entry.lesson] ?? 0) + entry.minutes;
      return acc;
    }, {});

    const leastStudied = Object.entries(byLesson).sort(
      (a, b) => a[1] - b[1],
    )[0]?.[0];

    const lesson =
      leastStudied ?? filtered.at(-1)?.lesson ?? "Matematik";

    const lastEntry = studyEntries.find((entry) => entry.lesson === lesson);
    const daysAgo = lastEntry
      ? differenceInDays(endDate, new Date(lastEntry.date))
      : 7;

    const minutes = Math.min(120, 40 + daysAgo * 10);
    const questions = Math.min(120, 30 + daysAgo * 8);

    return formatSuggestion(lesson, minutes, questions, daysAgo);
  }, [studyEntries]);

  const planItems = [
    {
      title: "Süre Dengesi",
      value: "6 saat hedef",
      tip: "Pomodoro ile ölç, gün sonunda oto kaydet.",
    },
    {
      title: "Deneme Bu Hafta",
      value: "3 / 4",
      tip: "Bir TYT, bir AYT denemesi planla.",
    },
    {
      title: "Konu Tamamlama",
      value: "%72",
      tip: "Eksik kaldığın konuları konu takibinden işaretle.",
    },
  ];

  return (
    <div className="glass rounded-3xl p-4">
      <div className="flex items-center gap-2 pb-3">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Bugün Ne Yapmalıyım?
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            7 günlük dağılıma göre öneri
          </h3>
        </div>
      </div>
      <p className="rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 p-3 text-sm font-medium text-amber-900 dark:from-amber-500/30 dark:to-orange-500/30 dark:text-amber-50">
        {suggestion}
      </p>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        {planItems.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-100 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/40"
          >
            <p className="text-xs text-slate-500">{item.title}</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {item.value}
            </p>
            <p className="text-xs text-slate-500">{item.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

