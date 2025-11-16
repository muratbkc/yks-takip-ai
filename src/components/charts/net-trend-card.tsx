"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { LessonType, MockExam } from "@/types";
import { useMemo, useState } from "react";
import { getLessonOptionsForField } from "@/lib/lesson-catalog";
import { useStudyStore } from "@/store/use-study-store";
import { subDays } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  chartPrimaryTick,
  chartSecondaryTick,
  chartTooltipStyle,
  chartTooltipLabelStyle,
  chartTooltipItemStyle,
  getChartLegendStyle,
} from "@/lib/chart-theme";

interface NetTrendCardProps {
  exams: MockExam[];
}

type ExamTab = "TYT" | "AYT";
type ChartView = "overall" | "lesson" | "all-lessons";
type TimeFilter = "week" | "month" | "all";

const LESSON_COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#f97316",
  "#10b981",
  "#ec4899",
  "#14b8a6",
  "#f43f5e",
  "#a855f7",
  "#eab308",
  "#38bdf8",
  "#84cc16",
  "#fb7185",
];

export function NetTrendCard({ exams }: NetTrendCardProps) {
  const profile = useStudyStore((state) => state.profile);
  const [activeTab, setActiveTab] = useState<ExamTab>("TYT");
  const [view, setView] = useState<ChartView>("overall");
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const lessonOptions = useMemo(
    () => getLessonOptionsForField(profile?.studyField),
    [profile],
  );

  const tytLessonOptions = useMemo(
    () => lessonOptions.filter((lesson) => !lesson.toUpperCase().startsWith("AYT")),
    [lessonOptions],
  );

  const aytLessonOptions = useMemo(
    () => lessonOptions.filter((lesson) => lesson.toUpperCase().startsWith("AYT")),
    [lessonOptions],
  );

  const currentLessonOptions: LessonType[] =
    activeTab === "TYT" ? tytLessonOptions : aytLessonOptions;

  const normalizedLesson = useMemo(() => {
    if (currentLessonOptions.length === 0) return null;
    if (!selectedLesson) return currentLessonOptions[0];
    return currentLessonOptions.includes(selectedLesson)
      ? selectedLesson
      : currentLessonOptions[0];
  }, [currentLessonOptions, selectedLesson]);

  // Aktif sekmeye göre sınavları filtrele
  const filteredExams = useMemo(() => {
    const examsByType = exams.filter(exam => exam.examType === activeTab);
    
    // Zamana göre filtrele
    const today = new Date().toISOString().split('T')[0];
    
    if (timeFilter === "week") {
      const weekAgo = subDays(new Date(), 7).toISOString().split('T')[0];
      return examsByType.filter(e => e.date >= weekAgo && e.date <= today);
    }
    
    if (timeFilter === "month") {
      const monthAgo = subDays(new Date(), 30).toISOString().split('T')[0];
      return examsByType.filter(e => e.date >= monthAgo && e.date <= today);
    }
    
    return examsByType; // all
  }, [exams, activeTab, timeFilter]);

  // Grafik verilerini hazırla
  const lessonForChart = view === "lesson" ? normalizedLesson : null;

  const chartData = useMemo(() => {
    if (!filteredExams || filteredExams.length === 0) return [];

    if (view === "overall") {
      // Genel trend: Toplam net
      return filteredExams
        .map(exam => {
          const totalNet = exam.summary.reduce((acc, item) => acc + item.net, 0);
          return {
            date: exam.date,
            dateLabel: new Date(exam.date).toLocaleDateString("tr-TR", {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            net: parseFloat(totalNet.toFixed(1)),
            rawDate: exam.date,
          };
        })
        .sort((a, b) => a.rawDate.localeCompare(b.rawDate));
    }

    if (view === "all-lessons") {
      type LessonSeriesPoint = {
        date: string;
        dateLabel: string;
        rawDate: string;
        [lesson: string]: string | number;
      };

      // Tüm dersler: Her ders için ayrı çizgi
      return filteredExams
        .map((exam): LessonSeriesPoint => {
          const dataPoint: LessonSeriesPoint = {
            date: exam.date,
            dateLabel: new Date(exam.date).toLocaleDateString("tr-TR", {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            rawDate: exam.date,
          };

          // Her dersin netini ayrı bir alan olarak ekle
          exam.summary.forEach((item) => {
            dataPoint[item.lesson] = parseFloat(item.net.toFixed(1));
          });

          return dataPoint;
        })
        .sort((a, b) => a.rawDate.localeCompare(b.rawDate));
    }

    if (view === "lesson" && lessonForChart) {
      // Ders bazlı: Seçili dersin neti
      return filteredExams
        .map(exam => {
          const lessonResult = exam.summary.find(item => item.lesson === lessonForChart);
          return lessonResult ? {
            date: exam.date,
            dateLabel: new Date(exam.date).toLocaleDateString("tr-TR", {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            net: parseFloat(lessonResult.net.toFixed(1)),
            lesson: lessonResult.lesson,
            rawDate: exam.date,
          } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a!.rawDate.localeCompare(b!.rawDate));
    }

    return [];
  }, [filteredExams, view, lessonForChart]);

  // Tüm Dersler görünümü için dersleri topla
  const allLessons = useMemo(() => {
    if (view !== "all-lessons" || !filteredExams || filteredExams.length === 0) return [];
    
    const lessonSet = new Set<string>();
    filteredExams.forEach(exam => {
      exam.summary.forEach(item => lessonSet.add(item.lesson));
    });
    
    return Array.from(lessonSet).sort();
  }, [filteredExams, view]);

  // İstatistikler
  const stats = useMemo(() => {
    if (chartData.length === 0 || view === "all-lessons") {
      return { avg: 0, max: 0, min: 0, latest: 0 };
    }

    const nets = (chartData as Array<{ net: number }>).map((d) => d.net);

    return {
      avg: (nets.reduce((a, b) => a + b, 0) / nets.length).toFixed(1),
      max: Math.max(...nets).toFixed(1),
      min: Math.min(...nets).toFixed(1),
      latest: nets[nets.length - 1]?.toFixed(1) || "0",
    };
  }, [chartData, view]);

  const activeLineColor =
    activeTab === "TYT"
      ? "var(--chart-series-tyt)"
      : "var(--chart-series-ayt)";

  return (
    <div className="chart-card flex h-full flex-col gap-4">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-200">Deneme Net Gelişimi</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {activeTab}{" "}
              {view === 'overall'
                ? 'Genel Trend'
                : view === 'all-lessons'
                  ? 'Tüm Dersler'
                  : `• ${normalizedLesson || 'Ders'}`}
            </h3>
          </div>
          
          {/* Görünüm Seçimi */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => setView("overall")}
                className={`rounded-full px-2 py-1 text-xs font-medium transition ${
                  view === "overall"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Genel
              </button>
              <button
                onClick={() => setView("all-lessons")}
                className={`rounded-full px-2 py-1 text-xs font-medium transition ${
                  view === "all-lessons"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Tüm Dersler
              </button>
              <button
                onClick={() => setView("lesson")}
                className={`rounded-full px-2 py-1 text-xs font-medium transition ${
                  view === "lesson"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Tek Ders
              </button>
            </div>
            
            {view === 'lesson' && (
              currentLessonOptions.length > 0 ? (
                <select 
                  value={normalizedLesson || ''} 
                  onChange={e => setSelectedLesson(e.target.value as LessonType)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <option value="" disabled>Ders Seçin</option>
                  {currentLessonOptions.map(lesson => (
                    <option key={lesson} value={lesson}>
                      {lesson}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Bu sekme için ders bulunamadı
                </span>
              )
            )}
          </div>
        </div>

        {/* TYT/AYT ve Zaman Filtreleri */}
        <div className="flex items-center justify-between gap-2 border-t pt-3" style={{ borderColor: "var(--chart-border)" }}>
          {/* TYT / AYT Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("TYT")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === "TYT"
                  ? "bg-violet-500 text-white shadow-md dark:bg-violet-600"
                  : "bg-white/70 text-slate-600 shadow-inner hover:bg-white dark:bg-slate-900/60 dark:text-slate-300"
              }`}
            >
              TYT
            </button>
            <button
              onClick={() => setActiveTab("AYT")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === "AYT"
                  ? "bg-emerald-500 text-white shadow-md dark:bg-emerald-600"
                  : "bg-white/70 text-slate-600 shadow-inner hover:bg-white dark:bg-slate-900/60 dark:text-slate-300"
              }`}
            >
              AYT
            </button>
          </div>

          {/* Zaman Filtreleri */}
          <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
            <TabsList className="h-9">
              <TabsTrigger value="week" className="text-xs px-3">Haftalık</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3">Aylık</TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-3">Tüm Zamanlar</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* İstatistikler - Sadece Genel ve Tek Ders görünümlerinde göster */}
      {view !== "all-lessons" && (
        <div className="grid grid-cols-4 gap-2 text-slate-600 dark:text-slate-300">
          <div className="chart-stat text-center">
            <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-300">Son</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.latest}</p>
          </div>
          <div className="chart-stat text-center">
            <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-300">Ortalama</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.avg}</p>
          </div>
          <div className="chart-stat text-center">
            <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-300">En Yüksek</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.max}</p>
          </div>
          <div className="chart-stat text-center">
            <p className="text-xs uppercase tracking-wide text-slate-600/80 dark:text-slate-300">En Düşük</p>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{stats.min}</p>
          </div>
        </div>
      )}

      {/* Grafik */}
      <div
        className="chart-panel flex-grow p-4 text-slate-700 dark:text-slate-200"
        style={{ minHeight: "300px" }}
      >
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {activeTab} için henüz deneme verisi yok
            </p>
          </div>
        ) : view === "all-lessons" ? (
          // Tüm Dersler görünümü - Her ders için ayrı çizgi
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              style={{ backgroundColor: 'transparent' }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis 
                dataKey="dateLabel" 
                fontSize={11}
                tick={chartSecondaryTick}
                tickLine={false}
                axisLine={false}
                height={40}
              />
              <YAxis 
                fontSize={12}
                tick={chartPrimaryTick}
                tickLine={false}
                axisLine={false}
                width={45}
                domain={[0, 'auto']}
                label={{ 
                  value: 'Net', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'var(--chart-axis)', fontSize: 12, fontWeight: 600 }
                }}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                labelStyle={chartTooltipLabelStyle}
                itemStyle={chartTooltipItemStyle}
              />
              <Legend 
                wrapperStyle={getChartLegendStyle({ paddingTop: 10 })}
                iconType="line"
              />
              {allLessons.map((lesson, index) => (
                <Line
                  key={lesson}
                  type="monotone"
                  dataKey={lesson}
                  name={lesson}
                  stroke={LESSON_COLORS[index % LESSON_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: LESSON_COLORS[index % LESSON_COLORS.length] }}
                  activeDot={{ r: 6, fill: LESSON_COLORS[index % LESSON_COLORS.length], strokeWidth: 2 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          // Genel ve Tek Ders görünümü
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              style={{ backgroundColor: 'transparent' }}
            >
              <defs>
                <linearGradient id={`gradient-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={activeLineColor}
                    stopOpacity={0.32} 
                  />
                  <stop 
                    offset="95%" 
                    stopColor={activeLineColor}
                    stopOpacity={0.08} 
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis 
                dataKey="dateLabel" 
                fontSize={11}
                tick={chartSecondaryTick}
                tickLine={false}
                axisLine={false}
                height={40}
              />
              <YAxis 
                fontSize={12}
                tick={chartPrimaryTick}
                tickLine={false}
                axisLine={false}
                width={45}
                domain={[0, 'auto']}
                label={{ 
                  value: 'Net', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'var(--chart-axis)', fontSize: 12, fontWeight: 600 }
                }}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                labelStyle={chartTooltipLabelStyle}
                itemStyle={chartTooltipItemStyle}
              />
              <Legend 
                wrapperStyle={getChartLegendStyle({ paddingTop: 10 })}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                name={view === 'overall' ? `${activeTab} Net` : normalizedLesson || 'Net'} 
                stroke={activeLineColor}
                strokeWidth={3}
                dot={{ 
                  fill: activeLineColor, 
                  r: 6,
                  strokeWidth: 2,
                  stroke: '#fff'
                }}
                activeDot={{ 
                  r: 8,
                  strokeWidth: 3,
                  stroke: '#fff'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

