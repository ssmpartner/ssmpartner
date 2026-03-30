import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const PAGES = ["home", "about", "career", "contact", "legal"] as const;
const LANGS = ["de", "fr", "it", "en"] as const;

const AdminContent = () => {
  const queryClient = useQueryClient();
  const [activePage, setActivePage] = useState<string>("home");
  const [activeLang, setActiveLang] = useState<string>("de");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ section_key: "", title: "", body: "", link_text: "", link_url: "" });

  const { data: content, isLoading } = useQuery({
    queryKey: ["admin-content", activePage, activeLang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("page", activePage)
        .eq("lang", activeLang)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: typeof form & { id?: string }) => {
      if (item.id) {
        const { error } = await supabase.from("site_content").update({
          title: item.title,
          body: item.body,
          link_text: item.link_text,
          link_url: item.link_url,
        }).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_content").insert({
          page: activePage,
          lang: activeLang,
          section_key: item.section_key,
          title: item.title,
          body: item.body,
          link_text: item.link_text,
          link_url: item.link_url,
          sort_order: (content?.length || 0),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      setEditingId(null);
      setForm({ section_key: "", title: "", body: "", link_text: "", link_url: "" });
      toast.success("Gespeichert");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("site_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      toast.success("Gelöscht");
    },
  });

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      section_key: item.section_key,
      title: item.title || "",
      body: item.body || "",
      link_text: item.link_text || "",
      link_url: item.link_url || "",
    });
  };

  const startNew = () => {
    setEditingId("new");
    setForm({ section_key: "", title: "", body: "", link_text: "", link_url: "" });
  };

  const inputClass = "w-full bg-background border border-border px-3 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Seitentexte</h1>
        <button onClick={startNew} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90">
          <Plus size={18} /> Neuer Inhalt
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex bg-muted rounded-lg p-1">
          {PAGES.map((p) => (
            <button key={p} onClick={() => setActivePage(p)}
              className={`px-3 py-1.5 rounded-md font-body text-xs font-medium transition-colors ${activePage === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex bg-muted rounded-lg p-1">
          {LANGS.map((l) => (
            <button key={l} onClick={() => setActiveLang(l)}
              className={`px-3 py-1.5 rounded-md font-body text-xs font-medium uppercase transition-colors ${activeLang === l ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Edit form */}
      {editingId && (
        <div className="bg-card border rounded-xl p-6 mb-6 space-y-4">
          {editingId === "new" && (
            <input placeholder="Section Key (z.B. hero, about, services)" value={form.section_key} onChange={(e) => setForm({ ...form, section_key: e.target.value })} className={inputClass} />
          )}
          <input placeholder="Titel" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          <textarea placeholder="Text / Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} className={`${inputClass} resize-none`} />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Link-Text" value={form.link_text} onChange={(e) => setForm({ ...form, link_text: e.target.value })} className={inputClass} />
            <input placeholder="Link-URL" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} className={inputClass} />
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

      {/* List */}
      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : !content?.length ? (
        <p className="font-body text-sm text-muted-foreground">Keine Inhalte für diese Seite/Sprache.</p>
      ) : (
        <div className="space-y-3">
          {content.map((item) => (
            <div key={item.id} className="bg-card border rounded-xl p-4 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0" onClick={() => startEdit(item)} role="button">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-body text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{item.section_key}</span>
                </div>
                {item.title && <h3 className="font-heading text-sm font-semibold text-foreground">{item.title}</h3>}
                {item.body && <p className="font-body text-xs text-muted-foreground mt-1 line-clamp-2">{item.body}</p>}
              </div>
              <button onClick={() => deleteMutation.mutate(item.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContent;
