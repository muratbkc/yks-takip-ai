-- Öğrenci alan bilgisini (sayısal, eşit ağırlık, sözel) saklamak için profil tablosuna yeni kolon
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS study_field TEXT
    CHECK (study_field IN ('sayisal', 'esit-agirlik', 'sozel'));

COMMENT ON COLUMN public.profiles.study_field IS
  'Öğrencinin hedef alanı: sayısal, eşit ağırlık veya sözel';

