import { addDays, formatISO, subDays } from "date-fns";
import type {
  Goal,
  MockExam,
  NotificationItem,
  StudyEntry,
  TopicProgress,
  WidgetConfig,
} from "@/types";

const today = new Date();

const createStudyEntry = (
  offset: number,
  overrides: Partial<StudyEntry> = {},
): StudyEntry => {
  const date = subDays(today, offset);
  return {
    id: crypto.randomUUID(),
    date: formatISO(date, { representation: "date" }),
    lesson: "Matematik",
    minutes: 120,
    questionCount: 80,
    studyType: "soru-cozumu",
    timeSlot: "öğlen",
    ...overrides,
  };
};

// 1 Haftalık Gerçekçi YKS Öğrencisi Verisi
export const initialStudyEntries: StudyEntry[] = [
  // BUGÜN (Gün 0) - Pazar - Hafta sonu yoğun çalışma
  createStudyEntry(0, {
    lesson: "Matematik",
    studyType: "soru-cozumu",
    minutes: 120,
    questionCount: 50,
    subTopic: "Fonksiyonlar",
    notes: "Güzel gitti, hız kazandım",
    timeSlot: "sabah",
  }),
  createStudyEntry(0, {
    lesson: "AYT Fizik",
    studyType: "konu-calismasi",
    minutes: 90,
    questionCount: 25,
    subTopic: "Elektrik ve Manyetizma",
    timeSlot: "öğlen",
  }),
  createStudyEntry(0, {
    lesson: "Türkçe",
    studyType: "soru-cozumu",
    minutes: 60,
    questionCount: 30,
    subTopic: "Paragraf",
    timeSlot: "akşam",
  }),

  // DÜN (Gün 1) - Cumartesi - Deneme günü
  createStudyEntry(1, {
    lesson: "Matematik",
    studyType: "tyt-deneme",
    minutes: 165,
    questionCount: 120,
    notes: "TYT Deneme 15 - İyi geçti",
    net: { tyt: 89 },
    timeSlot: "sabah",
  }),
  createStudyEntry(1, {
    lesson: "AYT Kimya",
    studyType: "soru-cozumu",
    minutes: 75,
    questionCount: 20,
    subTopic: "Organik Kimya",
    timeSlot: "akşam",
  }),

  // 2 GÜN ÖNCE (Gün 2) - Cuma - Yorgun gün
  createStudyEntry(2, {
    lesson: "Tarih",
    studyType: "konu-calismasi",
    minutes: 45,
    questionCount: 15,
    subTopic: "Osmanlı Tarihi",
    notes: "Okuldan sonra çok yorgundum",
    timeSlot: "akşam",
  }),
  createStudyEntry(2, {
    lesson: "Coğrafya",
    studyType: "tekrar",
    minutes: 40,
    questionCount: 20,
    subTopic: "İklim",
    timeSlot: "akşam",
  }),

  // 3 GÜN ÖNCE (Gün 3) - Perşembe - Dengeli çalışma
  createStudyEntry(3, {
    lesson: "AYT Matematik",
    studyType: "soru-cozumu",
    minutes: 100,
    questionCount: 35,
    subTopic: "Türev",
    notes: "Zorlandığım sorular için video izledim",
    timeSlot: "öğlen",
  }),
  createStudyEntry(3, {
    lesson: "Fizik",
    studyType: "soru-cozumu",
    minutes: 80,
    questionCount: 28,
    subTopic: "Kuvvet ve Hareket",
    timeSlot: "akşam",
  }),
  createStudyEntry(3, {
    lesson: "Biyoloji",
    studyType: "konu-calismasi",
    minutes: 60,
    questionCount: 18,
    subTopic: "Genetik",
    timeSlot: "akşam",
  }),

  // 4 GÜN ÖNCE (Gün 4) - Çarşamba - Yoğun gün
  createStudyEntry(4, {
    lesson: "Türkçe",
    studyType: "soru-cozumu",
    minutes: 70,
    questionCount: 35,
    subTopic: "Anlatım Bozuklukları",
    timeSlot: "sabah",
  }),
  createStudyEntry(4, {
    lesson: "Matematik",
    studyType: "soru-cozumu",
    minutes: 110,
    questionCount: 45,
    subTopic: "Geometri",
    timeSlot: "öğlen",
  }),
  createStudyEntry(4, {
    lesson: "AYT Fizik",
    studyType: "konu-calismasi",
    minutes: 95,
    questionCount: 30,
    subTopic: "Modern Fizik",
    notes: "Atom fiziği çok karışık, tekrar lazım",
    timeSlot: "akşam",
  }),
  createStudyEntry(4, {
    lesson: "Kimya",
    studyType: "tekrar",
    minutes: 50,
    questionCount: 22,
    timeSlot: "akşam",
  }),

  // 5 GÜN ÖNCE (Gün 5) - Salı - AYT deneme
  createStudyEntry(5, {
    lesson: "AYT Matematik",
    studyType: "ayt-deneme",
    minutes: 180,
    questionCount: 80,
    notes: "AYT Sayısal Deneme 8 - Matematik iyiydi",
    net: { ayt: 62 },
    timeSlot: "sabah",
  }),
  createStudyEntry(5, {
    lesson: "Felsefe",
    studyType: "soru-cozumu",
    minutes: 55,
    questionCount: 18,
    subTopic: "Bilgi Felsefesi",
    timeSlot: "akşam",
  }),

  // 6 GÜN ÖNCE (Gün 6) - Pazartesi - Hafta başı motive
  createStudyEntry(6, {
    lesson: "Matematik",
    studyType: "konu-calismasi",
    minutes: 85,
    questionCount: 32,
    subTopic: "Permütasyon - Kombinasyon",
    notes: "Yeni konu, güzel anladım",
    timeSlot: "sabah",
  }),
  createStudyEntry(6, {
    lesson: "AYT Biyoloji",
    studyType: "soru-cozumu",
    minutes: 70,
    questionCount: 24,
    subTopic: "Ekosistem",
    timeSlot: "öğlen",
  }),
  createStudyEntry(6, {
    lesson: "Türkçe",
    studyType: "soru-cozumu",
    minutes: 65,
    questionCount: 30,
    subTopic: "Söz Sanatları",
    timeSlot: "akşam",
  }),
  createStudyEntry(6, {
    lesson: "AYT Kimya",
    studyType: "tekrar",
    minutes: 45,
    questionCount: 15,
    subTopic: "Asit-Baz",
    timeSlot: "akşam",
  }),
];

export const initialMockExams: MockExam[] = [
  // Son 2 haftadaki denemeler (gelişim trendi göstermek için)
  {
    id: crypto.randomUUID(),
    title: "TYT Deneme 15",
    date: formatISO(subDays(today, 1), { representation: "date" }), // Dün
    duration: 165,
    difficulty: "orta",
    summary: [
      { lesson: "Türkçe", net: 35 },
      { lesson: "Matematik", net: 31 },
      { lesson: "Fizik", net: 6 },
      { lesson: "Kimya", net: 6 },
      { lesson: "Biyoloji", net: 5 },
      { lesson: "Tarih", net: 4 },
      { lesson: "Coğrafya", net: 3 },
      { lesson: "Felsefe", net: 4 },
      { lesson: "Din Kültürü", net: 4 },
    ],
    weakTopics: ["Matematik - Fonksiyonlar", "Fizik - Elektrik"],
  },
  {
    id: crypto.randomUUID(),
    title: "AYT Sayısal 8",
    date: formatISO(subDays(today, 5), { representation: "date" }), // 5 gün önce
    duration: 180,
    difficulty: "orta",
    summary: [
      { lesson: "AYT Matematik", net: 34 },
      { lesson: "AYT Fizik", net: 12 },
      { lesson: "AYT Kimya", net: 11 },
      { lesson: "AYT Biyoloji", net: 10 },
    ],
    weakTopics: ["AYT Fizik - Dalgalar", "AYT Kimya - Organik"],
  },
  {
    id: crypto.randomUUID(),
    title: "TYT Deneme 14",
    date: formatISO(subDays(today, 8), { representation: "date" }), // 8 gün önce
    duration: 165,
    difficulty: "kolay",
    summary: [
      { lesson: "Türkçe", net: 32 },
      { lesson: "Matematik", net: 28 },
      { lesson: "Fizik", net: 5 },
      { lesson: "Kimya", net: 6 },
      { lesson: "Biyoloji", net: 4 },
      { lesson: "Tarih", net: 4 },
      { lesson: "Coğrafya", net: 3 },
      { lesson: "Felsefe", net: 4 },
      { lesson: "Din Kültürü", net: 3 },
    ],
    weakTopics: ["Türkçe - Paragraf Yorumu", "Matematik - Geometri"],
  },
  {
    id: crypto.randomUUID(),
    title: "AYT Sayısal 7",
    date: formatISO(subDays(today, 12), { representation: "date" }), // 12 gün önce
    duration: 180,
    difficulty: "zor",
    summary: [
      { lesson: "AYT Matematik", net: 30 },
      { lesson: "AYT Fizik", net: 10 },
      { lesson: "AYT Kimya", net: 9 },
      { lesson: "AYT Biyoloji", net: 8 },
    ],
    weakTopics: ["AYT Matematik - İntegral", "AYT Fizik - Modern Fizik"],
  },
  {
    id: crypto.randomUUID(),
    title: "TYT Deneme 13",
    date: formatISO(subDays(today, 15), { representation: "date" }), // 15 gün önce
    duration: 165,
    difficulty: "orta",
    summary: [
      { lesson: "Türkçe", net: 30 },
      { lesson: "Matematik", net: 26 },
      { lesson: "Fizik", net: 4 },
      { lesson: "Kimya", net: 5 },
      { lesson: "Biyoloji", net: 4 },
      { lesson: "Tarih", net: 3 },
      { lesson: "Coğrafya", net: 3 },
      { lesson: "Felsefe", net: 3 },
      { lesson: "Din Kültürü", net: 3 },
    ],
    weakTopics: ["Matematik - Permütasyon", "Biyoloji - Genetik"],
  },
];

export const initialGoals: Goal[] = [
  {
    id: crypto.randomUUID(),
    title: "Günlük 150 soru",
    period: "günlük",
    target: 150,
    current: 105, // Bugün: 50+25+30 = 105 soru
    unit: "soru",
  },
  {
    id: crypto.randomUUID(),
    title: "Günlük 5 saat",
    period: "günlük",
    target: 300,
    current: 270, // Bugün: 120+90+60 = 270 dk
    unit: "dk",
  },
  {
    id: crypto.randomUUID(),
    title: "Haftada 2 deneme",
    period: "haftalık",
    target: 2,
    current: 2, // Bu hafta: TYT (dün) + AYT (5 gün önce)
    unit: "deneme",
  },
  {
    id: crypto.randomUUID(),
    title: "Haftalık 1200 soru",
    period: "haftalık",
    target: 1200,
    current: 987, // Son 7 günün toplamı
    unit: "soru",
  },
];

export const initialTopicProgress: TopicProgress[] = [
  {
    id: crypto.randomUUID(),
    lesson: "Matematik",
    completed: 35,
    total: 40,
    missingTopics: ["Olasılık", "Seriler", "İstatistik", "Diziler", "Karmaşık Sayılar"],
  },
  {
    id: crypto.randomUUID(),
    lesson: "AYT Matematik",
    completed: 21,
    total: 28,
    missingTopics: ["İntegral Uygulamaları", "L'Hospital", "Parametre", "Seriler", "İkinci Dereceden Denklemler", "Logaritma İleri", "İntegral Hacim"],
  },
  {
    id: crypto.randomUUID(),
    lesson: "AYT Fizik",
    completed: 12,
    total: 18,
    missingTopics: ["Modern Fizik", "Atom Fiziği", "Fotoelektrik Olay", "Kuantum", "Radyoaktivite", "Nükleer Fizik"],
  },
  {
    id: crypto.randomUUID(),
    lesson: "Fizik",
    completed: 14,
    total: 16,
    missingTopics: ["Basınç İleri", "Hidrostatik"],
  },
  {
    id: crypto.randomUUID(),
    lesson: "AYT Kimya",
    completed: 16,
    total: 20,
    missingTopics: ["Organik - Esterler", "Organik - Eterler", "Elektrokimya İleri", "Kimyasal Denge"],
  },
  {
    id: crypto.randomUUID(),
    lesson: "AYT Biyoloji",
    completed: 10,
    total: 15,
    missingTopics: ["Evrim İleri", "Ekosistem Ekolojisi", "Bitki Biyolojisi", "DNA Replikasyonu", "Gen İfadesi"],
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: crypto.randomUUID(),
    title: "🎉 Haftalık deneme hedefine ulaştın!",
    description:
      "Bu hafta 2 deneme hedefini tamamladın. Netlerinde artış var, harika gidiyorsun!",
    type: "motivasyon",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "⚠️ Tarih ve Coğrafya ihmal ediliyor",
    description:
      "Son 3 günde bu derslere hiç çalışmadın. 40 dk + 30 soru öneririm.",
    type: "uyarı",
    createdAt: addDays(new Date(), -1).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "📈 TYT netlerinde artış var!",
    description:
      "Son deneme: 89 net (önceki: 81 net). Matematik ve Türkçe'de çok iyi gidiyorsun.",
    type: "motivasyon",
    createdAt: addDays(new Date(), -1).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "💡 AYT Fizik'te Modern Fizik eksik",
    description:
      "6 eksik konu var. Haftaya deneme için bu konuları tamamlamalısın.",
    type: "bilgi",
    createdAt: addDays(new Date(), -2).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "🔥 Bu hafta 1545 dakika çalıştın!",
    description:
      "Bu hafta toplam 25 saat 45 dakika çalışma yaptın. Harika bir tempo!",
    type: "motivasyon",
    createdAt: addDays(new Date(), -3).toISOString(),
    read: true,
  },
];

export const initialWidgets: WidgetConfig[] = [
  {
    id: "time-series",
    title: "Zaman Analizleri",
    description: "Günlük ve haftalık süre akışı",
    component: "timeSeries",
    visible: true,
    size: "md",
  },
  {
    id: "lesson-distribution",
    title: "Ders Dağılımı",
    description: "Radar grafikte ders ağırlıkları",
    component: "lessonRadar",
    visible: true,
    size: "md",
  },
  {
    id: "deneme-performance",
    title: "Deneme Net Gelişimi",
    description: "TYT & AYT net trendi",
    component: "mockPerformance",
    visible: true,
    size: "md",
  },
  {
    id: "plan-suggestion",
    title: "Bugün Ne Yapmalıyım?",
    description: "7 günlük dağılıma göre öneriler",
    component: "planSuggestion",
    visible: true,
    size: "md",
  },
];

