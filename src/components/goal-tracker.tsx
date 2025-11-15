"use client";

import { useStudyStore } from "@/store/use-study-store";
import type { Goal } from "@/types";
import { cn, formatMinutes } from "@/lib/utils";
import { Progress } from "./ui/progress";

const getProgress = (goal: Goal) => {
  const ratio = goal.current / goal.target;
  return Math.min(100, Math.round(ratio * 100));
};

export function GoalTracker() {
  const goals = useStudyStore((state) => state.goals);

  return (
    <div className="glass rounded-3xl p-4">
      <div className="pb-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Hedef Sistemi
        </p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Günlük & haftalık hedef ilerlemeleri
        </h3>
      </div>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-2 rounded-2xl bg-white/60 p-3 dark:bg-slate-900/50">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {goal.title}
                </p>
                <p className="text-xs text-slate-500">
                  Hedef:{" "}
                  {goal.unit === "dk"
                    ? formatMinutes(goal.target)
                    : `${goal.target} ${goal.unit}`}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  goal.period === "günlük"
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200",
                )}
              >
                {goal.period}
              </span>
            </div>
            <Progress value={getProgress(goal)} />
            <div className="flex justify-between text-xs text-slate-500">
              <span>
                Şu an:{" "}
                {goal.unit === "dk"
                  ? formatMinutes(goal.current)
                  : `${goal.current} ${goal.unit}`}
              </span>
              <span>%{getProgress(goal)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

