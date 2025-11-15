"use client";

import { useEffect, useState } from "react";

export const useCountdown = (targetDate: string) => {
  const target = new Date(targetDate).getTime();
  const [timeLeft, setTimeLeft] = useState(() => target - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(target - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const days = Math.max(Math.floor(timeLeft / (1000 * 60 * 60 * 24)), 0);
  const hours = Math.max(
    Math.floor((timeLeft / (1000 * 60 * 60)) % 24),
    0,
  );
  const minutes = Math.max(Math.floor((timeLeft / (1000 * 60)) % 60), 0);
  const seconds = Math.max(Math.floor((timeLeft / 1000) % 60), 0);

  return { days, hours, minutes, seconds };
};

