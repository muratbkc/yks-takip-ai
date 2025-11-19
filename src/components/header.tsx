"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            YKS Takip AI
          </p>
          <h1 className="hidden text-2xl font-semibold text-slate-900 dark:text-white sm:block">
            TYT–AYT hazırlığını görünür kıl
          </h1>
          <h1 className="block text-xl font-semibold text-slate-900 dark:text-white sm:hidden">
            Hazırlığını Yönet
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <UserMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}

