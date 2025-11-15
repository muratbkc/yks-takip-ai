# 🔐 Environment Variables Kurulumu

Uygulamanın çalışması için Supabase bilgilerinizi eklemeniz gerekiyor.

## Yerel Geliştirme İçin

Proje kök dizininde `.env.local` dosyası oluşturun ve aşağıdaki satırları ekleyin:

```bash
# .env.local dosyası
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Bilgilerini Nereden Alırım?

1. [Supabase Dashboard](https://supabase.com/dashboard) → Projenizi seçin
2. Settings (dişli ikonu) → **API** sekmesi
3. İki değeri kopyalayın:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Örnek `.env.local` Dosyası

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh12345678.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoMTIzNDU2NzgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Production (Vercel) İçin

Vercel dashboard'da:
1. Project Settings → **Environment Variables**
2. Yukarıdaki iki değişkeni ekleyin
3. **All** (Production, Preview, Development) seçin
4. Save

## Güvenlik Notları

⚠️ **ASLA** şu dosyaları Git'e commit etmeyin:
- `.env.local`
- `.env`
- Supabase anon key'i `NEXT_PUBLIC_` ile başladığı için client-side'da görünür (bu normaldir)
- Güvenlik Row Level Security (RLS) politikaları ile sağlanır

## Test

Environment variables'ları doğru ayarladıysanız:

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışmalı ve giriş/kayıt sayfaları çalışmalıdır.

## Sorun Giderme

### "Invalid API credentials" hatası
→ URL ve Key'leri tekrar kopyalayın, boşluk olmadığından emin olun

### "Failed to fetch" hatası
→ Supabase projesinin aktif olduğundan emin olun

### Giriş yapamıyorum
→ Supabase'de Email provider'ın aktif olduğunu kontrol edin

