"use client";

import { getWeeklyTotals } from "@/lib/analytics";
import { useStudyStore } from "@/store/use-study-store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDown } from "lucide-react";
import { useMemo } from "react";

export function WeeklyReportCard() {
  const studyEntries = useStudyStore((state) => state.studyEntries);

  const weeklyTotals = useMemo(() => getWeeklyTotals(studyEntries), [studyEntries]);

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.text("YKS Takip AI - Haftalık Rapor", 14, 14);
    autoTable(doc, {
      head: [["Gün", "Dakika", "Soru"]],
      body: weeklyTotals.map((item) => [
        item.label,
        item.minutes.toString(),
        item.questions.toString(),
      ]),
    });
    doc.save("haftalik-rapor.pdf");
  };

  return (
    <div className="glass rounded-3xl p-4">
      <div className="flex items-center justify-between pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Haftalık PDF Raporu
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Süre, soru ve hedef özeti
          </h3>
        </div>
        <button
          onClick={downloadPdf}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <FileDown className="h-4 w-4" />
          PDF indir
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {weeklyTotals.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-100 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/40"
          >
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {item.minutes} dk
            </p>
            <p className="text-xs text-slate-500">{item.questions} soru</p>
          </div>
        ))}
      </div>
    </div>
  );
}

