export type Language = "de" | "fr" | "it" | "en";

export const translations: Record<string, Record<Language, string>> = {
  // Nav
  "nav.home": { de: "HOME", fr: "ACCUEIL", it: "HOME", en: "HOME" },
  "nav.team": { de: "TEAM", fr: "ÉQUIPE", it: "TEAM", en: "TEAM" },
  "nav.career": { de: "KARRIERE", fr: "CARRIÈRE", it: "CARRIERA", en: "CAREERS" },
  "nav.vag": { de: "VAG 45", fr: "LSA 45", it: "LSA 45", en: "ISA 45" },
  "nav.cta": { de: "Kontakt aufnehmen", fr: "Nous contacter", it: "Contattaci", en: "Contact us" },

  // Phone bar
  "home.phone.title": { de: "Sie haben eine Frage?", fr: "Vous avez une question?", it: "Avete una domanda?", en: "Do you have a question?" },
  "home.phone.sub": { de: "Wir freuen uns auf Ihren Anruf.", fr: "Nous nous réjouissons de votre appel.", it: "Saremo lieti di ricevere la vostra chiamata.", en: "We look forward to your call." },

  // Home Hero
  "home.hero.title": { de: "Ihr Partner für Finanzen.", fr: "Votre partenaire financier.", it: "Il vostro partner finanziario.", en: "Your financial partner." },
  "home.hero.sub": { de: "Massgeschneiderte Lösungen für Versicherung, Vorsorge und Finanzierung.", fr: "Des solutions sur mesure pour l'assurance, la prévoyance et le financement.", it: "Soluzioni su misura per assicurazioni, previdenza e finanziamenti.", en: "Tailored solutions for insurance, pension planning and financing." },
  "home.hero.cta": { de: "Beratung anfragen →", fr: "Demander un conseil →", it: "Richiedi consulenza →", en: "Request consultation →" },

  // Stats
  "home.stats.coaches": { de: "Finanzcoaches", fr: "Coachs financiers", it: "Coach finanziari", en: "Financial coaches" },
  "home.stats.consultations": { de: "Beratungen", fr: "Consultations", it: "Consulenze", en: "Consultations" },
  "home.stats.years": { de: "Jahre Erfahrung", fr: "Ans d'expérience", it: "Anni di esperienza", en: "Years of experience" },

  // Services
  "home.services.title": { de: "Was wir tun", fr: "Ce que nous faisons", it: "Cosa facciamo", en: "What we do" },
  "home.services.1.title": { de: "Versicherungsberatung", fr: "Conseil en assurances", it: "Consulenza assicurativa", en: "Insurance advisory" },
  "home.services.1.desc": { de: "Unabhängige Analyse und Optimierung Ihrer Versicherungslösungen.", fr: "Analyse indépendante et optimisation de vos solutions d'assurance.", it: "Analisi indipendente e ottimizzazione delle vostre soluzioni assicurative.", en: "Independent analysis and optimization of your insurance solutions." },
  "home.services.2.title": { de: "Vorsorge & Finanzplanung", fr: "Prévoyance & planification", it: "Previdenza & pianificazione", en: "Pension & financial planning" },
  "home.services.2.desc": { de: "Ganzheitliche Planung für Ihre finanzielle Zukunft.", fr: "Planification globale pour votre avenir financier.", it: "Pianificazione globale per il vostro futuro finanziario.", en: "Holistic planning for your financial future." },
  "home.services.3.title": { de: "Unternehmensberatung", fr: "Conseil aux entreprises", it: "Consulenza aziendale", en: "Corporate advisory" },
  "home.services.3.desc": { de: "Massgeschneiderte Lösungen für KMU und Grossunternehmen.", fr: "Solutions sur mesure pour PME et grandes entreprises.", it: "Soluzioni su misura per PMI e grandi aziende.", en: "Tailored solutions for SMEs and large enterprises." },

  // Trust
  "home.trust.quote": { de: "«Wir bringen Transparenz in den unübersichtlichen Markt der Versicherungs- und Finanzierungsangebote.»", fr: "«Nous apportons de la transparence dans le marché complexe des assurances et des financements.»", it: "«Portiamo trasparenza nel complesso mercato delle assicurazioni e dei finanziamenti.»", en: "\"We bring transparency to the complex market of insurance and financing offers.\"" },
  "home.trust.author": { de: "— SSM Partner AG, Rothenburg", fr: "— SSM Partner AG, Rothenburg", it: "— SSM Partner AG, Rothenburg", en: "— SSM Partner AG, Rothenburg" },

  // About
  "about.title": { de: "Wer wir sind", fr: "Qui nous sommes", it: "Chi siamo", en: "Who we are" },
  "about.text": { de: "SSM Partner AG ist ein Schweizer Unternehmen mit Hauptsitz in Rothenburg/Ebikon, Kanton Luzern. Mit über 100 Mitarbeitenden und einem technologiegetriebenen Ansatz bringen wir Transparenz in den Finanz- und Versicherungsmarkt. Unser ganzheitliches Finanzcoaching-Konzept begleitet unsere Kunden in allen Lebensbereichen — von der Vorsorge über die Versicherung bis zur Finanzierung. Unter der Leitung von CEO Martin Killer setzen wir auf Innovation, Unabhängigkeit und langfristige Partnerschaften.", fr: "SSM Partner AG est une entreprise suisse basée à Rothenburg/Ebikon, canton de Lucerne. Avec plus de 100 collaborateurs et une approche axée sur la technologie, nous apportons de la transparence sur le marché financier et des assurances. Notre concept de coaching financier holistique accompagne nos clients dans tous les domaines de la vie. Sous la direction du CEO Martin Killer, nous misons sur l'innovation, l'indépendance et les partenariats à long terme.", it: "SSM Partner AG è un'azienda svizzera con sede a Rothenburg/Ebikon, Canton Lucerna. Con oltre 100 collaboratori e un approccio orientato alla tecnologia, portiamo trasparenza nel mercato finanziario e assicurativo. Il nostro concetto olistico di coaching finanziario accompagna i clienti in tutti gli ambiti della vita. Sotto la guida del CEO Martin Killer, puntiamo su innovazione, indipendenza e partnership a lungo termine.", en: "SSM Partner AG is a Swiss company headquartered in Rothenburg/Ebikon, Canton of Lucerne. With over 100 employees and a technology-driven approach, we bring transparency to the financial and insurance market. Our holistic financial coaching concept accompanies clients across all areas of life — from pension planning to insurance and financing. Under the leadership of CEO Martin Killer, we focus on innovation, independence and long-term partnerships." },

  // Values
  "about.values.title": { de: "Unsere Werte", fr: "Nos valeurs", it: "I nostri valori", en: "Our values" },
  "about.values.1.title": { de: "Unabhängigkeit", fr: "Indépendance", it: "Indipendenza", en: "Independence" },
  "about.values.1.desc": { de: "Wir wählen die besten Lösungen aus dem gesamten Markt.", fr: "Nous sélectionnons les meilleures solutions sur l'ensemble du marché.", it: "Selezioniamo le migliori soluzioni dall'intero mercato.", en: "We select the best solutions from the entire market." },
  "about.values.2.title": { de: "Ganzheitlichkeit", fr: "Approche globale", it: "Approccio olistico", en: "Holistic approach" },
  "about.values.2.desc": { de: "Wir betrachten alle Lebensbereiche.", fr: "Nous considérons tous les domaines de la vie.", it: "Consideriamo tutti gli ambiti della vita.", en: "We consider all areas of life." },
  "about.values.3.title": { de: "Partnerschaft", fr: "Partenariat", it: "Partnership", en: "Partnership" },
  "about.values.3.desc": { de: "Ihr Finanzcoach begleitet Sie langfristig.", fr: "Votre coach financier vous accompagne sur le long terme.", it: "Il vostro coach finanziario vi accompagna a lungo termine.", en: "Your financial coach accompanies you long-term." },

  // Leadership
  "about.team.title": { de: "Geschäftsleitung", fr: "Direction", it: "Direzione", en: "Leadership" },
  "about.team.member": { de: "Geschäftsleitung", fr: "Direction", it: "Direzione", en: "Management" },

  // Career
  "career.hero.title": { de: "Starten Sie Ihre Karriere als Finanzcoach.", fr: "Lancez votre carrière de coach financier.", it: "Iniziate la vostra carriera come coach finanziario.", en: "Start your career as a financial coach." },
  "career.hero.sub": { de: "Flexible Arbeit, transparente Karrierewege und fundierte Ausbildung warten auf Sie.", fr: "Travail flexible, parcours de carrière transparents et formation solide vous attendent.", it: "Lavoro flessibile, percorsi di carriera trasparenti e formazione solida vi aspettano.", en: "Flexible work, transparent career paths and solid training await you." },
  "career.hero.cta": { de: "Jetzt bewerben →", fr: "Postuler maintenant →", it: "Candidati ora →", en: "Apply now →" },

  // Why SSM
  "career.why.1.title": { de: "Flexible Arbeitsgestaltung", fr: "Organisation flexible du travail", it: "Organizzazione flessibile del lavoro", en: "Flexible work arrangements" },
  "career.why.1.desc": { de: "Gestalten Sie Ihren Arbeitsalltag nach Ihren Vorstellungen.", fr: "Organisez votre quotidien professionnel selon vos souhaits.", it: "Organizzate la vostra giornata lavorativa secondo le vostre esigenze.", en: "Design your working day according to your preferences." },
  "career.why.2.title": { de: "Leistungsabhängige Vergütung", fr: "Rémunération liée aux performances", it: "Retribuzione basata sulle prestazioni", en: "Performance-based compensation" },
  "career.why.2.desc": { de: "Ihr Einsatz wird direkt und transparent honoriert.", fr: "Votre engagement est récompensé directement et de manière transparente.", it: "Il vostro impegno viene ricompensato in modo diretto e trasparente.", en: "Your commitment is rewarded directly and transparently." },
  "career.why.3.title": { de: "Aus- und Weiterbildung", fr: "Formation continue", it: "Formazione continua", en: "Training & development" },
  "career.why.3.desc": { de: "Fundierte Programme für Ihren langfristigen Erfolg.", fr: "Des programmes solides pour votre succès à long terme.", it: "Programmi solidi per il vostro successo a lungo termine.", en: "Solid programs for your long-term success." },

  // Positions
  "career.positions.title": { de: "Offene Stellen", fr: "Postes ouverts", it: "Posizioni aperte", en: "Open positions" },
  "career.positions.role": { de: "Position", fr: "Poste", it: "Posizione", en: "Position" },
  "career.positions.location": { de: "Standort", fr: "Lieu", it: "Sede", en: "Location" },
  "career.positions.workload": { de: "Pensum", fr: "Taux", it: "Percentuale", en: "Workload" },
  "career.positions.more": { de: "Mehr →", fr: "Plus →", it: "Dettagli →", en: "More →" },
  "career.positions.spontaneous": { de: "Keine passende Stelle? Initiativbewerbung →", fr: "Aucun poste correspondant ? Candidature spontanée →", it: "Nessuna posizione adatta? Candidatura spontanea →", en: "No suitable position? Spontaneous application →" },

  // Onboarding
  "career.onboarding.title": { de: "Ihr Weg zu uns", fr: "Votre parcours", it: "Il vostro percorso", en: "Your journey" },
  "career.onboarding.1.title": { de: "Bewerbung", fr: "Candidature", it: "Candidatura", en: "Application" },
  "career.onboarding.1.desc": { de: "Senden Sie uns Ihre Unterlagen.", fr: "Envoyez-nous vos documents.", it: "Inviateci i vostri documenti.", en: "Send us your documents." },
  "career.onboarding.2.title": { de: "Gespräch", fr: "Entretien", it: "Colloquio", en: "Interview" },
  "career.onboarding.2.desc": { de: "Lernen wir uns kennen.", fr: "Apprenons à nous connaître.", it: "Conosciamoci.", en: "Let's get to know each other." },
  "career.onboarding.3.title": { de: "Ausbildung", fr: "Formation", it: "Formazione", en: "Training" },
  "career.onboarding.3.desc": { de: "Intensive Einarbeitung und Zertifizierung.", fr: "Formation intensive et certification.", it: "Formazione intensiva e certificazione.", en: "Intensive onboarding and certification." },
  "career.onboarding.4.title": { de: "Karrierestart", fr: "Début de carrière", it: "Inizio carriera", en: "Career start" },
  "career.onboarding.4.desc": { de: "Starten Sie als Finanzcoach durch.", fr: "Lancez-vous en tant que coach financier.", it: "Iniziate come coach finanziario.", en: "Launch your career as a financial coach." },

  // Contact
  "contact.title": { de: "Sprechen wir.", fr: "Parlons-en.", it: "Parliamone.", en: "Let's talk." },
  "contact.form.name": { de: "Name", fr: "Nom", it: "Nome", en: "Name" },
  "contact.form.email": { de: "E-Mail", fr: "E-mail", it: "E-mail", en: "Email" },
  "contact.form.phone": { de: "Telefon", fr: "Téléphone", it: "Telefono", en: "Phone" },
  "contact.form.subject": { de: "Betreff", fr: "Objet", it: "Oggetto", en: "Subject" },
  "contact.form.subject.private": { de: "Privatberatung", fr: "Conseil privé", it: "Consulenza privata", en: "Private advisory" },
  "contact.form.subject.corporate": { de: "Unternehmensberatung", fr: "Conseil aux entreprises", it: "Consulenza aziendale", en: "Corporate advisory" },
  "contact.form.subject.career": { de: "Karriere", fr: "Carrière", it: "Carriera", en: "Career" },
  "contact.form.subject.other": { de: "Sonstiges", fr: "Autre", it: "Altro", en: "Other" },
  "contact.form.message": { de: "Nachricht", fr: "Message", it: "Messaggio", en: "Message" },
  "contact.form.submit": { de: "Anfrage senden", fr: "Envoyer la demande", it: "Invia richiesta", en: "Send request" },
  "contact.form.required": { de: "Pflichtfeld", fr: "Champ obligatoire", it: "Campo obbligatorio", en: "Required field" },

  // Footer
  "footer.imprint": { de: "Impressum", fr: "Mentions légales", it: "Impressum", en: "Imprint" },
  "footer.privacy": { de: "Datenschutz", fr: "Protection des données", it: "Privacy", en: "Privacy" },
  "footer.terms": { de: "AGB", fr: "CGV", it: "CG", en: "Terms" },
};
