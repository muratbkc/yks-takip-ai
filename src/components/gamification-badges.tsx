"use client";

import { Trophy, Zap, Flame, Medal } from "lucide-react";

const badges = [
  {
    id: "streak",
    title: "Çalışma Serisi",
    value: "12 gün",
    description: "Art arda veri girişi yaptın",
    icon: Flame,
    color: "from-orange-400 to-pink-500",
  },
  {
    id: "question",
    title: "1000 soru barajı",
    value: "1240 soru",
    description: "Bu hafta aşıldı",
    icon: Zap,
    color: "from-sky-400 to-indigo-500",
  },
  {
    id: "exam",
    title: "10 deneme",
    value: "10/10",
    description: "Hedef tamamlandı",
    icon: Trophy,
    color: "from-amber-400 to-yellow-500",
  },
  {
    id: "topic",
    title: "AYT Fizik %100",
    value: "Tamamlandı",
    description: "Konu takibinde işaretli",
    icon: Medal,
    color: "from-emerald-400 to-teal-500",
  },
];

export function GamificationBadges() {
  return (
    <div className="glass rounded-3xl p-4">
      <div className="pb-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Rozetler
        </p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Gamification
        </h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="rounded-3xl border border-slate-100 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${badge.color} text-white`}
              >
                <badge.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {badge.title}
                </p>
                <p className="text-xs text-slate-500">{badge.description}</p>
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {badge.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

