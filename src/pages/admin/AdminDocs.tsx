import { Book, Image, Users, Building2, FileText, Inbox, Layers, Globe, MessageSquare, Briefcase, Video, HelpCircle, Star, Bot, CreditCard, Scissors, Gift, Shield, KeyRound, Link2, Code, History } from "lucide-react";

const CMS_VERSION = "2.5.0";
const RELEASE_DATE = "22. April 2026";

const sections = [
  {
    icon: Layers,
    title: "Slider-Bilder",
    content: "Auf der Startseite befindet sich ein automatischer Bild-Slider. Unter «Slider-Bilder» können Sie Bilder hinzufügen, löschen und die Reihenfolge ändern. Jedes Slide kann eine Headline und Subline enthalten. Beim Hochladen oder nachträglich kann der Zuschnitt (16:9) angepasst werden. Empfohlenes Format: 1920 × 800 px, JPG oder WebP, max. 500 KB.",
  },
  {
    icon: Image,
    title: "Hero-Bilder",
    content: "Jede Unterseite und jede Agentur kann ein eigenes Hero-Bild erhalten. Unter «Hero-Bilder» wählen Sie die Seite aus und laden das gewünschte Bild hoch oder wählen es aus der Mediathek. Der Zuschnitt (21:9) kann jederzeit angepasst werden. Auch die Karriere-Hintergrundbilder (career_bg_1, career_bg_2) werden hier verwaltet.",
  },
  {
    icon: FileText,
    title: "Seitentexte (CMS)",
    content: "Unter «Seitentexte» verwalten Sie alle Texte der Website. Jeder Eintrag hat einen Seiten-Schlüssel und einen Abschnitts-Schlüssel. Texte können in mehreren Sprachen (DE, FR, IT, EN) gepflegt werden. Seiten: home, about, career, contact, agencies, team, legal.",
  },
  {
    icon: Users,
    title: "Team-Verwaltung",
    content: "Unter «Team» fügen Sie Mitglieder hinzu und weisen sie einer Kategorie zu: Geschäftsleitung, Fachführung, Erweitertes Team oder einer Agentur. Pro Agentur kann ein Mitglied als Agenturleiter/in markiert werden (★). Badges wie Verkaufsleiter, Teamleiter, Finanzexperte, Finanzcoach, Finanzcoach VBV oder Trainee können individuell vergeben werden. Über das Feld «Benutzer verknüpfen» wird ein Teammitglied 1:1 mit einem CMS-Benutzer verbunden — diese Verknüpfung liefert die Agentur-Zuordnung an die Benutzerverwaltung und an alle SSO-Projekte (z.B. SSM Recruit). Komfortfunktionen: Suchfeld, Filter-Dropdown (inkl. einzelner Agenturen), Kacheln-/Listenansicht und Mehrfachauswahl mit Bulk-Aktionen (Aktivieren, Deaktivieren, Löschen mit Bestätigung «LÖSCHEN»).",
  },
  {
    icon: Shield,
    title: "Benutzerverwaltung",
    content: "Unter «Benutzer» verwalten Superadmins alle CMS-Konten. Pro Benutzer können Sie Anzeigename, E-Mail, Passwort, Rolle (superadmin, admin, backoffice, analyst, teamleiter, controlling, geschaeftsleitung, hr, agency_manager, vertriebsleiter, agenturleiter, finanzcoach, trainee, verkaufsleiter) und SSO-Projekt-Zugriffe setzen. Die Agentur-Zuordnung wird automatisch aus der Team-Verknüpfung übernommen und im Bearbeiten-Modal zwischen E-Mail und Passwort angezeigt. Die Einstellungen sind im Dropdown des Benutzerprofils oben rechts erreichbar.",
  },
  {
    icon: KeyRound,
    title: "SSO & Zugriffsverwaltung",
    content: "Unter «SSO» legen Superadmins angebundene Projekte (z.B. SSM Recruit) an: project_key, Name, optionale API-URL und API-Secret. Pro Projekt wird gesteuert, welche Benutzer Zugriff haben. Die zentrale Edge Function «sso-auth» liefert beim Login (Action verify) und beim Pull-Sync (Action list_project_users) für jeden Benutzer einheitlich: id, email, display_name, avatar_url, role und agency_id/agency_name (aus der Team-Verknüpfung). Auth-Audit-Logs werden in der Tabelle auth_audit_log geführt.",
  },
  {
    icon: Link2,
    title: "Agentur-Verknüpfung",
    content: "Die Agentur-Zugehörigkeit eines Benutzers wird zentral über das Team-Mitglied gepflegt: team_members.user_id verknüpft 1:1 mit auth.users.id, das Feld team_members.agency_id zeigt auf die jeweilige Agentur. Diese Verknüpfung ist die einzige Quelle der Wahrheit — sowohl die Benutzerverwaltung im CMS als auch alle angebundenen Projekte über SSO erhalten dieselbe Agentur-Information.",
  },
  {
    icon: Building2,
    title: "Agenturen",
    content: "Unter «Agenturen» verwalten Sie alle Standorte. Jede Agentur hat eine eigene Detailseite mit Beschreibung, Team, Mapbox-Karte, Bewertungen, Galerie und Kontaktformular. Felder wie Adresse, Telefon, E-Mail, Öffnungszeiten und Koordinaten (Lat/Lng) können gepflegt werden. Hero-Bilder der Agenturen werden automatisch als Fallback verwendet, falls kein separates Hero-Bild gepflegt ist.",
  },
  {
    icon: Star,
    title: "Bewertungen",
    content: "Unter «Agenturen» können pro Standort Kundenbewertungen mit Autorenname, Text und Sternebewertung (1–5) hinzugefügt werden. Diese erscheinen auf der jeweiligen Agentur-Detailseite.",
  },
  {
    icon: Briefcase,
    title: "Stellenangebote",
    content: "Unter «Stellen» verwalten Sie offene Positionen mit Titel, Standort, Pensum und mehrsprachiger Beschreibung. Aktive Stellen werden auf der Karriereseite angezeigt.",
  },
  {
    icon: Video,
    title: "Karriere-Videos",
    content: "Unter «Karriere-Videos» können Sie Testimonial- oder Imagevideos hinzufügen, die auf der Karriereseite in einem Karussell angezeigt werden. Jedes Video hat einen Titel, ein Vorschaubild und eine Video-URL.",
  },
  {
    icon: HelpCircle,
    title: "Karriere-FAQs",
    content: "Unter «Karriere-FAQs» verwalten Sie häufig gestellte Fragen rund um Bewerbung und Karriere. Diese werden als Akkordeon am Ende der Karriereseite dargestellt.",
  },
  {
    icon: CreditCard,
    title: "Prämien & Angebotsanfrage (Wizard)",
    content: "Unter «Online-Check» verwalten Sie den 5-stufigen Wizard: Schritt 1 Produkt, Schritt 2 Persönliche Informationen, Schritt 3 Deckung mit Vorschlägen (günstigstes Angebot wird mit Badge markiert), Schritt 4 Zusammenfassung mit Richtpreisen (als PDF herunterladbar), Schritt 5 Offertenanfrage mit Agentur-Vorschlag und Terminbuchung. Die Preisstufen (Basis, Standard, Premium) werden über die Tabelle «wizard_pricing» verwaltet.",
  },
  {
    icon: Gift,
    title: "Cashback & Weiterempfehlung",
    content: "Unterhalb des Wizards wird ein Cashback-Bereich angezeigt: Bei Online-Abschluss erhalten Kunden CHF 150.– Cashback. Zudem können sie Familie oder Freunde weiterempfehlen und zusätzlich CHF 50.– pro Empfehlung erhalten.",
  },
  {
    icon: Inbox,
    title: "Anfragen",
    content: "Alle Kontaktanfragen — ob von der Kontaktseite, einer Agentur-Schnellanfrage, dem Chatbot oder dem Wizard — landen zentral unter «Anfragen». Status: Neu → In Bearbeitung → Erledigt → Archiviert. Sie können Notizen hinzufügen und den Verlauf verfolgen.",
  },
  {
    icon: Bot,
    title: "KI-Chat & Wissensbasis",
    content: "Der KI-Chatbot nutzt eine verwaltbare Wissensbasis. Unter «KI-Chat Wissen» können Sie Frage-Antwort-Paare in Kategorien pflegen. Der Bot erkennt auch Teammitglieder namentlich und kann deren digitale Visitenkarte (vCard mit QR-Code) direkt im Chat anzeigen.",
  },
  {
    icon: Globe,
    title: "Navigation",
    content: "Unter «Menüpunkte» verwalten Sie die Hauptnavigation. Sie können Einträge aktivieren/deaktivieren, umbenennen und die Reihenfolge anpassen. Mehrsprachige Labels (DE, FR, IT, EN) werden unterstützt.",
  },
  {
    icon: Scissors,
    title: "Bildzuschnitt",
    content: "Beim Hochladen von Bildern (Team, Hero, Slider) steht ein Zuschnitt-Tool zur Verfügung. Die Seitenverhältnisse sind fix vorgegeben: Team 3:4, Hero 21:9, Slider 16:9. Bestehende Bilder können jederzeit nachträglich zugeschnitten werden. Bilder können hochgeladen oder aus der Mediathek ausgewählt werden.",
  },
  {
    icon: Image,
    title: "Mediathek",
    content: "Alle hochgeladenen Bilder und Videos werden zentral in der Mediathek gespeichert. Von dort können sie in allen Bereichen (Slider, Heroes, Team, Agenturen, Videos) wiederverwendet werden.",
  },
  {
    icon: Book,
    title: "API-Zugang",
    content: "Über die REST-API können Sie alle Inhalte programmatisch lesen und schreiben. Ideal für Automationen, externe Tools oder mobile Apps. Details finden Sie unter «API-Docs» in der Seitenleiste.",
  },
];

const AdminDocs = () => {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Dokumentation</h1>
        <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-1 rounded-md">v{CMS_VERSION}</span>
      </div>
      <p className="font-body text-sm text-muted-foreground mb-8">
        Übersicht aller Funktionen des Content-Management-Systems.
      </p>

      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.title} className="bg-card border rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <s.icon size={18} className="text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">{s.title}</h2>
                <p className="font-body text-sm text-muted-foreground mt-1 leading-relaxed">{s.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-8">
        CMS Version {CMS_VERSION} · Letzte Aktualisierung: April 2026
      </p>
    </div>
  );
};

export default AdminDocs;
