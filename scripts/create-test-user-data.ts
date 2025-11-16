/**
 * Test Kullanıcısı İçin Gerçekçi 1 Aylık Veri Oluşturma Scripti
 * 
 * Bu script, sayısal alan öğrencisi için gerçekçi YKS çalışma verisi oluşturur:
 * - Günlük 4-6 saat çalışma
 * - TYT ve AYT derslerinde dengeli dağılım
 * - Haftalık 2 deneme sınavı (1 TYT, 1 AYT)
 * - Gerçekçi net artışı (aylık %10-15 gelişim)
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.local dosyasını yükle
config({ path: resolve(process.cwd(), '.env.local') });

// Supabase bağlantısı - environment variables kullanın
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Hata: .env.local dosyasında Supabase bilgileri bulunamadı!');
  console.error('Gerekli değişkenler:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test kullanıcı bilgileri
const TEST_USER = {
  email: 'test.ogrenci@yks2026.com',
  password: 'TestOgrenci2026!',
  fullName: 'Ahmet Yılmaz',
  studyField: 'sayisal' as const,
  targetExam: 'AYT-SAY',
};

// YKS 2026 için gerçekçi ders kataloğu
const TYT_LESSONS = ['Türkçe', 'Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya'] as const;
const AYT_SAY_LESSONS = ['AYT Matematik', 'AYT Fizik', 'AYT Kimya', 'AYT Biyoloji'] as const;

type StudyType = 'soru-cozumu' | 'konu-calismasi' | 'tekrar';
type TimeSlot = 'sabah' | 'öğlen' | 'akşam';

// Rastgele sayı üretici yardımcı fonksiyonlar
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;
const randomChoice = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const weighted = (weights: number[]) => {
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) return i;
    random -= weights[i];
  }
  return weights.length - 1;
};

// Tarih yardımcı fonksiyonu
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Gerçekçi net hesaplama (doğru - yanlış/4)
const calculateNet = (correct: number, wrong: number) => {
  return Math.max(0, correct - wrong / 4);
};

// TYT deneme sonuçları üretici (ortalama öğrenci için)
const generateTYTMockExam = (week: number, progressFactor: number) => {
  const baseNets = {
    'Türkçe': 25,
    'Matematik': 26,
    'Geometri': 8,
    'Fizik': 5,
    'Kimya': 5,
    'Biyoloji': 4,
    'Tarih': 9,
    'Coğrafya': 8,
  };

  const maxQuestions: Record<string, number> = {
    'Türkçe': 40,
    'Matematik': 40,
    'Geometri': 0, // Matematik içinde
    'Fizik': 7,
    'Kimya': 7,
    'Biyoloji': 6,
    'Tarih': 5,
    'Coğrafya': 5,
  };

  const summary = Object.entries(baseNets)
    .filter(([lesson]) => maxQuestions[lesson] > 0) // Geometri hariç
    .map(([lesson, baseNet]) => {
      const improvement = baseNet * progressFactor * (week / 4);
      const targetNet = Math.min(baseNet + improvement, maxQuestions[lesson] * 0.85);
      const actualNet = targetNet + randomFloat(-2, 2);
      const finalNet = Math.max(0, Math.min(actualNet, maxQuestions[lesson]));

      // Net'ten doğru/yanlış/boş hesapla
      const correct = Math.round(finalNet + randomInt(0, 3));
      const maxQ = maxQuestions[lesson];
      const remaining = maxQ - correct;
      const wrong = Math.min(randomInt(Math.floor(remaining * 0.3), Math.floor(remaining * 0.5)), remaining);
      const empty = maxQ - correct - wrong;

      return {
        lesson,
        correct,
        wrong,
        empty,
        net: parseFloat(calculateNet(correct, wrong).toFixed(2)),
      };
    });

  return summary;
};

// AYT Sayısal deneme sonuçları üretici
const generateAYTMockExam = (week: number, progressFactor: number) => {
  const baseNets = {
    'AYT Matematik': 18,
    'AYT Fizik': 7,
    'AYT Kimya': 7,
    'AYT Biyoloji': 6,
  };

  const maxQuestions: Record<string, number> = {
    'AYT Matematik': 40,
    'AYT Fizik': 14,
    'AYT Kimya': 13,
    'AYT Biyoloji': 13,
  };

  const summary = Object.entries(baseNets).map(([lesson, baseNet]) => {
    const improvement = baseNet * progressFactor * (week / 4);
    const targetNet = Math.min(baseNet + improvement, maxQuestions[lesson] * 0.75);
    const actualNet = targetNet + randomFloat(-1.5, 1.5);
    const finalNet = Math.max(0, Math.min(actualNet, maxQuestions[lesson]));

    const correct = Math.round(finalNet + randomInt(0, 2));
    const maxQ = maxQuestions[lesson];
    const remaining = maxQ - correct;
    const wrong = Math.min(randomInt(Math.floor(remaining * 0.3), Math.floor(remaining * 0.5)), remaining);
    const empty = maxQ - correct - wrong;

    return {
      lesson,
      correct,
      wrong,
      empty,
      net: parseFloat(calculateNet(correct, wrong).toFixed(2)),
    };
  });

  return summary;
};

// Günlük çalışma oturumu üretici
const generateDailyStudySessions = (date: Date, dayOfWeek: number) => {
  // Pazar günü daha az çalışma
  const isLightDay = dayOfWeek === 0;
  const sessionCount = isLightDay ? randomInt(2, 3) : randomInt(3, 5);
  
  const sessions = [];
  const availableLessons = [...TYT_LESSONS, ...AYT_SAY_LESSONS];
  
  for (let i = 0; i < sessionCount; i++) {
    const lesson = randomChoice(availableLessons);
    const studyType: StudyType = ['soru-cozumu', 'konu-calismasi', 'tekrar'][weighted([50, 30, 20])] as StudyType;
    
    // Soru çözümü daha uzun sürüyor
    const minutes = studyType === 'soru-cozumu' 
      ? randomInt(60, 90) 
      : studyType === 'konu-calismasi'
      ? randomInt(45, 75)
      : randomInt(30, 50);
    
    const questionCount = studyType === 'soru-cozumu'
      ? randomInt(30, 50)
      : studyType === 'konu-calismasi'
      ? randomInt(10, 25)
      : randomInt(15, 30);
    
    const timeSlot: TimeSlot = i === 0 ? 'sabah' : i < sessionCount - 1 ? 'öğlen' : 'akşam';
    
    sessions.push({
      date: formatDate(date),
      lesson,
      subTopic: undefined,
      minutes,
      questionCount,
      studyType,
      timeSlot,
      notes: undefined,
    });
  }
  
  return sessions;
};

// Ana script
async function main() {
  console.log('🚀 Test kullanıcısı için veri oluşturma başlıyor...\n');

  // 1. Kullanıcı oluştur veya mevcut kullanıcıyı kullan
  console.log('👤 Test kullanıcısı oluşturuluyor...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: TEST_USER.email,
    password: TEST_USER.password,
    email_confirm: true,
    user_metadata: {
      full_name: TEST_USER.fullName,
    },
  });

  if (authError && !authError.message.includes('already been registered')) {
    console.error('❌ Kullanıcı oluşturma hatası:', authError);
    return;
  }

  const userId = authData?.user?.id || (await supabase.auth.admin.listUsers())
    .data.users.find(u => u.email === TEST_USER.email)?.id;

  if (!userId) {
    console.error('❌ Kullanıcı ID bulunamadı!');
    return;
  }

  console.log(`✅ Kullanıcı ID: ${userId}\n`);

  // 2. Profil güncelle
  console.log('📝 Profil bilgileri güncelleniyor...');
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: TEST_USER.fullName,
      study_field: TEST_USER.studyField,
      target_exam: TEST_USER.targetExam,
    })
    .eq('id', userId);

  if (profileError) {
    console.error('❌ Profil güncelleme hatası:', profileError);
  } else {
    console.log('✅ Profil başarıyla güncellendi\n');
  }

  // 3. Son 30 günlük çalışma kayıtları oluştur
  console.log('📚 Günlük çalışma kayıtları oluşturuluyor...');
  const today = new Date();
  const studyEntries = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = addDays(today, -i);
    const dayOfWeek = date.getDay();
    const sessions = generateDailyStudySessions(date, dayOfWeek);
    studyEntries.push(...sessions);
  }

  // Batch insert (her 50 kayıtta bir)
  for (let i = 0; i < studyEntries.length; i += 50) {
    const batch = studyEntries.slice(i, i + 50).map(entry => ({
      user_id: userId,
      date: entry.date,
      lesson: entry.lesson,
      sub_topic: entry.subTopic,
      minutes: entry.minutes,
      question_count: entry.questionCount,
      study_type: entry.studyType,
      time_slot: entry.timeSlot,
      notes: entry.notes,
    }));

    const { error } = await supabase.from('study_entries').insert(batch);
    if (error) {
      console.error(`❌ Çalışma kayıtları ekleme hatası (batch ${Math.floor(i / 50) + 1}):`, error);
    } else {
      console.log(`✅ ${batch.length} çalışma kaydı eklendi (${i + batch.length}/${studyEntries.length})`);
    }
  }

  console.log(`✅ Toplam ${studyEntries.length} çalışma kaydı oluşturuldu\n`);

  // 4. Deneme sınavları oluştur (haftada 2 deneme: 1 TYT, 1 AYT)
  console.log('📝 Deneme sınavları oluşturuluyor...');
  const progressFactor = 0.15; // Aylık %15 gelişim
  
  for (let week = 0; week < 4; week++) {
    // TYT Denemesi (Çarşamba)
    const tytDate = addDays(today, -(28 - week * 7 - 3));
    const tytSummary = generateTYTMockExam(week, progressFactor);
    
    const { data: tytExam, error: tytError } = await supabase
      .from('mock_exams')
      .insert({
        user_id: userId,
        title: `${week + 1}. Hafta TYT Denemesi`,
        date: formatDate(tytDate),
        exam_type: 'TYT',
        duration: 135,
        difficulty: ['kolay', 'orta', 'orta', 'zor'][week],
      })
      .select()
      .single();

    if (tytError) {
      console.error(`❌ TYT Deneme ${week + 1} oluşturma hatası:`, tytError);
    } else if (tytExam) {
      // Deneme detaylarını ekle
      const tytDetails = tytSummary.map(detail => ({
        exam_id: tytExam.id,
        ...detail,
      }));

      const { error: detailsError } = await supabase
        .from('mock_exam_details')
        .insert(tytDetails);

      if (detailsError) {
        console.error(`❌ TYT Deneme ${week + 1} detayları ekleme hatası:`, detailsError);
      } else {
        const totalNet = tytSummary.reduce((sum, d) => sum + d.net, 0);
        console.log(`✅ ${week + 1}. Hafta TYT Denemesi (Toplam Net: ${totalNet.toFixed(2)})`);
      }
    }

    // AYT Denemesi (Cumartesi)
    const aytDate = addDays(today, -(28 - week * 7));
    const aytSummary = generateAYTMockExam(week, progressFactor);
    
    const { data: aytExam, error: aytError } = await supabase
      .from('mock_exams')
      .insert({
        user_id: userId,
        title: `${week + 1}. Hafta AYT Sayısal Denemesi`,
        date: formatDate(aytDate),
        exam_type: 'AYT',
        duration: 180,
        difficulty: ['kolay', 'orta', 'orta', 'zor'][week],
      })
      .select()
      .single();

    if (aytError) {
      console.error(`❌ AYT Deneme ${week + 1} oluşturma hatası:`, aytError);
    } else if (aytExam) {
      const aytDetails = aytSummary.map(detail => ({
        exam_id: aytExam.id,
        ...detail,
      }));

      const { error: detailsError } = await supabase
        .from('mock_exam_details')
        .insert(aytDetails);

      if (detailsError) {
        console.error(`❌ AYT Deneme ${week + 1} detayları ekleme hatası:`, detailsError);
      } else {
        const totalNet = aytSummary.reduce((sum, d) => sum + d.net, 0);
        console.log(`✅ ${week + 1}. Hafta AYT Denemesi (Toplam Net: ${totalNet.toFixed(2)})`);
      }
    }
  }

  console.log('\n✅ Toplam 8 deneme sınavı (4 TYT + 4 AYT) oluşturuldu\n');

  // 5. Hedefler oluştur
  console.log('🎯 Hedefler oluşturuluyor...');
  const goals = [
    { title: 'Günlük Çalışma Süresi', target: 300, current: 280, unit: 'dakika', period: 'günlük' },
    { title: 'Haftalık Soru Çözümü', target: 1500, current: 1320, unit: 'soru', period: 'haftalık' },
    { title: 'TYT Matematik Net', target: 35, current: 28, unit: 'net', period: 'haftalık' },
    { title: 'AYT Matematik Net', target: 25, current: 20, unit: 'net', period: 'haftalık' },
  ];

  for (const goal of goals) {
    const { error } = await supabase.from('goals').insert({
      user_id: userId,
      ...goal,
    });

    if (error) {
      console.error(`❌ Hedef "${goal.title}" oluşturma hatası:`, error);
    } else {
      console.log(`✅ Hedef oluşturuldu: ${goal.title}`);
    }
  }

  // 6. Widget'ları oluştur (GRAFİKLER için gerekli!)
  console.log('\n📊 Grafikler için widget'lar oluşturuluyor...');
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
      console.error(`❌ Widget "${widget.title}" oluşturma hatası:`, error);
    } else {
      console.log(`✅ Widget oluşturuldu: ${widget.title}`);
    }
  }

  console.log('\n🎉 Test kullanıcısı verisi başarıyla oluşturuldu!');
  console.log('\n📧 Giriş Bilgileri:');
  console.log(`   Email: ${TEST_USER.email}`);
  console.log(`   Şifre: ${TEST_USER.password}`);
  console.log(`   Alan: Sayısal`);
  console.log(`   Hedef: ${TEST_USER.targetExam}\n`);
}

// Script'i çalıştır
main().catch(console.error);

