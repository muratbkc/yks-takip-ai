"use client";

import { Eye, EyeOff } from "lucide-react";
import { useStudyStore } from "@/store/use-study-store";

export function WidgetTogglePanel() {
  const widgets = useStudyStore((state) => state.widgets);
  const toggleWidget = useStudyStore((state) => state.toggleWidget);

  return (
    <div className="glass rounded-3xl p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        Widget Yönetimi
      </p>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        Kart görünürlüğü
      </h3>
      <div className="mt-4 space-y-3">
        {widgets.map((widget) => (
          <button
            type="button"
            key={widget.id}
            onClick={() => toggleWidget(widget.id)}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-2 text-left text-sm transition hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                {widget.title}
              </p>
              <p className="text-xs text-slate-500">{widget.description}</p>
            </div>
            {widget.visible ? (
              <Eye className="h-4 w-4 text-emerald-500" />
            ) : (
              <EyeOff className="h-4 w-4 text-slate-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

