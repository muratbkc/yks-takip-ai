# 🎓 YKS Takip AI

**2026 YKS'ye hazırlık sürecini günlük kayıtlar, akıllı hedefler ve gelişim grafikleriyle görünür kılan modern Next.js 15 uygulaması.**

## 📅 2026 YKS Sınav Bilgileri

Bu uygulama, **2026 Yükseköğretim Kurumları Sınavı**'na göre optimize edilmiştir:

### **TYT (Temel Yeterlilik Testi)**
- 📆 **Tarih:** 20 Haziran 2026
- ⏱️ **Süre:** 165 dakika
- 📝 **Soru Sayısı:** 120 soru
  - Türkçe: 40 soru
  - Matematik: 40 soru
  - Fen Bilimleri: 20 soru (Fizik 7, Kimya 7, Biyoloji 6)
  - Sosyal Bilimler: 20 soru (Tarih 5, Coğrafya 5, Felsefe 5, Din Kültürü 5)

### **AYT (Alan Yeterlilik Testi)**
- 📆 **Tarih:** 21 Haziran 2026
- ⏱️ **Süre:** 180 dakika
- **Sayısal:**
  - Matematik: 40 soru
  - Fizik: 14 soru
  - Kimya: 13 soru
  - Biyoloji: 13 soru
- **Sözel / Eşit Ağırlık:**
  - Türk Dili ve Edebiyatı: 24 soru
  - Tarih-1: 4 soru, Tarih-2: 6 soru
  - Coğrafya-1: 3 soru, Coğrafya-2: 3 soru
  - Sosyal Bilimler-2: 15 soru (Felsefe, Din Kültürü, Psikoloji, Sosyoloji, Mantık)

### **YDT (Yabancı Dil Testi)**
- 📆 **Tarih:** 21 Haziran 2026
- ⏱️ **Süre:** 120 dakika
- 📝 **Soru Sayısı:** 80 soru
- **Diller:** İngilizce, Almanca, Fransızca, Arapça

---

## ✨ Özellikler

- 📊 **Günlük çalışma kaydı**: TYT, AYT ve YDT için çalışma türü, ders, süre, soru ve deneme netleri tek formda.
- 📈 **Grafik panosu**: Zaman, ders ve performans trendlerini otomatik güncelleyen Recharts tabanlı kartlar.
- 🎯 **Hedef sistemi**: Günlük/haftalık hedef yüzdeleri, tamamlanınca animasyonlu geri bildirim.
- 🧠 **"Bugün ne yapmalıyım?" motoru**: Son 7 gün dağılımına göre ders önerisi ve mini plan.
- 🔔 **Bildirimler**: İhmal edilen dersler, hedef kaçırma, motivasyon mesajlarını yüzeye çıkaran panel.
- 🧩 **Etkileşimli widget board**: Kartları sürükle-bırak sıralama ve görünürlük anahtarları.
- 🧾 **Haftalık PDF raporu**: Süre, soru ve hedef özetini tek tıkla dışa aktarır.
- ⏱️ **Pomodoro zamanlayıcısı**: Otomatik süre kaydı, fokus/mola durumları.
- ⏳ **Sınav geri sayım**: Sınava kalan süreyi canlı takip edin.
- 🌓 **Tema anahtarı**: Gece modu ve mobil-first tasarım.
- ✅ **2026 YKS uyumlu**: Tüm dersler ve soru sayıları 2026 YKS yapısına göre güncellendi.

## 🚀 Kurulum ve Yayına Alma

### Yerel Geliştirme

```bash
npm install
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

### 🌐 Canlıya Alma (Ücretsiz!)

Uygulamayı **ücretsiz** olarak yayına almak için detaylı talimatlar:

👉 **[DEPLOYMENT.md](./DEPLOYMENT.md)** dosyasına bakın

- ✅ **Vercel** ile ücretsiz hosting
- ✅ **Supabase** ile ücretsiz veritabanı ve kullanıcı girişi
- ✅ Otomatik deployment
- ✅ SSL sertifikası
- ✅ Global CDN

## Teknolojiler

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + Recharts + DnD Kit
- Zustand ile durum yönetimi + Supabase ile bulut senkronizasyonu
- Supabase (PostgreSQL + Authentication)
- Zod + React Hook Form validasyonlu formlar
- jsPDF ile PDF raporu

## Geliştirme

- `npm run lint` ile statik kontrol
- `npm run format` ile kod formatlama (Prettier)

## 📚 2026 YKS Detayları

### Derslere Göre Maksimum Net Sayıları
Uygulama, her ders için otomatik maksimum net kontrolü yapar:

**TYT:**
- Türkçe: 40 | Matematik: 40 | Geometri: 40
- Fizik: 7 | Kimya: 7 | Biyoloji: 6
- Tarih: 5 | Coğrafya: 5 | Felsefe: 5 | Din Kültürü: 5

**AYT:**
- Matematik: 40 | Fizik: 14 | Kimya: 13 | Biyoloji: 13
- Edebiyat: 24 | Tarih-1: 4 | Tarih-2: 6
- Coğrafya-1: 3 | Coğrafya-2: 3
- Felsefe: 4 | Din Kültürü: 3 | Psikoloji: 3 | Sosyoloji: 3 | Mantık: 2

**YDT:**
- İngilizce/Almanca/Fransızca/Arapça: 80

### Desteklenen Çalışma Türleri
- TYT Denemesi
- AYT Denemesi (Sayısal/Sözel/EA)
- YDT Denemesi
- Ders Bazlı Deneme
- Soru Çözümü
- Konu Çalışması
- Tekrar

---

## 🚀 Yol Haritası

- ✅ ~~Gerçek zamanlı senkronizasyon (Supabase)~~ **TAMAMLANDI!**
- ✅ ~~Kullanıcı girişi ve hesap sistemi~~ **TAMAMLANDI!**
- ✅ ~~Bulut tabanlı veri saklama~~ **TAMAMLANDI!**
- 📱 Mobil widget düzenleme
- 🤖 Gemini 2.5 ile kişiselleştirilmiş haftalık koç raporları
- 📊 Deneme sınavı sonuç analizi ve yanlış soru bankası
- 🏆 Gamification rozetleri ve başarı sistemi
- 📈 İstatistiksel performans tahminleri

---

## 🎯 Hedef Kitle

Bu uygulama, **2026 YKS'ye hazırlanan tüm öğrenciler** için tasarlanmıştır:
- Sayısal öğrenciler (TYT + AYT Sayısal)
- Sözel öğrenciler (TYT + AYT Sözel)
- Eşit Ağırlık öğrenciler (TYT + AYT EA)
- Yabancı dil sınavına girecek öğrenciler (YDT)

Katkılar ve geri bildirimler için PR açabilirsiniz. İyi çalışmalar! 🎓 **#YKS2026**

