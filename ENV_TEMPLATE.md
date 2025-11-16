# Environment Variables Şablonu

Script'i çalıştırmadan önce proje kök dizininde `.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

## Gerekli Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key (Sadece server-side ve scripts için!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Next.js Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase Bilgilerini Nereden Bulabilirim?

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. Projenizi seçin
3. **Settings** → **API** sekmesine gidin
4. Aşağıdaki bilgileri kopyalayın:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (Dikkat: Bu key'i asla public repository'ye koymayın!)

## Script'i Çalıştırma

`.env.local` dosyasını oluşturduktan sonra:

```bash
npm run seed-test-user
```

## Beklenen Çıktı

Script başarıyla çalıştığında şu çıktıyı göreceksiniz:

```
🚀 Test kullanıcısı için veri oluşturma başlıyor...

👤 Test kullanıcısı oluşturuluyor...
✅ Kullanıcı ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

📝 Profil bilgileri güncelleniyor...
✅ Profil başarıyla güncellendi

📚 Günlük çalışma kayıtları oluşturuluyor...
✅ 50 çalışma kaydı eklendi (50/120)
✅ 50 çalışma kaydı eklendi (100/120)
✅ 20 çalışma kaydı eklendi (120/120)
✅ Toplam 120 çalışma kaydı oluşturuldu

📝 Deneme sınavları oluşturuluyor...
✅ 1. Hafta TYT Denemesi (Toplam Net: 87.50)
✅ 1. Hafta AYT Denemesi (Toplam Net: 38.25)
✅ 2. Hafta TYT Denemesi (Toplam Net: 91.75)
✅ 2. Hafta AYT Denemesi (Toplam Net: 40.50)
✅ 3. Hafta TYT Denemesi (Toplam Net: 95.00)
✅ 3. Hafta AYT Denemesi (Toplam Net: 42.25)
✅ 4. Hafta TYT Denemesi (Toplam Net: 98.50)
✅ 4. Hafta AYT Denemesi (Toplam Net: 44.75)

✅ Toplam 8 deneme sınavı (4 TYT + 4 AYT) oluşturuldu

🎯 Hedefler oluşturuluyor...
✅ Hedef oluşturuldu: Günlük Çalışma Süresi
✅ Hedef oluşturuldu: Haftalık Soru Çözümü
✅ Hedef oluşturuldu: TYT Matematik Net
✅ Hedef oluşturuldu: AYT Matematik Net

🎉 Test kullanıcısı verisi başarıyla oluşturuldu!

📧 Giriş Bilgileri:
   Email: test.ogrenci@yks2026.com
   Şifre: TestOgrenci2026!
   Alan: Sayısal
   Hedef: AYT-SAY
```

## Test Kullanıcısı ile Giriş

Script çalıştıktan sonra:
1. Uygulamayı başlatın: `npm run dev`
2. Login sayfasına gidin: http://localhost:3000/auth/login
3. Test kullanıcısı bilgileriyle giriş yapın:
   - Email: `test.ogrenci@yks2026.com`
   - Şifre: `TestOgrenci2026!`

## Sorun Giderme

### "supabaseUrl is required" hatası
- `.env.local` dosyasının proje kök dizininde olduğundan emin olun
- Environment variable isimlerinin tam olarak eşleştiğinden emin olun

### "User already exists" hatası
- Normal! Script mevcut kullanıcıyı bulacak ve ona veri ekleyecek
- Sıfırdan başlamak istiyorsanız, Supabase Dashboard'dan kullanıcıyı silin

### Migration hataları
- Supabase Dashboard → SQL Editor'a gidin
- Migration dosyalarını sırayla çalıştırın:
  1. `001_init_schema.sql`
  2. `002_add_study_field.sql`
  3. `20251116110254_create_mock_exam_details_table.sql`

