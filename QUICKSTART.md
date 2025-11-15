# ⚡ Hızlı Başlangıç - 5 Dakikada Yayına Alın!

## 📝 Özet

Bu uygulama artık **Supabase** (ücretsiz veritabanı) ve **Vercel** (ücretsiz hosting) ile tam entegre!

Öğrenciler artık:
- ✅ Hesap açıp giriş yapabilir
- ✅ Verilerini bulutta güvenle saklayabilir
- ✅ Her cihazdan erişebilir
- ✅ Otomatik veri senkronizasyonu

---

## 🎯 Yapmanız Gerekenler (3 Adım)

### 1️⃣ Supabase Projesi Oluşturun (2 dakika)

1. https://supabase.com → GitHub ile giriş
2. "New Project" → İsim verin (örn: yks-takip)
3. Şifre belirleyin → Region: Europe West
4. "Create project" → Bekleyin (~2 dakika)

### 2️⃣ Veritabanını Kurun (1 dakika)

1. Sol menü → **SQL Editor**
2. `supabase/migrations/001_init_schema.sql` dosyasını açın
3. Tüm içeriği kopyalayın
4. SQL Editor'e yapıştırın
5. **Run** butonuna basın ✅

### 3️⃣ Vercel'e Deploy Edin (2 dakika)

1. GitHub'a push edin:
```bash
git add .
git commit -m "Supabase entegrasyonu eklendi"
git push
```

2. https://vercel.com → GitHub ile giriş
3. "New Project" → Repo'nuzu seçin
4. **Environment Variables** ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon key
5. "Deploy" butonuna basın! 🚀

**İşte bu kadar!** 🎉

---

## 🔑 API Anahtarlarını Nerede Bulabilirim?

Supabase Dashboard:
1. Settings (dişli ikonu)
2. **API** sekmesi
3. İki değeri kopyalayın:
   - **Project URL**
   - **anon public** key

---

## ✅ Deployment Tamamlandı - Şimdi Ne Yapmalı?

### Son Ayar: Redirect URLs

Vercel'den aldığınız URL'i (örn: `https://yks-takip-ai.vercel.app`) Supabase'e ekleyin:

1. Supabase → **Authentication** → **URL Configuration**
2. **Site URL**: Vercel URL'nizi girin
3. **Redirect URLs**: Şunları ekleyin:
   - `https://yks-takip-ai.vercel.app/**`
   - `https://yks-takip-ai.vercel.app/auth/callback`
4. Save ✅

---

## 🧪 Test Edin

1. Vercel URL'nize gidin
2. **Kayıt Ol** → Yeni hesap oluşturun
3. Giriş yapın → Çalışma kaydı ekleyin
4. Sayfayı yenileyin → Veriler kaybolmadı! ✅
5. Başka bir tarayıcıdan giriş yapın → Veriler senkronize! ✅

---

## 📊 Ne Kazandınız?

- 🆓 **Tamamen ücretsiz** (aylık ~500.000 istek)
- 🔒 **Güvenli** (SSL + Row Level Security)
- 🌍 **Global erişim** (CDN)
- ⚡ **Hızlı** (Edge Functions)
- 📱 **Mobil uyumlu**
- 🔄 **Otomatik yedekleme**
- 🚀 **Otomatik deployment** (her push'ta)

---

## 🆘 Sorun mu var?

### Giriş yapamıyorum
→ Redirect URLs'leri kontrol edin (yukarıda)

### "Invalid API credentials" hatası
→ Environment variables'ları Vercel'de kontrol edin

### Veriler kaydolmuyor
→ Supabase SQL'i doğru çalıştırdığınızdan emin olun

### Build hatası
→ `npm run build` komutuyla yerel test yapın

---

## 📚 Daha Fazla Bilgi

Detaylı talimatlar için **[DEPLOYMENT.md](./DEPLOYMENT.md)** dosyasına bakın.

---

**Başarılar! 🎓 YKS 2026'ya hazırlanın!**

