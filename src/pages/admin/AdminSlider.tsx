import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, GripVertical, Pencil, X, Check, Crop, ImageIcon, ArrowUp, ArrowDown, Smartphone } from "lucide-react";
import { toast } from "sonner";
import ImageCropModal from "@/components/ImageCropModal";
import MediaPickerModal from "@/components/MediaPickerModal";

const AdminSlider = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ headline: "", subline: "", alt_text: "" });
  const [cropModal, setCropModal] = useState<{ src: string; existingId?: string; mobile?: boolean } | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const { data: images, isLoading } = useQuery({
    queryKey: ["admin-slider"],
    queryFn: async () => {
      const { data, error } = await supabase.from("slider_images").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("slider_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-slider"] });
      toast.success("Bild gelöscht");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("slider_images").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-slider"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; headline: string; subline: string; alt_text: string }) => {
      const { error } = await supabase.from("slider_images").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-slider"] });
      setEditingId(null);
      toast.success("Gespeichert");
    },
  });

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (!images) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= images.length) return;
    const a = images[index];
    const b = images[swapIndex];
    await supabase.from("slider_images").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("slider_images").update({ sort_order: a.sort_order }).eq("id", b.id);
    queryClient.invalidateQueries({ queryKey: ["admin-slider"] });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropModal({ src: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleMediaSelect = (url: string) => {
    setMediaPickerOpen(false);
    setCropModal({ src: url });
  };

  const handleCroppedUpload = async (blob: Blob) => {
    setUploading(true);
    try {
      const path = `slider/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from("site-images").upload(path, blob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);

      if (cropModal?.existingId) {
        // Update existing slider image
        const { error } = await supabase.from("slider_images").update({ image_url: publicUrl }).eq("id", cropModal.existingId);
        if (error) throw error;
      } else {
        // Insert new slider image
        const maxOrder = images?.length ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;
        const { error } = await supabase.from("slider_images").insert({
          image_url: publicUrl,
          alt_text: "Slider-Bild",
          sort_order: maxOrder,
        });
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["admin-slider"] });
      toast.success(cropModal?.existingId ? "Zuschnitt aktualisiert" : "Bild hochgeladen");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      setCropModal(null);
    }
  };

  const handleRecrop = (imageUrl: string, id: string) => {
    setCropModal({ src: imageUrl, existingId: id });
  };

  const startEdit = (img: any) => {
    setEditingId(img.id);
    setEditForm({ headline: img.headline || "", subline: img.subline || "", alt_text: img.alt_text || "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Slider-Bilder</h1>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
            <Plus size={18} />
            {uploading ? "Hochladen..." : "Hochladen"}
            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={uploading} />
          </label>
          <button onClick={() => setMediaPickerOpen(true)} className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
            <ImageIcon size={18} />
            Mediathek
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : !images?.length ? (
        <p className="font-body text-sm text-muted-foreground">Noch keine Slider-Bilder vorhanden.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((img, idx) => (
            <div key={img.id} className="bg-card border rounded-xl overflow-hidden">
              <div className="relative aspect-video">
                <img src={img.image_url} alt={img.alt_text || ""} className="w-full h-full object-cover" />
                {!img.active && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <span className="font-body text-xs text-muted-foreground bg-card px-3 py-1 rounded-full">Inaktiv</span>
                  </div>
                )}
              </div>

              {editingId === img.id ? (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="font-body text-xs text-muted-foreground mb-1 block">Headline</label>
                    <input value={editForm.headline} onChange={e => setEditForm({ ...editForm, headline: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="Slide-Überschrift" />
                  </div>
                  <div>
                    <label className="font-body text-xs text-muted-foreground mb-1 block">Subline</label>
                    <input value={editForm.subline} onChange={e => setEditForm({ ...editForm, subline: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="Untertitel" />
                  </div>
                  <div>
                    <label className="font-body text-xs text-muted-foreground mb-1 block">Alt-Text</label>
                    <input value={editForm.alt_text} onChange={e => setEditForm({ ...editForm, alt_text: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="Bildbeschreibung" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateMutation.mutate({ id: img.id, ...editForm })} className="flex items-center gap-1 bg-primary text-primary-foreground text-sm px-3 py-1.5 rounded-lg"><Check size={14} /> Speichern</button>
                    <button onClick={() => setEditingId(null)} className="text-sm text-muted-foreground px-3 py-1.5">Abbrechen</button>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  {(img.headline || img.subline) && (
                    <div className="mb-2">
                      {img.headline && <p className="font-body text-sm font-medium">{img.headline}</p>}
                      {img.subline && <p className="font-body text-xs text-muted-foreground">{img.subline}</p>}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleMove(idx, "up")} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30" title="Nach oben"><ArrowUp size={14} /></button>
                      <button onClick={() => handleMove(idx, "down")} disabled={idx === images.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30" title="Nach unten"><ArrowDown size={14} /></button>
                      <span className="font-body text-xs text-muted-foreground">#{idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRecrop(img.image_url, img.id)} className="text-muted-foreground hover:text-foreground" title="Zuschnitt anpassen"><Crop size={14} /></button>
                      <button onClick={() => startEdit(img)} className="text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                      <button
                        onClick={() => toggleMutation.mutate({ id: img.id, active: !img.active })}
                        className={`font-body text-xs px-2 py-1 rounded ${img.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                      >
                        {img.active ? "Aktiv" : "Inaktiv"}
                      </button>
                      <button onClick={() => deleteMutation.mutate(img.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ImageCropModal
        open={!!cropModal}
        imageSrc={cropModal?.src || ""}
        aspect={16 / 9}
        onClose={() => setCropModal(null)}
        onCropDone={handleCroppedUpload}
      />

      <MediaPickerModal
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
};

export default AdminSlider;
