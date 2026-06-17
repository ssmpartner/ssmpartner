import { useState, useMemo } from "react";
import { Book, Image, Users, Building2, FileText, Inbox, Layers, Globe, Briefcase, Video, HelpCircle, Star, Bot, CreditCard, Scissors, Gift, Shield, KeyRound, Link2, Code, History, Search, Sparkles, Zap, Database, Palette, Map as MapIcon, Cloud, Cpu, Rocket, CheckCircle2, Newspaper, Calendar, BarChart3, ListChecks } from "lucide-react";

const CMS_VERSION = "2.7.0";
const RELEASE_DATE = "17. Juni 2026";

type Section = {
  icon: any;
  title: string;
  content: string;
  category: "Inhalte" | "Benutzer & SSO" | "Agenturen" | "Karriere" | "Portal" | "Tools";
};

const sections: Section[] = [
  { icon: BarChart3, title: "Dashboard", category: "Inhalte", content: "Das Dashboard liefert auf einen Blick alle wichtigen Kennzahlen: Website-Inhalte (Slider, Team, Stellen, Agenturen), Portal-Aktivität (News, Events, Anmeldungen), Engagement der letzten 7 Tage (Chat-Sessions, News-Views, Likes, Kommentare) sowie Übersichten zu bevorstehenden Events (mit Anmeldefortschritt), neuesten Anfragen und Top-News nach Reichweite." },
  { icon: Layers, title: "Slider-Bilder", category: "Inhalte", content: "Auf der Startseite befindet sich ein automatischer Bild-Slider. Unter «Slider-Bilder» können Sie Bilder hinzufügen, löschen und die Reihenfolge ändern. Jedes Slide kann eine Headline und Subline enthalten. Beim Hochladen oder nachträglich kann der Zuschnitt (16:9) angepasst werden. Empfohlenes Format: 1920 × 800 px, JPG oder WebP, max. 500 KB." },
  { icon: Image, title: "Hero-Bilder", category: "Inhalte", content: "Jede Unterseite und jede Agentur kann ein eigenes Hero-Bild erhalten. Unter «Hero-Bilder» wählen Sie die Seite aus und laden das gewünschte Bild hoch oder wählen es aus der Mediathek. Der Zuschnitt (21:9) kann jederzeit angepasst werden. Auch die Karriere-Hintergrundbilder (career_bg_1, career_bg_2) werden hier verwaltet." },
  { icon: FileText, title: "Seitentexte (CMS)", category: "Inhalte", content: "Unter «Seitentexte» verwalten Sie alle Texte der Website. Jeder Eintrag hat einen Seiten-Schlüssel und einen Abschnitts-Schlüssel. Texte können in mehreren Sprachen (DE, FR, IT, EN) gepflegt werden. Seiten: home, about, career, contact, agencies, team, legal." },
  { icon: Globe, title: "Navigation", category: "Inhalte", content: "Unter «Menüpunkte» verwalten Sie die Hauptnavigation. Sie können Einträge aktivieren/deaktivieren, umbenennen und die Reihenfolge anpassen. Mehrsprachige Labels (DE, FR, IT, EN) werden unterstützt." },
  { icon: Users, title: "Team-Verwaltung", category: "Benutzer & SSO", content: "Unter «Team» fügen Sie Mitglieder hinzu und weisen sie einer Kategorie zu: Geschäftsleitung, Fachführung, Erweitertes Team oder einer Agentur. Pro Agentur kann ein Mitglied als Agenturleiter/in markiert werden (★). Badges wie Verkaufsleiter, Teamleiter, Finanzexperte, Finanzcoach, Finanzcoach VBV oder Trainee können individuell vergeben werden. Über das Feld «Benutzer verknüpfen» wird ein Teammitglied 1:1 mit einem CMS-Benutzer verbunden — diese Verknüpfung liefert die Agentur-Zuordnung an die Benutzerverwaltung und an alle SSO-Projekte (z.B. SSM Recruit). Komfortfunktionen: Suchfeld, Filter-Dropdown, Kacheln-/Listenansicht und Bulk-Aktionen." },
  { icon: Shield, title: "Benutzerverwaltung", category: "Benutzer & SSO", content: "Unter «Benutzer» verwalten Superadmins alle CMS-Konten. Pro Benutzer können Sie Anzeigename, E-Mail, Passwort, Rolle (superadmin, admin, backoffice, analyst, teamleiter, controlling, geschaeftsleitung, hr, agency_manager, vertriebsleiter, agenturleiter, finanzcoach, trainee, verkaufsleiter) und SSO-Projekt-Zugriffe setzen. Die Agentur-Zuordnung wird automatisch aus der Team-Verknüpfung übernommen." },
  { icon: KeyRound, title: "SSO & Zugriffsverwaltung", category: "Benutzer & SSO", content: "Unter «SSO» legen Superadmins angebundene Projekte (SSM Recruit, SSM Cockpit) an: project_key, Name, optionale API-URL und API-Secret. Pro Projekt wird gesteuert, welche Benutzer Zugriff haben. Die zentrale Edge Function «sso-auth» liefert beim Login (verify) und beim Pull-Sync (list_project_users) für jeden Benutzer einheitlich: id, email, display_name, avatar_url, role und agency_id/agency_name. Zusätzlich: Redirect-SSO via einmalige Tokens (generate_redirect_token / validate_token, 5 Min. TTL). Auth-Audit-Logs werden geführt." },
  { icon: Shield, title: "Microsoft Entra ID (SAML SSO)", category: "Benutzer & SSO", content: "Unter «Microsoft SSO» richten Superadmins SAML 2.0 Single Sign-On mit Microsoft Entra ID (Azure AD) ein. Service-Provider-Werte (Entity ID, ACS URL, Sign-on URL) sind direkt kopierbar. Nach Konfiguration der Enterprise Application in Entra und Hinterlegung der App Federation Metadata Url wird der Provider für die zugelassene E-Mail-Domain (z.B. ssmpartner.ch) aktiviert. Bestehende Konten mit identischer E-Mail werden beim ersten SSO-Login automatisch verknüpft — Rolle, Profil und Team-/Agentur-Zuordnung bleiben erhalten. E-Mail/Passwort-Logins funktionieren parallel weiter." },
  { icon: Link2, title: "Agentur-Verknüpfung", category: "Benutzer & SSO", content: "Die Agentur-Zugehörigkeit eines Benutzers wird zentral über das Team-Mitglied gepflegt: team_members.user_id verknüpft 1:1 mit auth.users.id, das Feld team_members.agency_id zeigt auf die jeweilige Agentur. Diese Verknüpfung ist die einzige Quelle der Wahrheit." },
  { icon: Building2, title: "Agenturen", category: "Agenturen", content: "Unter «Agenturen» verwalten Sie alle Standorte. Jede Agentur hat eine eigene Detailseite mit Beschreibung, Team, Mapbox-Karte, Bewertungen, Galerie und Kontaktformular. Felder wie Adresse, Telefon, E-Mail, Öffnungszeiten und Koordinaten (Lat/Lng) können gepflegt werden." },
  { icon: Star, title: "Bewertungen", category: "Agenturen", content: "Unter «Agenturen» können pro Standort Kundenbewertungen mit Autorenname, Text und Sternebewertung (1–5) hinzugefügt werden. Diese erscheinen auf der jeweiligen Agentur-Detailseite." },
  { icon: Briefcase, title: "Stellenangebote", category: "Karriere", content: "Unter «Stellen» verwalten Sie offene Positionen mit Titel, Standort, Pensum und mehrsprachiger Beschreibung. Aktive Stellen werden auf der Karriereseite angezeigt." },
  { icon: Video, title: "Karriere-Videos", category: "Karriere", content: "Unter «Karriere-Videos» können Sie Testimonial- oder Imagevideos hinzufügen, die auf der Karriereseite in einem Karussell angezeigt werden." },
  { icon: HelpCircle, title: "Karriere-FAQs", category: "Karriere", content: "Unter «Karriere-FAQs» verwalten Sie häufig gestellte Fragen rund um Bewerbung und Karriere. Diese werden als Akkordeon am Ende der Karriereseite dargestellt." },
  { icon: Newspaper, title: "News & Kommunikation", category: "Portal", content: "Unter «News» verwalten Sie interne Beiträge für das Portal (/portal/news). Pro Beitrag: Titel, Slug, Auszug, Rich-Text-Inhalt, Cover-Bild/-Video, Kategorie, Tags, Kontaktperson und Sichtbarkeit (Alle / nach Rollen / nach Agenturen / gemischt). Spezial-Flags: «Wichtig» (blockierendes Pflicht-Lesebestätigungs-Popup), «Dringend-Banner» (roter Banner oben im Portal), «Highlight» (hervorgehobene Top-Card). Kommentare können pro Post aktiviert und von Superadmins moderiert (ausblenden/löschen) werden. Statistik-Tab zeigt Views, Lesebestätigungen, Likes und Kommentare pro Beitrag." },
  { icon: Calendar, title: "Events & Anmeldungen", category: "Portal", content: "Unter «Events» erstellen Sie Veranstaltungen für das Portal (/portal/events) mit Titel, Beschreibung (Rich-Text), Cover, Start-/Endzeit, Ort (mit optionaler Karten-URL), Kategorie, Kontaktperson, Kapazität und Anmeldeschluss. Sichtbarkeit analog zu News (Alle / Rollen / Agenturen / gemischt). Bestehende Events können als Vorlage dupliziert werden. Anmeldungen sind aktivierbar; ein konfigurierbarer Bestätigungstext wird Teilnehmern beim Klick auf «Teilnehmen» angezeigt. Optionaler Quiz-/Fragebogen-Editor: Text-, Single- und Multi-Choice-Fragen mit «Pflichtfeld»-Schalter. Antworten der Teilnehmer werden in der Anmeldungsliste sichtbar." },
  { icon: ListChecks, title: "Quiz / Fragebogen", category: "Portal", content: "Im Anmeldungs-Schritt eines Events lassen sich beliebig viele Fragen ergänzen. Drei Fragetypen: Freitext, Einfachauswahl, Mehrfachauswahl. Pro Frage steuerbar: Pflichtfeld ja/nein, Antwortoptionen (für Choice-Typen). Beim Klick auf «Teilnehmen» im Portal werden die Fragen dynamisch im Bestätigungs-Modal gerendert; Pflichtfragen werden vor dem Speichern validiert." },
  { icon: CreditCard, title: "Prämien & Wizard", category: "Tools", content: "Unter «Online-Check» verwalten Sie den 5-stufigen Wizard: Produkt, Persönliche Informationen, Deckung, Zusammenfassung mit Richtpreisen (PDF), Offertenanfrage. Die Preisstufen werden über «wizard_pricing» verwaltet." },
  { icon: Gift, title: "Cashback & Weiterempfehlung", category: "Tools", content: "Bei Online-Abschluss erhalten Kunden CHF 150.– Cashback. Zusätzlich CHF 50.– pro Empfehlung an Familie oder Freunde." },
  { icon: Inbox, title: "Anfragen", category: "Tools", content: "Alle Kontaktanfragen — von Kontaktseite, Agentur-Schnellanfrage, Chatbot oder Wizard — landen zentral unter «Anfragen». Status: Neu → In Bearbeitung → Erledigt → Archiviert." },
  { icon: Bot, title: "KI-Chat & Wissensbasis", category: "Tools", content: "Der KI-Chatbot nutzt eine verwaltbare Wissensbasis. Unter «KI-Chat Wissen» können Sie Frage-Antwort-Paare in Kategorien pflegen. Der Bot erkennt Teammitglieder namentlich und kann deren digitale Visitenkarte (vCard mit QR-Code) direkt anzeigen." },
  { icon: Scissors, title: "Bildzuschnitt", category: "Tools", content: "Beim Hochladen von Bildern (Team, Hero, Slider) steht ein Zuschnitt-Tool zur Verfügung. Seitenverhältnisse: Team 3:4, Hero 21:9, Slider 16:9." },
  { icon: Image, title: "Mediathek", category: "Tools", content: "Alle hochgeladenen Bilder und Videos werden zentral in der Mediathek gespeichert und können in allen Bereichen wiederverwendet werden." },
  { icon: Book, title: "API-Zugang", category: "Tools", content: "Über die REST-API können Sie alle Inhalte programmatisch lesen und schreiben. Details unter «API-Docs» in der Seitenleiste." },
  { icon: Database, title: "Cockpit-Data API", category: "Tools", content: "Die Edge Function «cockpit-data» liefert externen SSM-Projekten (z.B. SSM Cockpit) authentifizierten Lesezugriff auf Stammdaten (agencies, team_members). Authentifizierung via API-Secret aus sso_projects (Header x-sso-api-key). Der SUPABASE_SERVICE_ROLE_KEY bleibt vollständig serverseitig." },
];

const categories: Section["category"][] = ["Inhalte", "Benutzer & SSO", "Agenturen", "Karriere", "Portal", "Tools"];

const changelog = [
  {
    version: "2.7.0",
    date: "17. Juni 2026",
    type: "Major",
    changes: [
      "Microsoft Entra ID SAML SSO — Anleitung & Konfigurations-UI unter /admin/entra-sso",
      "Automatische Verknüpfung bestehender Konten beim ersten SSO-Login (Rolle/Profil/Team bleiben erhalten)",
      "Neue Edge Function «cockpit-data» für externen Stammdaten-Zugriff (agencies, team_members) via x-sso-api-key",
      "SSO-Redirect-Flow mit einmaligen Tokens (generate_redirect_token / validate_token, 5 Min. TTL)",
      "SSM Cockpit als drittes SSO-Projekt registriert",
      "Neue Rolle «verkaufsleiter» im app_role-Enum",
    ],
  },
  {
    version: "2.6.0",
    date: "23. April 2026",
    type: "Major",
    changes: [
      "Neues Events-Modul mit Anmeldungen & Teilnehmerlisten",
      "Event-Duplizierung als Vorlage",
      "Konfigurierbares Teilnahme-Bestätigungs-Modal",
      "Optionaler Quiz-/Fragebogen-Editor pro Event (Text / Single / Multi Choice)",
      "Bevorstehende Events oben in /portal/news verlinkt",
      "Dashboard mit Live-Statistiken: Website, Portal, 7-Tage-Engagement, Top-News, Anfragen",
    ],
  },
  {
    version: "2.5.0",
    date: "22. April 2026",
    type: "Major",
    changes: [
      "Neue SSO-Action list_project_users für Pull-Sync",
      "Team-Verwaltung: Toolbar mit Suche, Filter & View-Switch",
      "Team-Bearbeitung als Modal-Dialog",
      "Bulk-Aktionen mit Lösch-Bestätigung",
      "Dokumentation komplett überarbeitet",
    ],
  },
  {
    version: "2.4.0",
    date: "Januar 2026",
    type: "Feature",
    changes: [
      "SSO-System mit angebundenen Projekten",
      "Agentur-Verknüpfung über Team-Mitglieder",
      "Auth-Audit-Logging",
    ],
  },
  {
    version: "2.0.0",
    date: "Oktober 2025",
    type: "Major",
    changes: [
      "KI-Chatbot mit Gemini-Integration",
      "Online-Check Wizard mit BAG-API",
      "ElevenLabs TTS & Scribe",
      "Mehrsprachigkeit (DE/FR/IT/EN)",
    ],
  },
];

const techStack = [
  { icon: Code, label: "Frontend", value: "React 18 · TypeScript · Vite", sub: "Tailwind CSS · shadcn/ui · Framer Motion" },
  { icon: Database, label: "Backend", value: "Supabase Postgres", sub: "Auth · Storage · Realtime · RLS" },
  { icon: Zap, label: "Edge Functions", value: "Deno Runtime", sub: "ai-chat · sso-auth · cockpit-data · manage-users · bag-premiums · gsc-monitor · elevenlabs-tts · elevenlabs-scribe-token" },
  { icon: Cpu, label: "KI / ML", value: "Google Gemini 2.5 Pro", sub: "ElevenLabs TTS & Scribe" },
  { icon: MapIcon, label: "Maps", value: "Mapbox GL JS", sub: "light-v11 Style · Custom Marker" },
  { icon: Cloud, label: "Hosting", value: "Lovable Cloud", sub: "CDN · SSL · Auto-Deploy" },
];

const stats = [
  { label: "Module", value: sections.length, icon: Layers },
  { label: "Sprachen", value: 4, icon: Globe },
  { label: "Edge Functions", value: 8, icon: Zap },
  { label: "Benutzerrollen", value: 14, icon: Shield },
];

const AdminDocs = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Section["category"] | "Alle">("Alle");

  const filtered = useMemo(() => {
    return sections.filter((s) => {
      const matchesSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === "Alle" || s.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, activeCategory]);

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-8 mb-8">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-primary-foreground/15 text-primary-foreground px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
              <Sparkles size={12} /> v{CMS_VERSION}
            </span>
            <span className="text-primary-foreground/70 text-xs">{RELEASE_DATE}</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-semibold text-primary-foreground mb-2">SSM Partner CMS</h1>
          <p className="text-primary-foreground/80 text-base max-w-2xl">
            Vollständige Dokumentation aller Module, Features und der zugrundeliegenden Architektur.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 rounded-xl p-4">
                <s.icon size={16} className="text-primary-foreground/60 mb-2" />
                <div className="text-2xl font-semibold text-primary-foreground">{s.value}</div>
                <div className="text-xs text-primary-foreground/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 sticky top-0 bg-background/80 backdrop-blur-md py-2 z-10 -mx-2 px-2 rounded-xl">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Funktionen, Module, Stichwörter durchsuchen..."
            className="w-full h-10 pl-10 pr-4 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {(["Alle", ...categories] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`h-10 px-3.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">Module & Features</h2>
          <span className="text-xs text-muted-foreground">{filtered.length} von {sections.length}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="bg-card border rounded-xl p-12 text-center">
            <Search size={24} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Keine Treffer für «{search}»</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((s) => (
              <div key={s.title} className="group bg-card border rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 bg-primary/10 group-hover:bg-primary/15 rounded-lg flex items-center justify-center transition-colors">
                    <s.icon size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-sm font-semibold text-foreground">{s.title}</h3>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{s.category}</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{s.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tech Stack */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Cpu size={18} className="text-primary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Technologie-Stack</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {techStack.map((t) => (
            <div key={t.label} className="bg-card border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <t.icon size={15} className="text-primary" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t.label}</span>
              </div>
              <div className="font-heading text-sm font-semibold text-foreground mb-0.5">{t.value}</div>
              <div className="text-xs text-muted-foreground">{t.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Changelog */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History size={18} className="text-primary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Changelog</h2>
        </div>
        <div className="bg-card border rounded-xl p-6">
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            <div className="space-y-6">
              {changelog.map((entry, idx) => (
                <div key={entry.version} className="relative pl-8">
                  <div className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 ${idx === 0 ? "bg-primary border-primary" : "bg-card border-border"}`} />
                  <div className="flex items-baseline gap-2 flex-wrap mb-2">
                    <span className="font-mono text-sm font-semibold text-foreground">v{entry.version}</span>
                    <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded font-medium ${
                      entry.type === "Major" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}>{entry.type}</span>
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                    {idx === 0 && (
                      <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Aktuell</span>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {entry.changes.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 size={13} className="text-primary/60 mt-0.5 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 pt-6 border-t">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Rocket size={12} />
          <span>SSM Partner CMS · v{CMS_VERSION} · {RELEASE_DATE}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDocs;
