export type StudyType =
  | "tyt-deneme"
  | "ayt-deneme"
  | "ders-deneme"
  | "soru-cozumu"
  | "konu-calismasi"
  | "tekrar";

export type LessonType =
  // TYT Dersleri (120 soru, 165 dakika)
  | "Türkçe" // 40 soru
  | "Matematik" // 40 soru
  | "Fizik" // TYT Fen (20 soru içinde ~7)
  | "Kimya" // TYT Fen (20 soru içinde ~7)
  | "Biyoloji" // TYT Fen (20 soru içinde ~6)
  | "Tarih" // TYT Sosyal (20 soru içinde ~5)
  | "Coğrafya" // TYT Sosyal (20 soru içinde ~5)
  | "Felsefe" // TYT Sosyal (20 soru içinde ~5)
  | "Din Kültürü" // TYT Sosyal (20 soru içinde ~5)
  | "Geometri" // TYT Matematik içinde
  // AYT Dersleri (180 dakika)
  | "AYT Matematik" // 40 soru
  | "AYT Fizik" // 14 soru
  | "AYT Kimya" // 13 soru
  | "AYT Biyoloji" // 13 soru
  | "AYT Edebiyat" // Türk Dili ve Edebiyatı - 24 soru
  | "AYT Tarih-1" // 4 soru (İlk ve Orta Çağ Türk Tarihi)
  | "AYT Tarih-2" // 6 soru (Yakınçağ, İnkılap)
  | "AYT Coğrafya-1" // 3 soru (Fiziki ve Beşeri)
  | "AYT Coğrafya-2" // 3 soru (Bölgeler, Türkiye)
  | "AYT Felsefe" // Sosyal-2 içinde ~4
  | "AYT Din Kültürü" // Sosyal-2 içinde ~3
  | "AYT Psikoloji" // Sosyal-2 içinde ~3
  | "AYT Sosyoloji" // Sosyal-2 içinde ~3
  | "AYT Mantık"; // Sosyal-2 içinde ~2

export type StudyField = "sayisal" | "esit-agirlik" | "sozel";
export type MockExamType = "TYT" | "AYT" | "Ders";

export type Difficulty = "kolay" | "orta" | "zor";

export interface StudyEntry {
  id: string;
  date: string;
  lesson: LessonType;
  subTopic?: string;
  minutes: number;
  questionCount: number;
  notes?: string;
  studyType: StudyType;
  timeSlot: "sabah" | "öğlen" | "akşam";
  net?: {
    tyt?: number;
    ayt?: number;
  };
}

export interface StudentProfile {
  id: string;
  email?: string | null;
  fullName?: string | null;
  targetExam?: string | null;
  studyField?: StudyField | null;
  updatedAt?: string | null;
}

export interface MockExamDetail {
    lesson: LessonType;
    correct: number;
    wrong: number;
    empty: number;
    net: number;
}

export interface MockExam {
  id: string;
  title: string;
  date: string;
  examType: MockExamType;
  duration?: number;
  difficulty: Difficulty;
  summary: MockExamDetail[]; // Form tarafında kullanılacak, veritabanında değil
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  period: "günlük" | "haftalık";
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "uyarı" | "bilgi" | "motivasyon";
  createdAt: string;
  read?: boolean;
}

export interface TopicProgress {
  id: string;
  lesson: LessonType;
  completed: number;
  total: number;
  missingTopics: string[];
}

export type WidgetSize = "md" | "lg";

export interface WidgetConfig {
  id: string;
  title: string;
  description: string;
  component: string;
  visible: boolean;
  size: WidgetSize;
}

