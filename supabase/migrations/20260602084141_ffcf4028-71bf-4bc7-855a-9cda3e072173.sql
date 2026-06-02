ALTER TABLE public.career_faqs
  ADD COLUMN IF NOT EXISTS question_de text,
  ADD COLUMN IF NOT EXISTS question_fr text,
  ADD COLUMN IF NOT EXISTS question_it text,
  ADD COLUMN IF NOT EXISTS question_en text,
  ADD COLUMN IF NOT EXISTS answer_de text,
  ADD COLUMN IF NOT EXISTS answer_fr text,
  ADD COLUMN IF NOT EXISTS answer_it text,
  ADD COLUMN IF NOT EXISTS answer_en text;

UPDATE public.career_faqs
SET question_de = COALESCE(question_de, question),
    answer_de = COALESCE(answer_de, answer)
WHERE question_de IS NULL OR answer_de IS NULL;