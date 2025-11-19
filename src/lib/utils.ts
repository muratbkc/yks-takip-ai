import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatMinutes = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) {
    return `${minutes} dk`;
  }
  return `${hours} sa ${minutes} dk`;
};

export const formatDate = (date: string | Date) => {
  try {
    const value = typeof date === "string" ? new Date(date) : date;
    // Geçersiz tarih kontrolü
    if (isNaN(value.getTime())) {
      return "";
    }
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
    }).format(value);
  } catch (e) {
    return "";
  }
};

/**
 * 2026 YKS'ye göre her dersin maksimum soru sayısını döndürür
 * @param lesson - Ders adı
 * @returns Maksimum soru sayısı
 */
export const getMaxQuestionCount = (lesson: string): number => {
  const maxCounts: Record<string, number> = {
    // TYT Dersleri
    Türkçe: 40,
    Matematik: 40,
    Geometri: 40, // Matematik içinde
    Fizik: 7, // TYT Fen toplam 20
    Kimya: 7,
    Biyoloji: 6,
    Tarih: 5, // TYT Sosyal toplam 20
    Coğrafya: 5,
    Felsefe: 5,
    "Din Kültürü": 5,
    // AYT Dersleri
    "AYT Matematik": 40,
    "AYT Fizik": 14,
    "AYT Kimya": 13,
    "AYT Biyoloji": 13,
    "AYT Edebiyat": 24,
    "AYT Tarih-1": 4,
    "AYT Tarih-2": 6,
    "AYT Coğrafya-1": 3,
    "AYT Coğrafya-2": 3,
    "AYT Felsefe": 4,
    "AYT Din Kültürü": 3,
    "AYT Psikoloji": 3,
    "AYT Sosyoloji": 3,
    "AYT Mantık": 2,
    // Eski ders isimleri için geriye dönük uyumluluk
    "AYT Tarih": 10,
    "AYT Coğrafya": 6,
    Din: 5,
  };

  return maxCounts[lesson] || 40; // Varsayılan 40
};

/**
 * 2026 YKS sınav yapısı bilgilerini döndürür
 */
export const getExamInfo = () => ({
  tyt: {
    name: "TYT (Temel Yeterlilik Testi)",
    duration: 165, // dakika
    totalQuestions: 120,
    sections: {
      Türkçe: 40,
      Matematik: 40,
      "Fen Bilimleri": 20, // Fizik 7 + Kimya 7 + Biyoloji 6
      "Sosyal Bilimler": 20, // Tarih 5 + Coğrafya 5 + Felsefe 5 + Din 5
    },
  },
  ayt: {
    name: "AYT (Alan Yeterlilik Testi)",
    duration: 180, // dakika
    sections: {
      Sayısal: {
        Matematik: 40,
        Fizik: 14,
        Kimya: 13,
        Biyoloji: 13,
      },
      "Sözel / Eşit Ağırlık": {
        Edebiyat: 24,
        "Tarih-1": 4,
        "Tarih-2": 6,
        "Coğrafya-1": 3,
        "Coğrafya-2": 3,
        "Sosyal Bilimler-2": 15, // Felsefe, Din, Psikoloji, Sosyoloji, Mantık
      },
    },
  },
  examDate: {
    tyt: "20 Haziran 2026",
    ayt: "21 Haziran 2026",
  },
});

