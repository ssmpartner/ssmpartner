
-- VAG45 Downloads table
CREATE TABLE public.vag45_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lang TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vag45_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read vag45 downloads" ON public.vag45_downloads FOR SELECT TO public USING (true);
CREATE POLICY "Auth users can insert vag45 downloads" ON public.vag45_downloads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update vag45 downloads" ON public.vag45_downloads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete vag45 downloads" ON public.vag45_downloads FOR DELETE TO authenticated USING (true);

-- VAG45 Partners table
CREATE TABLE public.vag45_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL DEFAULT 'life',
  branch TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  privacy_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vag45_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read vag45 partners" ON public.vag45_partners FOR SELECT TO public USING (true);
CREATE POLICY "Auth users can insert vag45 partners" ON public.vag45_partners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update vag45 partners" ON public.vag45_partners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete vag45 partners" ON public.vag45_partners FOR DELETE TO authenticated USING (true);

-- Seed downloads
INSERT INTO public.vag45_downloads (lang, description, url, sort_order) VALUES
('Deutsch', 'Informationen gemäss Art. 45 Versicherungsaufsichtsgesetz', 'https://ssmpartner.ch/assets/25-07-10_Artikel_VAG45_D_5.1.pdf', 0),
('Français', 'Informations selon l''art. 45 de la loi sur la surveillance des assurances', 'https://ssmpartner.ch/assets/25-07-10_Artikel_VAG45_F_5.1.pdf', 1),
('Italiano', 'Informazioni ai sensi dell''art 45 della Legge sulla sorveglianza degli assicuratori', 'https://ssmpartner.ch/assets/25-07-10_Artikel_VAG45_I_5.1.pdf', 2);

-- Seed life insurance partners
INSERT INTO public.vag45_partners (section, branch, category, company, address, contact_email, privacy_url, sort_order) VALUES
('life', 'Kollektivlebensversicherung im Rahmen der beruflichen Vorsorge', 'FINMA-Kategorie A1', 'Allianz Suisse Lebensversicherungs-Gesellschaft AG', 'Richtiplatz 1, 8304 Wallisellen', 'feedback@allianz-suisse.ch', 'https://www.allianz.ch/de/informationen/datenschutz.html', 0),
('life', 'Anteilsgebundene Lebensversicherung', 'FINMA-Kategorie A2', 'Lichtenstein Life Assurance AG', 'Industriering 37, 9491 Ruggell', 'info@lichtensteinlife.com', 'https://liechtensteinlife.com/de-DE/markets/de/datenschutz', 1),
('life', 'Sonstige Lebensversicherung', 'FINMA-Kategorie A3', 'Visana Versicherungen AG', 'Weltpoststrasse 19, 3015 Bern', 'info@visana.ch', 'https://www.visana.ch/de/visana/rechtliches/datenschutz', 2);

-- Seed damage insurance partners
INSERT INTO public.vag45_partners (section, branch, category, company, address, contact_email, privacy_url, sort_order) VALUES
('damage', 'Unfall- und Kranken-Zusatzversicherung', 'FINMA-Kategorie B1, B2', 'Visana Versicherungen AG', 'Weltpoststrasse 19, 3015 Bern', 'info@visana.ch', 'https://www.visana.ch/de/visana/rechtliches/datenschutz', 0),
('damage', 'Motorfahrzeugversicherung (Kategorie M) + N', 'FINMA-Kategorie B3, B10', 'TSM Compagnie d''assurance, Société coopérative', 'Rue Jaquet-Droz 43b, 2300 La Chaux-de-Fonds', 'info@tsm.ch', 'https://tsm.ch/datenschutzrichtlinie-und-datenverarbeitung/?l=de', 1),
('damage', 'Motorfahrzeugversicherung (Kategorie L, T, G, R)', 'FINMA-Kategorie B3, B10', 'Allianz Suisse Lebensversicherungs-Gesellschaft AG', 'Richtiplatz 1, 8304 Wallisellen', 'feedback@allianz-suisse.ch', 'https://www.allianz.ch/de/informationen/datenschutz.html', 2),
('damage', 'Luftfahrtversicherung', 'FINMA-Kategorie B5', 'Allianz Suisse Lebensversicherungs-Gesellschaft AG', 'Richtiplatz 1, 8304 Wallisellen', 'feedback@allianz-suisse.ch', 'https://www.allianz.ch/de/informationen/datenschutz.html', 3),
('damage', 'Bootversicherung', 'FINMA-Kategorie B6, B12', 'Allianz Suisse Lebensversicherungs-Gesellschaft AG', 'Richtiplatz 1, 8304 Wallisellen', 'feedback@allianz-suisse.ch', 'https://www.allianz.ch/de/informationen/datenschutz.html', 4),
('damage', 'Hausrat- und Gebäudeversicherung', 'FINMA-Kategorie B8, B9', 'Visana Allgemeine Versicherungen AG', 'Weltpoststrasse 19, 3015 Bern', 'info@visana.ch', 'https://www.visana.ch/de/visana/rechtliches/datenschutz', 5),
('damage', 'Haftpflichtversicherung (Privatkunden)', 'FINMA-Kategorie B13', 'Visana Allgemeine Versicherungen AG', 'Weltpoststrasse 19, 3015 Bern', 'info@visana.ch', 'https://www.visana.ch/de/visana/rechtliches/datenschutz', 6),
('damage', 'Haftpflichtversicherung (Unternehmenskunden)', 'FINMA-Kategorie B13', 'Allianz Suisse Lebensversicherungs-Gesellschaft AG', 'Richtiplatz 1, 8304 Wallisellen', 'feedback@allianz-suisse.ch', 'https://www.allianz.ch/de/informationen/datenschutz.html', 7),
('damage', 'Kautionsversicherung', 'FINMA-Kategorie B15', 'Allianz Suisse Lebensversicherungs-Gesellschaft AG', 'Richtiplatz 1, 8304 Wallisellen', 'feedback@allianz-suisse.ch', 'https://www.allianz.ch/de/informationen/datenschutz.html', 8),
('damage', 'Rechtsschutzversicherung', 'FINMA-Kategorie B17', 'CAP Rechtsschutz-Versicherungsgesellschaft AG', 'Neue Winterthurerstrasse 88, 8304 Wallisellen', 'feedback@allianz-suisse.ch', 'https://www.allianz.ch/de/informationen/datenschutz.html', 9),
('damage', 'Touristische Beistandsleistung', 'FINMA-Kategorie B18', 'Allianz Suisse Lebensversicherungs-Gesellschaft AG', 'Richtiplatz 1, 8304 Wallisellen', 'feedback@allianz-suisse.ch', 'https://www.allianz.ch/de/informationen/datenschutz.html', 10);
