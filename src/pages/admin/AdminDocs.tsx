import { Book, Image, Users, Building2, FileText, Inbox, Layers, Globe } from "lucide-react";

const sections = [
  {
    icon: Layers,
    title: "Slider-Bilder",
    content: "Auf der Startseite befindet sich ein automatischer Bild-Slider. Unter «Slider-Bilder» können Sie Bilder hinzufügen, löschen und die Reihenfolge ändern. Empfohlenes Format: 1920 × 800 px (21:9), JPG oder WebP, max. 500 KB.",
  },
  {
    icon: Image,
    title: "Hero-Bilder",
    content: "Jede Unterseite und jede Agentur kann ein eigenes Hero-Bild erhalten. Unter «Hero-Bilder» wählen Sie die Seite aus und laden das gewünschte Bild hoch. Empfohlenes Format: 1920 × 800 px.",
  },
  {
    icon: FileText,
    title: "Seitentexte (CMS)",
    content: "Unter «Seitentexte» verwalten Sie alle Texte der Website. Jeder Eintrag hat einen Seiten-Schlüssel und einen Abschnitts-Schlüssel. Texte können in mehreren Sprachen (DE, FR, IT, EN) gepflegt werden.",
  },
  {
    icon: Users,
    title: "Team-Verwaltung",
    content: "Unter «Team» fügen Sie Mitglieder hinzu und weisen sie einer Kategorie zu: Geschäftsleitung, Fachführung, Erweitertes Team oder einer Agentur. Pro Agentur kann ein Mitglied als Agenturleiter/in markiert werden (★). Verwenden Sie die Filter-Pillen, um schnell nach Kategorie oder Agentur zu filtern.",
  },
  {
    icon: Building2,
    title: "Agenturen",
    content: "Unter «Agenturen» verwalten Sie alle Standorte. Jede Agentur hat eine eigene Detailseite mit Beschreibung, Team, Karte, Bewertungen und Kontaktformular. Felder wie Adresse, Telefon, E-Mail und Öffnungszeiten können individuell gepflegt werden.",
  },
  {
    icon: Inbox,
    title: "Anfragen",
    content: "Alle Kontaktanfragen — ob von der Kontaktseite oder einer Agentur-Schnellanfrage — landen zentral unter «Anfragen». Status: Neu → In Bearbeitung → Erledigt → Archiviert. Sie können Notizen hinzufügen und direkt per E-Mail antworten.",
  },
  {
    icon: Globe,
    title: "Navigation",
    content: "Unter «Menüpunkte» verwalten Sie die Hauptnavigation. Sie können Einträge aktivieren/deaktivieren, umbenennen und die Reihenfolge per Drag anpassen. Mehrsprachige Labels (DE, FR, IT, EN) werden unterstützt.",
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
