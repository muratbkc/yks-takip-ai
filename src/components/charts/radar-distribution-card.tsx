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
import { useState, useMemo } from "react";
import { subDays } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LessonRadarProps {
  entries: StudyEntry[];
}

type TimeFilter = "week" | "month" | "all";

export function LessonRadarCard({ entries }: LessonRadarProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  // Zamana göre filtrele
  const filteredEntries = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    if (timeFilter === "week") {
      const weekAgo = subDays(new Date(), 7).toISOString().split('T')[0];
      return entries.filter(e => e.date >= weekAgo && e.date <= today);
    }
    
    if (timeFilter === "month") {
      const monthAgo = subDays(new Date(), 30).toISOString().split('T')[0];
      return entries.filter(e => e.date >= monthAgo && e.date <= today);
    }
    
    return entries; // all
  }, [entries, timeFilter]);

  const distribution = getLessonDistribution(filteredEntries);
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
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            {distribution.length} ders
          </span>
          <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
            <TabsList className="h-8">
              <TabsTrigger value="week" className="text-xs px-2 py-1">Haftalık</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-2 py-1">Aylık</TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-2 py-1">Tüm Zamanlar</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer>
          <RadarChart data={distribution}>
            <PolarGrid stroke="#64748b" strokeOpacity={0.3} />
            <PolarAngleAxis 
              dataKey="lesson" 
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(12px)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                color: "#f1f5f9",
              }}
            />
            <Radar
              name="Dakika"
              dataKey="minutes"
              stroke="#8b5cf6"
              fill="#a78bfa"
              fillOpacity={0.5}
              strokeWidth={2}
            />
            <Radar
              name="Soru"
              dataKey="questions"
              stroke="#f59e0b"
              fill="#fbbf24"
              fillOpacity={0.4}
              strokeWidth={2}
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

