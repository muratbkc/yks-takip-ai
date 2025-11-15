"use client";

import { useStudyStore } from "@/store/use-study-store";
import { Progress } from "./ui/progress";

export function TopicTracker() {
  const topics = useStudyStore((state) => state.topics);

  return (
    <div className="glass rounded-3xl p-4">
      <div className="pb-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Konu Takip Sistemi
        </p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Tamamlanma oranları
        </h3>
      </div>
      <div className="space-y-4">
        {topics.map((topic) => {
          const completion = Math.round((topic.completed / topic.total) * 100);
          return (
            <div key={topic.id} className="space-y-2 rounded-2xl bg-white/70 p-3 dark:bg-slate-900/40">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {topic.lesson}
                  </p>
                  <p className="text-xs text-slate-500">
                    {topic.completed}/{topic.total} konu tamamlandı
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  %{completion}
                </span>
              </div>
              <Progress value={completion} />
              {!!topic.missingTopics.length && (
                <p className="text-xs text-slate-500">
                  Eksik: {topic.missingTopics.join(", ")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

