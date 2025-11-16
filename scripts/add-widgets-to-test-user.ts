/**
 * Mevcut test kullanıcısına widget'ları ekleyen hızlı script
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.local dosyasını yükle
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Hata: .env.local dosyasında Supabase bilgileri bulunamadı!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const TEST_USER_EMAIL = 'test.ogrenci@yks2026.com';

async function main() {
  console.log('🚀 Test kullanıcısına widgetlar ekleniyor...\n');

  // Kullanıcı ID'sini bul
  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users.users.find(u => u.email === TEST_USER_EMAIL);

  if (!testUser) {
    console.error('❌ Test kullanıcısı bulunamadı!');
    process.exit(1);
  }

  const userId = testUser.id;
  console.log(`✅ Kullanıcı bulundu: ${userId}\n`);

  // Mevcut widgetları kontrol et
  const { data: existingWidgets } = await supabase
    .from('widget_configs')
    .select('id')
    .eq('user_id', userId);

  if (existingWidgets && existingWidgets.length > 0) {
    console.log(`⚠️  ${existingWidgets.length} widget zaten mevcut. Önce silinecek...\n`);
    await supabase.from('widget_configs').delete().eq('user_id', userId);
  }

  // Widgetları ekle
  const widgets = [
    {
      id: 'time-series',
      title: 'Zaman Analizleri',
      description: 'Günlük ve haftalık süre akışı',
      component: 'timeSeries',
      visible: true,
      size: 'md',
      display_order: 0,
    },
    {
      id: 'lesson-distribution',
      title: 'Ders Dağılımı',
      description: 'Radar grafikte ders ağırlıkları',
      component: 'lessonRadar',
      visible: true,
      size: 'md',
      display_order: 1,
    },
    {
      id: 'deneme-performance',
      title: 'Deneme Net Gelişimi',
      description: 'TYT & AYT net trendi',
      component: 'mockPerformance',
      visible: true,
      size: 'md',
      display_order: 2,
    },
    {
      id: 'plan-suggestion',
      title: 'Bugün Ne Yapmalıyım?',
      description: '7 günlük dağılıma göre öneriler',
      component: 'planSuggestion',
      visible: true,
      size: 'md',
      display_order: 3,
    },
  ];

  for (const widget of widgets) {
    const { error } = await supabase.from('widget_configs').insert({
      user_id: userId,
      ...widget,
    });

    if (error) {
      console.error(`❌ Widget "${widget.title}" eklenemedi:`, error);
    } else {
      console.log(`✅ Widget eklendi: ${widget.title}`);
    }
  }

  console.log('\n🎉 Tüm widgetlar başarıyla eklendi!');
  console.log('🔄 Tarayıcıda sayfayı yenileyin (F5) veya çıkış yapıp tekrar giriş yapın.\n');
}

main().catch(console.error);

