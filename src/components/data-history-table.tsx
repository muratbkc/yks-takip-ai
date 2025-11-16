"use client";

import { useStudyStore } from "@/store/use-study-store";
import { useState, useMemo, Fragment, useCallback } from "react";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  X,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Timer,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  YAxis,
} from "recharts";
import { cn, formatMinutes } from "@/lib/utils";
import { sumBy } from "@/lib/math";
import { chartTooltipStyle } from "@/lib/chart-theme";
import type { LessonType, StudyEntry } from "@/types";

type SortDirection = "asc" | "desc";
type DateFilter = "all" | "today" | "week" | "month";
type StudyEntryWithTopic = StudyEntry & { displayTopic: string };

const TYT_DETAIL_LESSONS: LessonType[] = [
  "Türkçe",
  "Matematik",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Tarih",
  "Coğrafya",
  "Felsefe",
  "Din Kültürü",
];

const LESSON_SYNONYMS: Record<string, LessonType> = {
  "dkab": "Din Kültürü",
  "din kültürü ve ahlak bilgisi": "Din Kültürü",
  "din kültürü": "Din Kültürü",
  "felsefe grubu": "Felsefe",
};

const normalizeLessonName = (name: string): LessonType | string => {
  const key = name.trim().toLowerCase();
  return LESSON_SYNONYMS[key] ?? name;
};

const TOPIC_FALLBACKS: Partial<Record<LessonType, string[]>> = {
  Matematik: [
    "Fonksiyonlar",
    "Polinomlar",
    "Limit & Süreklilik",
    "Türev",
    "İntegral",
    "Olasılık",
  ],
  Geometri: ["Üçgenler", "Çember", "Analitik", "Katı Cisimler"],
  Türkçe: ["Paragraf", "Dil Bilgisi", "Anlatım Bozuklukları", "Sözcükte Anlam"],
  Fizik: ["Kuvvet & Hareket", "Elektrik", "Modern Fizik", "Dalga Mekaniği"],
  Kimya: ["Organik Kimya", "Kimyasal Denge", "Asit Baz", "Elektrokimya"],
  Biyoloji: ["Genetik", "Hücre", "Ekosistem", "Canlılarda Enerji"],
  Tarih: ["Osmanlı", "İnkılap Tarihi", "İlk Çağ", "Orta Çağ"],
  Coğrafya: ["İklim", "Harita Bilgisi", "Türkiye Coğrafyası", "Doğal Kaynaklar"],
  Felsefe: ["Bilgi Felsefesi", "Varlık Felsefesi", "Bilim Felsefesi"],
  "Din Kültürü": ["İslam Tarihi", "İnanç", "Ahlak"],
  "AYT Matematik": ["Türev", "İntegral", "Seriler", "Karmaşık Sayılar"],
  "AYT Fizik": ["Modern Fizik", "Elektrik", "Manyetizma", "Basit Harmonik Hareket"],
  "AYT Kimya": ["Organik Bileşikler", "Kimyasal Denge", "Çözeltiler"],
  "AYT Biyoloji": ["DNA & Genetik", "Sistemler", "Ekoloji"],
  "AYT Edebiyat": ["Şiir", "Roman", "Hikâye", "Tanzimat"],
  "AYT Tarih-1": ["İslamiyet Öncesi Türk", "Osmanlı", "Kurtuluş Savaşı"],
  "AYT Tarih-2": ["Yakınçağ", "Cumhuriyet", "Kültür ve Medeniyet"],
  "AYT Coğrafya-1": ["Fiziki Coğrafya", "Türkiye Coğrafyası", "Beşeri Coğrafya"],
  "AYT Coğrafya-2": ["Ekonomik Coğrafya", "Bölgeler", "Çevre"],
  "AYT Felsefe": ["Psikoloji", "Sosyoloji", "Mantık"],
  "AYT Din Kültürü": ["İnanç", "İbadet", "Ahlak"],
  "AYT Psikoloji": ["Davranış", "Öğrenme", "Kişilik"],
  "AYT Sosyoloji": ["Kültür", "Toplum", "Değişim"],
  "AYT Mantık": ["Klasik Mantık", "Sembolik Mantık"],
};

const hashString = (value: string) =>
  value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

const getFallbackTopic = (lesson: LessonType, seed: string) => {
  const pool = TOPIC_FALLBACKS[lesson];
  if (!pool || pool.length === 0) {
    return "Genel tekrar";
  }
  const index = Math.abs(hashString(seed)) % pool.length;
  return pool[index] ?? "Genel tekrar";
};

export function DataHistoryTable() {
  const { studyEntries, mockExams, topics } = useStudyStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [lessonFilter, setLessonFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [studySortField, setStudySortField] = useState<"date" | "minutes" | "questionCount" | "lesson">("date");
  const [studySortDir, setStudySortDir] = useState<SortDirection>("desc");
  const [examSortField, setExamSortField] = useState<"date" | "totalNet" | "title">("date");
  const [examSortDir, setExamSortDir] = useState<SortDirection>("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  const topicMap = useMemo(() => new Map(topics.map((topic) => [topic.lesson, topic])), [topics]);

  const getDisplayTopic = useCallback(
    (entry: StudyEntry) => {
      const normalized = entry.subTopic?.trim();
      if (normalized) return normalized;
      const topicInfo = topicMap.get(entry.lesson);
      if (topicInfo?.missingTopics?.length) {
        return topicInfo.missingTopics[0] as string;
      }
      return getFallbackTopic(entry.lesson, `${entry.id}-${entry.studyType}`);
    },
    [topicMap],
  );

  const studyEntriesWithTopic = useMemo<StudyEntryWithTopic[]>(
    () => studyEntries.map((entry) => ({ ...entry, displayTopic: getDisplayTopic(entry) })),
    [studyEntries, getDisplayTopic],
  );

  // Unique lessons for filter
  const uniqueLessons = useMemo(() => {
    const lessons = new Set(studyEntriesWithTopic.map(e => e.lesson));
    return Array.from(lessons).sort();
  }, [studyEntriesWithTopic]);

  // Unique study types for filter
  const uniqueStudyTypes = useMemo(() => {
    const types = new Set(studyEntriesWithTopic.map(e => e.studyType));
    return Array.from(types).sort();
  }, [studyEntriesWithTopic]);

  // Filter by date range
  const filterByDate = useCallback((dateString: string) => {
    if (dateFilter === "all") return true;
    const itemDate = new Date(dateString);
    const today = new Date();
    const intervalEnd = endOfDay(today);

    switch (dateFilter) {
      case "today":
        return isWithinInterval(itemDate, {
          start: startOfDay(today),
          end: intervalEnd,
        });
      case "week": {
        const start = subDays(startOfDay(today), 6);
        return isWithinInterval(itemDate, { start, end: intervalEnd });
      }
      case "month": {
        const start = subDays(startOfDay(today), 29);
        return isWithinInterval(itemDate, { start, end: intervalEnd });
      }
      default:
        return true;
    }
  }, [dateFilter]);

  // Günlük çalışma kayıtlarını filtrele ve sırala
  const filteredStudyEntries = useMemo(() => {
    const filtered = studyEntriesWithTopic.filter(
      (entry) =>
        (entry.lesson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.displayTopic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.subTopic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        filterByDate(entry.date) &&
        (lessonFilter === "all" || entry.lesson === lessonFilter) &&
        (typeFilter === "all" || entry.studyType === typeFilter)
    );

    return filtered.sort((a, b) => {
      const modifier = studySortDir === "asc" ? 1 : -1;
      if (studySortField === "date") {
        return modifier * a.date.localeCompare(b.date);
      } else if (studySortField === "minutes") {
        return modifier * (a.minutes - b.minutes);
      } else if (studySortField === "lesson") {
        return modifier * a.lesson.localeCompare(b.lesson);
      } else {
        return modifier * ((a.questionCount || 0) - (b.questionCount || 0));
      }
    });
  }, [studyEntriesWithTopic, searchTerm, studySortField, studySortDir, lessonFilter, typeFilter, filterByDate]);

  // Deneme sınavlarını filtrele ve sırala
  const filteredMockExams = useMemo(() => {
    const filtered = mockExams.filter(
      (exam) =>
        (exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.examType?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        filterByDate(exam.date)
    );

    return filtered.sort((a, b) => {
      const modifier = examSortDir === "asc" ? 1 : -1;
      if (examSortField === "date") {
        return modifier * a.date.localeCompare(b.date);
      } else if (examSortField === "title") {
        return modifier * a.title.localeCompare(b.title);
      } else {
        const aTotal = a.summary.reduce((sum, item) => sum + item.net, 0);
        const bTotal = b.summary.reduce((sum, item) => sum + item.net, 0);
        return modifier * (aTotal - bTotal);
      }
    });
  }, [mockExams, searchTerm, examSortField, examSortDir, filterByDate]);


  // Pagination
  const paginatedStudyEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudyEntries.slice(start, start + itemsPerPage);
  }, [filteredStudyEntries, currentPage, itemsPerPage]);

  const paginatedMockExams = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMockExams.slice(start, start + itemsPerPage);
  }, [filteredMockExams, currentPage, itemsPerPage]);

  const toggleStudySort = (field: typeof studySortField) => {
    if (studySortField === field) {
      setStudySortDir(studySortDir === "asc" ? "desc" : "asc");
    } else {
      setStudySortField(field);
      setStudySortDir("desc");
    }
    setCurrentPage(1);
  };

  const toggleExamSort = (field: typeof examSortField) => {
    if (examSortField === field) {
      setExamSortDir(examSortDir === "asc" ? "desc" : "asc");
    } else {
      setExamSortField(field);
      setExamSortDir("desc");
    }
    setCurrentPage(1);
  };


  type CsvRow = Record<string, string | number | null | undefined>;

  const exportToCSV = (data: CsvRow[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(","),
      ...data.map(row => headers.map(header => row[header]).join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const totalPages = (total: number) => Math.ceil(total / itemsPerPage);

  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("all");
    setLessonFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || dateFilter !== "all" || lessonFilter !== "all" || typeFilter !== "all";

  // İstatistikler
  const studyStats = useMemo(() => {
    const totalMinutes = filteredStudyEntries.reduce((sum, e) => sum + e.minutes, 0);
    const totalQuestions = filteredStudyEntries.reduce((sum, e) => sum + (e.questionCount || 0), 0);
    const avgMinutes = filteredStudyEntries.length > 0 ? Math.round(totalMinutes / filteredStudyEntries.length) : 0;
    return {
      totalMinutes,
      totalQuestions,
      avgMinutes,
      count: filteredStudyEntries.length,
    };
  }, [filteredStudyEntries]);

  const examStats = useMemo(() => {
    return { count: filteredMockExams.length };
  }, [filteredMockExams]);

  const timeSeriesData = useMemo(() => {
    if (!filteredStudyEntries.length) return [] as Array<{
      dateISO: string;
      label: string;
      minutes: number;
      questions: number;
      hours: number;
      efficiency: number;
    }>;

    const grouped = filteredStudyEntries.reduce<Record<string, { minutes: number; questions: number }>>((acc, entry) => {
      const key = format(new Date(entry.date), "yyyy-MM-dd");
      if (!acc[key]) {
        acc[key] = { minutes: 0, questions: 0 };
      }
      acc[key].minutes += entry.minutes;
      acc[key].questions += entry.questionCount || 0;
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([dateISO, value]) => ({
        dateISO,
        label: format(new Date(dateISO), "dd MMM", { locale: tr }),
        minutes: value.minutes,
        questions: value.questions,
        hours: Number((value.minutes / 60).toFixed(1)),
        efficiency: value.minutes ? Number((value.questions / value.minutes).toFixed(2)) : 0,
      }));
  }, [filteredStudyEntries]);

  const lessonBreakdown = useMemo(() => {
    if (!filteredStudyEntries.length) return [] as Array<{
      lesson: string;
      minutes: number;
      questions: number;
      ratio: number;
    }>;

    const totals = new Map<string, { minutes: number; questions: number }>();
    filteredStudyEntries.forEach((entry) => {
      const current = totals.get(entry.lesson) || { minutes: 0, questions: 0 };
      totals.set(entry.lesson, {
        minutes: current.minutes + entry.minutes,
        questions: current.questions + (entry.questionCount || 0),
      });
    });

    const totalMinutes = sumBy(Array.from(totals.values()), (item) => item.minutes);

    return Array.from(totals.entries())
      .map(([lesson, value]) => ({
        lesson,
        minutes: value.minutes,
        questions: value.questions,
        ratio: totalMinutes ? Math.round((value.minutes / totalMinutes) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [filteredStudyEntries]);

  const trendStats = useMemo(() => {
    if (!timeSeriesData.length) {
      return {
        currentMinutes: 0,
        currentQuestions: 0,
        minutesDelta: 0,
        questionsDelta: 0,
        minutesDeltaPct: 0,
        questionsDeltaPct: 0,
        bestDay: null as (typeof timeSeriesData[0]) | null,
        peakDay: null as (typeof timeSeriesData[0]) | null,
      };
    }

    const last7 = timeSeriesData.slice(-7);
    const prev7 = timeSeriesData.slice(-14, -7);

    const currentMinutes = sumBy(last7, (day) => day.minutes);
    const previousMinutes = sumBy(prev7, (day) => day.minutes);
    const currentQuestions = sumBy(last7, (day) => day.questions);
    const previousQuestions = sumBy(prev7, (day) => day.questions);

    const bestDay = last7.length
      ? last7.reduce((best, day) => (day.minutes > best.minutes ? day : best), last7[0]!)
      : null;
    const peakDay = timeSeriesData.length
      ? timeSeriesData.reduce((best, day) => (day.minutes > best.minutes ? day : best), timeSeriesData[0]!)
      : null;

    return {
      currentMinutes,
      currentQuestions,
      minutesDelta: currentMinutes - previousMinutes,
      questionsDelta: currentQuestions - previousQuestions,
      minutesDeltaPct: previousMinutes ? ((currentMinutes - previousMinutes) / previousMinutes) * 100 : 0,
      questionsDeltaPct: previousQuestions ? ((currentQuestions - previousQuestions) / previousQuestions) * 100 : 0,
      bestDay,
      peakDay,
    };
  }, [timeSeriesData]);

  const examHighlights = useMemo(() => {
    if (!filteredMockExams.length) {
      return {
        latest: null,
        latestNet: 0,
        previousNet: 0,
        delta: 0,
        bestExam: null,
        bestNet: 0,
        avgDuration: 0,
        trend: [] as Array<{ label: string; net: number }>,
        typeStats: { TYT: 0, AYT: 0 },
      };
    }

    const sortedByDate = [...filteredMockExams].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const latest = sortedByDate[0];
    const previous = sortedByDate[1];
    const latestNetRaw = latest.summary.reduce((sum, item) => sum + item.net, 0);
    const previousNetRaw = previous ? previous.summary.reduce((sum, item) => sum + item.net, 0) : 0;

    const best = filteredMockExams.reduce(
      (acc, exam) => {
        const net = exam.summary.reduce((sum, item) => sum + item.net, 0);
        if (net > acc.net) {
          return { exam, net };
        }
        return acc;
      },
      { exam: latest, net: latestNetRaw },
    );

    const avgDuration = Math.round(
      sumBy(filteredMockExams, (exam) => exam.duration || 0) / filteredMockExams.length,
    );

    const trend = sortedByDate
      .slice(0, 6)
      .map((exam) => ({
        label: format(new Date(exam.date), "dd MMM", { locale: tr }),
        net: Number(exam.summary.reduce((sum, item) => sum + item.net, 0).toFixed(1)),
      }))
      .reverse();

    const typeStats = {
      TYT: filteredMockExams.filter((exam) => exam.examType === "TYT").length,
      AYT: filteredMockExams.filter((exam) => exam.examType === "AYT").length,
    };

    return {
      latest,
      latestNet: Number(latestNetRaw.toFixed(1)),
      previousNet: Number(previousNetRaw.toFixed(1)),
      delta: Number((latestNetRaw - previousNetRaw).toFixed(1)),
      bestExam: best.exam,
      bestNet: Number(best.net.toFixed(1)),
      avgDuration,
      trend,
      typeStats,
    };
  }, [filteredMockExams]);

  const studyInsightCards = useMemo(() => {
    const topLesson = lessonBreakdown[0];
    return [
      {
        id: "minutes",
        label: "Son 7 Gün Süresi",
        value: trendStats.currentMinutes ? formatMinutes(trendStats.currentMinutes) : "0 dk",
        deltaPct: trendStats.minutesDeltaPct,
        helper: "Önceki 7 güne göre",
        Icon: Timer,
      },
      {
        id: "questions",
        label: "Son 7 Gün Soru",
        value: `${trendStats.currentQuestions || 0} soru`,
        deltaPct: trendStats.questionsDeltaPct,
        helper: "Önceki 7 güne göre",
        Icon: Sparkles,
      },
      {
        id: "top-lesson",
        label: "En Yoğun Ders",
        value: topLesson ? topLesson.lesson : "Kayıt yok",
        helper: topLesson
          ? `${formatMinutes(topLesson.minutes)} • ${topLesson.ratio}%`
          : "Filtreyi genişletin",
        Icon: BookOpen,
      },
    ];
  }, [lessonBreakdown, trendStats]);

  return (
    <div className="glass col-span-1 rounded-3xl p-6 lg:col-span-3">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Veri Geçmişi
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Tüm çalışma verilerinizi görüntüleyin ve analiz edin
            </p>
          </div>
        </div>

        {/* Arama ve Filtreler */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              showFilters
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            )}
          >
            <Filter className="h-4 w-4" />
            Filtreler
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-xs text-white">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filtre Paneli */}
      {showFilters && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Filtreler</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                <X className="h-4 w-4" />
                Temizle
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Tarih Filtresi */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tarih Aralığı
              </label>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value as DateFilter);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="all">Tümü</option>
                <option value="today">Bugün</option>
                <option value="week">Son 7 Gün</option>
                <option value="month">Son 30 Gün</option>
              </select>
            </div>

            {/* Ders Filtresi */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Ders
              </label>
              <select
                value={lessonFilter}
                onChange={(e) => {
                  setLessonFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="all">Tüm Dersler</option>
                {uniqueLessons.map((lesson) => (
                  <option key={lesson} value={lesson}>
                    {lesson}
                  </option>
                ))}
              </select>
            </div>

            {/* Çalışma Türü Filtresi */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Çalışma Türü
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="all">Tüm Türler</option>
                {uniqueStudyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Çalışma içgörüleri ve grafik */}
      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="grid gap-3 sm:grid-cols-2">
            {studyInsightCards.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl border border-slate-100 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {card.label}
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2 text-white">
                    <card.Icon className="h-4 w-4" />
                  </div>
                </div>
                {typeof card.deltaPct === "number" ? (
                  <div className="mt-3 flex items-center gap-1 text-xs">
                    {card.deltaPct >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-rose-500" />
                    )}
                    <span
                      className={cn(
                        "font-semibold",
                        card.deltaPct >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400",
                      )}
                    >
                      {card.deltaPct >= 0 ? "+" : ""}
                      {Math.round(card.deltaPct)}%
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{card.helper}</span>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{card.helper}</p>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500 dark:text-slate-400">En çok çalışılan dersler</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Aktif filtrelere göre</p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {lessonBreakdown.length} ders
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {lessonBreakdown.length ? (
                lessonBreakdown.slice(0, 4).map((lesson) => (
                  <div key={lesson.lesson}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-900 dark:text-white">{lesson.lesson}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {formatMinutes(lesson.minutes)}
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${lesson.ratio}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Görüntülenecek ders bulunmuyor.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-900/50 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Çalışma Akışı</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Zaman Serisi</p>
            </div>
            {trendStats.bestDay && (
              <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                <div>
                  <p className="text-xs uppercase text-slate-500 dark:text-slate-400">En üretken gün</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {trendStats.bestDay.label} • {formatMinutes(trendStats.bestDay.minutes)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {timeSeriesData.length ? (
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="minutesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="questionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                  <XAxis dataKey="label" stroke="var(--chart-axis)" tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="minutes"
                    stroke="var(--chart-axis)"
                    tickFormatter={(value) => `${value} dk`}
                    width={60}
                  />
                  <YAxis
                    yAxisId="questions"
                    orientation="right"
                    stroke="var(--chart-axis-muted)"
                    tickFormatter={(value) => `${value} s`}
                    width={50}
                  />
                  <RechartsTooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value: number | string, name: string | number) => {
                      const numeric = typeof value === "number" ? value : Number(value);
                      return name === "minutes"
                        ? [`${numeric} dk`, "Süre"]
                        : [`${numeric} soru`, "Soru"];
                    }}
                    labelFormatter={(value) => `Tarih: ${value}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    name="Süre (dk)"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#minutesGradient)"
                    yAxisId="minutes"
                  />
                  <Area
                    type="monotone"
                    dataKey="questions"
                    name="Soru"
                    stroke="#f97316"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#questionsGradient)"
                    yAxisId="questions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Grafikte gösterecek kayıt bulunamadı.
            </div>
          )}
        </div>
      </div>

      {/* Deneme performansı kartları */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Son Deneme</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {examHighlights.latest?.title || "Deneme kaydı yok"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {examHighlights.latest
                  ? format(new Date(examHighlights.latest.date), "dd MMM yyyy", { locale: tr })
                  : "Hazır olduğunuzda ilk denemenizi ekleyin"}
              </p>
            </div>
            {examHighlights.latest && (
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  examHighlights.delta >= 0
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
                )}
              >
                {examHighlights.delta >= 0 ? "+" : ""}
                {examHighlights.delta} net
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/40">
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Toplam Net</p>
              <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                {examHighlights.latestNet.toFixed(1)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/40">
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Önceki Net</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {examHighlights.previousNet.toFixed(1)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/40">
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Süre</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {examHighlights.latest?.duration || examHighlights.avgDuration} dk
              </p>
            </div>
          </div>

          {examHighlights.trend.length > 1 ? (
            <div className="mt-6 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={examHighlights.trend} margin={{ left: 0, right: 10, top: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                  <XAxis dataKey="label" stroke="var(--chart-axis)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--chart-axis)" tickLine={false} width={40} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value: number | string) => {
                      const numeric = typeof value === "number" ? value : Number(value);
                      return [`${numeric.toFixed(1)} net`, "Toplam Net"];
                    }}
                    labelFormatter={(value) => `Tarih: ${value}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1, stroke: "#fff" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Trend grafiğini görmek için en az iki deneme ekleyin.
            </p>
          )}


        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Performans Özeti</p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {examHighlights.bestExam?.title || "En iyi deneme bekleniyor"}
              </h3>
              {examHighlights.bestExam && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {format(new Date(examHighlights.bestExam.date), "dd MMM yyyy", { locale: tr })} • {examHighlights.bestExam.examType}
                </p>
              )}
            </div>
            <div className="rounded-full bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-200">
              <Trophy className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-100 p-4 text-center dark:border-slate-800">
            <p className="text-xs uppercase text-slate-500 dark:text-slate-400">En yüksek net</p>
            <p className="text-3xl font-bold text-amber-500 dark:text-amber-300">
              {examHighlights.bestNet.toFixed(1)}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-900/40">
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Ortalama Süre</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {examHighlights.avgDuration} dk
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-900/40">
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">TYT / AYT</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {examHighlights.typeStats.TYT} / {examHighlights.typeStats.AYT}
              </p>
            </div>
          </div>

          {trendStats.peakDay && (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 text-sm dark:border-slate-800">
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Filtre dönemi</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                En yoğun gün: {trendStats.peakDay.label} • {formatMinutes(trendStats.peakDay.minutes)}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Grafikler ve deneme analizleri bu aralıktaki kayıtlara göre hesaplanır.
              </p>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="study" className="w-full" onValueChange={() => setCurrentPage(1)}>
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="study">
            <Calendar className="mr-2 h-4 w-4" />
            Günlük Çalışmalar ({filteredStudyEntries.length})
          </TabsTrigger>
          <TabsTrigger value="exams">
            <BookOpen className="mr-2 h-4 w-4" />
            Denemeler ({filteredMockExams.length})
          </TabsTrigger>
        </TabsList>

        {/* Günlük Çalışmalar Tablosu */}
        <TabsContent value="study">
          {/* İstatistik Özeti */}
          <div className="mb-4 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50 md:grid-cols-4">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Toplam Kayıt</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{studyStats.count}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Toplam Süre</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {Math.floor(studyStats.totalMinutes / 60)}sa {studyStats.totalMinutes % 60}dk
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Toplam Soru</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{studyStats.totalQuestions}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Ortalama Süre</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{studyStats.avgMinutes} dk</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                  <TableHead
                    className="cursor-pointer font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => toggleStudySort("date")}
                  >
                    <div className="flex items-center gap-2">
                      Tarih
                      {studySortField === "date" && (
                        studySortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => toggleStudySort("lesson")}
                  >
                    <div className="flex items-center gap-2">
                      Ders
                      {studySortField === "lesson" && (
                        studySortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">Çalışma Türü</TableHead>
                  <TableHead
                    className="cursor-pointer font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => toggleStudySort("minutes")}
                  >
                    <div className="flex items-center gap-2">
                      Süre (dk)
                      {studySortField === "minutes" && (
                        studySortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => toggleStudySort("questionCount")}
                  >
                    <div className="flex items-center gap-2">
                      Soru
                      {studySortField === "questionCount" && (
                        studySortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-center">Detay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudyEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                      {hasActiveFilters ? "Filtrelere uygun kayıt bulunamadı" : "Henüz çalışma kaydı yok"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudyEntries.map((entry) => {
                    const isExpanded = expandedRow === entry.id;
                    
                    return (
                      <Fragment key={entry.id}>
                        <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <TableCell className="font-medium">
                            {format(new Date(entry.date), "dd MMM yyyy", { locale: tr })}
                          </TableCell>
                          <TableCell className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {entry.lesson}
                          </TableCell>
                          
                          <TableCell>
                            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {entry.studyType}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold text-purple-600 dark:text-purple-400">
                            {entry.minutes}
                          </TableCell>
                          <TableCell className="font-semibold text-amber-600 dark:text-amber-400">
                            {entry.questionCount || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : entry.id)}
                              className="rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${entry.id}-details`}>
                            <TableCell colSpan={7} className="bg-slate-50 dark:bg-slate-900/30">
                              <div className="p-5 space-y-4">
                                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Çalışma Özeti</p>
                                  <dl className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 dark:text-slate-200 md:grid-cols-2">
                                    <div className="flex items-center justify-between">
                                      <dt>Ders</dt>
                                      <dd className="font-semibold text-indigo-600 dark:text-indigo-400">{entry.lesson}</dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <dt>Konu</dt>
                                      <dd className="font-medium">{entry.displayTopic}</dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <dt>Çalışma Türü</dt>
                                      <dd className="rounded-full bg-blue-100 px-2 py-0.5 text-[12px] font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                                        {entry.studyType}
                                      </dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <dt>Zaman Dilimi</dt>
                                      <dd className="font-medium capitalize">{entry.timeSlot || "Belirtilmemiş"}</dd>
                                    </div>
                                  </dl>
                                </div>

                                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/20 dark:text-slate-200">
                                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Notlar</p>
                                  <p className="mt-2 leading-relaxed">
                                    {entry.notes && entry.notes.trim() !== "" ? entry.notes : (
                                      <span className="italic text-slate-400 dark:text-slate-500">Not eklenmedi</span>
                                    )}
                                  </p>
                                </div>

                                {(entry.net?.tyt || entry.net?.ayt) && (
                                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                                    <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Net Bilgisi</p>
                                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-200">
                                      {entry.net?.tyt && (
                                        <span className="font-medium text-purple-600 dark:text-purple-400">TYT: {entry.net.tyt}</span>
                                      )}
                                      {entry.net?.ayt && (
                                        <span className="font-medium text-green-600 dark:text-green-400">AYT: {entry.net.ayt}</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredStudyEntries.length > itemsPerPage && (
            <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Sayfa başına:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Sayfa {currentPage} / {totalPages(filteredStudyEntries.length)}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages(filteredStudyEntries.length), currentPage + 1))}
                  disabled={currentPage === totalPages(filteredStudyEntries.length)}
                  className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => exportToCSV(
                  filteredStudyEntries.map(e => ({
                    Tarih: format(new Date(e.date), "dd/MM/yyyy"),
                    Ders: e.lesson,
                    "Çalışma Türü": e.studyType,
                    "Süre (dk)": e.minutes,
                    Soru: e.questionCount || 0,
                    "Zaman Dilimi": e.timeSlot || "-"
                  })),
                  "calisma-kayitlari.csv"
                )}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                CSV İndir
              </button>
            </div>
          )}
        </TabsContent>

        {/* Denemeler Tablosu */}
        <TabsContent value="exams">
          {/* İstatistik Özeti */}
          <div className="mb-4 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Toplam Deneme</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{examStats.count}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">TYT / AYT</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {filteredMockExams.filter(e => e.examType === "TYT").length} / {filteredMockExams.filter(e => e.examType === "AYT").length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                  <TableHead
                    className="cursor-pointer font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => toggleExamSort("date")}
                  >
                    <div className="flex items-center gap-2">
                      Tarih
                      {examSortField === "date" && (
                        examSortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => toggleExamSort("title")}
                  >
                    <div className="flex items-center gap-2">
                      Başlık
                      {examSortField === "title" && (
                        examSortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">Tür</TableHead>
                  <TableHead className="font-semibold">Süre</TableHead>
                  <TableHead
                    className="cursor-pointer font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => toggleExamSort("totalNet")}
                  >
                    <div className="flex items-center gap-2">
                      Toplam Net
                      {examSortField === "totalNet" && (
                        examSortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">Zorluk</TableHead>
                  <TableHead className="font-semibold text-center">Detay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMockExams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      {hasActiveFilters ? "Filtrelere uygun deneme bulunamadı" : "Henüz deneme kaydı yok"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMockExams.map((exam) => {
                    const totalNet = exam.summary.reduce((sum, item) => sum + item.net, 0);
                    const isExpanded = expandedRow === exam.id;
                    
                    return (
                      <Fragment key={exam.id}>
                        <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <TableCell className="font-medium">
                            {format(new Date(exam.date), "dd MMM yyyy", { locale: tr })}
                          </TableCell>
                          <TableCell className="font-semibold max-w-xs">
                            {exam.title}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                                exam.examType === "TYT"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              )}
                            >
                              {exam.examType || "Ders"}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            {exam.duration} dk
                          </TableCell>
                          <TableCell className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                            {totalNet.toFixed(1)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                                exam.difficulty === "kolay"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : exam.difficulty === "orta"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                              )}
                            >
                              {exam.difficulty}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : exam.id)}
                              className="rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${exam.id}-details`}>
                            <TableCell colSpan={6} className="bg-slate-50 dark:bg-slate-900/30">
                              <div className="p-4 space-y-3">
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                  Ders Bazlı Netler
                                </h4>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                                  {(function(){
                                    const isTyt = exam.examType === "TYT";
                                    const normalized = isTyt
                                      ? TYT_DETAIL_LESSONS.map((lesson) => {
                                          const found = exam.summary.find((s) => normalizeLessonName(s.lesson) === lesson);
                                          return found || { lesson, correct: 0, wrong: 0, empty: 0, net: 0 };
                                        })
                                      : exam.summary;
                                    return normalized;
                                  })().map((item, idx) => (
                                    <div key={idx} className="rounded-lg bg-white p-3 dark:bg-slate-800">
                                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                        {item.lesson}
                                      </p>
                                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                        {item.net.toFixed(1)}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        D: {item.correct} / Y: {item.wrong} / B: {item.empty}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredMockExams.length > itemsPerPage && (
            <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Sayfa başına:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Sayfa {currentPage} / {totalPages(filteredMockExams.length)}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages(filteredMockExams.length), currentPage + 1))}
                  disabled={currentPage === totalPages(filteredMockExams.length)}
                  className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => exportToCSV(
                  filteredMockExams.map(e => ({
                    Tarih: format(new Date(e.date), "dd/MM/yyyy"),
                    Başlık: e.title,
                    Tür: e.examType,
                    Süre: e.duration,
                    "Toplam Net": e.summary.reduce((sum, item) => sum + item.net, 0).toFixed(1),
                    Zorluk: e.difficulty
                  })),
                  "deneme-kayitlari.csv"
                )}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                CSV İndir
              </button>
            </div>
          )}
        </TabsContent>

      </Tabs>

      {/* Genel İstatistikler */}
      <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white md:grid-cols-2">
        <div className="text-center">
          <p className="text-sm opacity-90">Toplam Çalışma Kaydı</p>
          <p className="text-3xl font-bold">{studyEntries.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm opacity-90">Toplam Deneme</p>
          <p className="text-3xl font-bold">{mockExams.length}</p>
        </div>
      </div>
    </div>
  );
}
