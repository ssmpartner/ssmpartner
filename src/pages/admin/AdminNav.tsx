import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, GripVertical, Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";

const AdminNav = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ label_de: "", label_fr: "", label_it: "", label_en: "", url: "" });
  const [adding, setAdding] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-nav"],
    queryFn: async () => {
      const { data, error } = await supabase.from("nav_items").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (item: { id?: string; label_de: string; label_fr: string; label_it: string; label_en: string; url: string; sort_order?: number }) => {
      if (item.id) {
        const { error } = await supabase.from("nav_items").update({
          label_de: item.label_de,
          label_fr: item.label_fr,
          label_it: item.label_it,
          label_en: item.label_en,
          url: item.url,
        }).eq("id", item.id);
        if (error) throw error;
      } else {
        const maxOrder = items?.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 0;
        const { error } = await supabase.from("nav_items").insert({
          ...item,
          sort_order: maxOrder,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-nav"] });
      setEditing(null);
      setAdding(false);
      toast.success("Gespeichert");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("nav_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-nav"] });
      toast.success("Gelöscht");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("nav_items").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-nav"] }),
  });

  const startEdit = (item: any) => {
    setEditing(item.id);
    setForm({ label_de: item.label_de, label_fr: item.label_fr || "", label_it: item.label_it || "", label_en: item.label_en || "", url: item.url });
  };

  const startAdd = () => {
    setAdding(true);
    setForm({ label_de: "", label_fr: "", label_it: "", label_en: "", url: "/" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Menüpunkte</h1>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Neuer Menüpunkt
        </button>
      </div>

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left font-body text-xs font-medium text-muted-foreground px-4 py-3">#</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground px-4 py-3">Label (DE)</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground px-4 py-3">FR</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground px-4 py-3">IT</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground px-4 py-3">EN</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground px-4 py-3">URL</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right font-body text-xs font-medium text-muted-foreground px-4 py-3">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  {editing === item.id ? (
                    <>
                      <td className="px-4 py-3"><GripVertical size={14} className="text-muted-foreground" /></td>
                      <td className="px-4 py-2"><input value={form.label_de} onChange={e => setForm({ ...form, label_de: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></td>
                      <td className="px-4 py-2"><input value={form.label_fr} onChange={e => setForm({ ...form, label_fr: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></td>
                      <td className="px-4 py-2"><input value={form.label_it} onChange={e => setForm({ ...form, label_it: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></td>
                      <td className="px-4 py-2"><input value={form.label_en} onChange={e => setForm({ ...form, label_en: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></td>
                      <td className="px-4 py-2"><input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></td>
                      <td />
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => upsertMutation.mutate({ id: item.id, ...form })} className="text-success mr-2"><Check size={16} /></button>
                        <button onClick={() => setEditing(null)} className="text-muted-foreground"><X size={16} /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-body text-xs text-muted-foreground">{item.sort_order + 1}</td>
                      <td className="px-4 py-3 font-body text-sm">{item.label_de}</td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground">{item.label_fr}</td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground">{item.label_it}</td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground">{item.label_en}</td>
                      <td className="px-4 py-3 font-body text-xs text-muted-foreground font-mono">{item.url}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleMutation.mutate({ id: item.id, active: !item.active })}
                          className={`font-body text-xs px-2 py-1 rounded ${item.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                        >
                          {item.active ? "Aktiv" : "Inaktiv"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => startEdit(item)} className="text-muted-foreground hover:text-foreground mr-2"><Pencil size={14} /></button>
                        <button onClick={() => deleteMutation.mutate(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {adding && (
                <tr className="border-t bg-muted/30">
                  <td className="px-4 py-3"><Plus size={14} className="text-muted-foreground" /></td>
                  <td className="px-4 py-2"><input value={form.label_de} onChange={e => setForm({ ...form, label_de: e.target.value })} placeholder="Label DE" className="w-full border rounded px-2 py-1 text-sm" /></td>
                  <td className="px-4 py-2"><input value={form.label_fr} onChange={e => setForm({ ...form, label_fr: e.target.value })} placeholder="FR" className="w-full border rounded px-2 py-1 text-sm" /></td>
                  <td className="px-4 py-2"><input value={form.label_it} onChange={e => setForm({ ...form, label_it: e.target.value })} placeholder="IT" className="w-full border rounded px-2 py-1 text-sm" /></td>
                  <td className="px-4 py-2"><input value={form.label_en} onChange={e => setForm({ ...form, label_en: e.target.value })} placeholder="EN" className="w-full border rounded px-2 py-1 text-sm" /></td>
                  <td className="px-4 py-2"><input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="/pfad" className="w-full border rounded px-2 py-1 text-sm" /></td>
                  <td />
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => upsertMutation.mutate(form)} className="text-success mr-2"><Check size={16} /></button>
                    <button onClick={() => setAdding(false)} className="text-muted-foreground"><X size={16} /></button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminNav;
