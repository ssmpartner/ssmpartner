import { useState } from "react";
import { Copy, Check, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ACS_URL = `${SUPABASE_URL}/auth/v1/sso/saml/acs`;
const ENTITY_ID = `${SUPABASE_URL}/auth/v1/sso/saml/metadata`;
const METADATA_URL = `${SUPABASE_URL}/auth/v1/sso/saml/metadata?download=true`;

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <div className="flex items-stretch gap-2">
        <code className="flex-1 rounded-xl border bg-muted/40 px-3 py-2 text-xs font-mono break-all">{value}</code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success("Kopiert");
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-1.5 rounded-xl border bg-card px-3 text-xs font-body hover:bg-muted transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "OK" : "Kopieren"}
        </button>
      </div>
    </div>
  );
}

const AdminEntraSso = () => {
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const domain = testEmail.split("@")[1]?.trim().toLowerCase();
    if (!domain) {
      toast.error("Bitte eine gültige E-Mail eingeben");
      return;
    }
    setTesting(true);
    const { data, error } = await supabase.auth.signInWithSSO({
      domain,
      options: { redirectTo: `${window.location.origin}/portal` },
    });
    setTesting(false);
    if (error) {
      toast.error(error.message || "SSO ist für diese Domain nicht aktiv");
      return;
    }
    if (data?.url) window.location.href = data.url;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Microsoft Entra ID (SSO)</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          SAML 2.0 Single Sign-On für Firmen-Konten. Bestehende E-Mail/Passwort-Logins bleiben unverändert.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">1. Service-Provider-Details für Entra</h2>
        </div>
        <p className="font-body text-sm text-muted-foreground">
          Diese Werte in der Entra-Enterprise-Application (SAML) hinterlegen:
        </p>
        <div className="space-y-3">
          <CopyField label="Identifier / Entity ID" value={ENTITY_ID} />
          <CopyField label="Reply URL (ACS)" value={ACS_URL} />
          <CopyField label="Sign-on URL" value={`${window.location.origin}/login`} />
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <h2 className="font-display text-lg font-semibold">2. Anleitung in Entra ID</h2>
        <ol className="list-decimal list-inside space-y-2 font-body text-sm text-muted-foreground">
          <li>Entra Admin Center → <em>Enterprise Applications</em> → <em>New application</em> → <em>Create your own application</em> → Name z.B. „SSM CMS" → <em>Non-gallery</em>.</li>
          <li>Im neuen Eintrag: <em>Single sign-on</em> → <strong>SAML</strong> wählen.</li>
          <li><em>Basic SAML Configuration</em> → die drei Werte oben einsetzen.</li>
          <li><em>Attributes &amp; Claims</em> Standard belassen (Email als NameID reicht).</li>
          <li><em>SAML Certificates</em> → <strong>App Federation Metadata Url</strong> kopieren.</li>
          <li><em>Users and groups</em> → Berechtigte User / Gruppe zuweisen.</li>
        </ol>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 space-y-3">
        <h2 className="font-display text-lg font-semibold">3. SSO aktivieren</h2>
        <p className="font-body text-sm">
          Sobald die <strong>App Federation Metadata Url</strong> aus Entra vorliegt und die zugelassene E-Mail-Domain (z.B. <code className="text-xs bg-muted px-1.5 py-0.5 rounded">ssmpartner.ch</code>) festgelegt ist, kann die IT-Administration den Provider im Backend freischalten. Anschliessend ist der Microsoft-Login auf der Anmeldeseite verfügbar.
        </p>
        <p className="font-body text-xs text-muted-foreground">
          Bestehende Konten mit identischer E-Mail werden beim ersten SSO-Login automatisch verknüpft (Rolle, Profil und Team-Zuordnung werden übernommen).
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold">4. Test-Login (nach Aktivierung)</h2>
        <p className="font-body text-sm text-muted-foreground">
          Gib eine Firmen-E-Mail ein. Wenn die Domain als SSO-Provider aktiv ist, wirst du zu Microsoft weitergeleitet.
        </p>
        <form onSubmit={handleTest} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="vorname.nachname@ssmpartner.ch"
            className="flex-1 h-11 rounded-xl border bg-background px-4 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={testing}
            className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-body text-sm font-medium hover:bg-primary/90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            Mit SSO anmelden
          </button>
        </form>
        <p className="font-body text-xs text-muted-foreground">
          Metadata-Endpunkt (informativ): <a href={METADATA_URL} target="_blank" rel="noreferrer" className="underline">SP-Metadata anzeigen</a>
        </p>
      </div>
    </div>
  );
};

export default AdminEntraSso;