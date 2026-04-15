import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ShieldCheck, ShieldX, Clock, Users, Building2, Activity, Key, Copy, Check, RefreshCw, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const actionLabels: Record<string, string> = {
  sso_login: "SSO Login",
  access_granted: "Zugang erteilt",
  access_revoked: "Zugang entzogen",
  secret_generated: "API-Secret generiert",
  login: "Login",
};

const SSO_API_URL_DISPLAY = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sso-auth`;

const AdminSSO = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"access" | "projects" | "audit">("access");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [generatedSecrets, setGeneratedSecrets] = useState<Record<string, string>>({});

  const { data: users } = useQuery({
    queryKey: ["sso-users"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "list" },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.users as any[];
    },
  });

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

  const { data: auditLogs } = useQuery({
    queryKey: ["sso-audit"],
    enabled: activeTab === "audit",
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("sso-auth", {
        body: { action: "audit_log", limit: 100 },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.logs as any[];
    },
  });

  const toggleAccessMutation = useMutation({
    mutationFn: async ({ user_id, project_id, grant }: { user_id: string; project_id: string; grant: boolean }) => {
      const { data, error } = await supabase.functions.invoke("sso-auth", {
        body: { action: grant ? "grant_access" : "revoke_access", user_id, project_id },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sso-access"] });
      queryClient.invalidateQueries({ queryKey: ["sso-audit"] });
      toast.success("Zugang aktualisiert");
    },
    onError: (err: any) => toast.error(err.message),
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
      queryClient.invalidateQueries({ queryKey: ["sso-audit"] });
      toast.success("API-Secret generiert – bitte jetzt kopieren!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const hasAccess = (userId: string, projectId: string) => {
    return accessList?.find((a: any) => a.user_id === userId && a.project_id === projectId && a.active);
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success("In Zwischenablage kopiert");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleSecretVisibility = (projectId: string) => {
    setVisibleSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const getDisplaySecret = (project: any) => {
    if (generatedSecrets[project.id]) return generatedSecrets[project.id];
    return project.api_secret;
  };

  const tabs = [
    { key: "access", label: "Zugangsmatrix", icon: Shield },
    { key: "projects", label: "Projekte & API-Keys", icon: Key },
    { key: "audit", label: "Aktivitätslog", icon: Activity },
  ] as const;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">SSO & Zugriffsverwaltung</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Zentrale Benutzer- und Projektzugriffsverwaltung</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/30 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 font-body text-sm px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Access Matrix */}
      {activeTab === "access" && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="font-heading text-xs font-medium text-muted-foreground text-left px-4 py-3 sticky left-0 bg-muted/30">
                    Benutzer
                  </th>
                  {projects?.map((p: any) => (
                    <th key={p.id} className="font-heading text-xs font-medium text-muted-foreground text-center px-4 py-3 min-w-[120px]">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users?.map((u: any) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 sticky left-0 bg-card">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center font-heading text-xs font-semibold text-primary">
                          {(u.display_name || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-body text-sm font-medium text-foreground">{u.display_name}</p>
                          <p className="font-body text-[10px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    {projects?.map((p: any) => {
                      const access = hasAccess(u.id, p.id);
                      return (
                        <td key={p.id} className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleAccessMutation.mutate({
                              user_id: u.id,
                              project_id: p.id,
                              grant: !access,
                            })}
                            className={`inline-flex items-center gap-1 font-body text-xs px-2.5 py-1.5 rounded-full transition-colors ${
                              access
                                ? "bg-emerald-500/10 text-emerald-600 hover:bg-red-500/10 hover:text-red-600"
                                : "bg-muted text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600"
                            }`}
                            title={access ? "Zugang entziehen" : "Zugang erteilen"}
                          >
                            {access ? <ShieldCheck size={12} /> : <ShieldX size={12} />}
                            {access ? "Aktiv" : "Kein Zugang"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects & API Keys */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          {/* SSO Endpoint Info */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Building2 size={14} />
              SSO API Endpoint
            </h3>
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-4 py-2.5">
              <code className="font-mono text-xs text-foreground flex-1 select-all">{SSO_API_URL_DISPLAY}</code>
              <button
                onClick={() => copyToClipboard(SSO_API_URL_DISPLAY, "endpoint")}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Kopieren"
              >
                {copiedField === "endpoint" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Project Cards */}
          <div className="grid grid-cols-1 gap-4">
            {projects?.map((p: any) => {
              const userCount = accessList?.filter((a: any) => a.project_id === p.id && a.active).length || 0;
              const secret = getDisplaySecret(p);
              const isVisible = visibleSecrets.has(p.id);

              return (
                <div key={p.id} className="bg-card border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading text-base font-semibold text-foreground">{p.name}</h3>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        Schlüssel: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">{p.project_key}</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 font-body text-xs text-muted-foreground">
                        <Users size={12} />
                        {userCount}
                      </span>
                      <span className={`inline-flex items-center gap-1 font-body text-xs px-2 py-1 rounded-full ${
                        p.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                      }`}>
                        {p.active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </div>
                  </div>

                  {/* API Secret Section */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-heading text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Key size={12} />
                        API-Secret
                      </label>
                      <button
                        onClick={() => generateSecretMutation.mutate(p.id)}
                        disabled={generateSecretMutation.isPending}
                        className="inline-flex items-center gap-1.5 font-body text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={generateSecretMutation.isPending ? "animate-spin" : ""} />
                        {secret ? "Neu generieren" : "Generieren"}
                      </button>
                    </div>

                    {secret ? (
                      <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-4 py-2.5">
                        <code className="font-mono text-xs text-foreground flex-1 select-all">
                          {isVisible ? secret : "••••••••••••••••••••••••••••••••"}
                        </code>
                        <button
                          onClick={() => toggleSecretVisibility(p.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title={isVisible ? "Verbergen" : "Anzeigen"}
                        >
                          {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(secret, `secret-${p.id}`)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Kopieren"
                        >
                          {copiedField === `secret-${p.id}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ) : (
                      <p className="font-body text-xs text-muted-foreground italic">
                        Noch kein API-Secret generiert. Klicke auf "Generieren" um einen sicheren Schlüssel zu erstellen.
                      </p>
                    )}

                    {/* Project Key copy */}
                    <div className="flex items-center gap-2">
                      <label className="font-heading text-xs font-medium text-muted-foreground whitespace-nowrap">Project Key:</label>
                      <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-1.5 flex-1">
                        <code className="font-mono text-xs text-foreground flex-1">{p.project_key}</code>
                        <button
                          onClick={() => copyToClipboard(p.project_key, `key-${p.id}`)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedField === `key-${p.id}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Integration Hint */}
          <div className="bg-muted/20 border border-dashed rounded-xl p-5">
            <h4 className="font-heading text-sm font-semibold text-foreground mb-2">Integration in anderen Projekten</h4>
            <p className="font-body text-xs text-muted-foreground mb-3">
              Verwende den API-Endpoint, Project Key und API-Secret in deinen anderen SSM-Projekten, um Benutzer zentral über SSO zu authentifizieren.
            </p>
            <div className="bg-card rounded-lg p-4 border">
              <pre className="font-mono text-[11px] text-foreground whitespace-pre-wrap">{`// Beispiel SSO-Verify Call
const res = await fetch("${SSO_API_URL_DISPLAY}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-sso-api-key": "DEIN_API_SECRET"
  },
  body: JSON.stringify({
    action: "verify",
    email: "user@ssmpartner.ch",
    password: "...",
    project_key: "ssm-cockpit"
  })
});`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log */}
      {activeTab === "audit" && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="font-heading text-xs font-medium text-muted-foreground text-left px-4 py-3">Zeitpunkt</th>
                <th className="font-heading text-xs font-medium text-muted-foreground text-left px-4 py-3">Benutzer</th>
                <th className="font-heading text-xs font-medium text-muted-foreground text-left px-4 py-3">Aktion</th>
                <th className="font-heading text-xs font-medium text-muted-foreground text-left px-4 py-3">Projekt</th>
                <th className="font-heading text-xs font-medium text-muted-foreground text-left px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center font-body text-sm text-muted-foreground">
                    Noch keine Aktivitäten aufgezeichnet
                  </td>
                </tr>
              )}
              {auditLogs?.map((log: any) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} className="text-muted-foreground" />
                      <span className="font-body text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("de-CH")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-body text-xs text-foreground">{log.user_email || "–"}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`font-body text-xs px-2 py-0.5 rounded-full ${
                      log.action === "sso_login" ? "bg-blue-500/10 text-blue-600"
                        : log.action === "access_granted" ? "bg-emerald-500/10 text-emerald-600"
                        : log.action === "access_revoked" ? "bg-red-500/10 text-red-600"
                        : log.action === "secret_generated" ? "bg-amber-500/10 text-amber-600"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {actionLabels[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-body text-xs text-muted-foreground">{log.project_key || "–"}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-body text-[10px] text-muted-foreground font-mono">{log.ip_address || "–"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSSO;
