import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Plus, Trash2, KeyRound, Shield, Mail } from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  backoffice: "Backoffice",
  analyst: "Analyst",
  teamleiter: "Teamleiter",
  controlling: "Controlling",
  geschaeftsleitung: "Geschäftsleitung",
  hr: "HR",
  agency_manager: "Agenturleiter",
};

const roleColors: Record<string, string> = {
  superadmin: "bg-red-500/10 text-red-600",
  admin: "bg-orange-500/10 text-orange-600",
  backoffice: "bg-blue-500/10 text-blue-600",
  analyst: "bg-purple-500/10 text-purple-600",
  teamleiter: "bg-emerald-500/10 text-emerald-600",
  controlling: "bg-cyan-500/10 text-cyan-600",
  geschaeftsleitung: "bg-amber-500/10 text-amber-600",
  hr: "bg-pink-500/10 text-pink-600",
  agency_manager: "bg-teal-500/10 text-teal-600",
};

interface UserData {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "", display_name: "", role: "admin" });
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState<{ userId: string; password: string } | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "list" },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.users as UserData[];
    },
  });

  const callAction = async (action: string, payload: Record<string, any>) => {
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { action, ...payload },
    });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return data;
  };

  const createMutation = useMutation({
    mutationFn: () => callAction("create", createForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowCreate(false);
      setCreateForm({ email: "", password: "", display_name: "", role: "admin" });
      toast.success("Benutzer erstellt");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ user_id, role }: { user_id: string; role: string }) =>
      callAction("update_role", { user_id, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingRole(null);
      toast.success("Rolle aktualisiert");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetPwMutation = useMutation({
    mutationFn: ({ user_id, new_password }: { user_id: string; new_password: string }) =>
      callAction("reset_password", { user_id, new_password }),
    onSuccess: () => {
      setResetPw(null);
      toast.success("Passwort zurückgesetzt");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (user_id: string) => callAction("delete", { user_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Benutzer gelöscht");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const inputClass = "w-full bg-background border border-border px-3 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Benutzerverwaltung</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90"
        >
          <Plus size={18} /> Benutzer erstellen
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-card border rounded-xl p-6 mb-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">Neuer Benutzer</h2>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="E-Mail" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className={inputClass} />
            <input placeholder="Passwort" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className={inputClass} />
            <input placeholder="Anzeigename" value={createForm.display_name} onChange={(e) => setCreateForm({ ...createForm, display_name: e.target.value })} className={inputClass} />
            <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className={inputClass}>
              {Object.entries(roleLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              Erstellen
            </button>
            <button onClick={() => setShowCreate(false)} className="font-body text-sm text-muted-foreground px-4 py-2">Abbrechen</button>
          </div>
        </div>
      )}

      {/* Users list */}
      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="font-heading text-xs font-medium text-muted-foreground text-left px-4 py-3">Benutzer</th>
                <th className="font-heading text-xs font-medium text-muted-foreground text-left px-4 py-3">Rolle</th>
                <th className="font-heading text-xs font-medium text-muted-foreground text-left px-4 py-3">Erstellt</th>
                <th className="font-heading text-xs font-medium text-muted-foreground text-right px-4 py-3">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-heading text-xs font-semibold text-primary">
                        {(u.display_name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">{u.display_name || u.email}</p>
                        <p className="font-body text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingRole === u.id ? (
                      <select
                        defaultValue={u.role || ""}
                        onChange={(e) => {
                          updateRoleMutation.mutate({ user_id: u.id, role: e.target.value });
                        }}
                        onBlur={() => setEditingRole(null)}
                        autoFocus
                        className={inputClass + " w-40"}
                      >
                        {Object.entries(roleLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingRole(u.id)}
                        className={`inline-flex items-center gap-1 font-body text-xs px-2.5 py-1 rounded-full ${roleColors[u.role || ""] || "bg-muted text-muted-foreground"}`}
                      >
                        <Shield size={10} />
                        {roleLabels[u.role || ""] || "Keine Rolle"}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-body text-xs text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString("de-CH")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Reset password */}
                      {resetPw?.userId === u.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="password"
                            placeholder="Neues Passwort"
                            value={resetPw.password}
                            onChange={(e) => setResetPw({ ...resetPw, password: e.target.value })}
                            className="bg-background border border-border px-2 py-1 font-body text-xs rounded w-32"
                          />
                          <button
                            onClick={() => resetPwMutation.mutate({ user_id: u.id, new_password: resetPw.password })}
                            className="font-body text-xs text-primary hover:underline"
                          >
                            OK
                          </button>
                          <button
                            onClick={() => setResetPw(null)}
                            className="font-body text-xs text-muted-foreground"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setResetPw({ userId: u.id, password: "" })}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                          title="Passwort zurücksetzen"
                        >
                          <KeyRound size={14} />
                        </button>
                      )}
                      {/* Delete */}
                      {u.id !== user?.id && (
                        <button
                          onClick={() => {
                            if (confirm(`"${u.display_name || u.email}" wirklich löschen?`)) {
                              deleteMutation.mutate(u.id);
                            }
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors"
                          title="Benutzer löschen"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
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

export default AdminUsers;
