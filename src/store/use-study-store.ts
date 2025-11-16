"use client";

import {
  initialGoals,
  initialMockExams,
  initialNotifications,
  initialStudyEntries,
  initialTopicProgress,
  initialWidgets,
} from "@/lib/sample-data";
import { createClient } from "@/lib/supabase/client";
import type {
  Goal,
  MockExam,
  NotificationItem,
  StudentProfile,
  StudyEntry,
  TopicProgress,
  WidgetConfig,
  WidgetSize,
} from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const mapProfileRow = (row: any): StudentProfile => ({
  id: row.id,
  email: row.email,
  fullName: row.full_name,
  targetExam: row.target_exam,
  studyField: row.study_field,
  updatedAt: row.updated_at,
});

export interface StudyState {
  studyEntries: StudyEntry[];
  mockExams: MockExam[];
  goals: Goal[];
  topics: TopicProgress[];
  notifications: NotificationItem[];
  widgets: WidgetConfig[];
  isInitialized: boolean;
  userId: string | null;
  profile: StudentProfile | null;
  
  // Actions
  setUserId: (userId: string | null) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (payload: {
    fullName?: string;
    studyField?: StudentProfile["studyField"];
  }) => Promise<void>;
  initializeFromSupabase: () => Promise<void>;
  addStudyEntry: (entry: StudyEntry) => Promise<void>;
  addMockExam: (exam: MockExam) => Promise<void>;
  updateGoalProgress: (goalId: string, current: number) => Promise<void>;
  toggleWidget: (widgetId: string) => void;
  reorderWidgets: (activeId: string, overId: string) => void;
  updateWidgetSize: (widgetId: string, size: WidgetSize) => void;
  markNotificationRead: (id: string) => Promise<void>;
  updateTopics: (topic: TopicProgress) => Promise<void>;
  syncToSupabase: () => Promise<void>;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      studyEntries: initialStudyEntries,
      mockExams: initialMockExams,
      goals: initialGoals,
      topics: initialTopicProgress,
      notifications: initialNotifications,
      widgets: initialWidgets,
      isInitialized: false,
      userId: null,
      profile: null,

      setUserId: (userId) =>
        set((state) => ({
          userId,
          isInitialized:
            userId && state.userId === userId ? state.isInitialized : false,
          profile: userId && state.userId === userId ? state.profile : null,
        })),

      fetchProfile: async () => {
        const { userId } = get();
        if (!userId) return;

        const supabase = createClient();
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select(
              "id, email, full_name, target_exam, study_field, updated_at",
            )
            .eq("id", userId)
            .maybeSingle();

          if (error) throw error;
          set({ profile: data ? mapProfileRow(data) : null });
        } catch (error) {
          console.error("Profil bilgisi alınamadı:", error);
        }
      },

      updateProfile: async ({ fullName, studyField }) => {
        const { userId, profile } = get();
        if (!userId) return;

        const supabase = createClient();
        const targetExamMap: Record<string, string> = {
          sayisal: "AYT-SAY",
          "esit-agirlik": "AYT-EA",
          sozel: "AYT-SOZ",
        };

        const updates = {
          full_name: fullName ?? profile?.fullName ?? null,
          study_field: studyField ?? profile?.studyField ?? null,
          target_exam:
            (studyField ? targetExamMap[studyField] : profile?.targetExam) ??
            null,
        };

        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", userId)
          .select(
            "id, email, full_name, target_exam, study_field, updated_at",
          )
          .single();

        if (error) {
          console.error(
            "Profil güncellenemedi:",
            JSON.stringify(error, null, 2),
          );
          throw error;
        }

        set({ profile: mapProfileRow(data) });
      },

      initializeFromSupabase: async () => {
        const { userId, isInitialized } = get();
        if (!userId || isInitialized) return;

        const supabase = createClient();

        try {
          // Tüm verileri paralel olarak çek
          const [
            { data: studyEntries },
            { data: mockExamsRaw },
            { data: goals },
            { data: topics },
            { data: notifications },
            { data: widgets },
            { data: profileRow },
          ] = await Promise.all([
            supabase
              .from("study_entries")
              .select("*")
              .order("date", { ascending: false })
              .limit(100),
            supabase
              .from("mock_exams")
              .select("*")
              .order("date", { ascending: false })
              .limit(30),
            supabase.from("goals").select("*"),
            supabase.from("topic_progress").select("*"),
            supabase
              .from("notifications")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(50),
            supabase.from("widget_configs").select("*").order("display_order"),
            supabase
              .from("profiles")
              .select(
                "id, email, full_name, target_exam, study_field, updated_at",
              )
              .eq("id", userId)
              .maybeSingle(),
          ]);

          // Mock exam details'i ayrı çek ve birleştir
          const mockExams = await Promise.all(
            (mockExamsRaw || []).map(async (exam) => {
              const { data: details } = await supabase
                .from("mock_exam_details")
                .select("*")
                .eq("exam_id", exam.id);

              // Güvenli tarih parsing
              const normalizeDate = (dateStr: string) => {
                if (!dateStr) return new Date().toISOString().split('T')[0];
                return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
              };

              return {
                id: exam.id,
                title: exam.title || 'Deneme',
                date: normalizeDate(exam.date),
                examType: exam.exam_type || 'TYT',
                duration: exam.duration ?? 0,
                difficulty: exam.difficulty || 'orta',
                summary: details?.map((d) => ({
                  lesson: d.lesson,
                  correct: d.correct ?? 0,
                  wrong: d.wrong ?? 0,
                  empty: d.empty ?? 0,
                  net: d.net ?? 0,
                })) || [],
              };
            })
          );

          // Güvenli tarih parsing fonksiyonu
          const normalizeDate = (dateStr: string) => {
            if (!dateStr) return new Date().toISOString().split('T')[0];
            return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
          };

          set({
            studyEntries: studyEntries?.map((entry) => ({
              id: entry.id,
              date: normalizeDate(entry.date),
              lesson: entry.lesson || '',
              subTopic: entry.sub_topic || '',
              minutes: entry.minutes ?? 0,
              questionCount: entry.question_count ?? 0,
              notes: entry.notes || '',
              studyType: entry.study_type || 'konu-calisma',
              timeSlot: entry.time_slot || 'sabah',
              net: {
                tyt: entry.tyt_net ?? null,
                ayt: entry.ayt_net ?? null,
              },
            })) || [],
            mockExams: mockExams || [],
            goals: goals?.map((goal) => ({
              id: goal.id,
              title: goal.title,
              target: Number(goal.target),
              current: Number(goal.current),
              unit: goal.unit,
              period: goal.period,
            })) || [],
            topics: topics?.map((topic) => ({
              id: topic.id,
              lesson: topic.lesson,
              completed: topic.completed,
              total: topic.total,
              missingTopics: topic.missing_topics,
            })) || [],
            notifications: notifications?.map((notif) => ({
              id: notif.id,
              title: notif.title,
              description: notif.description,
              type: notif.type,
              createdAt: notif.created_at,
              read: notif.read,
            })) || [],
            widgets: widgets?.map((widget) => ({
              id: widget.id,
              title: widget.title,
              description: widget.description,
              component: widget.component,
              visible: widget.visible,
              size: widget.size,
            })) || initialWidgets,
            profile: profileRow ? mapProfileRow(profileRow) : null,
            isInitialized: true,
          });
        } catch (error) {
          console.error("Supabase'den veri çekilemedi:", error);
          set({ isInitialized: true });
        }
      },

      addStudyEntry: async (entry) => {
        const { userId } = get();
        if (!userId) return;

        const supabase = createClient();
        
        const { error } = await supabase.from("study_entries").insert({
          user_id: userId,
          date: entry.date,
          lesson: entry.lesson,
          sub_topic: entry.subTopic,
          minutes: entry.minutes,
          question_count: entry.questionCount,
          notes: entry.notes,
          study_type: entry.studyType,
          time_slot: entry.timeSlot,
          tyt_net: entry.net?.tyt,
          ayt_net: entry.net?.ayt,
        });

        if (!error) {
          set((state) => ({
            studyEntries: [entry, ...state.studyEntries].slice(0, 100),
          }));
        }
      },

      addMockExam: async (exam) => {
        const { userId } = get();
        if (!userId) return;

        const supabase = createClient();

        // 1. Ana deneme kaydını 'mock_exams' tablosuna ekle (summary olmadan)
        const { data: newExam, error: examError } = await supabase
          .from("mock_exams")
          .insert({
            user_id: userId,
            title: exam.title,
            date: exam.date,
            exam_type: exam.examType,
            duration: exam.duration,
            difficulty: exam.difficulty,
          })
          .select()
          .single();

        if (examError) {
          console.error("Deneme ana kaydı oluşturulamadı:", examError);
          return;
        }

        if (!newExam) return;

        // 2. Her bir ders sonucunu 'mock_exam_details' tablosuna ekle
        const summaryWithExamId = exam.summary.map(detail => ({
            exam_id: newExam.id,
            ...detail
        }));

        const { error: detailsError } = await supabase
          .from("mock_exam_details")
          .insert(summaryWithExamId);

        if (detailsError) {
          console.error("Deneme detayları kaydedilemedi:", detailsError);
          // İsteğe bağlı: Burada ana deneme kaydını silerek işlemi geri alabiliriz.
          return;
        }

        // 3. Lokal state'i güncelle
        if (!examError && !detailsError) {
          set((state) => ({
            mockExams: [{ ...exam, id: newExam.id }, ...state.mockExams].slice(0, 30),
          }));
        }
      },

      updateGoalProgress: async (goalId, current) => {
        const { userId } = get();
        if (!userId) return;

        const supabase = createClient();
        
        const { error } = await supabase
          .from("goals")
          .update({ current })
          .eq("id", goalId)
          .eq("user_id", userId);

        if (!error) {
          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === goalId ? { ...goal, current } : goal
            ),
          }));
        }
      },

      toggleWidget: (widgetId) =>
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === widgetId
              ? { ...widget, visible: !widget.visible }
              : widget
          ),
        })),

      reorderWidgets: (activeId, overId) =>
        set((state) => {
          const widgets = [...state.widgets];
          const fromIndex = widgets.findIndex((widget) => widget.id === activeId);
          const toIndex = widgets.findIndex((widget) => widget.id === overId);
          if (fromIndex === -1 || toIndex === -1) {
            return {};
          }
          const [moved] = widgets.splice(fromIndex, 1);
          widgets.splice(toIndex, 0, moved);
          return { widgets };
        }),

      updateWidgetSize: (widgetId, size) =>
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === widgetId ? { ...widget, size } : widget
          ),
        })),

      markNotificationRead: async (id) => {
        const { userId } = get();
        if (!userId) return;

        const supabase = createClient();
        
        const { error } = await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", id)
          .eq("user_id", userId);

        if (!error) {
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notification.id === id ? { ...notification, read: true } : notification
            ),
          }));
        }
      },

      updateTopics: async (topic) => {
        const { userId } = get();
        if (!userId) return;

        const supabase = createClient();
        
        const { error } = await supabase
          .from("topic_progress")
          .upsert({
            user_id: userId,
            id: topic.id,
            lesson: topic.lesson,
            completed: topic.completed,
            total: topic.total,
            missing_topics: topic.missingTopics,
          });

        if (!error) {
          set((state) => ({
            topics: state.topics.map((item) =>
              item.id === topic.id ? topic : item
            ),
          }));
        }
      },

      syncToSupabase: async () => {
        const { userId, widgets } = get();
        if (!userId) return;

        const supabase = createClient();

        // Widget ayarlarını senkronize et
        await Promise.all(
          widgets.map((widget, index) =>
            supabase.from("widget_configs").upsert({
              user_id: userId,
              id: widget.id,
              title: widget.title,
              description: widget.description,
              component: widget.component,
              visible: widget.visible,
              size: widget.size,
              display_order: index,
            })
          )
        );
      },
    }),
    {
      name: "yks-tracker-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        studyEntries: state.studyEntries,
        mockExams: state.mockExams,
        goals: state.goals,
        topics: state.topics,
        widgets: state.widgets,
        profile: state.profile,
        userId: state.userId,
      }),
    }
  )
);
