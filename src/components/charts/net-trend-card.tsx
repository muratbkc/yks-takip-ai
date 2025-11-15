"use client";

import { getNetTrend } from "@/lib/analytics";
import { formatDate } from "@/lib/utils";
import type { MockExam } from "@/types";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface NetTrendCardProps {
  exams: MockExam[];
}

export function NetTrendCard({ exams }: NetTrendCardProps) {
  const trend = getNetTrend(exams);

  return (
    <div className="glass rounded-3xl p-4">
      <div className="pb-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Net Gelişim Grafiği
        </p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          TYT & AYT karşılaştırma
        </h3>
      </div>
      <div className="h-56">
        <ResponsiveContainer>
          <LineChart data={trend}>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatDate(value)}
            />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="tyt"
              name="TYT"
              stroke="#2563eb"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="ayt"
              name="AYT"
              stroke="#fb7185"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

