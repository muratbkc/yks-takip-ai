"use client";

import { getEfficiencyData } from "@/lib/analytics";
import type { StudyEntry } from "@/types";
import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipStyle,
} from "@/lib/chart-theme";

interface EfficiencyCardProps {
  entries: StudyEntry[];
}

export function EfficiencyCard({ entries }: EfficiencyCardProps) {
  const efficiency = getEfficiencyData(entries).slice(-14);
  const lastSeven = efficiency.slice(-7);
  const avgEfficiency =
    lastSeven.reduce((sum, day) => sum + day.efficiency, 0) /
    (lastSeven.length || 1) || 0;
  const latest = efficiency.at(-1)?.efficiency ?? 0;
  const targetEfficiency = 0.45;
  const percent = Math.min(Math.round((avgEfficiency / targetEfficiency) * 100), 120);
  const gaugeData = [
    {
      name: "Kalan",
      value: Math.max(0, 100 - Math.min(percent, 100)),
      fill: "var(--chart-neutral-soft)",
    },
    {
      name: "Verim",
      value: Math.min(percent, 100),
      fill: "var(--chart-positive)",
    },
  ];
  const bestDay =
    lastSeven.reduce(
      (best, day) => (day.efficiency > best.efficiency ? day : best),
      { date: "-", efficiency: 0 },
    ) ?? { date: "-", efficiency: 0 };
  const worstDay =
    lastSeven.reduce(
      (worst, day) => (day.efficiency < worst.efficiency ? day : worst),
      { date: "-", efficiency: Infinity },
    ) ?? { date: "-", efficiency: 0 };
  const formatter = (date: string) =>
    date === "-"
      ? "-"
      : new Date(date).toLocaleDateString("tr-TR", {
        weekday: "short",
      });

  return (
    <div className="chart-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-200">
            Verimlilik
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Soru / dakika
          </h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-600 dark:text-slate-400">Bugün</p>
          <p className="text-sm font-semibold text-emerald-500 dark:text-emerald-400">
            {latest.toFixed(2)} soru/dk
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="chart-stat flex flex-col items-center justify-center text-slate-700 dark:text-slate-200">
          <div className="h-36 w-36">
            <ResponsiveContainer>
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={gaugeData}
                startAngle={90}
                endAngle={450}
                style={{ backgroundColor: 'transparent' }}
              >
                <Tooltip
                  formatter={(value: number) => `${value}%`}
                  contentStyle={chartTooltipStyle}
                  labelStyle={chartTooltipLabelStyle}
                  itemStyle={chartTooltipItemStyle}
                />
                <RadialBar dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">
            7 günlük ortalama
          </p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {avgEfficiency.toFixed(2)} soru/dk
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Hedef: {targetEfficiency.toFixed(2)}
          </p>
        </div>
        <div className="space-y-3 text-slate-600 dark:text-slate-300">
          <div className="chart-stat">
            <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-300">
              En verimli gün
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatter(bestDay.date)} • {bestDay.efficiency.toFixed(2)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Pomodoro odak ve kolay sorularla tempoyu koru
            </p>
          </div>
          <div className="chart-stat">
            <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-300">
              En düşük gün
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatter(worstDay.date)} •{" "}
              {worstDay.efficiency === Infinity
                ? "0.00"
                : worstDay.efficiency.toFixed(2)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Çalışma türünü değiştir veya kısa tekrar blokları ekle
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
            {avgEfficiency >= targetEfficiency
              ? "Harika! Hedef verimliliği aştın, bu tempoyu koru."
              : "Verimliliği artırmak için soru seçimini kolaydan zora sırala ve süre tut."}
          </div>
        </div>
      </div>
    </div>
  );
}

