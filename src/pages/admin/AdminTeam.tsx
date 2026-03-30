import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AdminTeam = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", role_de: "", role_fr: "", role_it: "", role_en: "", category: "geschaeftsleitung" });
  const [uploading, setUploading] = useState(false);

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
      if (item.id) {
        const { error } = await supabase.from("team_members").update({
          name: item.name, role_de: item.role_de, role_fr: item.role_fr, role_it: item.role_it, role_en: item.role_en, category: item.category,
        }).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("team_members").insert({
          name: item.name, role_de: item.role_de, role_fr: item.role_fr, role_it: item.role_it, role_en: item.role_en,
          sort_order: (members?.length || 0),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      setEditingId(null);
      setForm({ name: "", role_de: "", role_fr: "", role_it: "", role_en: "" });
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

  const handleImageUpload = async (memberId: string, file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `team/${memberId}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);
      const { error } = await supabase.from("team_members").update({ image_url: publicUrl }).eq("id", memberId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      toast.success("Foto hochgeladen");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setForm({ name: m.name, role_de: m.role_de || "", role_fr: m.role_fr || "", role_it: m.role_it || "", role_en: m.role_en || "" });
  };

  const inputClass = "w-full bg-background border border-border px-3 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Team</h1>
        <button onClick={() => { setEditingId("new"); setForm({ name: "", role_de: "", role_fr: "", role_it: "", role_en: "" }); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90">
          <Plus size={18} /> Mitglied hinzufügen
        </button>
      </div>

      {editingId && (
        <div className="bg-card border rounded-xl p-6 mb-6 space-y-4">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Rolle (DE)" value={form.role_de} onChange={(e) => setForm({ ...form, role_de: e.target.value })} className={inputClass} />
            <input placeholder="Rolle (FR)" value={form.role_fr} onChange={(e) => setForm({ ...form, role_fr: e.target.value })} className={inputClass} />
            <input placeholder="Rolle (IT)" value={form.role_it} onChange={(e) => setForm({ ...form, role_it: e.target.value })} className={inputClass} />
            <input placeholder="Rolle (EN)" value={form.role_en} onChange={(e) => setForm({ ...form, role_en: e.target.value })} className={inputClass} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => saveMutation.mutate(editingId === "new" ? form : { ...form, id: editingId })}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm px-4 py-2 rounded-lg hover:opacity-90">
              <Save size={16} /> Speichern
            </button>
            <button onClick={() => setEditingId(null)} className="font-body text-sm text-muted-foreground px-4 py-2">Abbrechen</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members?.map((m) => (
            <div key={m.id} className="bg-card border rounded-xl overflow-hidden">
              <div className="aspect-square bg-muted relative group">
                {m.image_url ? (
                  <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-heading text-4xl">
                    {m.name.charAt(0)}
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="font-body text-xs text-primary-foreground bg-foreground/80 px-3 py-1.5 rounded-lg">
                    {uploading ? "..." : "Foto ändern"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(m.id, e.target.files[0])} />
                </label>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div onClick={() => startEdit(m)} role="button" className="cursor-pointer">
                  <h3 className="font-heading text-sm font-semibold text-foreground">{m.name}</h3>
                  <p className="font-body text-xs text-muted-foreground">{m.role_de}</p>
                </div>
                <button onClick={() => deleteMutation.mutate(m.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
