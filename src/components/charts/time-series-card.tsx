"use client";

import { getDailySeries, getWeeklyTotals } from "@/lib/analytics";
import {
  chartPrimaryTick,
  chartSecondaryTick,
  chartTooltipStyle,
  getChartLegendStyle,
} from "@/lib/chart-theme";
import { formatDate } from "@/lib/utils";
import type { StudyEntry } from "@/types";
import { useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

interface TimeSeriesCardProps {
  entries: StudyEntry[];
}

export function TimeSeriesCard({ entries }: TimeSeriesCardProps) {
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly">("weekly");
  const days = timeRange === "weekly" ? 7 : 30;
  const dailySeries = getDailySeries(entries, days);

  const weekly = getWeeklyTotals(entries);
  const totalMinutes = dailySeries.reduce((sum, day) => sum + day.minutes, 0);
  const totalQuestions = dailySeries.reduce(
    (sum, day) => sum + day.questions,
    0,
  );
  const avgMinutes =
    dailySeries.length > 0 ? Math.round(totalMinutes / dailySeries.length) : 0;
  const bestDay = dailySeries.reduce(
    (best, day) => (day.minutes > best.minutes ? day : best),
    { date: "-", minutes: 0, questions: 0 },
  );
  const MINUTES_TARGET = 300;

  return (
    <div className="chart-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-200">
            Zaman Bazlı Analizler
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Günlük çalışma süresi
          </h3>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white/70 p-1 text-slate-600 shadow-inner dark:bg-slate-900/60">
          <button
            onClick={() => setTimeRange("weekly")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${timeRange === "weekly"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
          >
            7 Gün
          </button>
          <button
            onClick={() => setTimeRange("monthly")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${timeRange === "monthly"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
          >
            30 Gün
          </button>
        </div>
      </div>
      <div className="chart-panel h-60 p-3">
        <ResponsiveContainer>
          <ComposedChart data={dailySeries} style={{ backgroundColor: 'transparent' }}>
            <defs>
              <linearGradient id="minutes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-series-1)"
                  stopOpacity={0.55}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-series-1)"
                  stopOpacity={0.08}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--chart-grid)"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={chartSecondaryTick}
              tickFormatter={(value) => formatDate(value)}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={chartPrimaryTick}
              stroke="var(--chart-series-1)"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={chartPrimaryTick}
              stroke="var(--chart-series-2)"
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              labelFormatter={(label: string) => {
                try {
                  if (!label || typeof label !== 'string' || !label.includes("-")) return label;
                  const parts = label.split("-").map(Number);
                  if (parts.length !== 3 || parts.some(isNaN)) return label;
                  const [year, month, day] = parts;
                  const date = new Date(year, month - 1, day);
                  if (isNaN(date.getTime())) return label;
                  return date.toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                } catch {
                  return label;
                }
              }}
            />
            <Legend wrapperStyle={getChartLegendStyle()} />
            <ReferenceLine
              yAxisId="left"
              y={MINUTES_TARGET}
              stroke="var(--chart-positive)"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: "Hedef 300 dk",
                position: "insideTopRight",
                fill: "var(--chart-positive)",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="minutes"
              name="Dakika"
              stroke="var(--chart-series-1)"
              fill="url(#minutes)"
              strokeWidth={3}
            />
            <Bar
              yAxisId="right"
              dataKey="questions"
              name="Soru Sayısı"
              barSize={14}
              radius={[6, 6, 0, 0]}
              fill="var(--chart-series-2)"
              opacity={0.92}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="chart-stat text-slate-600 dark:text-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-300">
            Günlük ortalama
          </p>
          <p className="text-xl font-semibold text-slate-900 dark:text-white">
            {avgMinutes} dk
          </p>
          <p className="text-xs text-slate-600/90 dark:text-slate-300">
            Hedeften {Math.abs(avgMinutes - MINUTES_TARGET)} dk{" "}
            {avgMinutes >= MINUTES_TARGET ? "fazla" : "eksik"}
          </p>
        </div>
        <div className="chart-stat text-slate-600 dark:text-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-300">
            En verimli gün
          </p>
          <p className="text-xl font-semibold text-slate-900 dark:text-white">
            {bestDay.minutes} dk
          </p>
          <p className="text-xs text-slate-600/90 dark:text-slate-300">
            {bestDay.date !== "-" ? formatDate(bestDay.date) : "-"} •{" "}
            {bestDay.questions} soru
          </p>
        </div>
        <div className="chart-stat text-slate-600 dark:text-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-300">
            Toplam ({days} gün)
          </p>
          <p className="text-xl font-semibold text-slate-900 dark:text-white">
            {totalMinutes} dk
          </p>
          <p className="text-xs text-slate-600/90 dark:text-slate-300">{totalQuestions} soru</p>
        </div>
      </div>
      {timeRange === "weekly" && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-300">
            Bu Haftanın Dökümü (Pzt-Paz)
          </p>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {weekly.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border p-2"
                style={{
                  borderColor: "var(--chart-border)",
                  background: "var(--chart-surface-muted)",
                }}
              >
                <p className="text-xs text-slate-600/80 dark:text-slate-300">{item.label}</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {item.minutes}
                  <span className="ml-0.5 text-xs font-normal text-slate-500 dark:text-slate-400">
                    dk
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

