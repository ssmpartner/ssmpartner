export type Language = "de" | "fr" | "it" | "en";

export const translations: Record<string, Record<Language, string>> = {
  // Nav
  "nav.home": { de: "Home", fr: "Accueil", it: "Home", en: "Home" },
  "nav.about": { de: "Über uns", fr: "À propos", it: "Chi siamo", en: "About" },
  "nav.team": { de: "Team", fr: "Équipe", it: "Team", en: "Team" },
  "nav.career": { de: "Karriere", fr: "Carrière", it: "Carriera", en: "Careers" },
  "nav.vag": { de: "VAG45", fr: "LSA45", it: "LSA45", en: "ISA45" },
  "nav.cta": { de: "Kontakt", fr: "Contact", it: "Contatto", en: "Contact" },

  // Navbar subtext (next to logo)
  "nav.subtext.1": { de: "Eine Tochtergesellschaft der Visana-Gruppe.", fr: "Une filiale du groupe Visana.", it: "Una società affiliata del gruppo Visana.", en: "A subsidiary of the Visana Group." },
  "nav.subtext.2": { de: "Gebundener Vermittler gemäss VAG.", fr: "Intermédiaire lié selon la LSA.", it: "Intermediario vincolato secondo la LSA.", en: "Tied intermediary under the ISA." },

  // Home - Overlap CTA bar
  "home.overlap.cta": { de: "Jetzt Kontakt aufnehmen", fr: "Nous contacter", it: "Contattaci ora", en: "Contact us now" },

  // Home - Quickstart cards (slider tiles)
  "home.quickstart.1.title": { de: "Karriere starten", fr: "Démarrer votre carrière", it: "Inizia la tua carriera", en: "Start your career" },
  "home.quickstart.1.desc": { de: "Entdecke offene Stellen bei SSM", fr: "Découvrez les postes ouverts chez SSM", it: "Scopri le posizioni aperte presso SSM", en: "Discover open positions at SSM" },
  "home.quickstart.2.title": { de: "Unsere Agenturen", fr: "Nos agences", it: "Le nostre agenzie", en: "Our agencies" },
  "home.quickstart.2.desc": { de: "Finde deinen Standort in der Nähe", fr: "Trouvez une agence près de chez vous", it: "Trova una sede vicino a te", en: "Find a location near you" },

  // Home - Who section
  "home.who.label": { de: "Über SSM Partner", fr: "À propos de SSM Partner", it: "Su SSM Partner", en: "About SSM Partner" },
  "home.who.locations": { de: "Unsere Standorte", fr: "Nos sites", it: "Le nostre sedi", en: "Our locations" },

  // Home - Services section
  "home.services.label": { de: "Unsere Dienstleistungen", fr: "Nos services", it: "I nostri servizi", en: "Our services" },

  // Home - Agencies teaser
  "home.agencies.label": { de: "Schweizweit für Sie da", fr: "À votre service dans toute la Suisse", it: "Al vostro servizio in tutta la Svizzera", en: "At your service throughout Switzerland" },
  "home.agencies.title": { de: "Unsere Standorte", fr: "Nos sites", it: "Le nostre sedi", en: "Our locations" },
  "home.agencies.all": { de: "Alle Agenturen", fr: "Toutes les agences", it: "Tutte le agenzie", en: "All agencies" },

  // Home - Career CTA
  "home.career.label": { de: "Karriere", fr: "Carrière", it: "Carriera", en: "Career" },
  "home.career.title": { de: "Werde Teil unseres Teams", fr: "Rejoignez notre équipe", it: "Entra a far parte del nostro team", en: "Join our team" },
  "home.career.body": { de: "Entdecke spannende Karrieremöglichkeiten bei SSM Partner. Wir bieten dir ein inspirierendes Arbeitsumfeld, faire Vergütung und echte Entwicklungsperspektiven.", fr: "Découvrez des opportunités de carrière passionnantes chez SSM Partner. Nous vous offrons un environnement de travail inspirant, une rémunération équitable et de réelles perspectives d'évolution.", it: "Scopri interessanti opportunità di carriera presso SSM Partner. Ti offriamo un ambiente di lavoro stimolante, una retribuzione equa e reali prospettive di sviluppo.", en: "Discover exciting career opportunities at SSM Partner. We offer you an inspiring work environment, fair compensation, and real development prospects." },
  "home.career.cta": { de: "Karriere entdecken", fr: "Découvrir les carrières", it: "Scopri le carriere", en: "Discover careers" },
  "home.career.tag.1": { de: "Work-Life-Balance", fr: "Équilibre vie pro/perso", it: "Equilibrio vita-lavoro", en: "Work-life balance" },
  "home.career.tag.2": { de: "Weiterbildung", fr: "Formation continue", it: "Formazione continua", en: "Training" },
  "home.career.tag.3": { de: "Starkes Team", fr: "Une équipe forte", it: "Squadra forte", en: "Strong team" },
  "home.career.jobs": { de: "offene Stellen warten auf dich", fr: "postes ouverts vous attendent", it: "posizioni aperte ti aspettano", en: "open positions waiting for you" },

  // Home - Contact section
  "home.contact.label": { de: "Kontakt", fr: "Contact", it: "Contatto", en: "Contact" },
  "home.contact.title": { de: "Lassen Sie uns ins Gespräch kommen", fr: "Entrons en contact", it: "Mettiamoci in contatto", en: "Let's get in touch" },
  "home.contact.body": { de: "Ob Versicherungsfrage, Finanzplanung oder Karriereanfrage — wir sind persönlich für Sie da. Schreiben Sie uns oder besuchen Sie uns direkt.", fr: "Question d'assurance, planification financière ou demande de carrière — nous sommes personnellement à votre disposition. Écrivez-nous ou rendez-nous visite directement.", it: "Domande sulle assicurazioni, pianificazione finanziaria o richieste di carriera — siamo personalmente a vostra disposizione. Scriveteci o venite a trovarci direttamente.", en: "Whether it's an insurance question, financial planning or a career inquiry — we are personally there for you. Write to us or visit us directly." },
  "home.contact.cta": { de: "Kontakt aufnehmen", fr: "Nous contacter", it: "Contattaci", en: "Get in touch" },
  "home.contact.nearby": { de: "Agentur in Ihrer Nähe", fr: "Une agence près de chez vous", it: "Un'agenzia vicino a te", en: "Agency near you" },


  // Phone bar
  "home.phone.title": { de: "Sie haben eine Frage?", fr: "Vous avez une question?", it: "Avete una domanda?", en: "Do you have a question?" },
  "home.phone.sub": { de: "Wir freuen uns auf Ihren Anruf.", fr: "Nous nous réjouissons de votre appel.", it: "Saremo lieti di ricevere la vostra chiamata.", en: "We look forward to your call." },

  // Home - Wer wir sind
  "home.who.title": { de: "Wer wir sind", fr: "Qui nous sommes", it: "Chi siamo", en: "Who we are" },
  "home.who.text": { de: "Die SSM Partner AG ist eine gebundene Versicherungsvermittlerin und eine Tochtergesellschaft der Visana-Gruppe. Wir arbeiten mit ausgewählten, Partnern zusammen und unterstützen sie dabei, den Vertrieb von Finanz- und Versicherungsprodukten effizient, zuverlässig und abgestimmt zu gestalten.", fr: "SSM Partner SA est un intermédiaire d'assurance lié et une filiale du groupe Visana. Nous travaillons avec des partenaires sélectionnés et les soutenons dans la distribution efficace, fiable et coordonnée de produits financiers et d'assurance.", it: "SSM Partner SA è un intermediario assicurativo vincolato e una società affiliata del gruppo Visana. Lavoriamo con partner selezionati e li supportiamo nella distribuzione efficiente, affidabile e coordinata di prodotti finanziari e assicurativi.", en: "SSM Partner AG is a tied insurance intermediary and a subsidiary of the Visana Group. We work with selected partners and support them in distributing financial and insurance products efficiently, reliably and in a coordinated manner." },
  "home.who.cta": { de: "TEAM KENNENLERNEN", fr: "DÉCOUVRIR L'ÉQUIPE", it: "SCOPRI IL TEAM", en: "MEET THE TEAM" },

  // Home - Headquarter
  "home.hq.title": { de: "Unser Headquarter", fr: "Notre siège", it: "La nostra sede", en: "Our Headquarters" },
  "home.hq.sub": { de: "in Rothenburg, beantwortet gerne Ihre offenen Fragen.", fr: "à Rothenburg, répond volontiers à vos questions.", it: "a Rothenburg, risponde volentieri alle vostre domande.", en: "in Rothenburg, is happy to answer your questions." },

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
  "footer.sitemap": { de: "Sitemap", fr: "Plan du site", it: "Mappa del sito", en: "Sitemap" },
  "footer.contact": { de: "Kontakt", fr: "Contact", it: "Contatto", en: "Contact" },
  "footer.social": { de: "Social Media", fr: "Réseaux sociaux", it: "Social Media", en: "Social Media" },
  "footer.rights": { de: "Alle Rechte vorbehalten.", fr: "Tous droits réservés.", it: "Tutti i diritti riservati.", en: "All rights reserved." },

  // Agencies page
  "agencies.intro.title": { de: "Unsere Agenturen", fr: "Nos agences", it: "Le nostre agenzie", en: "Our agencies" },
  "agencies.intro.body": { de: "Entdecken Sie die Agenturen der SSM Partner AG und finden Sie die richtigen Ansprechpersonen in Ihrer Nähe. Mit {count} Standorten in der ganzen Schweiz sind wir immer für Sie da.", fr: "Découvrez les agences de SSM Partner SA et trouvez les bons interlocuteurs près de chez vous. Avec {count} sites dans toute la Suisse, nous sommes toujours à votre disposition.", it: "Scoprite le agenzie di SSM Partner SA e trovate i giusti referenti vicino a voi. Con {count} sedi in tutta la Svizzera, siamo sempre al vostro fianco.", en: "Discover the agencies of SSM Partner AG and find the right contacts near you. With {count} locations across Switzerland, we are always there for you." },
  "agencies.badge.locations": { de: "Standorte", fr: "Sites", it: "Sedi", en: "Locations" },
  "agencies.badge.localTeams": { de: "Lokale Teams", fr: "Équipes locales", it: "Team locali", en: "Local teams" },
  "agencies.badge.advice": { de: "Persönliche Beratung", fr: "Conseil personnalisé", it: "Consulenza personalizzata", en: "Personal advice" },
  "agencies.cta.title": { de: "Moderne Büroräumlichkeiten. Persönliche Beratung.", fr: "Bureaux modernes. Conseil personnalisé.", it: "Uffici moderni. Consulenza personalizzata.", en: "Modern offices. Personal advice." },
  "agencies.cta.body": { de: "Jede unserer Agenturen ist mit modernsten Arbeitsplätzen und Besprechungsräumen ausgestattet — für Beratungen auf höchstem Niveau.", fr: "Chacune de nos agences est équipée de postes de travail et de salles de réunion modernes — pour des conseils au plus haut niveau.", it: "Ognuna delle nostre agenzie è dotata di postazioni di lavoro e sale riunioni moderne — per consulenze al massimo livello.", en: "Each of our agencies is equipped with state-of-the-art workspaces and meeting rooms — for advice at the highest level." },
  "agencies.grid.title": { de: "Finden Sie Ihre Agentur", fr: "Trouvez votre agence", it: "Trova la tua agenzia", en: "Find your agency" },
  "agencies.loading": { de: "Laden...", fr: "Chargement...", it: "Caricamento...", en: "Loading..." },
  "agencies.viewProfile": { de: "Agenturprofil ansehen →", fr: "Voir le profil de l'agence →", it: "Vedi profilo dell'agenzia →", en: "View agency profile →" },
  "agencies.bottom.title": { de: "Bereit für ein persönliches Gespräch?", fr: "Prêt pour un entretien personnel ?", it: "Pronti per un colloquio personale?", en: "Ready for a personal conversation?" },
  "agencies.bottom.body": { de: "Kontaktieren Sie die Agentur in Ihrer Nähe oder besuchen Sie uns direkt — wir freuen uns auf Sie.", fr: "Contactez l'agence près de chez vous ou venez nous rendre visite — nous nous réjouissons de vous accueillir.", it: "Contattate l'agenzia più vicina o venite a trovarci — non vediamo l'ora di incontrarvi.", en: "Contact the agency near you or visit us directly — we look forward to meeting you." },
  "agencies.bottom.cta": { de: "Kontakt aufnehmen", fr: "Nous contacter", it: "Contattaci", en: "Get in touch" },
  "agencies.hq.title": { de: "Entdecke unser HQ", fr: "Découvrez notre siège", it: "Scopri la nostra sede", en: "Discover our HQ" },
  "agencies.hq.body": { de: "Werfen Sie einen Blick hinter die Kulissen unseres Hauptsitzes — moderne Räumlichkeiten, in denen Teamgeist und Innovation zu Hause sind.", fr: "Jetez un coup d'œil dans les coulisses de notre siège — des locaux modernes où l'esprit d'équipe et l'innovation sont chez eux.", it: "Date un'occhiata dietro le quinte della nostra sede — spazi moderni dove spirito di squadra e innovazione sono di casa.", en: "Take a look behind the scenes of our headquarters — modern spaces where team spirit and innovation are at home." },
};
