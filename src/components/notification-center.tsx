"use client";

import { useStudyStore } from "@/store/use-study-store";
import { BellRing, CheckCircle2 } from "lucide-react";

export function NotificationCenter() {
  const notifications = useStudyStore((state) => state.notifications);

  return (
    <div className="glass h-full rounded-3xl p-4">
      <div className="flex items-center gap-2 pb-3">
        <BellRing className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Akıllı Hatırlatmalar
        </h3>
      </div>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="rounded-2xl border border-slate-100 bg-white/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div className="flex items-center justify-between pb-1">
              <p className="font-medium text-slate-900 dark:text-white">
                {notification.title}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  notification.type === "uyarı"
                    ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-200"
                    : notification.type === "motivasyon"
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200"
                      : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200"
                }`}
              >
                {notification.type}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              {notification.description}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <CheckCircle2 className="h-3 w-3" />
              {new Date(notification.createdAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

