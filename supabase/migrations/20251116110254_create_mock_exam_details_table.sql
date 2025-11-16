-- Yeni tablo: mock_exam_details
-- Her denemenin her ders sonucunu ayrı bir satırda saklar.
CREATE TABLE IF NOT EXISTS public.mock_exam_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.mock_exams(id) ON DELETE CASCADE,
    lesson TEXT NOT NULL,
    correct INTEGER NOT NULL,
    wrong INTEGER NOT NULL,
    empty INTEGER NOT NULL,
    net DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eski 'summary' kolonunu 'mock_exams' tablosundan kaldır.
-- exam_type kolonu ekle
ALTER TABLE public.mock_exams
DROP COLUMN IF EXISTS summary;

ALTER TABLE public.mock_exams
ADD COLUMN IF NOT EXISTS exam_type TEXT CHECK (exam_type IN ('TYT', 'AYT', 'Ders'));

-- Yeni tablo için RLS politikaları
ALTER TABLE public.mock_exam_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi deneme detaylarını görebilir"
ON public.mock_exam_details FOR SELECT
USING (auth.uid() = (SELECT user_id FROM public.mock_exams WHERE id = exam_id));

CREATE POLICY "Kullanıcılar kendi deneme detaylarını ekleyebilir"
ON public.mock_exam_details FOR INSERT
WITH CHECK (auth.uid() = (SELECT user_id FROM public.mock_exams WHERE id = exam_id));

-- İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_mock_exam_details_exam_id ON public.mock_exam_details(exam_id);
