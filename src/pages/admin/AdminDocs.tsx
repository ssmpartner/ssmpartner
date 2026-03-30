import { Book, Image, Users, Building2, FileText, Inbox, Layers, Globe, MessageSquare, Briefcase, Video, HelpCircle, Star, Bot } from "lucide-react";

const sections = [
  {
    icon: Layers,
    title: "Slider-Bilder",
    content: "Auf der Startseite befindet sich ein automatischer Bild-Slider. Unter «Slider-Bilder» können Sie Bilder hinzufügen, löschen und die Reihenfolge ändern. Jedes Slide kann eine Headline und Subline enthalten. Empfohlenes Format: 1920 × 800 px (21:9), JPG oder WebP, max. 500 KB.",
  },
  {
    icon: Image,
    title: "Hero-Bilder",
    content: "Jede Unterseite und jede Agentur kann ein eigenes Hero-Bild erhalten. Unter «Hero-Bilder» wählen Sie die Seite aus und laden das gewünschte Bild hoch. Auch die Karriere-Hintergrundbilder (career_bg_1, career_bg_2) werden hier verwaltet. Empfohlenes Format: 1920 × 800 px.",
  },
  {
    icon: FileText,
    title: "Seitentexte (CMS)",
    content: "Unter «Seitentexte» verwalten Sie alle Texte der Website. Jeder Eintrag hat einen Seiten-Schlüssel und einen Abschnitts-Schlüssel. Texte können in mehreren Sprachen (DE, FR, IT, EN) gepflegt werden. Seiten: home, about, career, contact, agencies, team, legal.",
  },
  {
    icon: Users,
    title: "Team-Verwaltung",
    content: "Unter «Team» fügen Sie Mitglieder hinzu und weisen sie einer Kategorie zu: Geschäftsleitung, Fachführung, Erweitertes Team oder einer Agentur. Pro Agentur kann ein Mitglied als Agenturleiter/in markiert werden (★). Badges wie Verkaufsleiter, Teamleiter oder Finanzexperte können individuell vergeben werden und erscheinen auf dem Profilbild.",
  },
  {
    icon: Building2,
    title: "Agenturen",
    content: "Unter «Agenturen» verwalten Sie alle Standorte. Jede Agentur hat eine eigene Detailseite mit Beschreibung, Team, Mapbox-Karte, Bewertungen, Galerie und Kontaktformular. Felder wie Adresse, Telefon, E-Mail, Öffnungszeiten und Koordinaten (Lat/Lng) können gepflegt werden. Auf der Agenturen-Übersicht gibt es zudem einen HQ-Bereich mit Bildergalerie.",
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
    icon: Inbox,
    title: "Anfragen",
    content: "Alle Kontaktanfragen — ob von der Kontaktseite, einer Agentur-Schnellanfrage oder dem Chatbot — landen zentral unter «Anfragen». Status: Neu → In Bearbeitung → Erledigt → Archiviert. Sie können Notizen hinzufügen und den Verlauf verfolgen.",
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
      <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Dokumentation</h1>
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
    </div>
  );
};

export default AdminDocs;
