"use client";

import { useMemo } from "react";
import { useStudyStore } from "@/store/use-study-store";
import { useStore } from "@/hooks/use-store";
import { sumBy } from "@/lib/math";
import { formatMinutes } from "@/lib/utils";
import {
  Activity,
  BarChart2,
  Target,
  Layers,
} from "lucide-react";

const cards = [
  {
    id: "minutes",
    title: "Bu hafta toplam süre",
    icon: Activity,
    color: "text-indigo-500",
  },
  {
    id: "questions",
    title: "Bu hafta soru",
    icon: BarChart2,
    color: "text-emerald-500",
  },
  {
    id: "exams",
    title: "Deneme sayısı",
    icon: Target,
    color: "text-rose-500",
  },
  {
    id: "lessons",
    title: "Aktif ders",
    icon: Layers,
    color: "text-amber-500",
  },
];

export function AnalyticsSummary() {
  const studyEntries = useStore(useStudyStore, (state) => state.studyEntries) ?? [];
  const mockExams = useStore(useStudyStore, (state) => state.mockExams) ?? [];

  const stats = useMemo(() => {
    const minutes = sumBy(studyEntries, (entry) => entry.minutes);
    const questions = sumBy(studyEntries, (entry) => entry.questionCount);
    const lessons = new Set(studyEntries.map((entry) => entry.lesson)).size;
    return {
      minutes,
      questions,
      exams: mockExams.length,
      lessons,
    };
  }, [studyEntries, mockExams]);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((card) => {
        const value =
          card.id === "minutes"
            ? formatMinutes(stats.minutes)
            : card.id === "questions"
              ? `${stats.questions} soru`
              : card.id === "exams"
                ? `${stats.exams} deneme`
                : `${stats.lessons} ders`;
        return (
          <div
            key={card.id}
            className="glass flex items-center gap-3 rounded-3xl p-4"
          >
            <card.icon className={`h-8 w-8 ${card.color}`} />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {card.title}
              </p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

