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
import {
  chartSecondaryTick,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipStyle,
} from "@/lib/chart-theme";

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
    <div className="chart-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-200">
            Ders Bazlı Dağılım
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Süre & soru radar grafiği
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="chart-pill">
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
      <div className="chart-panel h-64 p-3 text-slate-700 dark:text-slate-200">
        <ResponsiveContainer>
          <RadarChart data={distribution} style={{ backgroundColor: 'transparent' }}>
            <PolarGrid stroke="var(--chart-grid)" />
            <PolarAngleAxis
              dataKey="lesson"
              tick={chartSecondaryTick}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              labelStyle={chartTooltipLabelStyle}
              itemStyle={chartTooltipItemStyle}
            />
            <Radar
              name="Dakika"
              dataKey="minutes"
              stroke="var(--chart-series-1)"
              fill="var(--chart-series-1-soft)"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Radar
              name="Soru"
              dataKey="questions"
              stroke="var(--chart-series-2)"
              fill="var(--chart-series-2-soft)"
              fillOpacity={0.45}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-4 text-sm md:grid-cols-2">
        <div className="chart-stat text-slate-600 dark:text-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-300">
            En çok çalışılan dersler
          </p>
          <ul className="mt-2 space-y-1">
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

