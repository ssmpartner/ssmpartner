import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Plus, Trash2, KeyRound, Shield, FolderKey, Search, X, CheckSquare, Square, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import MediaPickerModal from "@/components/MediaPickerModal";

const roleLabels: Record<string, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  vertriebsleiter: "Vertriebsleiter",
  teamleiter: "Teamleiter",
  finanzcoach: "Finanzcoach",
  trainee: "Trainee",
  controlling: "Controlling",
  geschaeftsleitung: "Geschäftsleitung",
  hr: "HR",
  backoffice: "Backoffice",
  analyst: "Analyst",
  agency_manager: "Agenturleiter",
  verkaufsleiter: "Verkaufsleiter",
};

const roleColors: Record<string, string> = {
  superadmin: "bg-red-500/10 text-red-600",
  admin: "bg-orange-500/10 text-orange-600",
  vertriebsleiter: "bg-indigo-500/10 text-indigo-600",
  teamleiter: "bg-emerald-500/10 text-emerald-600",
  finanzcoach: "bg-green-500/10 text-green-600",
  trainee: "bg-lime-500/10 text-lime-600",
  controlling: "bg-cyan-500/10 text-cyan-600",
  geschaeftsleitung: "bg-amber-500/10 text-amber-600",
  hr: "bg-pink-500/10 text-pink-600",
  backoffice: "bg-blue-500/10 text-blue-600",
  analyst: "bg-purple-500/10 text-purple-600",
  agency_manager: "bg-teal-500/10 text-teal-600",
  verkaufsleiter: "bg-rose-500/10 text-rose-600",
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
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState<{ userId: string; password: string } | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkRole, setBulkRole] = useState<string>("");
  const [avatarPickerFor, setAvatarPickerFor] = useState<string | null>(null);

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

  const callAction = async (action: string, payload: Record<string, any>) => {
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { action, ...payload },
    });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return data;
  };

  const createMutation = useMutation({
    mutationFn: () => callAction("create", { ...createForm, project_ids: selectedProjects }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["sso-access"] });
      setShowCreate(false);
      setCreateForm({ email: "", password: "", display_name: "", role: "admin" });
      setSelectedProjects([]);
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

  const updateAvatarMutation = useMutation({
    mutationFn: ({ user_id, avatar_url }: { user_id: string; avatar_url: string | null }) =>
      callAction("update_avatar", { user_id, avatar_url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setAvatarPickerFor(null);
      toast.success("Profilbild aktualisiert");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) await callAction("delete", { user_id: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUsers([]);
      toast.success("Benutzer gelöscht");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const bulkRoleMutation = useMutation({
    mutationFn: async ({ ids, role }: { ids: string[]; role: string }) => {
      for (const id of ids) await callAction("update_role", { user_id: id, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUsers([]);
      setBulkRole("");
      toast.success("Rollen aktualisiert");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const getUserProjects = (userId: string) => {
    return accessList?.filter((a: any) => a.user_id === userId && a.active) || [];
  };

  const filteredUsers = (users || []).filter((u) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.email.toLowerCase().includes(q) ||
      (u.display_name || "").toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || (u.role || "") === roleFilter;
    return matchesSearch && matchesRole;
  });

  const allVisibleSelected =
    filteredUsers.length > 0 && filteredUsers.every((u) => selectedUsers.includes(u.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedUsers((prev) => prev.filter((id) => !filteredUsers.some((u) => u.id === id)));
    } else {
      setSelectedUsers((prev) => Array.from(new Set([...prev, ...filteredUsers.map((u) => u.id)])));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUsers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

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

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Suche nach Name oder E-Mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border pl-9 pr-9 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-background border border-border px-3 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring sm:w-56"
        >
          <option value="all">Alle Rollen</option>
          {Object.entries(roleLabels).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Action toolbar */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="font-body text-sm font-medium text-foreground">
            {selectedUsers.length} ausgewählt
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={bulkRole}
              onChange={(e) => setBulkRole(e.target.value)}
              className="bg-background border border-border px-3 py-1.5 font-body text-xs rounded-lg"
            >
              <option value="">Rolle ändern...</option>
              {Object.entries(roleLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <button
              disabled={!bulkRole || bulkRoleMutation.isPending}
              onClick={() => bulkRoleMutation.mutate({ ids: selectedUsers, role: bulkRole })}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-body text-xs px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              Anwenden
            </button>
            <button
              onClick={() => {
                if (confirm(`${selectedUsers.length} Benutzer wirklich löschen?`)) {
                  bulkDeleteMutation.mutate(selectedUsers.filter((id) => id !== user?.id));
                }
              }}
              disabled={bulkDeleteMutation.isPending}
              className="inline-flex items-center gap-1.5 bg-destructive text-destructive-foreground font-body text-xs px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              <Trash2 size={12} /> Löschen
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="font-body text-xs text-muted-foreground hover:text-foreground px-2"
            >
              Aufheben
            </button>
          </div>
        </div>
      )}

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

          {/* Project Access Checkboxes */}
          {projects && projects.length > 0 && (
            <div>
              <label className="font-heading text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                <FolderKey size={12} />
                Projektzugriff
              </label>
              <div className="flex flex-wrap gap-2">
                {projects.map((p: any) => (
                  <label
                    key={p.id}
                    className={`inline-flex items-center gap-2 font-body text-sm px-3 py-2 rounded-lg border cursor-pointer transition-colors select-none ${
                      selectedProjects.includes(p.id)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-muted/20 text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(p.id)}
                      onChange={() => toggleProject(p.id)}
                      className="h-3.5 w-3.5 rounded border-border accent-[hsl(var(--primary))]"
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              Erstellen
            </button>
            <button onClick={() => { setShowCreate(false); setSelectedProjects([]); }} className="font-body text-sm text-muted-foreground px-4 py-2">Abbrechen</button>
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
                <th className="w-10 px-4 py-3">
                  <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground">
                    {allVisibleSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="font-heading text-xs font-medium text-muted-foreground text-left px-4 py-3">Benutzer</th>
                <th className="font-heading text-xs font-medium text-muted-foreground text-left px-4 py-3">Rolle</th>
                <th className="font-heading text-xs font-medium text-muted-foreground text-left px-4 py-3">Projekte</th>
                <th className="font-heading text-xs font-medium text-muted-foreground text-left px-4 py-3">Erstellt</th>
                <th className="font-heading text-xs font-medium text-muted-foreground text-right px-4 py-3">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center font-body text-sm text-muted-foreground">Keine Benutzer gefunden</td></tr>
              )}
              {filteredUsers.map((u) => {
                const userProjects = getUserProjects(u.id);
                const isSelected = selectedUsers.includes(u.id);
                return (
                  <tr key={u.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${isSelected ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelectUser(u.id)} className="text-muted-foreground hover:text-foreground">
                        {isSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                      </button>
                    </td>
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
                      <div className="flex flex-wrap gap-1">
                        {userProjects.length > 0 ? (
                          userProjects.map((a: any) => {
                            const proj = projects?.find((p: any) => p.id === a.project_id);
                            return proj ? (
                              <span key={a.id} className="font-body text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {proj.name}
                              </span>
                            ) : null;
                          })
                        ) : (
                          <span className="font-body text-[10px] text-muted-foreground">–</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-body text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("de-CH")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
