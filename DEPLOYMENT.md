# 🚀 YKS Takip AI - Deployment Talimatları

Bu döküman, YKS Takip AI uygulamasını **ücretsiz olarak** yayına almak için gereken adımları içerir.

## 📋 Gereksinimler

1. GitHub hesabı
2. Vercel hesabı (ücretsiz)
3. Supabase hesabı (ücretsiz)

---

## 1️⃣ Supabase Kurulumu (Veritabanı ve Kullanıcı Girişi)

### Adım 1: Supabase Projesi Oluştur

1. [Supabase](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub ile giriş yapın
4. "New Project" butonuna tıklayın
5. Proje detaylarını doldurun:
   - **Name:** yks-takip-ai
   - **Database Password:** Güçlü bir şifre oluşturun (kaydedin!)
   - **Region:** Europe West (Frankfurt) - Türkiye'ye en yakın
   - **Pricing Plan:** Free tier (ücretsiz)
6. "Create new project" butonuna tıklayın
7. Projenin oluşturulmasını bekleyin (~2 dakika)

### Adım 2: Veritabanı Şemasını Oluştur

1. Sol menüden **"SQL Editor"** seçeneğine tıklayın
2. "New query" butonuna tıklayın
3. `supabase/migrations/001_init_schema.sql` dosyasının içeriğini kopyalayıp SQL editöre yapıştırın
4. Sağ üstteki **"Run"** (veya F5) butonuna basın
5. "Success. No rows returned" mesajını görmelisiniz

### Adım 3: API Anahtarlarını Kopyala

1. Sol menüden **"Project Settings"** (dişli ikonu) tıklayın
2. **"API"** sekmesine gidin
3. Aşağıdaki bilgileri kopyalayın (bunları sonra kullanacaksınız):
   - **Project URL** (örn: https://abcdefgh.supabase.co)
   - **anon public** key (uzun bir string)

### Adım 4: Email Ayarlarını Yapılandır (Opsiyonel ama önerilen)

1. Sol menüden **"Authentication"** → **"Providers"** gidin
2. **"Email"** seçeneğine tıklayın
3. **"Enable Email provider"** açık olmalı
4. **"Confirm email"** kapalı tutabilirsiniz (geliştirme için daha kolay)
5. **"Save"** butonuna tıklayın

---

## 2️⃣ Vercel Deployment (Hosting)

### Adım 1: GitHub'a Push

Projenizi henüz GitHub'a yüklemediyseniz:

```bash
# Terminalde proje klasöründe
git init
git add .
git commit -m "Initial commit - YKS Takip AI"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/yks-takip-ai.git
git push -u origin main
```

### Adım 2: Vercel'e Deploy

1. [Vercel](https://vercel.com) adresine gidin
2. GitHub ile giriş yapın
3. **"Add New..."** → **"Project"** butonuna tıklayın
4. GitHub repo listesinden **yks-takip-ai** projenizi seçin
5. **"Import"** butonuna tıklayın

### Adım 3: Environment Variables Ekle

1. **"Environment Variables"** bölümüne gidin
2. Aşağıdaki değişkenleri ekleyin:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Supabase Project URL'nizi buraya yapıştırın
   - Environments: Production, Preview, Development (hepsini seçin)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Supabase anon public key'inizi buraya yapıştırın
   - Environments: Production, Preview, Development (hepsini seçin)

3. **"Deploy"** butonuna tıklayın

### Adım 4: Deployment'ı Bekle

- Vercel otomatik olarak projeyi build edip deploy edecek (~2-3 dakika)
- Build tamamlandığında size bir URL verilecek (örn: https://yks-takip-ai.vercel.app)
- Bu URL'yi ziyaret ederek uygulamanızın çalıştığını görebilirsiniz

---

## 3️⃣ Supabase Redirect URL Ayarları

Vercel deployment tamamlandıktan sonra:

1. Vercel'den aldığınız URL'i kopyalayın
2. Supabase'e geri dönün
3. **"Authentication"** → **"URL Configuration"** gidin
4. **"Site URL"** alanına Vercel URL'inizi yapıştırın (örn: https://yks-takip-ai.vercel.app)
5. **"Redirect URLs"** listesine şunları ekleyin:
   - `https://yks-takip-ai.vercel.app/**`
   - `https://yks-takip-ai.vercel.app/auth/callback`
   - `http://localhost:3000/**` (yerel geliştirme için)
6. **"Save"** butonuna tıklayın

---

## 4️⃣ Test Etme

1. Vercel URL'nize gidin (örn: https://yks-takip-ai.vercel.app)
2. **"Kayıt Ol"** sayfasından yeni bir hesap oluşturun
3. Giriş yapın
4. Günlük çalışma kaydı ekleyin
5. Sayfayı yenileyin - verileriniz kaybolmamalı!
6. Başka bir cihazdan giriş yapın - verileriniz senkronize olmalı!

---

## 🎉 Tebrikler!

Uygulamanız artık canlıda! Aşağıdaki özelliklere sahipsiniz:

✅ **Ücretsiz hosting** (Vercel)  
✅ **Ücretsiz veritabanı** (Supabase PostgreSQL)  
✅ **Kullanıcı girişi ve kaydı**  
✅ **Otomatik veri senkronizasyonu**  
✅ **Mobil uyumlu**  
✅ **SSL sertifikası** (HTTPS)  
✅ **Otomatik backuplar**  
✅ **Global CDN**

---

## 📊 Limitler (Ücretsiz Tier)

### Vercel
- 100 GB bant genişliği/ay
- Sınırsız deployment
- Otomatik SSL

### Supabase
- 500 MB veritabanı
- 2 GB dosya depolama
- 50,000 aktif kullanıcı/ay
- Row Level Security (RLS)

**Not:** Bir öğrenci için bu limitler fazlasıyla yeterlidir!

---

## 🔄 Güncelleme Yapma

Kodunuzda değişiklik yaptığınızda:

```bash
git add .
git commit -m "Yeni özellik eklendi"
git push
```

Vercel otomatik olarak yeni versiyonu deploy edecek!

---

## 🆘 Sorun Giderme

### "Invalid API credentials" hatası
- Supabase URL ve Key'leri doğru kopyaladığınızdan emin olun
- Vercel'deki Environment Variables'ları kontrol edin

### Giriş yapılamıyor
- Supabase'de Redirect URLs'leri doğru ayarladığınızdan emin olun
- Browser console'da hata mesajlarını kontrol edin

### Veriler kaybolmuyor ama güncellenmıyor
- Browser console'u açıp hataları kontrol edin
- Supabase'de RLS politikalarının aktif olduğundan emin olun

---

## 🌐 Özel Domain (Opsiyonel)

Kendi domain'inizi kullanmak isterseniz:

1. Vercel dashboard → Settings → Domains
2. Domain'inizi ekleyin (örn: ykstakip.com)
3. DNS ayarlarını Vercel'in verdiği şekilde yapılandırın
4. Supabase'de yeni domain'i Redirect URLs'e ekleyin

---

## 📞 Destek

Herhangi bir sorunla karşılaşırsanız:
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

Başarılar! 🎓 **#YKS2026**

