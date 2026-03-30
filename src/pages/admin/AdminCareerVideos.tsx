import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Trash2, Upload, X, FileImage, FileVideo, Check } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const emptyForm = { title: "", image_url: "", video_url: "" };

interface FileInfo {
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

const AdminCareerVideos = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadProgress, setUploadProgress] = useState<{ image?: number; video?: number }>({});
  const [imageInfo, setImageInfo] = useState<FileInfo | null>(null);
  const [videoInfo, setVideoInfo] = useState<FileInfo | null>(null);
  const [uploadDone, setUploadDone] = useState<{ image?: boolean; video?: boolean }>({});

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-career-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_videos")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: typeof form & { id?: string }) => {
      const payload = {
        title: item.title,
        image_url: item.image_url || null,
        video_url: item.video_url || null,
      };
      if (item.id) {
        const { error } = await supabase.from("career_videos").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("career_videos").insert({
          ...payload,
          sort_order: items?.length || 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-career-videos"] });
      setEditingId(null);
      setForm(emptyForm);
      setImageInfo(null);
      setVideoInfo(null);
      setUploadDone({});
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

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (file: File, type: "image" | "video", itemId?: string) => {
    const info: FileInfo = { name: file.name, size: file.size, type: file.type };

    if (type === "image") {
      const dims = await getImageDimensions(file);
      info.width = dims.width;
      info.height = dims.height;
      setImageInfo(info);
    } else {
      setVideoInfo(info);
    }

    setUploadProgress((p) => ({ ...p, [type]: 0 }));
    setUploadDone((d) => ({ ...d, [type]: false }));

    // Simulate progress since supabase doesn't provide upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => {
        const current = p[type] || 0;
        if (current >= 90) { clearInterval(progressInterval); return p; }
        return { ...p, [type]: current + Math.random() * 15 };
      });
    }, 200);

    try {
      const ext = file.name.split(".").pop();
      const id = itemId || "new-" + Date.now();
      const folder = type === "video" ? "career-videos" : "career-thumbs";
      const path = `${folder}/${id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);

      clearInterval(progressInterval);
      setUploadProgress((p) => ({ ...p, [type]: 100 }));
      setUploadDone((d) => ({ ...d, [type]: true }));

      const field = type === "image" ? "image_url" : "video_url";

      if (itemId) {
        const { error } = await supabase.from("career_videos").update({ [field]: publicUrl }).eq("id", itemId);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ["admin-career-videos"] });
        toast.success(`${type === "image" ? "Bild" : "Video"} hochgeladen`);
      } else {
        setForm((prev) => ({ ...prev, [field]: publicUrl }));
        toast.success(`${type === "image" ? "Bild" : "Video"} bereit — bitte speichern`);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadProgress((p) => ({ ...p, [type]: undefined }));
      toast.error(err.message);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setForm({ title: item.title || "", image_url: item.image_url || "", video_url: item.video_url || "" });
    setImageInfo(null);
    setVideoInfo(null);
    setUploadDone({});
    setUploadProgress({});
  };

  const inputClass = "w-full bg-background border border-border px-3 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring";

  const renderFileInfo = (info: FileInfo | null, type: "image" | "video") => {
    if (!info) return null;
    const ext = info.name.split(".").pop()?.toUpperCase() || "";
    return (
      <div className="mt-2 bg-muted/50 border border-border rounded-lg p-3 space-y-1.5">
        <div className="flex items-center gap-2">
          {type === "image" ? <FileImage size={14} className="text-primary" /> : <FileVideo size={14} className="text-primary" />}
          <span className="font-body text-xs font-medium text-foreground truncate">{info.name}</span>
          {uploadDone[type] && <Check size={14} className="text-primary ml-auto shrink-0" />}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-body text-[11px] text-muted-foreground">
          <span>Format: <strong className="text-foreground">{ext}</strong></span>
          <span>Grösse: <strong className="text-foreground">{formatBytes(info.size)}</strong></span>
          <span>MIME: <strong className="text-foreground">{info.type}</strong></span>
          {info.width && info.height && (
            <span>Auflösung: <strong className="text-foreground">{info.width} × {info.height} px</strong></span>
          )}
        </div>
        {uploadProgress[type] !== undefined && (
          <div className="pt-1">
            <Progress value={uploadProgress[type]} className="h-1.5" />
            <p className="font-body text-[10px] text-muted-foreground mt-1">
              {uploadDone[type] ? "Upload abgeschlossen ✓" : `${Math.round(uploadProgress[type] || 0)}%`}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Karriere-Videos</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Video-Karten auf der Karriere-Seite verwalten</p>
        </div>
        <button
          onClick={() => { setEditingId("new"); setForm(emptyForm); setImageInfo(null); setVideoInfo(null); setUploadDone({}); setUploadProgress({}); }}
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
            <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          <div>
            <label className="font-body text-xs text-muted-foreground mb-1 block">Titel</label>
            <input placeholder="z.B. Einblicke in den Arbeitsalltag" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Thumbnail */}
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">Vorschaubild</label>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative group border border-border">
                {form.image_url ? (
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground font-body text-xs gap-1">
                    <FileImage size={24} />
                    <span>Bild hochladen</span>
                    <span className="text-[10px]">JPG, PNG, WebP</span>
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload size={20} className="text-primary-foreground" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    if (e.target.files?.[0]) handleUpload(e.target.files[0], "image", editingId === "new" ? undefined : editingId);
                    e.target.value = "";
                  }} />
                </label>
              </div>
              {renderFileInfo(imageInfo, "image")}
            </div>

            {/* Video */}
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">Video-Datei</label>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative group border border-border">
                {form.video_url ? (
                  <video src={form.video_url} className="w-full h-full object-cover" muted />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground font-body text-xs gap-1">
                    <FileVideo size={24} />
                    <span>Video hochladen</span>
                    <span className="text-[10px]">MP4, WebM, MOV</span>
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload size={20} className="text-primary-foreground" />
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => {
                    if (e.target.files?.[0]) handleUpload(e.target.files[0], "video", editingId === "new" ? undefined : editingId);
                    e.target.value = "";
                  }} />
                </label>
              </div>
              {renderFileInfo(videoInfo, "video")}
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
              <div className="aspect-video bg-muted relative group">
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
    </div>
  );
};

export default AdminCareerVideos;
