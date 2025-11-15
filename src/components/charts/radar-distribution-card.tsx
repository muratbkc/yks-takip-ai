"use client";

import { getLessonDistribution } from "@/lib/analytics";
import type { StudyEntry } from "@/types";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface LessonRadarProps {
  entries: StudyEntry[];
}

export function LessonRadarCard({ entries }: LessonRadarProps) {
  const distribution = getLessonDistribution(entries);
  const topLessons = distribution
    .slice()
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 3);
  const needAttention = distribution
    .slice()
    .sort((a, b) => a.minutes - b.minutes)
    .slice(0, 3);

  return (
    <div className="glass rounded-3xl p-4">
      <div className="flex items-center justify-between pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Ders Bazlı Dağılım
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Süre & soru radar grafiği
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          {distribution.length} ders
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer>
          <RadarChart data={distribution}>
            <PolarGrid />
            <PolarAngleAxis dataKey="lesson" />
            <Tooltip />
            <Radar
              name="Dakika"
              dataKey="minutes"
              stroke="#3b82f6"
              fill="#93c5fd"
              fillOpacity={0.4}
            />
            <Radar
              name="Soru"
              dataKey="questions"
              stroke="#f97316"
              fill="#fdba74"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            En çok çalışılan dersler
          </p>
          <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
            {topLessons.map((lesson) => (
              <li key={lesson.lesson} className="flex items-center justify-between">
                <span>{lesson.lesson}</span>
                <span className="text-xs">
                  {lesson.minutes} dk • {lesson.questions} soru
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <p className="text-xs uppercase tracking-wide">
            Daha fazla ilgi isteyen dersler
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {needAttention.map((lesson) => (
              <li key={lesson.lesson} className="flex items-center justify-between">
                <span>{lesson.lesson}</span>
                <span className="text-xs">{lesson.minutes} dk</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs">
            Haftalık plana bu derslerden en az birini eklemeyi unutma.
          </p>
        </div>
      </div>
    </div>
  );
}

