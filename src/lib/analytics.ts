import { addDays, format, startOfWeek, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import type { MockExam, StudyEntry } from "@/types";

export const getDailySeries = (entries: StudyEntry[], dayCount = 14) => {
  const grouped = new Map<string, { minutes: number; questions: number }>();
  entries.forEach((entry) => {
    const key = entry.date;
    const current = grouped.get(key) ?? { minutes: 0, questions: 0 };
    current.minutes += entry.minutes;
    current.questions += entry.questionCount;
    grouped.set(key, current);
  });

  const endDate = new Date();
  return Array.from({ length: dayCount }).map((_, i) => {
    const date = subDays(endDate, i);
    const dateKey = date.toISOString().split("T")[0];
    const data = grouped.get(dateKey) ?? { minutes: 0, questions: 0 };
    return {
      date: dateKey,
      ...data,
    };
  }).reverse();
};

export const getWeeklyTotals = (entries: StudyEntry[]) => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }).map((_, index) => {
    const day = addDays(start, index);
    const dayKey = day.toISOString().split("T")[0];
    const totals = entries
      .filter((entry) => entry.date === dayKey)
      .reduce(
        (acc, entry) => {
          acc.minutes += entry.minutes;
          acc.questions += entry.questionCount;
          return acc;
        },
        { minutes: 0, questions: 0 },
      );
    return {
      label: format(day, "EEE", { locale: tr }),
      ...totals,
    };
  });
};

export const getLessonDistribution = (entries: StudyEntry[]) => {
  const totals = new Map<string, { minutes: number; questions: number }>();
  entries.forEach((entry) => {
    const current = totals.get(entry.lesson) ?? { minutes: 0, questions: 0 };
    current.minutes += entry.minutes;
    current.questions += entry.questionCount;
    totals.set(entry.lesson, current);
  });

  return Array.from(totals.entries()).map(([lesson, value]) => ({
    lesson,
    minutes: value.minutes,
    questions: value.questions,
  }));
};

export const getEfficiencyData = (entries: StudyEntry[]) => {
  return getDailySeries(entries).map((item) => ({
    date: item.date,
    efficiency: item.minutes ? item.questions / item.minutes : 0,
  }));
};

export const getNetTrend = (mockExams: MockExam[]) => {
  return mockExams
    .slice()
    .reverse()
    .map((exam) => {
      const tyt = exam.summary
        .filter(
          (lesson) =>
            !lesson.lesson.startsWith("AYT") &&
            !lesson.lesson.startsWith("YDT"),
        )
        .reduce((acc, lesson) => acc + lesson.net, 0);
      const ayt = exam.summary
        .filter((lesson) => lesson.lesson.startsWith("AYT"))
        .reduce((acc, lesson) => acc + lesson.net, 0);
      return { date: exam.date, tyt, ayt };
    });
};

