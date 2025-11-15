"use client";

import { createClient } from "@/lib/supabase/client";
import {
  initialGoals,
  initialNotifications,
  initialTopicProgress,
  initialWidgets,
} from "@/lib/sample-data";

export async function initializeUserData(userId: string) {
  const supabase = createClient();

  try {
    // Kullanıcının mevcut verilerini kontrol et
    const { data: existingGoals } = await supabase
      .from("goals")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    // Eğer zaten veri varsa, tekrar ekleme
    if (existingGoals && existingGoals.length > 0) {
      return;
    }

    // İlk hedefleri ekle
    const goalsToInsert = initialGoals.map((goal) => ({
      user_id: userId,
      id: goal.id,
      title: goal.title,
      target: goal.target,
      current: goal.current,
      unit: goal.unit,
      period: goal.period,
    }));

    await supabase.from("goals").insert(goalsToInsert);

    // İlk bildirimleri ekle
    const notificationsToInsert = initialNotifications.map((notif) => ({
      user_id: userId,
      id: notif.id,
      title: notif.title,
      description: notif.description,
      type: notif.type,
      read: notif.read || false,
    }));

    await supabase.from("notifications").insert(notificationsToInsert);

    // İlk konu ilerlemelerini ekle
    const topicsToInsert = initialTopicProgress.map((topic) => ({
      user_id: userId,
      id: topic.id,
      lesson: topic.lesson,
      completed: topic.completed,
      total: topic.total,
      missing_topics: topic.missingTopics,
    }));

    await supabase.from("topic_progress").insert(topicsToInsert);

    // İlk widget yapılandırmalarını ekle
    const widgetsToInsert = initialWidgets.map((widget, index) => ({
      user_id: userId,
      id: widget.id,
      title: widget.title,
      description: widget.description,
      component: widget.component,
      visible: widget.visible,
      size: widget.size,
      display_order: index,
    }));

    await supabase.from("widget_configs").insert(widgetsToInsert);

    console.log("✅ İlk kullanıcı verileri başarıyla oluşturuldu");
  } catch (error) {
    console.error("❌ İlk veri oluşturma hatası:", error);
  }
}

