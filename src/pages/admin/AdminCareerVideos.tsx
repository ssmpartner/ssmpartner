import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Trash2, X, FileImage, FileVideo } from "lucide-react";
import { toast } from "sonner";
import MediaPickerModal from "@/components/MediaPickerModal";

const emptyForm = { title: "", image_url: "", video_url: "" };

const AdminCareerVideos = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [mediaPicker, setMediaPicker] = useState<{ open: boolean; accept: "image" | "video"; field: "image_url" | "video_url" }>({ open: false, accept: "image", field: "image_url" });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-career-videos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("career_videos").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: typeof form & { id?: string }) => {
      const payload = { title: item.title, image_url: item.image_url || null, video_url: item.video_url || null };
      if (item.id) {
        const { error } = await supabase.from("career_videos").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("career_videos").insert({ ...payload, sort_order: items?.length || 0 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-career-videos"] });
      setEditingId(null);
      setForm(emptyForm);
      toast.success("Gespeichert");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("career_videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-career-videos"] });
      toast.success("Gelöscht");
    },
  });

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setForm({ title: item.title || "", image_url: item.image_url || "", video_url: item.video_url || "" });
  };

  const openPicker = (accept: "image" | "video", field: "image_url" | "video_url") => {
    setMediaPicker({ open: true, accept, field });
  };

  const handleMediaSelect = (url: string) => {
    setForm((prev) => ({ ...prev, [mediaPicker.field]: url }));

    // If editing existing item, save directly
    if (editingId && editingId !== "new") {
      supabase.from("career_videos").update({ [mediaPicker.field]: url } as { image_url?: string; video_url?: string }).eq("id", editingId)
        .then(({ error }) => {
          if (error) toast.error(error.message);
          else { queryClient.invalidateQueries({ queryKey: ["admin-career-videos"] }); toast.success("Aktualisiert"); }
        });
    }
  };

  const inputClass = "w-full bg-background border border-border px-3 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Karriere-Videos</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Video-Karten auf der Karriere-Seite verwalten</p>
        </div>
        <button
          onClick={() => { setEditingId("new"); setForm(emptyForm); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90"
        >
          <Plus size={18} /> Video hinzufügen
        </button>
      </div>

      {editingId && (
        <div className="bg-card border rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {editingId === "new" ? "Neue Video-Karte" : "Video-Karte bearbeiten"}
            </h2>
            <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>

          <div>
            <label className="font-body text-xs text-muted-foreground mb-1 block">Titel</label>
            <input placeholder="z.B. Einblicke in den Arbeitsalltag" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Thumbnail */}
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">Vorschaubild</label>
              <button
                onClick={() => openPicker("image", "image_url")}
                className="w-full aspect-video bg-muted rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer relative group"
              >
                {form.image_url ? (
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1">
                    <FileImage size={24} />
                    <span className="font-body text-xs">Bild auswählen</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="font-body text-xs text-primary-foreground bg-primary/80 px-3 py-1.5 rounded-lg">
                    {form.image_url ? "Ändern" : "Auswählen"}
                  </span>
                </div>
              </button>
            </div>

            {/* Video */}
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">Video</label>
              <button
                onClick={() => openPicker("video", "video_url")}
                className="w-full aspect-video bg-muted rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer relative group"
              >
                {form.video_url ? (
                  <video src={form.video_url} className="w-full h-full object-cover" muted />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1">
                    <FileVideo size={24} />
                    <span className="font-body text-xs">Video auswählen</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="font-body text-xs text-primary-foreground bg-primary/80 px-3 py-1.5 rounded-lg">
                    {form.video_url ? "Ändern" : "Auswählen"}
                  </span>
                </div>
              </button>
              <input placeholder="oder Video-URL einfügen" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} className={`${inputClass} mt-2`} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => saveMutation.mutate(editingId === "new" ? form : { ...form, id: editingId })}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              <Save size={16} /> Speichern
            </button>
            <button onClick={() => setEditingId(null)} className="font-body text-sm text-muted-foreground px-4 py-2 hover:text-foreground">Abbrechen</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : !items?.length ? (
        <p className="font-body text-sm text-muted-foreground">Noch keine Video-Karten erstellt.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div key={item.id} className={`bg-card border rounded-lg overflow-hidden transition-shadow hover:shadow-md ${editingId === item.id ? "ring-2 ring-primary" : ""}`}>
              <div className="aspect-video bg-muted relative">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body text-sm">Kein Bild</div>
                )}
                {item.video_url && (
                  <span className="absolute top-2 left-2 bg-foreground/70 text-primary-foreground font-body text-[10px] px-2 py-0.5 rounded">Video ✓</span>
                )}
              </div>
              <div className="p-3 flex items-center justify-between">
                <div onClick={() => startEdit(item)} className="cursor-pointer flex-1 min-w-0">
                  <h3 className="font-heading text-sm font-semibold text-foreground truncate">{item.title || "Ohne Titel"}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      if (idx > 0 && items) {
                        const prev = items[idx - 1];
                        Promise.all([
                          supabase.from("career_videos").update({ sort_order: prev.sort_order }).eq("id", item.id),
                          supabase.from("career_videos").update({ sort_order: item.sort_order }).eq("id", prev.id),
                        ]).then(() => queryClient.invalidateQueries({ queryKey: ["admin-career-videos"] }));
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >▲</button>
                  <button
                    onClick={() => {
                      if (items && idx < items.length - 1) {
                        const next = items[idx + 1];
                        Promise.all([
                          supabase.from("career_videos").update({ sort_order: next.sort_order }).eq("id", item.id),
                          supabase.from("career_videos").update({ sort_order: item.sort_order }).eq("id", next.id),
                        ]).then(() => queryClient.invalidateQueries({ queryKey: ["admin-career-videos"] }));
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >▼</button>
                  <button onClick={() => deleteMutation.mutate(item.id)} className="text-muted-foreground hover:text-destructive ml-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={mediaPicker.open}
        onClose={() => setMediaPicker((p) => ({ ...p, open: false }))}
        onSelect={handleMediaSelect}
        accept={mediaPicker.accept}
        title={mediaPicker.accept === "image" ? "Bild auswählen" : "Video auswählen"}
      />
    </div>
  );
};

export default AdminCareerVideos;
