"use client";

import { getDailySeries, getWeeklyTotals } from "@/lib/analytics";
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
    <div className="glass rounded-3xl p-4">
      <div className="flex items-center justify-between pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Zaman Bazlı Analizler
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Günlük çalışma süresi
          </h3>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setTimeRange("weekly")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              timeRange === "weekly"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            7 Gün
          </button>
          <button
            onClick={() => setTimeRange("monthly")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              timeRange === "monthly"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            30 Gün
          </button>
        </div>
      </div>
      <div className="h-60">
        <ResponsiveContainer>
          <ComposedChart data={dailySeries}>
            <defs>
              <linearGradient id="minutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={(value) => formatDate(value)} />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              stroke="#6366f1"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              stroke="#f97316"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(4px)",
                borderRadius: "1rem",
                border: "1px solid rgba(200, 200, 200, 0.5)",
              }}
              labelFormatter={(label: string) => {
                if (!label.includes("-")) return label;
                const [year, month, day] = label.split("-").map(Number);
                const date = new Date(year, month - 1, day);
                return date.toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
              }}
            />
            <Legend />
            <ReferenceLine
              yAxisId="left"
              y={MINUTES_TARGET}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{
                value: "Hedef 300 dk",
                position: "insideTopRight",
                fill: "#94a3b8",
                fontSize: 10,
              }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="minutes"
              name="Dakika"
              stroke="#6366f1"
              fill="url(#minutes)"
              strokeWidth={2}
            />
            <Bar
              yAxisId="right"
              dataKey="questions"
              name="Soru Sayısı"
              barSize={14}
              radius={[6, 6, 0, 0]}
              fill="#f97316"
              opacity={0.6}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="rounded-2xl border border-slate-100 p-3 text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Günlük ortalama
          </p>
          <p className="text-xl font-semibold text-slate-900 dark:text-white">
            {avgMinutes} dk
          </p>
          <p className="text-xs">
            Hedeften {Math.abs(avgMinutes - MINUTES_TARGET)} dk{" "}
            {avgMinutes >= MINUTES_TARGET ? "fazla" : "eksik"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 p-3 text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            En verimli gün
          </p>
          <p className="text-xl font-semibold text-slate-900 dark:text-white">
            {bestDay.minutes} dk
          </p>
          <p className="text-xs">
            {bestDay.date !== "-" ? formatDate(bestDay.date) : "-"} •{" "}
            {bestDay.questions} soru
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 p-3 text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Toplam ({days} gün)
          </p>
          <p className="text-xl font-semibold text-slate-900 dark:text-white">
            {totalMinutes} dk
          </p>
          <p className="text-xs">{totalQuestions} soru</p>
        </div>
      </div>
      {timeRange === "weekly" && (
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
            Bu Haftanın Dökümü (Pzt-Paz)
          </p>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {weekly.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-slate-100 p-2 dark:border-slate-800"
              >
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {item.minutes}
                  <span className="ml-0.5 text-xs font-normal text-slate-400">
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

