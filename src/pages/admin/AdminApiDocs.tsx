import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Check, ExternalLink, Code2, Database, Lock, Zap, Key, RefreshCw, Eye, EyeOff, Users, Building2 } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const tables = [
  { name: "agencies", label: "Agenturen", description: "Alle Agentur-Standorte mit Kontaktdaten, Koordinaten, Öffnungszeiten und Beschreibung (mehrsprachig)." },
  { name: "team_members", label: "Team-Mitglieder", description: "Mitglieder aller Teams inkl. Kategorie, Agentur-Zuweisung, Badge und Kontaktdaten." },
  { name: "job_positions", label: "Stellenangebote", description: "Offene Stellen mit Titel, Standort, Pensum und mehrsprachiger Beschreibung." },
  { name: "slider_images", label: "Slider-Bilder", description: "Hero-Slider auf der Startseite mit Headline und Subline." },
  { name: "page_heroes", label: "Hero-Bilder", description: "Hero-Bilder pro Seite und Agentur, inkl. Karriere-Hintergrundbilder." },
  { name: "site_content", label: "Seitentexte", description: "CMS-Inhalte für alle Seiten, mehrsprachig (DE, FR, IT, EN)." },
  { name: "nav_items", label: "Navigation", description: "Menüpunkte der Hauptnavigation mit mehrsprachigen Labels." },
  { name: "inquiries", label: "Anfragen", description: "Kontaktanfragen von der Website, Agenturen und Chatbot." },
  { name: "agency_members", label: "Agentur-Mitglieder", description: "Direkt zugewiesene Agentur-Mitglieder mit Kontaktdaten." },
  { name: "agency_reviews", label: "Bewertungen", description: "Kundenbewertungen pro Agentur mit Sternebewertung." },
  { name: "career_faqs", label: "Karriere-FAQs", description: "Häufig gestellte Fragen zur Karriere mit Frage und Antwort." },
  { name: "career_videos", label: "Karriere-Videos", description: "Video-Testimonials mit Titel, Vorschaubild und Video-URL." },
  { name: "chatbot_knowledge", label: "KI-Chat Wissen", description: "Wissensbasis für den KI-Chatbot mit Kategorie, Frage und Antwort." },
  { name: "sso_projects", label: "SSO-Projekte", description: "Angebundene Projekte (z.B. SSM Recruit) mit project_key, API-URL und API-Secret. Nur für Superadmins lesbar." },
  { name: "project_access", label: "Projekt-Zugriffe", description: "Verknüpfung Benutzer ↔ SSO-Projekt. Steuert, welche Benutzer auf welches angebundene Projekt zugreifen dürfen." },
  { name: "auth_audit_log", label: "Auth-Audit-Log", description: "Login-, Logout- und SSO-Events mit IP, User-Agent und Metadaten. Nur für Superadmins lesbar." },
];

const edgeFunctions = [
  {
    name: "ai-chat",
    label: "KI-Chat",
    description: "Streaming-KI-Antworten basierend auf Wissensbasis und BAG-Prämien.",
    public: true,
  },
  {
    name: "bag-premiums",
    label: "BAG-Prämien",
    description: "Aktuelle Krankenkassen-Prämien des Bundesamts für Gesundheit.",
    public: true,
  },
  {
    name: "manage-users",
    label: "Benutzerverwaltung",
    description: "Listen, Erstellen, Aktualisieren und Löschen von CMS-Benutzern. Nur für Superadmins.",
    public: false,
  },
  {
    name: "sso-auth",
    label: "SSO-Authentifizierung",
    description: "Login-Verifizierung und Pull-Sync für angebundene Projekte. Erfordert x-sso-api-key Header.",
    public: false,
  },
  {
    name: "elevenlabs-tts",
    label: "Text-to-Speech",
    description: "Sprachausgabe für den KI-Chat über ElevenLabs.",
    public: true,
  },
  {
    name: "elevenlabs-scribe-token",
    label: "Scribe-Token",
    description: "Erzeugt kurzlebige Tokens für ElevenLabs-Spracheingabe.",
    public: true,
  },
];

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      title="Kopieren"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
};

const CodeBlock = ({ label, code }: { label: string; code: string }) => (
  <div className="mt-3">
    <div className="flex items-center justify-between mb-1">
      <span className="font-body text-xs text-muted-foreground">{label}</span>
      <CopyButton text={code} />
    </div>
    <pre className="bg-muted/70 border border-border rounded-lg p-3 font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap break-all">
      {code}
    </pre>
  </div>
);

const AdminApiDocs = () => {
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [generatedSecrets, setGeneratedSecrets] = useState<Record<string, string>>({});

  const { data: projects } = useQuery({
    queryKey: ["sso-projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sso_projects" as any).select("*").order("created_at");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: accessList } = useQuery({
    queryKey: ["sso-access"],
    queryFn: async () => {
      const { data, error } = await supabase.from("project_access" as any).select("*");
      if (error) throw error;
      return data as any[];
    },
  });

  const generateSecretMutation = useMutation({
    mutationFn: async (project_id: string) => {
      const { data, error } = await supabase.functions.invoke("sso-auth", {
        body: { action: "generate_secret", project_id },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return { project_id, api_secret: data.api_secret };
    },
    onSuccess: ({ project_id, api_secret }) => {
      setGeneratedSecrets((prev) => ({ ...prev, [project_id]: api_secret }));
      setVisibleSecrets((prev) => new Set(prev).add(project_id));
      queryClient.invalidateQueries({ queryKey: ["sso-projects"] });
      toast.success("API-Secret generiert – bitte jetzt kopieren!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const copyToClipboard = async (text: string, fieldId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success("In Zwischenablage kopiert");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleSecretVisibility = (projectId: string) => {
    setVisibleSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId); else next.add(projectId);
      return next;
    });
  };

  const getDisplaySecret = (project: any) => generatedSecrets[project.id] || project.api_secret;
  const SSO_API_URL_DISPLAY = `${SUPABASE_URL}/functions/v1/sso-auth`;

  return (
    <div className="max-w-4xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground mb-1">API-Dokumentation</h1>
      <p className="font-body text-sm text-muted-foreground mb-8">
        Greifen Sie auf alle Inhalte über die REST-API zu — ideal für externe Tools, Automationen oder mobile Apps.
      </p>

      {/* SSO Projects & API Keys */}
      <div className="bg-card border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Key size={20} className="text-primary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">SSO-Projekte & API-Keys</h2>
        </div>
        <div className="mb-4">
          <label className="font-heading text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
            <Building2 size={12} /> SSO API Endpoint
          </label>
          <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-4 py-2.5">
            <code className="font-mono text-xs text-foreground flex-1 select-all break-all">{SSO_API_URL_DISPLAY}</code>
            <button onClick={() => copyToClipboard(SSO_API_URL_DISPLAY, "endpoint")} className="text-muted-foreground hover:text-foreground transition-colors" title="Kopieren">
              {copiedField === "endpoint" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {projects?.map((p: any) => {
            const userCount = accessList?.filter((a: any) => a.project_id === p.id && a.active).length || 0;
            const secret = getDisplaySecret(p);
            const isVisible = visibleSecrets.has(p.id);
            return (
              <div key={p.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="min-w-0">
                    <h3 className="font-heading text-sm font-semibold text-foreground">{p.name}</h3>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      Key: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">{p.project_key}</code>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 font-body text-xs text-muted-foreground">
                      <Users size={12} /> {userCount}
                    </span>
                    <span className={`inline-flex items-center font-body text-[10px] px-2 py-0.5 rounded-full ${p.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {p.active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-heading text-xs font-medium text-muted-foreground">API-Secret</label>
                  <button
                    onClick={() => generateSecretMutation.mutate(p.id)}
                    disabled={generateSecretMutation.isPending}
                    className="inline-flex items-center gap-1.5 font-body text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={generateSecretMutation.isPending ? "animate-spin" : ""} />
                    {secret ? "Neu generieren" : "Generieren"}
                  </button>
                </div>
                {secret ? (
                  <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                    <code className="font-mono text-xs text-foreground flex-1 select-all break-all">
                      {isVisible ? secret : "••••••••••••••••••••••••••••••••"}
                    </code>
                    <button onClick={() => toggleSecretVisibility(p.id)} className="text-muted-foreground hover:text-foreground" title={isVisible ? "Verbergen" : "Anzeigen"}>
                      {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => copyToClipboard(secret, `secret-${p.id}`)} className="text-muted-foreground hover:text-foreground" title="Kopieren">
                      {copiedField === `secret-${p.id}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                ) : (
                  <p className="font-body text-xs text-muted-foreground italic">Noch kein API-Secret generiert.</p>
                )}
              </div>
            );
          })}
          {(!projects || projects.length === 0) && (
            <p className="font-body text-sm text-muted-foreground italic">Keine SSO-Projekte vorhanden.</p>
          )}
        </div>
      </div>

      {/* Base Info */}
      <div className="bg-card border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock size={20} className="text-primary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Authentifizierung</h2>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-4">
          Alle API-Aufrufe benötigen den <code className="bg-muted px-1 rounded text-xs">apikey</code> Header.
          Für schreibende Zugriffe zusätzlich den <code className="bg-muted px-1 rounded text-xs">Authorization: Bearer</code> Header mit einem gültigen JWT-Token.
        </p>
        <CodeBlock label="Base URL" code={`${SUPABASE_URL}/rest/v1`} />
        <CodeBlock label="API Key (anon/public)" code={ANON_KEY} />
      </div>

      {/* Quick Start */}
      <div className="bg-card border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Code2 size={20} className="text-primary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Schnellstart</h2>
        </div>
        <CodeBlock
          label="Beispiel: Alle Agenturen abrufen (cURL)"
          code={`curl '${SUPABASE_URL}/rest/v1/agencies?select=*&active=eq.true&order=sort_order' \\
  -H "apikey: ${ANON_KEY}" \\
  -H "Accept: application/json"`}
        />
        <CodeBlock
          label="Beispiel: JavaScript / fetch"
          code={`const res = await fetch(
  '${SUPABASE_URL}/rest/v1/agencies?select=*&active=eq.true&order=sort_order',
  {
    headers: {
      'apikey': '${ANON_KEY}',
      'Accept': 'application/json',
    },
  }
);
const agencies = await res.json();`}
        />
        <CodeBlock
          label="Beispiel: KI-Chat Edge Function aufrufen"
          code={`const res = await fetch(
  '${SUPABASE_URL}/functions/v1/ai-chat',
  {
    method: 'POST',
    headers: {
      'apikey': '${ANON_KEY}',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Welche Agenturen gibt es?' }]
    }),
  }
);
// Streaming response (text/event-stream)`}
        />
      </div>

      {/* Edge Functions */}
      <div className="bg-card border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap size={20} className="text-primary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Edge Functions ({edgeFunctions.length})</h2>
        </div>
        <div className="space-y-2 mb-6">
          {edgeFunctions.map((f) => (
            <div key={f.name} className="flex items-start justify-between gap-3 px-3 py-2 border border-border rounded-lg">
              <div className="min-w-0">
                <div className="font-body text-sm font-medium text-foreground">
                  {f.label} <span className="font-mono text-xs text-muted-foreground">/functions/v1/{f.name}</span>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-0.5">{f.description}</p>
              </div>
              <span className={`shrink-0 font-body text-[10px] px-2 py-0.5 rounded ${f.public ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {f.public ? "Öffentlich" : "API-Key"}
              </span>
            </div>
          ))}
        </div>

        <h3 className="font-heading text-sm font-semibold text-foreground mb-2">SSO — Action: verify (Login)</h3>
        <p className="font-body text-xs text-muted-foreground mb-2">
          Verifiziert E-Mail/Passwort und liefert Benutzerdaten inkl. Agentur-Zuordnung. Header <code className="bg-muted px-1 rounded">x-sso-api-key</code> erforderlich (api_secret aus sso_projects).
        </p>
        <CodeBlock
          label="Request"
          code={`POST ${SUPABASE_URL}/functions/v1/sso-auth
x-sso-api-key: <api_secret>
Content-Type: application/json

{
  "action": "verify",
  "project_key": "ssm-recruit",
  "email": "user@ssmpartner.ch",
  "password": "..."
}`}
        />
        <CodeBlock
          label="Response (200)"
          code={`{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@ssmpartner.ch",
    "display_name": "Max Mustermann",
    "avatar_url": "https://.../avatar.jpg",
    "role": "teamleiter",
    "agency_id": "uuid",
    "agency_name": "Zürich Nord"
  }
}`}
        />

        <h3 className="font-heading text-sm font-semibold text-foreground mb-2 mt-6">SSO — Action: list_project_users (Pull-Sync)</h3>
        <p className="font-body text-xs text-muted-foreground mb-2">
          Liefert alle Benutzer, die einem Projekt zugewiesen sind — identische Felder wie verify, ideal für regelmäßige Synchronisation.
        </p>
        <CodeBlock
          label="Request"
          code={`POST ${SUPABASE_URL}/functions/v1/sso-auth
x-sso-api-key: <api_secret>
Content-Type: application/json

{
  "action": "list_project_users",
  "project_key": "ssm-recruit"
}`}
        />
        <CodeBlock
          label="Response (200)"
          code={`{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "email": "user@ssmpartner.ch",
      "display_name": "Max Mustermann",
      "avatar_url": "https://.../avatar.jpg",
      "role": "teamleiter",
      "agency_id": "uuid",
      "agency_name": "Zürich Nord",
      "is_active": true,
      "assigned_at": "2025-01-15T10:00:00Z"
    }
  ]
}`}
        />
      </div>

      {/* Tables */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database size={20} className="text-primary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Verfügbare Endpunkte ({tables.length} Tabellen)</h2>
        </div>
        <div className="space-y-2">
          {tables.map((t) => (
            <div key={t.name} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedTable(expandedTable === t.name ? null : t.name)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div>
                  <span className="font-body text-sm font-medium text-foreground">{t.label}</span>
                  <span className="font-body text-xs text-muted-foreground ml-2">/{t.name}</span>
                </div>
                <span className="font-body text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  GET / POST / PATCH / DELETE
                </span>
              </button>
              {expandedTable === t.name && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                  <p className="font-body text-xs text-muted-foreground mb-3">{t.description}</p>
                  <CodeBlock
                    label="Alle lesen (GET)"
                    code={`GET ${SUPABASE_URL}/rest/v1/${t.name}?select=*`}
                  />
                  <CodeBlock
                    label="Gefiltert lesen"
                    code={`GET ${SUPABASE_URL}/rest/v1/${t.name}?select=*&active=eq.true`}
                  />
                  <CodeBlock
                    label="Einzelnen Datensatz lesen"
                    code={`GET ${SUPABASE_URL}/rest/v1/${t.name}?id=eq.{uuid}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PostgREST Docs Link */}
      <div className="mt-6 text-center">
        <a
          href="https://postgrest.org/en/stable/references/api.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-body text-sm text-primary hover:underline"
        >
          <ExternalLink size={14} />
          Vollständige API-Referenz (PostgREST)
        </a>
      </div>
    </div>
  );
};

export default AdminApiDocs;
