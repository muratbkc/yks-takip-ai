-- YKS Takip AI - Veritabanı Şeması
-- 2026 YKS için öğrenci çalışma takip sistemi

-- 1. Kullanıcı profili tablosu
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    target_exam TEXT DEFAULT 'TYT', -- TYT, AYT-SAY, AYT-SOZ, AYT-EA, YDT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Çalışma kayıtları tablosu
CREATE TABLE IF NOT EXISTS public.study_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    lesson TEXT NOT NULL,
    sub_topic TEXT,
    minutes INTEGER NOT NULL,
    question_count INTEGER NOT NULL,
    notes TEXT,
    study_type TEXT NOT NULL, -- tyt-deneme, ayt-deneme, soru-cozumu, etc.
    time_slot TEXT NOT NULL, -- sabah, öğlen, akşam
    tyt_net DECIMAL(5,2),
    ayt_net DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Deneme sınavları tablosu
CREATE TABLE IF NOT EXISTS public.mock_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER,
    difficulty TEXT NOT NULL, -- kolay, orta, zor
    summary JSONB NOT NULL, -- Array<{ lesson: string, net: number }>
    weak_topics JSONB, -- Array<string>
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Hedefler tablosu
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target DECIMAL(10,2) NOT NULL,
    current DECIMAL(10,2) DEFAULT 0,
    unit TEXT NOT NULL,
    period TEXT NOT NULL, -- günlük, haftalık
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Konu ilerlemesi tablosu
CREATE TABLE IF NOT EXISTS public.topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    missing_topics JSONB, -- Array<string>
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson)
);

-- 6. Bildirimler tablosu
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL, -- uyarı, bilgi, motivasyon
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Widget yapılandırması tablosu
CREATE TABLE IF NOT EXISTS public.widget_configs (
    id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    component TEXT NOT NULL,
    visible BOOLEAN DEFAULT TRUE,
    size TEXT DEFAULT 'md', -- md, lg
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, id)
);

-- İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_study_entries_user_id ON public.study_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_study_entries_date ON public.study_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_mock_exams_user_id ON public.mock_exams(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_exams_date ON public.mock_exams(date DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_user_id ON public.topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_widget_configs_user_id ON public.widget_configs(user_id);

-- Row Level Security (RLS) Politikaları
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_configs ENABLE ROW LEVEL SECURITY;

-- Profiles politikaları
CREATE POLICY "Kullanıcılar kendi profillerini görebilir" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Study entries politikaları
CREATE POLICY "Kullanıcılar kendi kayıtlarını görebilir" 
    ON public.study_entries FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi kayıtlarını ekleyebilir" 
    ON public.study_entries FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi kayıtlarını güncelleyebilir" 
    ON public.study_entries FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi kayıtlarını silebilir" 
    ON public.study_entries FOR DELETE 
    USING (auth.uid() = user_id);

-- Mock exams politikaları
CREATE POLICY "Kullanıcılar kendi denemelerini görebilir" 
    ON public.mock_exams FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi denemelerini ekleyebilir" 
    ON public.mock_exams FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi denemelerini güncelleyebilir" 
    ON public.mock_exams FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi denemelerini silebilir" 
    ON public.mock_exams FOR DELETE 
    USING (auth.uid() = user_id);

-- Goals politikaları
CREATE POLICY "Kullanıcılar kendi hedeflerini görebilir" 
    ON public.goals FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi hedeflerini ekleyebilir" 
    ON public.goals FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi hedeflerini güncelleyebilir" 
    ON public.goals FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi hedeflerini silebilir" 
    ON public.goals FOR DELETE 
    USING (auth.uid() = user_id);

-- Topic progress politikaları
CREATE POLICY "Kullanıcılar kendi konu ilerlemelerini görebilir" 
    ON public.topic_progress FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi konu ilerlemelerini ekleyebilir" 
    ON public.topic_progress FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi konu ilerlemelerini güncelleyebilir" 
    ON public.topic_progress FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi konu ilerlemelerini silebilir" 
    ON public.topic_progress FOR DELETE 
    USING (auth.uid() = user_id);

-- Notifications politikaları
CREATE POLICY "Kullanıcılar kendi bildirimlerini görebilir" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi bildirimlerini ekleyebilir" 
    ON public.notifications FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi bildirimlerini güncelleyebilir" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi bildirimlerini silebilir" 
    ON public.notifications FOR DELETE 
    USING (auth.uid() = user_id);

-- Widget configs politikaları
CREATE POLICY "Kullanıcılar kendi widget ayarlarını görebilir" 
    ON public.widget_configs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi widget ayarlarını ekleyebilir" 
    ON public.widget_configs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi widget ayarlarını güncelleyebilir" 
    ON public.widget_configs FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi widget ayarlarını silebilir" 
    ON public.widget_configs FOR DELETE 
    USING (auth.uid() = user_id);

-- Yeni kullanıcı kaydında otomatik profil oluşturma
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Yeni kullanıcı oluşturulduğunda profil oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger'ları
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.study_entries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.mock_exams
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.topic_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.widget_configs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

