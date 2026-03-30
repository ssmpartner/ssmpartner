import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AdminJobs = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", location: "", workload: "", description_de: "", description_fr: "", description_it: "", description_en: "" });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_positions").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: typeof form & { id?: string }) => {
      if (item.id) {
        const { error } = await supabase.from("job_positions").update({
          title: item.title, location: item.location, workload: item.workload,
          description_de: item.description_de, description_fr: item.description_fr,
          description_it: item.description_it, description_en: item.description_en,
        }).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("job_positions").insert({
          ...item, sort_order: (jobs?.length || 0),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      setEditingId(null);
      setForm({ title: "", location: "", workload: "", description_de: "", description_fr: "", description_it: "", description_en: "" });
      toast.success("Gespeichert");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("job_positions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast.success("Gelöscht");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("job_positions").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-jobs"] }),
  });

  const startEdit = (j: any) => {
    setEditingId(j.id);
    setForm({ title: j.title, location: j.location || "", workload: j.workload || "", description_de: j.description_de || "", description_fr: j.description_fr || "", description_it: j.description_it || "", description_en: j.description_en || "" });
  };

  const inputClass = "w-full bg-background border border-border px-3 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Offene Stellen</h1>
        <button onClick={() => { setEditingId("new"); setForm({ title: "", location: "", workload: "", description_de: "", description_fr: "", description_it: "", description_en: "" }); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90">
          <Plus size={18} /> Stelle hinzufügen
        </button>
      </div>

      {editingId && (
        <div className="bg-card border rounded-xl p-6 mb-6 space-y-4">
          <input placeholder="Titel" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Standort" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} />
            <input placeholder="Pensum (z.B. 80-100%)" value={form.workload} onChange={(e) => setForm({ ...form, workload: e.target.value })} className={inputClass} />
          </div>
          <textarea placeholder="Beschreibung (DE)" value={form.description_de} onChange={(e) => setForm({ ...form, description_de: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
          <textarea placeholder="Beschreibung (FR)" value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
          <textarea placeholder="Beschreibung (IT)" value={form.description_it} onChange={(e) => setForm({ ...form, description_it: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
          <textarea placeholder="Beschreibung (EN)" value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
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
      ) : !jobs?.length ? (
        <p className="font-body text-sm text-muted-foreground">Keine Stellen vorhanden.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="bg-card border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => startEdit(j)}>
                <h3 className="font-heading text-sm font-semibold text-foreground">{j.title}</h3>
                <p className="font-body text-xs text-muted-foreground">{j.location} · {j.workload}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleMutation.mutate({ id: j.id, active: !j.active })}
                  className={`font-body text-xs px-2 py-1 rounded ${j.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {j.active ? "Aktiv" : "Inaktiv"}
                </button>
                <button onClick={() => deleteMutation.mutate(j.id)} className="text-muted-foreground hover:text-destructive">
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

export default AdminJobs;
