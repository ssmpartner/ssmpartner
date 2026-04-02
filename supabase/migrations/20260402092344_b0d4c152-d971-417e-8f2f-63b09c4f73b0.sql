
CREATE TABLE public.wizard_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'basis',
  label TEXT NOT NULL DEFAULT '',
  price_text TEXT NOT NULL DEFAULT '',
  price_value NUMERIC DEFAULT NULL,
  description TEXT DEFAULT '',
  api_source TEXT DEFAULT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category, tier)
);

ALTER TABLE public.wizard_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read wizard pricing" ON public.wizard_pricing FOR SELECT TO public USING (true);
CREATE POLICY "Auth users can insert wizard pricing" ON public.wizard_pricing FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update wizard pricing" ON public.wizard_pricing FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete wizard pricing" ON public.wizard_pricing FOR DELETE TO authenticated USING (true);

-- Seed with default pricing
INSERT INTO public.wizard_pricing (category, tier, label, price_text, price_value, description, sort_order) VALUES
('hausrat', 'basis', 'Basis', 'ab CHF 8.–/Mt.', 8, 'Solider Grundschutz zum besten Preis', 1),
('hausrat', 'komfort', 'Komfort', 'ab CHF 15.–/Mt.', 15, 'Erweiterter Schutz für mehr Sicherheit', 2),
('hausrat', 'premium', 'Premium', 'ab CHF 25.–/Mt.', 25, 'Maximaler Schutz ohne Kompromisse', 3),
('auto', 'basis', 'Basis', 'ab CHF 45.–/Mt.', 45, 'Haftpflicht-Grunddeckung', 1),
('auto', 'komfort', 'Komfort', 'ab CHF 75.–/Mt.', 75, 'Haftpflicht + Teilkasko', 2),
('auto', 'premium', 'Premium', 'ab CHF 110.–/Mt.', 110, 'Haftpflicht + Vollkasko', 3),
('rechtsschutz', 'basis', 'Basis', 'ab CHF 12.–/Mt.', 12, 'Privat-Rechtsschutz', 1),
('rechtsschutz', 'komfort', 'Komfort', 'ab CHF 22.–/Mt.', 22, 'Privat + Verkehr', 2),
('rechtsschutz', 'premium', 'Premium', 'ab CHF 35.–/Mt.', 35, 'Rundum-Rechtsschutz', 3),
('vorsorge', 'basis', 'Basis', 'Sparkonto 3a', NULL, 'Klassisches Sparkonto', 1),
('vorsorge', 'komfort', 'Komfort', 'Fonds-Lösung', NULL, 'Fonds-basierte Vorsorge', 2),
('vorsorge', 'premium', 'Premium', 'Individuelle Strategie', NULL, 'Massgeschneiderte Lösung', 3),
('leben', 'basis', 'Basis', 'ab CHF 30.–/Mt.', 30, 'Risikolebensversicherung', 1),
('leben', 'komfort', 'Komfort', 'ab CHF 55.–/Mt.', 55, 'Gemischte Lebensversicherung', 2),
('leben', 'premium', 'Premium', 'ab CHF 90.–/Mt.', 90, 'Fondsgebundene Lebensversicherung', 3),
('krankenkasse', 'basis', 'Basis', 'Grundversicherung', NULL, 'OKP Grundversicherung', 1),
('krankenkasse', 'komfort', 'Komfort', 'Grund + Spital halbprivat', NULL, 'Grundversicherung + Spital halbprivat', 2),
('krankenkasse', 'premium', 'Premium', 'Grund + Spital privat + Zusatz', NULL, 'Vollpaket mit Zusatzversicherung', 3);
