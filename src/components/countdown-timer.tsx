"use client";

import { useCountdown } from "@/hooks/use-countdown";
import { Timer, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  target: string;
}

export function CountdownTimer({ target }: CountdownTimerProps) {
  const { days, hours, minutes, seconds } = useCountdown(target);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const timeParts = [
    { label: "Gün", value: days, icon: "📅" },
    { label: "Saat", value: hours, icon: "⏰" },
    { label: "Dakika", value: minutes, icon: "⏱️" },
    { label: "Saniye", value: seconds, icon: "⚡" },
  ];

  if (!isMounted) {
    return (
      <div className="rounded-lg bg-slate-900/80 p-4 text-center shadow-lg backdrop-blur-sm">
        <p className="font-mono text-sm uppercase text-red-400">Yükleniyor...</p>
      </div>
    );
  }

  // Gerginlik seviyesi hesapla (son 30 gün çok kritik)
  const isUrgent = days <= 30;
  const isCritical = days <= 7;

  return (
    <div className="relative">
      {/* Uyarı Bandı */}
      {isUrgent && (
        <div className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-red-950/60 border border-red-600/40 py-2 px-4 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-red-400 animate-bounce" />
          <span className="text-sm font-bold uppercase tracking-wider text-red-300">
            {isCritical ? "⚠️ KRİTİK SÜRE! SON GÜNLER! ⚠️" : "🔥 YAKLAŞIYOR! DİKKAT! 🔥"}
          </span>
          <AlertTriangle className="h-4 w-4 text-red-400 animate-bounce" />
        </div>
      )}

      {/* Ana Geri Sayım Kartı - Kalp Atışı Efektli */}
      <div
        className={cn(
          "animate-heartbeat animate-glow-pulse overflow-hidden rounded-2xl border-2 p-6 text-center backdrop-blur-xl transition-all duration-300",
          "animate-border-pulse",
          isCritical 
            ? "border-red-600/60 bg-gradient-to-br from-red-950/90 via-slate-950/95 to-red-900/80" 
            : "border-red-500/40 bg-gradient-to-br from-slate-950/90 via-slate-900/95 to-red-950/70"
        )}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <Timer className={cn(
            "h-6 w-6 transition-all",
            isCritical ? "text-red-400 animate-spin" : "text-red-400 animate-pulse"
          )} />
          <h3 className={cn(
            "font-bold uppercase tracking-widest transition-all",
            isCritical 
              ? "text-xl text-red-200 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
              : "text-lg text-red-300 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
          )}>
            ⏳ YKS SINAVI YAKLAŞIYOR ⏳
          </h3>
          <Timer className={cn(
            "h-6 w-6 transition-all",
            isCritical ? "text-red-400 animate-spin" : "text-red-400 animate-pulse"
          )} />
        </div>

        {/* Zaman Kutuları */}
        <div className="grid grid-cols-4 gap-3 font-mono">
          {timeParts.map((part) => (
            <div
              key={part.label}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl p-4 transition-all duration-300",
                "border-2 backdrop-blur-sm",
                isCritical
                  ? "border-red-600/50 bg-red-950/60 hover:bg-red-900/70 hover:scale-105"
                  : "border-red-700/30 bg-red-950/40 hover:bg-red-950/60 hover:scale-105"
              )}
            >
              {/* İkon Badge */}
              <div className="absolute -top-3 bg-slate-900 px-2 py-0.5 rounded-full border border-red-600/40">
                <span className="text-lg">{part.icon}</span>
              </div>

              {/* Sayı - Kalp Atışı ile Pulse */}
              <span className={cn(
                "animate-number-pulse tabular-nums font-extrabold tracking-tight transition-all",
                isCritical 
                  ? "text-5xl lg:text-6xl text-red-300 drop-shadow-[0_0_15px_rgba(239,68,68,1)]" 
                  : "text-4xl lg:text-5xl text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]"
              )}>
                {part.value.toString().padStart(2, "0")}
              </span>

              {/* Label */}
              <span className={cn(
                "mt-2 text-xs font-bold uppercase tracking-widest transition-all",
                isCritical ? "text-red-300/90" : "text-red-400/70"
              )}>
                {part.label}
              </span>

              {/* Pulse Ring Efekti */}
              <div className={cn(
                "absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity",
                "ring-2 ring-red-500/50 ring-offset-2 ring-offset-slate-950"
              )} />
            </div>
          ))}
        </div>

        {/* Alt Mesaj */}
        <div className="mt-4 pt-3 border-t border-red-800/30">
          <p className={cn(
            "text-sm font-semibold uppercase tracking-wide transition-all",
            isCritical 
              ? "text-red-300 animate-pulse" 
              : "text-red-400/80"
          )}>
            {isCritical 
              ? "💀 Her saniye değerli! Hazır mısın? 💀" 
              : isUrgent
              ? "🔥 Hızla yaklaşıyor! Hazırlığını tamamla! 🔥"
              : "⚡ Zamanın değerini bil! Şimdi çalış! ⚡"}
          </p>
        </div>
      </div>

      {/* Pulsing Glow Efekti (Dış Işık) */}
      <div className={cn(
        "absolute inset-0 -z-10 rounded-2xl blur-2xl opacity-40 transition-all duration-300",
        isCritical 
          ? "bg-red-600/40 animate-pulse" 
          : "bg-red-800/20"
      )} />
    </div>
  );
}

