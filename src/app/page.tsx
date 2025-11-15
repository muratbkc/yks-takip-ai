"use client";

import { Header } from "@/components/header";
import { DailyLogForm } from "@/components/forms/daily-log-form";
import { MockExamForm } from "@/components/forms/mock-exam-form";
import { CountdownTimer } from "@/components/countdown-timer";
import { NotificationCenter } from "@/components/notification-center";
import { WidgetBoard } from "@/components/widget-board";
import { useStudyStore } from "@/store/use-study-store";
import { AnalyticsSummary } from "@/components/analytics-summary";
import { TopicTracker } from "@/components/topic-tracker";
import { GamificationBadges } from "@/components/gamification-badges";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { WeeklyReportCard } from "@/components/weekly-report-card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const studyEntries = useStudyStore((state) => state.studyEntries);
  const mockExams = useStudyStore((state) => state.mockExams);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
      } else {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Header />
        <CountdownTimer target="2026-06-20T10:00:00" />
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Pano</TabsTrigger>
            <TabsTrigger value="entry">Veri Girişi</TabsTrigger>
            <TabsTrigger value="tools">Araçlar</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-3">
                <AnalyticsSummary />
              </div>
              <div className="lg:col-span-3">
                <WidgetBoard entries={studyEntries} exams={mockExams} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="entry">
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DailyLogForm />
              <MockExamForm />
            </div>
          </TabsContent>
          <TabsContent value="tools">
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <PomodoroTimer />
              <TopicTracker />
              <WeeklyReportCard />
            </div>
          </TabsContent>
          <TabsContent value="profile">
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <GamificationBadges />
              <NotificationCenter />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

