
CREATE TABLE public.chatbot_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'general',
  question text NOT NULL DEFAULT '',
  answer text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chatbot knowledge" ON public.chatbot_knowledge FOR SELECT TO public USING (true);
CREATE POLICY "Auth users can insert chatbot knowledge" ON public.chatbot_knowledge FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update chatbot knowledge" ON public.chatbot_knowledge FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete chatbot knowledge" ON public.chatbot_knowledge FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_chatbot_knowledge_updated_at BEFORE UPDATE ON public.chatbot_knowledge FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
