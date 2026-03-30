import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";

const AdminSlider = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-slider"] });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `slider/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("site-images").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);

      const maxOrder = images?.length ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;
      const { error } = await supabase.from("slider_images").insert({
        image_url: publicUrl,
        alt_text: file.name,
        sort_order: maxOrder,
      });
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["admin-slider"] });
      toast.success("Bild hochgeladen");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Slider-Bilder</h1>
        <label className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
          <Plus size={18} />
          {uploading ? "Hochladen..." : "Bild hinzufügen"}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : !images?.length ? (
        <p className="font-body text-sm text-muted-foreground">Noch keine Slider-Bilder. Laden Sie Bilder hoch, um den Hero-Slider zu füllen.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="bg-card border rounded-xl overflow-hidden group">
              <div className="relative aspect-video">
                <img src={img.image_url} alt={img.alt_text || ""} className="w-full h-full object-cover" />
                {!img.active && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <span className="font-body text-xs text-muted-foreground bg-card px-3 py-1 rounded-full">Inaktiv</span>
                  </div>
                )}
              </div>
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-muted-foreground" />
                  <span className="font-body text-xs text-muted-foreground">#{img.sort_order + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMutation.mutate({ id: img.id, active: !img.active })}
                    className={`font-body text-xs px-2 py-1 rounded ${img.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                  >
                    {img.active ? "Aktiv" : "Inaktiv"}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(img.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={16} />
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

export default AdminSlider;
