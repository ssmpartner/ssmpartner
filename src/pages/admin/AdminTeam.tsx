import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { value: "", label: "Alle" },
  { value: "geschaeftsleitung", label: "Geschäftsleitung" },
  { value: "fachfuehrung", label: "Fachführung" },
  { value: "erweitertes_team", label: "Erweitertes Team" },
  { value: "agentur", label: "Alle Agenturen" },
];

const emptyForm = { name: "", role_de: "", role_fr: "", role_it: "", role_en: "", category: "geschaeftsleitung", agency_id: "", is_agency_leader: false, image_url: "" };

const AdminTeam = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("");

  const { data: agencies } = useQuery({
    queryKey: ["admin-agencies-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agencies").select("id, name").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: members, isLoading } = useQuery({
    queryKey: ["admin-team"],
    queryFn: async () => {
      const { data, error } = await supabase.from("team_members").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: typeof form & { id?: string }) => {
      const agencyId = item.agency_id || null;
      const cat = agencyId ? "agentur" : item.category;
      const payload = {
        name: item.name,
        role_de: item.role_de,
        role_fr: item.role_fr,
        role_it: item.role_it,
        role_en: item.role_en,
        category: cat,
        agency_id: agencyId,
        is_agency_leader: item.is_agency_leader,
        image_url: item.image_url || null,
      };
      if (item.id) {
        const { error } = await supabase.from("team_members").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("team_members").insert({
          ...payload,
          sort_order: members?.length || 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      setEditingId(null);
      setForm(emptyForm);
      toast.success("Gespeichert");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      toast.success("Gelöscht");
    },
  });

  const handleImageUpload = async (file: File, memberId?: string) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const id = memberId || "new-" + Date.now();
      const path = `team/${id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);

      if (memberId) {
        // Existing member — save directly to DB
        const { error } = await supabase.from("team_members").update({ image_url: publicUrl }).eq("id", memberId);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ["admin-team"] });
        toast.success("Foto hochgeladen");
      } else {
        // New member — just set in form state
        setForm((prev) => ({ ...prev, image_url: publicUrl }));
        toast.success("Foto hochgeladen — bitte speichern");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      role_de: m.role_de || "",
      role_fr: m.role_fr || "",
      role_it: m.role_it || "",
      role_en: m.role_en || "",
      category: m.category || "geschaeftsleitung",
      agency_id: m.agency_id || "",
      is_agency_leader: m.is_agency_leader || false,
      image_url: m.image_url || "",
    });
  };

  const filteredMembers = members?.filter((m) => {
    if (!filter) return true;
    if (filter === "agentur") return m.category === "agentur";
    if (filter.startsWith("agency-")) {
      const agencyId = filter.replace("agency-", "");
      return m.category === "agentur" && (m as any).agency_id === agencyId;
    }
    return m.category === filter;
  });

  const inputClass = "w-full bg-background border border-border px-3 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Team</h1>
        <button
          onClick={() => { setEditingId("new"); setForm(emptyForm); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90"
        >
          <Plus size={18} /> Mitglied hinzufügen
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === c.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            {c.label}
            {c.value === "" ? ` (${members?.length || 0})` : c.value === "agentur" ? ` (${members?.filter((m) => m.category === "agentur").length || 0})` : ` (${members?.filter((m) => m.category === c.value).length || 0})`}
          </button>
        ))}
        {agencies?.map((a) => {
          const count = members?.filter((m) => m.category === "agentur" && (m as any).agency_id === a.id).length || 0;
          return (
            <button
              key={`agency-${a.id}`}
              onClick={() => setFilter(`agency-${a.id}`)}
              className={`font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === `agency-${a.id}`
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {a.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Edit / Add Form */}
      {editingId && (
        <div className="bg-card border rounded-xl p-6 mb-6 space-y-4">
          <div className="flex gap-4">
            {/* Image preview + upload */}
            <div className="shrink-0">
              <div className="w-24 h-28 bg-muted rounded-lg overflow-hidden relative group">
                {form.image_url ? (
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-heading text-2xl">
                    {form.name?.charAt(0) || "?"}
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload size={16} className="text-primary-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, editingId === "new" ? undefined : editingId);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <p className="font-body text-[10px] text-muted-foreground mt-1 text-center">
                {uploading ? "Hochladen..." : "Foto"}
              </p>
            </div>

            <div className="flex-1 space-y-3">
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, agency_id: "" })} className={inputClass}>
                  <option value="geschaeftsleitung">Geschäftsleitung</option>
                  <option value="fachfuehrung">Fachführung</option>
                  <option value="erweitertes_team">Erweitertes Team</option>
                  <option value="agentur">Agentur-Zuweisung</option>
                </select>
                {form.category === "agentur" && (
                  <select value={form.agency_id} onChange={(e) => setForm({ ...form, agency_id: e.target.value })} className={inputClass}>
                    <option value="">– Agentur wählen –</option>
                    {agencies?.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                )}
              </div>
              {form.category === "agentur" && (
                <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={form.is_agency_leader} onChange={(e) => setForm({ ...form, is_agency_leader: e.target.checked })} className="rounded border-border" />
                  Agenturleiter/in
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Rolle (DE)" value={form.role_de} onChange={(e) => setForm({ ...form, role_de: e.target.value })} className={inputClass} />
            <input placeholder="Rolle (FR)" value={form.role_fr} onChange={(e) => setForm({ ...form, role_fr: e.target.value })} className={inputClass} />
            <input placeholder="Rolle (IT)" value={form.role_it} onChange={(e) => setForm({ ...form, role_it: e.target.value })} className={inputClass} />
            <input placeholder="Rolle (EN)" value={form.role_en} onChange={(e) => setForm({ ...form, role_en: e.target.value })} className={inputClass} />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => saveMutation.mutate(editingId === "new" ? form : { ...form, id: editingId })}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm px-4 py-2 rounded-lg hover:opacity-90"
            >
              <Save size={16} /> Speichern
            </button>
            <button onClick={() => setEditingId(null)} className="font-body text-sm text-muted-foreground px-4 py-2">Abbrechen</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredMembers?.map((m, idx) => (
            <div key={m.id} className={`bg-card border rounded-lg overflow-hidden ${editingId === m.id ? "ring-2 ring-primary" : ""}`}>
              <div className="aspect-[4/3] bg-muted relative group">
                {m.image_url ? (
                  <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-heading text-2xl">
                    {m.name.charAt(0)}
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="font-body text-xs text-primary-foreground bg-foreground/80 px-2 py-1 rounded">
                    {uploading ? "..." : "Foto"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleImageUpload(e.target.files[0], m.id);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="p-2.5 flex items-center justify-between gap-1">
                <div onClick={() => startEdit(m)} role="button" className="cursor-pointer min-w-0 flex-1">
                  <h3 className="font-heading text-xs font-semibold text-foreground truncate">{m.name}</h3>
                  <p className="font-body text-[10px] text-muted-foreground truncate">{m.role_de}</p>
                  <span className="font-body text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground mt-0.5 inline-block">
                    {m.category === "fachfuehrung"
                      ? "Fachführung"
                      : m.category === "erweitertes_team"
                      ? "Erw. Team"
                      : m.category === "agentur"
                      ? `${agencies?.find((a) => a.id === (m as any).agency_id)?.name || "Agentur"}${(m as any).is_agency_leader ? " ★" : ""}`
                      : "GL"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 items-center shrink-0">
                  <button
                    onClick={() => {
                      if (idx > 0 && filteredMembers) {
                        const prev = filteredMembers[idx - 1];
                        Promise.all([
                          supabase.from("team_members").update({ sort_order: prev.sort_order }).eq("id", m.id),
                          supabase.from("team_members").update({ sort_order: m.sort_order }).eq("id", prev.id),
                        ]).then(() => queryClient.invalidateQueries({ queryKey: ["admin-team"] }));
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground text-xs"
                    title="Nach oben"
                  >▲</button>
                  <button
                    onClick={() => {
                      if (filteredMembers && idx < filteredMembers.length - 1) {
                        const next = filteredMembers[idx + 1];
                        Promise.all([
                          supabase.from("team_members").update({ sort_order: next.sort_order }).eq("id", m.id),
                          supabase.from("team_members").update({ sort_order: m.sort_order }).eq("id", next.id),
                        ]).then(() => queryClient.invalidateQueries({ queryKey: ["admin-team"] }));
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground text-xs"
                    title="Nach unten"
                  >▼</button>
                  <button onClick={() => deleteMutation.mutate(m.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
