import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ShieldCheck, ShieldX, Clock, Users, Building2, Activity } from "lucide-react";
import { toast } from "sonner";

const actionLabels: Record<string, string> = {
  sso_login: "SSO Login",
  access_granted: "Zugang erteilt",
  access_revoked: "Zugang entzogen",
  login: "Login",
};

const AdminSSO = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"access" | "projects" | "audit">("access");

  // Fetch users with manage-users function
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

  // Fetch projects
  const { data: projects } = useQuery({
    queryKey: ["sso-projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sso_projects" as any).select("*").order("created_at");
      if (error) throw error;
      return data as any[];
    },
  });

  // Fetch access matrix
  const { data: accessList } = useQuery({
    queryKey: ["sso-access"],
    queryFn: async () => {
      const { data, error } = await supabase.from("project_access" as any).select("*");
      if (error) throw error;
      return data as any[];
    },
  });

  // Fetch audit log
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

  const hasAccess = (userId: string, projectId: string) => {
    return accessList?.find((a: any) => a.user_id === userId && a.project_id === projectId && a.active);
  };

  const tabs = [
    { key: "access", label: "Zugangsmatrix", icon: Shield },
    { key: "projects", label: "Projekte", icon: Building2 },
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

      {/* Projects */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects?.map((p: any) => {
            const userCount = accessList?.filter((a: any) => a.project_id === p.id && a.active).length || 0;
            return (
              <div key={p.id} className="bg-card border rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-base font-semibold text-foreground">{p.name}</h3>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      Schlüssel: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">{p.project_key}</code>
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 font-body text-xs px-2 py-1 rounded-full ${
                    p.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                  }`}>
                    {p.active ? "Aktiv" : "Inaktiv"}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                  <div className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                    <Users size={12} />
                    {userCount} Benutzer
                  </div>
                  {p.api_url && (
                    <div className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                      API: <code className="bg-muted px-1 rounded text-[10px]">{p.api_url}</code>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
