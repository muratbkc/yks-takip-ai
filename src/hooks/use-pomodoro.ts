"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PomodoroConfig {
  focusMinutes?: number;
  shortBreakMinutes?: number;
}

export const usePomodoro = ({
  focusMinutes = 25,
  shortBreakMinutes = 5,
}: PomodoroConfig = {}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(focusMinutes * 60);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [focusMinutes]);

  const toggle = () => {
    setIsRunning((prev) => !prev);
  };

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (!isBreak) {
            setIsBreak(true);
            return shortBreakMinutes * 60;
          }
          reset();
          return focusMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isBreak, shortBreakMinutes, focusMinutes, reset]);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return {
    isRunning,
    isBreak,
    minutes,
    seconds,
    toggle,
    reset,
    secondsLeft,
  };
};

