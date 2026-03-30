import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Image as ImageIcon, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import MediaPickerModal from "@/components/MediaPickerModal";

const staticPages = [
  // Home
  { key: "home_who_1", label: "Home – Wer wir sind Bild 1" },
  { key: "home_who_2", label: "Home – Wer wir sind Bild 2" },
  { key: "home_career", label: "Home – Karriere-Bild" },
  { key: "home_trust_bg", label: "Home – Vertrauen Hintergrund" },
  { key: "home_quickstart_1", label: "Home – Quickstart Karte 1" },
  { key: "home_quickstart_2", label: "Home – Quickstart Karte 2" },
  // Unterseiten
  { key: "about", label: "Über uns" },
  { key: "about-intro", label: "Über uns – Intro-Bild" },
  { key: "career", label: "Karriere" },
  { key: "career-divider-1", label: "Karriere – Bild-Trenner 1" },
  { key: "career-divider-2", label: "Karriere – Bild-Trenner 2" },
  { key: "career-process", label: "Karriere – Ihr Weg zu uns" },
  { key: "contact", label: "Kontakt" },
  { key: "team", label: "Agenturen" },
  { key: "legal", label: "Impressum / Datenschutz" },
  { key: "hq-1", label: "HQ Galerie – Hauptbild" },
  { key: "hq-2", label: "HQ Galerie – Bild 2" },
  { key: "hq-3", label: "HQ Galerie – Bild 3" },
  { key: "hq-4", label: "HQ Galerie – Bild 4" },
  { key: "hq-5", label: "HQ Galerie – Bild 5" },
];

const AdminHeroes = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<string | null>(null);

  const { data: heroes, isLoading } = useQuery({
    queryKey: ["admin-heroes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_heroes").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: agencies } = useQuery({
    queryKey: ["admin-agencies-for-heroes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agencies").select("slug, name").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const pages = [
    ...staticPages,
    ...(agencies?.map((a) => ({ key: `agency-${a.slug}`, label: `Agentur: ${a.name}` })) || []),
  ];

  const updateMutation = useMutation({
    mutationFn: async ({ pageKey, image_url }: { pageKey: string; image_url: string }) => {
      const existing = heroes?.find((h) => h.page_key === pageKey);
      if (existing) {
        const { error } = await supabase.from("page_heroes").update({ image_url }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("page_heroes").insert({ page_key: pageKey, image_url });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-heroes"] });
      toast.success("Hero-Bild aktualisiert");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleUpload = async (pageKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(pageKey);
    try {
      const ext = file.name.split(".").pop();
      const path = `heroes/${pageKey}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("site-images").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);
      await updateMutation.mutateAsync({ pageKey, image_url: publicUrl });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const getHero = (pageKey: string) => heroes?.find((h) => h.page_key === pageKey);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Hero-Bilder</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Verwalten Sie die Hero-Bilder für jede Seite.</p>
        <div className="mt-3 bg-muted/60 border border-border rounded-lg px-4 py-3">
          <p className="font-body text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Empfohlenes Format:</span>{" "}
            1920 × 800 px · Seitenverhältnis 21:9 · JPG/WebP · max. 500 KB für schnelle Ladezeiten
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pages.map((page) => {
            const hero = getHero(page.key);
            return (
              <div key={page.key} className="bg-card border rounded-xl overflow-hidden">
                <div className="relative aspect-[21/9] bg-muted">
                  {hero?.image_url ? (
                    <img src={hero.image_url} alt={page.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon size={32} />
                      <span className="font-body text-xs mt-2">Kein Bild</span>
                    </div>
                  )}
                  {/* Green line preview */}
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: "#243e3a" }} />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-body text-sm font-medium text-foreground">{page.label}</h3>
                    <p className="font-body text-xs text-muted-foreground">Seite: /{page.key}</p>
                  </div>
                  <label className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-xs font-medium px-3 py-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                    <Upload size={14} />
                    {uploading === page.key ? "Hochladen..." : "Bild ändern"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(page.key, e)}
                      className="hidden"
                      disabled={uploading === page.key}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminHeroes;
