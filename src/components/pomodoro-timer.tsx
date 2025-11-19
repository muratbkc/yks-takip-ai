"use client";

import { usePomodoro } from "@/hooks/use-pomodoro";
import { useStudyStore } from "@/store/use-study-store";
import { generateSafeId } from "@/lib/safe-random-id";
import { Clock, PauseCircle, PlayCircle, RotateCcw } from "lucide-react";

export function PomodoroTimer() {
  const { minutes, seconds, isRunning, isBreak, toggle, reset } =
    usePomodoro();
  const addStudyEntry = useStudyStore((state) => state.addStudyEntry);

  const handleReset = () => {
    if (!isRunning && !isBreak) {
      // Otomatik süre kaydı
      addStudyEntry({
        id: generateSafeId(),
        date: new Date().toISOString().split("T")[0],
        lesson: "Matematik",
        minutes: 25,
        questionCount: 0,
        studyType: "konu-calismasi",
        timeSlot: "öğlen",
      });
    }
    reset();
  };

  return (
    <div className="glass flex flex-col rounded-3xl p-4">
      <div className="flex items-center gap-2 pb-3">
        <Clock className="h-5 w-5 text-purple-500" />
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Çalışma Zamanlayıcısı
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Pomodoro
          </h3>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-baseline gap-2 text-4xl font-bold text-slate-900 dark:text-white">
          {minutes}:{seconds}
        </div>
        <p className="text-sm text-slate-500">
          {isBreak ? "Kısa mola zamanı" : "Odak modu"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-2 text-white shadow-lg"
          >
            {isRunning ? (
              <>
                <PauseCircle className="h-5 w-5" />
                Durdur
              </>
            ) : (
              <>
                <PlayCircle className="h-5 w-5" />
                Başlat
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <RotateCcw className="h-5 w-5" /> Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
}

