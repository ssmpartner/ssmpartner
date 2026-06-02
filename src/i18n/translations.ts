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
  "contact.form.sending": { de: "Wird gesendet...", fr: "Envoi en cours...", it: "Invio in corso...", en: "Sending..." },
  "contact.toast.success": { de: "Anfrage wurde gesendet!", fr: "Demande envoyée !", it: "Richiesta inviata!", en: "Request sent!" },
  "contact.toast.error": { de: "Ein Fehler ist aufgetreten.", fr: "Une erreur s'est produite.", it: "Si è verificato un errore.", en: "An error occurred." },
  "contact.hours.title": { de: "Öffnungszeiten", fr: "Heures d'ouverture", it: "Orari di apertura", en: "Opening hours" },
  "contact.hours.weekdays": { de: "Montag – Freitag", fr: "Lundi – Vendredi", it: "Lunedì – Venerdì", en: "Monday – Friday" },
  "contact.hours.weekend": { de: "Samstag – Sonntag", fr: "Samedi – Dimanche", it: "Sabato – Domenica", en: "Saturday – Sunday" },
  "contact.hours.closed": { de: "Geschlossen", fr: "Fermé", it: "Chiuso", en: "Closed" },

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

  // Agency detail page
  "agency.back": { de: "Alle Agenturen", fr: "Toutes les agences", it: "Tutte le agenzie", en: "All agencies" },
  "agency.titlePrefix": { de: "Agentur", fr: "Agence", it: "Agenzia", en: "Agency" },
  "agency.leadership": { de: "Agenturleitung", fr: "Direction de l'agence", it: "Direzione dell'agenzia", en: "Agency leadership" },
  "agency.contact.title": { de: "Kontakt", fr: "Contact", it: "Contatto", en: "Contact" },
  "agency.contact.hours": { de: "Öffnungszeiten", fr: "Heures d'ouverture", it: "Orari di apertura", en: "Opening hours" },
  "agency.contact.empty": { de: "Kontaktdaten werden in Kürze ergänzt.", fr: "Les coordonnées seront ajoutées prochainement.", it: "I dati di contatto saranno aggiunti a breve.", en: "Contact details will be added shortly." },
  "agency.contact.cta": { de: "Kontakt aufnehmen", fr: "Nous contacter", it: "Contattaci", en: "Get in touch" },
  "agency.form.title": { de: "Schnellanfrage", fr: "Demande rapide", it: "Richiesta rapida", en: "Quick inquiry" },
  "agency.form.recipient": { de: "Ansprechperson wählen (optional)", fr: "Choisir un interlocuteur (optionnel)", it: "Seleziona referente (opzionale)", en: "Select contact person (optional)" },
  "agency.form.name": { de: "Ihr Name *", fr: "Votre nom *", it: "Il tuo nome *", en: "Your name *" },
  "agency.form.email": { de: "E-Mail *", fr: "E-mail *", it: "E-mail *", en: "Email *" },
  "agency.form.phone": { de: "Telefon (optional)", fr: "Téléphone (optionnel)", it: "Telefono (opzionale)", en: "Phone (optional)" },
  "agency.form.message": { de: "Ihre Nachricht *", fr: "Votre message *", it: "Il tuo messaggio *", en: "Your message *" },
  "agency.form.submit": { de: "Anfrage senden", fr: "Envoyer la demande", it: "Invia richiesta", en: "Send request" },
  "agency.form.sending": { de: "Wird gesendet...", fr: "Envoi en cours...", it: "Invio in corso...", en: "Sending..." },
  "agency.form.required": { de: "Bitte füllen Sie alle Pflichtfelder aus.", fr: "Veuillez remplir tous les champs obligatoires.", it: "Compila tutti i campi obbligatori.", en: "Please fill in all required fields." },
  "agency.form.success": { de: "Vielen Dank für Ihre Anfrage!", fr: "Merci pour votre demande !", it: "Grazie per la vostra richiesta!", en: "Thank you for your inquiry!" },
  "agency.form.error": { de: "Ein Fehler ist aufgetreten.", fr: "Une erreur s'est produite.", it: "Si è verificato un errore.", en: "An error occurred." },
  "agency.team.title": { de: "Unser Team in", fr: "Notre équipe à", it: "Il nostro team a", en: "Our team in" },
  "agency.location": { de: "Standort", fr: "Emplacement", it: "Posizione", en: "Location" },
  "agency.reviews.title": { de: "Das sagen unsere Kunden", fr: "Ce que disent nos clients", it: "Cosa dicono i nostri clienti", en: "What our customers say" },
  "agency.notFound": { de: "Agentur nicht gefunden.", fr: "Agence introuvable.", it: "Agenzia non trovata.", en: "Agency not found." },
  "agency.loading": { de: "Laden...", fr: "Chargement...", it: "Caricamento...", en: "Loading..." },
  "agency.recipientLeadershipSuffix": { de: "Agenturleitung", fr: "Direction", it: "Direzione", en: "Leadership" },

  // Career page extras
  "career.exploreProcess": { de: "Bewerbungsprozess erkunden", fr: "Découvrir le processus de candidature", it: "Scopri il processo di candidatura", en: "Explore application process" },
  "career.divider1": { de: "«Gemeinsam gestalten wir die Zukunft der Finanzberatung.»", fr: "« Ensemble, nous façonnons l'avenir du conseil financier. »", it: "«Insieme costruiamo il futuro della consulenza finanziaria.»", en: "\"Together we shape the future of financial advice.\"" },
  "career.divider2": { de: "Moderne Arbeitsplätze. Inspirierendes Umfeld.", fr: "Postes de travail modernes. Environnement inspirant.", it: "Postazioni di lavoro moderne. Ambiente stimolante.", en: "Modern workplaces. Inspiring environment." },
  "career.videos.title": { de: "Einblick in unsere Welt", fr: "Aperçu de notre univers", it: "Uno sguardo nel nostro mondo", en: "Insight into our world" },
  "career.videos.body": { de: "Erleben Sie, wie der Arbeitsalltag bei SSM Partner aussieht — authentisch, motivierend und voller Möglichkeiten.", fr: "Découvrez à quoi ressemble le quotidien chez SSM Partner — authentique, motivant et riche en opportunités.", it: "Scoprite com'è la vita quotidiana presso SSM Partner — autentica, motivante e ricca di opportunità.", en: "Experience what daily life at SSM Partner looks like — authentic, motivating and full of opportunities." },
  "career.benefits.title": { de: "Was dich erwartet bei SSM", fr: "Ce qui vous attend chez SSM", it: "Cosa ti aspetta in SSM", en: "What awaits you at SSM" },
  "career.benefit.balance": { de: "Work-Life-Balance", fr: "Équilibre vie pro/perso", it: "Equilibrio vita-lavoro", en: "Work-life balance" },
  "career.benefit.pay": { de: "Faire Vergütung", fr: "Rémunération équitable", it: "Retribuzione equa", en: "Fair compensation" },
  "career.benefit.holidays": { de: "Ferien", fr: "Vacances", it: "Vacanze", en: "Holidays" },
  "career.benefit.discounts": { de: "Rabatte", fr: "Remises", it: "Sconti", en: "Discounts" },
  "career.benefit.training": { de: "Aus- & Weiterbildung", fr: "Formation continue", it: "Formazione continua", en: "Training & development" },
  "career.partner.label": { de: "Dein Ansprechpartner", fr: "Votre interlocuteur", it: "Il tuo referente", en: "Your contact" },
  "career.partner.defaultRole": { de: "Recruiting Partner", fr: "Partenaire recrutement", it: "Partner di reclutamento", en: "Recruiting partner" },
  "career.partner.body": { de: "Spontane Bewerbung? Oder hast du eine Frage? {name} nimmt sich für deine offenen Fragen Zeit. Entdecke unten die nächsten Schritte im Bewerbungsprozess.", fr: "Candidature spontanée ? Ou une question ? {name} prend le temps de répondre à vos questions. Découvrez ci-dessous les prochaines étapes du processus de candidature.", it: "Candidatura spontanea? O hai una domanda? {name} si prende il tempo per le tue domande. Scopri qui sotto i prossimi passi del processo di candidatura.", en: "Spontaneous application? Or do you have a question? {name} will take time for your questions. Discover the next steps in the application process below." },
  "career.partner.applyNow": { de: "Jetzt bewerben", fr: "Postuler maintenant", it: "Candidati ora", en: "Apply now" },
  "career.partner.agencies": { de: "Unsere Agenturen", fr: "Nos agences", it: "Le nostre agenzie", en: "Our agencies" },
  "career.partner.askQuestion": { de: "Frage stellen", fr: "Poser une question", it: "Fai una domanda", en: "Ask a question" },
  "career.onboarding.body": { de: "Von der Bewerbung bis zum ersten Arbeitstag — wir begleiten dich durch jeden Schritt.", fr: "De la candidature au premier jour de travail — nous vous accompagnons à chaque étape.", it: "Dalla candidatura al primo giorno di lavoro — ti accompagniamo in ogni passo.", en: "From application to your first day — we accompany you every step of the way." },
  "career.path.start.title": { de: "Start", fr: "Démarrer", it: "Inizio", en: "Start" },
  "career.path.start.desc": { de: "Stell dich neuen Herausforderungen und wachse mit uns.", fr: "Relevez de nouveaux défis et grandissez avec nous.", it: "Affronta nuove sfide e cresci con noi.", en: "Take on new challenges and grow with us." },
  "career.path.empower.title": { de: "Empower", fr: "Inspirer", it: "Ispira", en: "Empower" },
  "career.path.empower.desc": { de: "Inspiriere andere durch starke Werte und Visionen.", fr: "Inspirez les autres par des valeurs et des visions fortes.", it: "Ispira gli altri con valori e visioni forti.", en: "Inspire others through strong values and visions." },
  "career.path.lead.title": { de: "Lead", fr: "Diriger", it: "Guida", en: "Lead" },
  "career.path.lead.desc": { de: "Setze neue Massstäbe und mische mit uns die Branche auf.", fr: "Établissez de nouveaux standards et bousculez le secteur avec nous.", it: "Stabilisci nuovi standard e scuoti il settore con noi.", en: "Set new standards and shake up the industry with us." },
  "career.process.title": { de: "Dein Weg zu uns", fr: "Votre parcours chez nous", it: "Il tuo percorso da noi", en: "Your journey to us" },
  "career.process.sub": { de: "Schritt für Schritt zum neuen Job", fr: "Étape par étape vers votre nouvel emploi", it: "Passo dopo passo verso il nuovo lavoro", en: "Step by step to your new job" },
  "career.faq.title": { de: "Häufig gestellte Fragen", fr: "Questions fréquentes", it: "Domande frequenti", en: "Frequently asked questions" },
  "career.faq.body": { de: "Alles, was du über eine Karriere bei SSM Partner wissen musst.", fr: "Tout ce que vous devez savoir sur une carrière chez SSM Partner.", it: "Tutto quello che devi sapere su una carriera in SSM Partner.", en: "Everything you need to know about a career at SSM Partner." },
  "career.apply.title": { de: "Jetzt bewerben", fr: "Postuler maintenant", it: "Candidati ora", en: "Apply now" },
  "career.apply.sub": { de: "SSM Partner — Bewerbungsformular", fr: "SSM Partner — Formulaire de candidature", it: "SSM Partner — Modulo di candidatura", en: "SSM Partner — Application form" },

  // Career — process phases
  "career.phase.1.label": { de: "Bewerbung", fr: "Candidature", it: "Candidatura", en: "Application" },
  "career.phase.1.phase": { de: "Phase 1", fr: "Phase 1", it: "Fase 1", en: "Phase 1" },
  "career.phase.1.motto": { de: "Der erste Schritt zählt!", fr: "Le premier pas compte !", it: "Il primo passo conta!", en: "The first step counts!" },
  "career.phase.1.sub": { de: "Zeig, was dich ausmacht!", fr: "Montrez qui vous êtes !", it: "Mostra chi sei!", en: "Show what makes you unique!" },
  "career.phase.1.step1.title": { de: "Bewerbung", fr: "Candidature", it: "Candidatura", en: "Application" },
  "career.phase.1.step1.desc": { de: "Hast du die passende Stelle gefunden? Bewirb dich online über unser Bewerbungsformular. Du erhältst sofort eine Eingangsbestätigung.", fr: "Vous avez trouvé le poste idéal ? Postulez en ligne via notre formulaire. Vous recevrez immédiatement un accusé de réception.", it: "Hai trovato la posizione giusta? Candidati online tramite il nostro modulo. Riceverai subito una conferma di ricezione.", en: "Found the right position? Apply online via our form. You will immediately receive a confirmation." },
  "career.phase.1.step2.title": { de: "Bewerbungsunterlagen", fr: "Dossier de candidature", it: "Documenti di candidatura", en: "Application documents" },
  "career.phase.1.step2.desc": { de: "Deine Bewerbungsunterlagen werden vom HR-Recruiting-Partner geprüft und zur Beurteilung an die zuständige Führungsperson weitergeleitet.", fr: "Votre dossier est examiné par le partenaire RH et transmis pour évaluation au responsable concerné.", it: "I tuoi documenti vengono esaminati dal partner HR e inoltrati al responsabile competente per la valutazione.", en: "Your documents are reviewed by the HR recruiting partner and forwarded to the responsible manager." },
  "career.phase.1.step3.title": { de: "Auswahl", fr: "Sélection", it: "Selezione", en: "Selection" },
  "career.phase.1.step3.desc": { de: "Wir prüfen deine Qualifikation, Fähigkeit und Soft-Skills. Passt du zu SSM, laden wir dich gerne zu einem ersten Kennenlernen ein. Du hörst innerhalb von rund einer Arbeitswoche von uns.", fr: "Nous évaluons vos qualifications, compétences et soft skills. Si vous correspondez à SSM, nous vous inviterons à une première rencontre. Vous recevrez une réponse en une semaine environ.", it: "Valutiamo qualifiche, competenze e soft skill. Se sei in linea con SSM, ti invitiamo a un primo incontro. Avrai una risposta entro circa una settimana lavorativa.", en: "We assess your qualifications, skills and soft skills. If you fit SSM, we'll invite you to a first meeting. You'll hear from us within about a working week." },
  "career.phase.2.label": { de: "Kennenlernen", fr: "Rencontre", it: "Conoscersi", en: "Get to know" },
  "career.phase.2.phase": { de: "Phase 2", fr: "Phase 2", it: "Fase 2", en: "Phase 2" },
  "career.phase.2.motto": { de: "Deine Chance wartet!", fr: "Votre chance vous attend !", it: "La tua occasione ti aspetta!", en: "Your chance awaits!" },
  "career.phase.2.sub": { de: "Überzeuge mit Persönlichkeit!", fr: "Convainquez par votre personnalité !", it: "Convinci con la personalità!", en: "Convince with personality!" },
  "career.phase.2.step1.title": { de: "Erstes Gespräch «Kennenlernen»", fr: "Premier entretien « Rencontre »", it: "Primo colloquio «Conoscenza»", en: "First interview \"Getting to know\"" },
  "career.phase.2.step1.desc": { de: "Im ersten Gespräch erfährst du mehr über uns und die Stelle. Wir lernen dich und deine Wünsche kennen. Wenn auf beiden Seiten alles passt, laden wir dich zu einem zweiten Gespräch ein.", fr: "Lors du premier entretien, vous en apprenez plus sur nous et le poste. Nous apprenons à vous connaître. Si tout convient, nous vous invitons à un deuxième entretien.", it: "Nel primo colloquio scoprirai di più su di noi e sulla posizione. Conosceremo te e i tuoi desideri. Se tutto è in linea, ti invitiamo a un secondo colloquio.", en: "In the first interview you'll learn more about us and the role. We get to know you and your wishes. If everything fits, we invite you to a second interview." },
  "career.phase.2.step2.title": { de: "Zweites Gespräch «oder Schnuppern»", fr: "Deuxième entretien « ou immersion »", it: "Secondo colloquio «o giornata di prova»", en: "Second interview \"or trial day\"" },
  "career.phase.2.step2.desc": { de: "Im Aussendienst wirst du zu einem zweiten Gespräch eingeladen, und im Innendienst laden wir dich je nach Position zu einem Schnuppertag ein. So erhältst du einen Einblick in unseren Arbeitsalltag.", fr: "Sur le terrain, vous êtes invité à un second entretien ; en interne, selon le poste, à une journée d'immersion. Vous découvrez ainsi notre quotidien.", it: "Per il servizio esterno sei invitato a un secondo colloquio, per il servizio interno a una giornata di prova. Così avrai uno sguardo sul nostro quotidiano.", en: "For field roles you're invited to a second interview, for office roles to a trial day depending on the position. This gives you a real glimpse of our daily work." },
  "career.phase.3.label": { de: "Angebot & Vertrag", fr: "Offre & contrat", it: "Offerta & contratto", en: "Offer & contract" },
  "career.phase.3.phase": { de: "Phase 3", fr: "Phase 3", it: "Fase 3", en: "Phase 3" },
  "career.phase.3.motto": { de: "Der Erfolg rückt näher!", fr: "Le succès approche !", it: "Il successo si avvicina!", en: "Success is near!" },
  "career.phase.3.sub": { de: "Fast geschafft!", fr: "Presque arrivé !", it: "Quasi fatto!", en: "Almost there!" },
  "career.phase.3.step1.title": { de: "Angebot", fr: "Offre", it: "Offerta", en: "Offer" },
  "career.phase.3.step1.desc": { de: "Du hast uns überzeugt! Wir machen dir ein konkretes Angebot.", fr: "Vous nous avez convaincus ! Nous vous faisons une offre concrète.", it: "Ci hai convinto! Ti facciamo un'offerta concreta.", en: "You convinced us! We make you a concrete offer." },
  "career.phase.3.step2.title": { de: "Vertrag", fr: "Contrat", it: "Contratto", en: "Contract" },
  "career.phase.3.step2.desc": { de: "Du entscheidest dich für SSM. Dein Vertrag ist innerhalb von fünf Tagen in deiner Mailbox.", fr: "Vous choisissez SSM. Votre contrat arrive dans votre boîte mail sous cinq jours.", it: "Scegli SSM. Il contratto arriva nella tua casella di posta entro cinque giorni.", en: "You choose SSM. Your contract is in your mailbox within five days." },
  "career.phase.4.label": { de: "Willkommen!", fr: "Bienvenue !", it: "Benvenuto!", en: "Welcome!" },
  "career.phase.4.phase": { de: "Phase 4", fr: "Phase 4", it: "Fase 4", en: "Phase 4" },
  "career.phase.4.motto": { de: "Auf geht's zum neuen Abenteuer!", fr: "En route vers la nouvelle aventure !", it: "Si parte per la nuova avventura!", en: "Off to the new adventure!" },
  "career.phase.4.sub": { de: "Willkommen an Board!", fr: "Bienvenue à bord !", it: "Benvenuto a bordo!", en: "Welcome aboard!" },
  "career.phase.4.step1.title": { de: "Willkommen an Board!", fr: "Bienvenue à bord !", it: "Benvenuto a bordo!", en: "Welcome aboard!" },
  "career.phase.4.step1.desc": { de: "Dein erster Tag bei SSM ist da! Wir freuen uns, dich im Team zu begrüssen. Damit du dich schnell bei uns zu Hause fühlst, gibt dir unser «WelcomeDay» einen ersten Einblick in unser Unternehmen. Wir wünschen dir viel Erfolg und Freude!", fr: "C'est votre premier jour chez SSM ! Ravis de vous accueillir dans l'équipe. Notre « WelcomeDay » vous offre un premier aperçu de notre entreprise pour vous sentir vite chez vous. Bon succès et beaucoup de plaisir !", it: "È il tuo primo giorno in SSM! Felici di darti il benvenuto nel team. Il nostro «WelcomeDay» ti offre un primo sguardo sull'azienda per farti sentire subito a casa. Buon successo e tanto divertimento!", en: "It's your first day at SSM! We're glad to welcome you. Our \"WelcomeDay\" gives you a first glimpse of our company so you feel at home quickly. We wish you success and joy!" },

  // VAG45 / LSA45 / ISA45 page
  "vag45.title": { de: "VAG 45", fr: "LSA 45", it: "LSA 45", en: "ISA 45" },
  "vag45.intro": {
    de: "Am 1. Januar 2024 ist das revidierte Versicherungsaufsichtsgesetz (VAG) und die revidierte Aufsichtsverordnung (AVO) in Kraft getreten.",
    fr: "Le 1er janvier 2024, la loi révisée sur la surveillance des assurances (LSA) et l'ordonnance révisée sur la surveillance (OS) sont entrées en vigueur.",
    it: "Il 1° gennaio 2024 sono entrate in vigore la legge sulla sorveglianza degli assicuratori (LSA) e l'ordinanza sulla sorveglianza (OS) rivedute.",
    en: "On 1 January 2024, the revised Insurance Supervision Act (ISA) and the revised Supervision Ordinance (SO) came into force.",
  },
  "vag45.download.hint": {
    de: "Laden Sie jeweils in der entsprechenden Sprache das Informationsblatt herunter.",
    fr: "Téléchargez la fiche d'information dans la langue correspondante.",
    it: "Scaricate la scheda informativa nella lingua corrispondente.",
    en: "Download the information sheet in the corresponding language.",
  },
  "vag45.download.cta": { de: "Download", fr: "Télécharger", it: "Scarica", en: "Download" },
  "vag45.partners.title": { de: "Versicherungspartner", fr: "Partenaires d'assurance", it: "Partner assicurativi", en: "Insurance partners" },
  "vag45.partners.intro": {
    de: "Die SSM Partner AG und die SSM Life AG sind Unternehmen der VISANA-Gruppe und als solche gebundene Versicherungsvermittlerin gemäss VAG. In den untenstehenden Versicherungszweigen erfolgt die Versicherungsvermittlung ausschliesslich im Auftrag einer der folgenden Gesellschaften:",
    fr: "SSM Partner SA et SSM Life SA sont des sociétés du groupe VISANA et, à ce titre, des intermédiaires d'assurance liés au sens de la LSA. Dans les branches d'assurance ci-dessous, l'intermédiation est effectuée exclusivement pour le compte de l'une des sociétés suivantes :",
    it: "SSM Partner SA e SSM Life SA sono società del gruppo VISANA e, in quanto tali, intermediari assicurativi vincolati ai sensi della LSA. Nei seguenti rami assicurativi l'intermediazione avviene esclusivamente per conto di una delle seguenti società:",
    en: "SSM Partner AG and SSM Life AG are companies of the VISANA Group and, as such, tied insurance intermediaries under the ISA. In the insurance branches listed below, the intermediation is carried out exclusively on behalf of one of the following companies:",
  },
  "vag45.section.life": { de: "Rubrik Lebensversicherung (A)", fr: "Branche assurance vie (A)", it: "Ramo assicurazione vita (A)", en: "Life insurance category (A)" },
  "vag45.section.damage": { de: "Rubrik Schadenversicherung (B)", fr: "Branche assurance dommages (B)", it: "Ramo assicurazione danni (B)", en: "Non-life insurance category (B)" },
  "vag45.col.branch": { de: "Versicherungszweig", fr: "Branche d'assurance", it: "Ramo assicurativo", en: "Insurance branch" },
  "vag45.col.partner": { de: "Versicherungspartner / Risikoträger", fr: "Partenaire d'assurance / Porteur de risque", it: "Partner assicurativo / Portatore di rischio", en: "Insurance partner / Risk carrier" },
  "vag45.partner.contact": { de: "Kontakt", fr: "Contact", it: "Contatto", en: "Contact" },
  "vag45.partner.privacy": { de: "Datenschutz", fr: "Confidentialité", it: "Privacy", en: "Privacy" },
};
