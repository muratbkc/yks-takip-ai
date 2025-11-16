# Test Kullanıcısı Veri Oluşturma Scripti

Bu script, YKS Takip AI uygulaması için gerçekçi test verisi oluşturur.

## 🎯 Oluşturulan Veriler

### Test Kullanıcı Bilgileri
- **Email**: `test.ogrenci@yks2026.com`
- **Şifre**: `TestOgrenci2026!`
- **Ad Soyad**: Ahmet Yılmaz
- **Alan**: Sayısal
- **Hedef**: AYT-SAY

### Veri İçeriği
- ✅ **30 günlük günlük çalışma kayıtları** (~120-150 kayıt)
  - Günlük 3-5 çalışma seansı
  - Pazar günleri daha az yoğun
  - Gerçekçi çalışma süreleri (240-360 dk/gün)
  - TYT ve AYT derslerinde dengeli dağılım

- ✅ **8 deneme sınavı** (4 hafta)
  - Her hafta 1 TYT denemesi (Çarşamba)
  - Her hafta 1 AYT denemesi (Cumartesi)
  - Haftalık %3-4 gelişim trendi
  - Gerçekçi net dağılımları:
    - TYT: ~90-100 net (ortalama öğrenci)
    - AYT Sayısal: ~38-45 net

- ✅ **4 hedef kartı**
  - Günlük çalışma süresi
  - Haftalık soru sayısı
  - TYT Matematik net hedefi
  - AYT Matematik net hedefi

## 📋 Gereksinimler

1. **Environment Variables (.env.local)**:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

2. **Supabase Veritabanı**:
   - Tüm migration'ların çalıştırılmış olması
   - RLS policy'lerinin aktif olması
   - Auth sisteminizin çalışıyor olması

## 🚀 Kullanım

### 1. Dependencies'i yükleyin
```bash
npm install
```

### 2. Environment variables'ı ayarlayın
`.env.local` dosyanızı oluşturun ve Supabase bilgilerinizi ekleyin.

### 3. Script'i çalıştırın
```bash
npm run seed-test-user
```

### 4. Test kullanıcısı ile giriş yapın
Uygulama arayüzünden aşağıdaki bilgilerle giriş yapabilirsiniz:
- Email: `test.ogrenci@yks2026.com`
- Şifre: `TestOgrenci2026!`

## 📊 Oluşturulan Veri Detayları

### Günlük Çalışma Dağılımı
- **Soru Çözümü**: %50 (60-90 dk, 30-50 soru)
- **Konu Çalışması**: %30 (45-75 dk, 10-25 soru)
- **Tekrar**: %20 (30-50 dk, 15-30 soru)

### TYT Net Dağılımı (Ortalama)
- Türkçe: ~25-28 net (40 soru)
- Matematik: ~26-29 net (40 soru)
- Fizik: ~5-7 net (7 soru)
- Kimya: ~5-7 net (7 soru)
- Biyoloji: ~4-6 net (6 soru)
- Tarih: ~9-11 net (5 soru)
- Coğrafya: ~8-10 net (5 soru)
- **Toplam**: ~90-100 net

### AYT Sayısal Net Dağılımı (Ortalama)
- AYT Matematik: ~18-22 net (40 soru)
- AYT Fizik: ~7-9 net (14 soru)
- AYT Kimya: ~7-9 net (13 soru)
- AYT Biyoloji: ~6-8 net (13 soru)
- **Toplam**: ~38-45 net

### Gelişim Trendi
Script, 4 hafta boyunca yaklaşık **%15 aylık gelişim** (haftalık ~%3.5) simüle eder:
- 1. Hafta: Temel seviye
- 2. Hafta: +%3.5 gelişim
- 3. Hafta: +%7 gelişim
- 4. Hafta: +%10.5 gelişim

## 🔧 Özelleştirme

Script içerisindeki `TEST_USER` nesnesini ve gelişim faktörlerini (`progressFactor`) düzenleyerek farklı senaryolar oluşturabilirsiniz:

```typescript
const TEST_USER = {
  email: 'test.ogrenci@yks2026.com',
  password: 'TestOgrenci2026!',
  fullName: 'Ahmet Yılmaz',
  studyField: 'sayisal', // veya 'esit-agirlik', 'sozel'
  targetExam: 'AYT-SAY',
};

const progressFactor = 0.15; // Aylık %15 gelişim
```

## ⚠️ Notlar

- Script, mevcut bir kullanıcı varsa hata vermez, kullanıcıyı bulur ve verileri ona ekler
- Her çalıştırmada YENİ veriler eklenir (eskiler silinmez)
- Eğer test kullanıcısını sıfırlamak isterseniz, önce Supabase dashboard'dan manuel olarak silin
- Service Role Key kullanıldığı için RLS bypass edilir - sadece development ortamında kullanın

## 🧹 Temizleme

Test kullanıcısını ve tüm verilerini silmek için:
1. Supabase Dashboard → Authentication → Users
2. `test.ogrenci@yks2026.com` kullanıcısını bulun
3. Delete user → CASCADE ile tüm ilişkili veriler de silinir

## 📝 Lisans

Bu script, YKS Takip AI projesinin bir parçasıdır ve MIT lisansı altında sunulmaktadır.

