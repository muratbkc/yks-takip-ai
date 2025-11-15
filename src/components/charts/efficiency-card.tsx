"use client";

import { getEfficiencyData } from "@/lib/analytics";
import type { StudyEntry } from "@/types";
import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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
    { name: "Kalan", value: Math.max(0, 100 - Math.min(percent, 100)), fill: "#e2e8f0" },
    { name: "Verim", value: Math.min(percent, 100), fill: "#10b981" },
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
    <div className="glass rounded-3xl p-4">
      <div className="flex items-center justify-between pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Verimlilik
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Soru / dakika
          </h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Bugün</p>
          <p className="text-sm font-semibold text-emerald-500">
            {latest.toFixed(2)} soru/dk
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="h-36 w-36">
            <ResponsiveContainer>
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={gaugeData}
                startAngle={90}
                endAngle={-270}
              >
                <Tooltip formatter={(value: number) => `${value}%`} />
                <RadialBar dataKey="value" cornerRadius={20} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
            7 günlük ortalama
          </p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {avgEfficiency.toFixed(2)} soru/dk
          </p>
          <p className="text-xs text-slate-500">
            Hedef: {targetEfficiency.toFixed(2)}
          </p>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              En verimli gün
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatter(bestDay.date)} • {bestDay.efficiency.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500">
              Pomodoro odak ve kolay sorularla tempoyu koru
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              En düşük gün
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatter(worstDay.date)} •{" "}
              {worstDay.efficiency === Infinity
                ? "0.00"
                : worstDay.efficiency.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500">
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

