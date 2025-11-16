import { LessonType } from "@/types";

/**
 * 2026 YKS TYT ve AYT konu başlıkları katalogu
 * Her ders için detaylı konu listesi
 */

export const TOPICS_BY_LESSON: Record<LessonType, string[]> = {
  // TYT DERSLERİ
  "Türkçe": [
    "Sözcükte Anlam (Eş-Zıt Anlam)",
    "Deyimler ve Atasözleri",
    "Cümlede Anlam",
    "Anlatım Biçimleri",
    "Söz Sanatları",
    "Paragraf Anlama ve Yorumlama",
    "Ses Bilgisi",
    "Ünlü-Ünsüz Uyumu",
    "Yazım Kuralları",
    "Noktalama İşaretleri",
    "Dil Bilgisi",
    "Anlatım Bozuklukları",
  ],

  "Matematik": [
    "Temel Kavramlar",
    "Sayı Basamakları",
    "Bölme ve Bölünebilme",
    "OBEB-OKEK",
    "Rasyonel Sayılar",
    "Birinci Dereceden Denklemler",
    "İkinci Dereceden Denklemler",
    "Orantı",
    "Yüzde Problemleri",
    "Faiz Problemleri",
    "Kar-Zarar Problemleri",
    "Açılar",
    "Üçgenler",
    "Dörtgenler",
    "Çember ve Daire",
  ],

  "Fizik": [
    "Kuvvet ve Hareket",
    "Newton Kanunları",
    "Enerji",
    "İş-Güç-Enerji",
    "Basit Makineler",
    "Elektrik ve Manyetizma",
    "Ohm Kanunu",
  ],

  "Kimya": [
    "Atom ve Periyodik Sistem",
    "Maddenin Halleri",
    "Kimyasal Tepkimeler",
    "Mol Kavramı",
    "Asit-Baz",
    "Kimyasal Bağlar",
  ],

  "Biyoloji": [
    "Hücre ve Organelleri",
    "DNA ve Genetik Kod",
    "Proteinler",
    "Ekosistem",
    "Besin Zinciri",
    "Çevre Sorunları",
  ],

  "Tarih": [
    "İslamiyet Öncesi Türk Tarihi",
    "İlk Türk Devletleri",
    "Selçuklular",
    "Osmanlı Kuruluş Dönemi",
    "Osmanlı Yükselme Dönemi",
    "Osmanlı Duraklama Dönemi",
  ],

  "Coğrafya": [
    "Harita Bilgisi",
    "İklim Tipleri",
    "Doğal Afetler",
    "Türkiye'nin Coğrafi Konumu",
    "Türkiye'nin İklim Özellikleri",
    "Nüfus ve Yerleşme",
  ],

  "Felsefe": [
    "Bilgi Felsefesi",
    "Ahlak Felsefesi",
    "Mantık",
    "Felsefenin Temel Problemleri",
    "Doğru Düşünme İlkeleri",
  ],

  "Din Kültürü": [
    "İslam'ın Temel Kavramları",
    "İnanç Esasları",
    "İbadet",
    "İslam Düşüncesi",
    "Ahlak ve Değerler",
  ],

  // AYT SAYISAL DERSLERİ
  "Geometri": [
    "Üçgenler",
    "Dörtgenler",
    "Çember",
    "Katı Cisimler",
    "Analitik Geometri",
    "Dönüşüm Geometrisi",
    "Açı-Kenar Bağıntıları",
    "Trigonometri",
  ],

  // AYT SAYISAL - Matematik
  "AYT Matematik": [
    "Fonksiyonlar",
    "Polinomlar",
    "Logaritma",
    "Üstel Fonksiyonlar",
    "Trigonometri",
    "Diziler",
    "Seriler",
    "Limit",
    "Süreklilik",
    "Türev",
    "İntegral",
    "Olasılık",
    "Analitik Geometri",
  ],

  "AYT Fizik": [
    "Vektörler",
    "Kuvvet ve Hareket",
    "İş-Güç-Enerji",
    "Momentum",
    "Elektrik",
    "Manyetizma",
    "Dalgalar",
    "Optik",
    "Atom Fiziği",
    "Modern Fizik",
  ],

  "AYT Kimya": [
    "Kimyasal Bağlar",
    "Asit-Baz Dengesi",
    "Çözeltiler",
    "Kimyasal Tepkime Hızı",
    "Kimyasal Denge",
    "Elektrokimya",
    "Organik Kimya",
    "Hidrokarbonlar",
    "Alkoller",
    "Esterler",
  ],

  "AYT Biyoloji": [
    "Canlıların Sınıflandırılması",
    "Hücre Bölünmesi",
    "Kalıtım",
    "Genetik",
    "Evrim",
    "Ekosistem Ekolojisi",
    "Bitki Biyolojisi",
    "Hayvan Biyolojisi",
  ],

  // AYT SÖZEL DERSLERİ
  "AYT Edebiyat": [
    "Tanzimat Edebiyatı",
    "Servet-i Fünun",
    "Milli Edebiyat",
    "Cumhuriyet Dönemi Edebiyatı",
    "Nazım Biçimleri",
    "Nazım Türleri",
    "Roman",
    "Hikaye",
    "Tiyatro",
    "Edebi Akımlar",
    "Söz Sanatları",
    "Anlatım Teknikleri",
  ],

  "AYT Tarih-1": [
    "İlk Çağ Medeniyetleri",
    "Orta Çağ",
    "İlk Türk Devletleri",
    "Büyük Selçuklu Devleti",
    "Anadolu Selçukluları",
    "Beylikler Dönemi",
  ],

  "AYT Tarih-2": [
    "Osmanlı Kuruluş ve Yükselme",
    "Osmanlı Duraklama ve Gerileme",
    "Osmanlı Dağılma Dönemi",
    "Türkiye Cumhuriyeti Tarihi",
    "Atatürk İlkeleri ve İnkılap Tarihi",
    "Çağdaş Türk ve Dünya Tarihi",
  ],

  "AYT Coğrafya-1": [
    "Türkiye'nin Fiziki Coğrafyası",
    "İklim ve Bitki Örtüsü",
    "Toprak Tipleri",
    "Türkiye'nin Jeolojik Yapısı",
    "Türkiye'nin Beşeri Coğrafyası",
    "Nüfus ve Göç",
  ],

  "AYT Coğrafya-2": [
    "Türkiye'nin Ekonomik Coğrafyası",
    "Tarım",
    "Hayvancılık",
    "Enerji Kaynakları",
    "Sanayi",
    "Ulaşım ve Ticaret",
    "Dünya Ekonomik Coğrafyası",
    "Bölgeler ve Ülkeler",
  ],

  "AYT Felsefe": [
    "Felsefenin Temel Problemleri",
    "Bilgi Felsefesi",
    "Metafizik",
    "Ahlak Felsefesi",
    "Din Felsefesi",
    "Siyaset Felsefesi",
  ],

  "AYT Din Kültürü": [
    "İslam Düşüncesi Tarihi",
    "Kelam İlmi",
    "İslam Mezhepleri",
    "Din ve Ahlak",
    "İnanç Sistemleri",
    "Dinler Tarihi",
  ],

  "AYT Psikoloji": [
    "Psikolojinin Temel Kavramları",
    "Algı ve Duyum",
    "Duygu ve Düşünce",
    "Öğrenme",
    "Bellek",
    "Gelişim Psikolojisi",
    "Kişilik Kuramları",
  ],

  "AYT Sosyoloji": [
    "Sosyolojinin Temel Kavramları",
    "Toplum ve Kültür",
    "Sosyal Yapı",
    "Sosyal Kurumlar",
    "Sosyalleşme",
    "Sosyal Değişme ve Gelişme",
    "Kent ve Kentleşme",
  ],

  "AYT Mantık": [
    "Mantığın Temel Kavramları",
    "Önermeler",
    "Kavramlar",
    "Çıkarım",
    "Kıyas",
    "Tümevarım ve Tümdengelim",
  ],
};

/**
 * Verilen ders için konu listesini döndürür
 */
export function getTopicsForLesson(lesson: LessonType): string[] {
  return TOPICS_BY_LESSON[lesson] || [];
}

/**
 * Tüm derslerin konu sayılarını döndürür
 */
export function getTopicCountByLesson(): Record<LessonType, number> {
  const result = {} as Record<LessonType, number>;
  for (const [lesson, topics] of Object.entries(TOPICS_BY_LESSON)) {
    result[lesson as LessonType] = topics.length;
  }
  return result;
}

/**
 * Arama terimine göre konuları filtreler
 */
export function searchTopics(lesson: LessonType, searchTerm: string): string[] {
  const topics = getTopicsForLesson(lesson);
  if (!searchTerm) return topics;
  
  const lowerSearch = searchTerm.toLowerCase();
  return topics.filter(topic => 
    topic.toLowerCase().includes(lowerSearch)
  );
}
