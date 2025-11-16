"use client";

import { useStudyStore } from "@/store/use-study-store";
import { useState, useMemo, Fragment } from "react";
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
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
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortDirection = "asc" | "desc";
type DateFilter = "all" | "today" | "week" | "month";

export function DataHistoryTable() {
  const { studyEntries, mockExams } = useStudyStore();
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

  // Unique lessons for filter
  const uniqueLessons = useMemo(() => {
    const lessons = new Set(studyEntries.map(e => e.lesson));
    return Array.from(lessons).sort();
  }, [studyEntries]);

  // Unique study types for filter
  const uniqueStudyTypes = useMemo(() => {
    const types = new Set(studyEntries.map(e => e.studyType));
    return Array.from(types).sort();
  }, [studyEntries]);

  // Filter by date range
  const filterByDate = (dateString: string) => {
    if (dateFilter === "all") return true;
    const itemDate = new Date(dateString);
    const today = new Date();
    
    switch (dateFilter) {
      case "today":
        return format(itemDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
      case "week":
        return isAfter(itemDate, subDays(today, 7));
      case "month":
        return isAfter(itemDate, subDays(today, 30));
      default:
        return true;
    }
  };

  // Günlük çalışma kayıtlarını filtrele ve sırala
  const filteredStudyEntries = useMemo(() => {
    let filtered = studyEntries.filter(
      (entry) =>
        (entry.lesson.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  }, [studyEntries, searchTerm, studySortField, studySortDir, dateFilter, lessonFilter, typeFilter]);

  // Deneme sınavlarını filtrele ve sırala
  const filteredMockExams = useMemo(() => {
    let filtered = mockExams.filter(
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
  }, [mockExams, searchTerm, examSortField, examSortDir, dateFilter]);


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


  const exportToCSV = (data: any[], filename: string) => {
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
    return { totalMinutes, totalQuestions, avgMinutes, count: filteredStudyEntries.length };
  }, [filteredStudyEntries]);

  const examStats = useMemo(() => {
    const avgNet = filteredMockExams.length > 0
      ? filteredMockExams.reduce((sum, e) => sum + e.summary.reduce((s, i) => s + i.net, 0), 0) / filteredMockExams.length
      : 0;
    return { avgNet: avgNet.toFixed(1), count: filteredMockExams.length };
  }, [filteredMockExams]);

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
                  <TableHead className="font-semibold">Konu</TableHead>
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
                  <TableHead className="font-semibold">Verim</TableHead>
                  <TableHead className="font-semibold text-center">Detay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudyEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                      {hasActiveFilters ? "Filtrelere uygun kayıt bulunamadı" : "Henüz çalışma kaydı yok"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudyEntries.map((entry) => {
                    const isExpanded = expandedRow === entry.id;
                    const efficiency = entry.questionCount && entry.minutes > 0 
                      ? (entry.questionCount / entry.minutes).toFixed(2)
                      : "0.00";
                    
                    return (
                      <Fragment key={entry.id}>
                        <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <TableCell className="font-medium">
                            {format(new Date(entry.date), "dd MMM yyyy", { locale: tr })}
                          </TableCell>
                          <TableCell className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {entry.lesson}
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            {entry.subTopic || "-"}
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
                          <TableCell>
                            <span className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                              parseFloat(efficiency) >= 0.5
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : parseFloat(efficiency) >= 0.3
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            )}>
                              {efficiency} s/dk
                            </span>
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
                            <TableCell colSpan={8} className="bg-slate-50 dark:bg-slate-900/30">
                              <div className="p-4 space-y-3">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                      Zaman Dilimi
                                    </p>
                                    <p className="text-sm text-slate-900 dark:text-white">
                                      {entry.timeSlot || "Belirtilmemiş"}
                                    </p>
                                  </div>
                                  {entry.notes && (
                                    <div className="md:col-span-2">
                                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Notlar
                                      </p>
                                      <p className="text-sm text-slate-900 dark:text-white">
                                        {entry.notes}
                                      </p>
                                    </div>
                                  )}
                                  {(entry.net.tyt || entry.net.ayt) && (
                                    <div className="md:col-span-2">
                                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Net Bilgisi
                                      </p>
                                      <div className="flex gap-4">
                                        {entry.net.tyt && (
                                          <span className="text-sm">
                                            <span className="font-medium text-purple-600 dark:text-purple-400">TYT:</span>{" "}
                                            {entry.net.tyt}
                                          </span>
                                        )}
                                        {entry.net.ayt && (
                                          <span className="text-sm">
                                            <span className="font-medium text-green-600 dark:text-green-400">AYT:</span>{" "}
                                            {entry.net.ayt}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
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
                    Konu: e.subTopic || "-",
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
          <div className="mb-4 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50 md:grid-cols-3">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Toplam Deneme</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{examStats.count}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Ortalama Net</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{examStats.avgNet}</p>
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
                    <TableCell colSpan={7} className="text-center text-slate-500 py-8">
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
                            <TableCell colSpan={7} className="bg-slate-50 dark:bg-slate-900/30">
                              <div className="p-4 space-y-3">
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                  Ders Bazlı Netler
                                </h4>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                                  {exam.summary.map((item, idx) => (
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
                                {exam.weakTopics && exam.weakTopics.length > 0 && (
                                  <div>
                                    <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                                      Zayıf Konular
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {exam.weakTopics.map((topic, idx) => (
                                        <span
                                          key={idx}
                                          className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                                        >
                                          {topic}
                                        </span>
                                      ))}
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
