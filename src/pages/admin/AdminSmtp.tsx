import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type S = { host: string; port: number; secure: boolean; username: string; password: string; from_email: string; from_name: string; notify_email: string; enabled: boolean };
const empty: S = { host: "", port: 465, secure: true, username: "", password: "", from_email: "", from_name: "SSM Partner AG", notify_email: "marketing@ssmpartner.ch", enabled: false };

const call = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("smtp-settings", { body });
  if (error) {
    let msg = error.message;
    try { msg = (await (error as any).context.json()).error || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
};

const AdminSmtp = () => {
  const [s, setS] = useState<S>(empty);
  const [hasPw, setHasPw] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testTo, setTestTo] = useState("");

  useEffect(() => {
    call({ action: "get" }).then((d) => {
      if (d.settings) { setS({ ...empty, ...d.settings, password: "" }); setHasPw(d.settings.has_password); }
    }).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof S>(k: K, v: S[K]) => setS((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try { await call({ action: "save", settings: s }); toast.success("SMTP-Einstellungen gespeichert"); if (s.password) setHasPw(true); set("password", ""); }
    catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };
  const test = async () => {
    setTesting(true);
    try { const d = await call({ action: "test", to: testTo || undefined }); toast.success(`Test-E-Mail gesendet an ${d.to}`); }
    catch (e: any) { toast.error(`Test fehlgeschlagen: ${e.message}`); } finally { setTesting(false); }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-2xl">
      <Link to="/admin/settings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft size={16} /> Einstellungen</Link>
      <h1 className="font-heading text-2xl font-semibold text-foreground mb-1 flex items-center gap-2"><Mail size={22} /> E-Mail (SMTP)</h1>
      <p className="font-body text-sm text-muted-foreground mb-6">Eigenen Mailserver für Benachrichtigungen und Bestätigungen verwenden (z. B. Kontaktformular).</p>

      <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div><Label>SMTP aktiv</Label><p className="text-xs text-muted-foreground">E-Mails werden über diesen Server versendet.</p></div>
          <Switch checked={s.enabled} onCheckedChange={(v) => set("enabled", v)} />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2"><Label>SMTP-Server</Label><Input value={s.host} onChange={(e) => set("host", e.target.value)} placeholder="smtp.office365.com" /></div>
          <div><Label>Port</Label><Input type="number" value={s.port} onChange={(e) => set("port", Number(e.target.value))} /></div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={s.secure} onCheckedChange={(v) => set("secure", v)} />
          <Label>SSL/TLS (bei Port 465 aktivieren, bei 587 deaktivieren → STARTTLS)</Label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Benutzername</Label><Input value={s.username} onChange={(e) => set("username", e.target.value)} autoComplete="off" /></div>
          <div><Label>Passwort</Label><Input type="password" value={s.password} onChange={(e) => set("password", e.target.value)} placeholder={hasPw ? "•••••••• (gespeichert)" : ""} autoComplete="new-password" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Absender-E-Mail</Label><Input value={s.from_email} onChange={(e) => set("from_email", e.target.value)} placeholder="noreply@ssmpartner.ch" /></div>
          <div><Label>Absender-Name</Label><Input value={s.from_name} onChange={(e) => set("from_name", e.target.value)} /></div>
        </div>
        <div><Label>Benachrichtigungen an</Label><Input value={s.notify_email} onChange={(e) => set("notify_email", e.target.value)} /></div>
        <Button onClick={save} disabled={saving}>{saving && <Loader2 className="animate-spin mr-2" size={16} />}Speichern</Button>
      </div>

      <div className="bg-card border rounded-2xl p-6 shadow-sm mt-6 space-y-3">
        <h2 className="font-heading font-semibold">Verbindung testen</h2>
        <div className="flex gap-2">
          <Input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder={s.notify_email || "E-Mail-Adresse"} />
          <Button variant="outline" onClick={test} disabled={testing}>{testing && <Loader2 className="animate-spin mr-2" size={16} />}Test senden</Button>
        </div>
        <p className="text-xs text-muted-foreground">Zuerst speichern, dann testen.</p>
      </div>
    </div>
  );
};
export default AdminSmtp;
