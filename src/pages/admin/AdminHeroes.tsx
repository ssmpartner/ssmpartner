import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Image as ImageIcon, FolderOpen, Crop, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import MediaPickerModal from "@/components/MediaPickerModal";
import ImageCropModal from "@/components/ImageCropModal";

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
  { key: "onlinecheck", label: "Online-Beratung" },
  { key: "vag45", label: "VAG 45" },
  { key: "hq-1", label: "HQ Galerie – Hauptbild" },
  { key: "hq-2", label: "HQ Galerie – Bild 2" },
  { key: "hq-3", label: "HQ Galerie – Bild 3" },
  { key: "hq-4", label: "HQ Galerie – Bild 4" },
  { key: "hq-5", label: "HQ Galerie – Bild 5" },
];

const AdminHeroes = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<string | null>(null);
  const [mediaPickerKey, setMediaPickerKey] = useState<string | null>(null);
  const [cropModal, setCropModal] = useState<{ src: string; pageKey: string } | null>(null);
  const [view, setView] = useState<"grid" | "list">(() => (localStorage.getItem("admin-heroes-view") as "grid" | "list") || "grid");

  const setViewMode = (v: "grid" | "list") => {
    setView(v);
    localStorage.setItem("admin-heroes-view", v);
  };

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

  const handleFileSelect = (pageKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropModal({ src: reader.result as string, pageKey });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCroppedUpload = async (blob: Blob, pageKey?: string) => {
    if (!pageKey) return;
    setUploading(pageKey);
    try {
      const path = `heroes/${pageKey}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from("site-images").upload(path, blob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);
      await updateMutation.mutateAsync({ pageKey, image_url: publicUrl });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(null);
      setCropModal(null);
    }
  };

  const handleMediaSelect = (url: string) => {
    if (mediaPickerKey) {
      setCropModal({ src: url, pageKey: mediaPickerKey });
    }
    setMediaPickerKey(null);
  };

  const handleRecrop = (imageUrl: string, pageKey: string) => {
    setCropModal({ src: imageUrl, pageKey });
  };

  const getHero = (pageKey: string) => heroes?.find((h) => h.page_key === pageKey);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">Hero-Bilder</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">Verwalten Sie die Hero-Bilder für jede Seite.</p>
          </div>
          <div className="inline-flex items-center gap-0.5 bg-muted rounded-lg p-0.5 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              title="Kachel-Ansicht"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              title="Listen-Ansicht"
            >
              <List size={14} />
            </button>
          </div>
        </div>
        <div className="mt-3 bg-muted/60 border border-border rounded-lg px-4 py-3">
          <p className="font-body text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Empfohlenes Format:</span>{" "}
            1920 × 800 px · Seitenverhältnis 21:9 · JPG/WebP · max. 500 KB für schnelle Ladezeiten
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {pages.map((page) => {
            const hero = getHero(page.key);
            return (
              <div key={page.key} className="bg-card border rounded-xl overflow-hidden">
                <div className="relative aspect-[21/9] bg-muted">
                  {hero?.image_url ? (
                    <img src={hero.image_url} alt={page.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon size={20} />
                      <span className="font-body text-[10px] mt-1">Kein Bild</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: "#243e3a" }} />
                </div>
                <div className="p-2.5">
                  <h3 className="font-body text-xs font-medium text-foreground truncate">{page.label}</h3>
                  <p className="font-body text-[10px] text-muted-foreground truncate mb-2">/{page.key}</p>
                  <div className="flex items-center gap-1">
                    {hero?.image_url && (
                      <button
                        onClick={() => handleRecrop(hero.image_url!, page.key)}
                        className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors"
                        title="Zuschnitt"
                      >
                        <Crop size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => setMediaPickerKey(page.key)}
                      className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors"
                      title="Mediathek"
                    >
                      <FolderOpen size={12} />
                    </button>
                    <label className="ml-auto inline-flex items-center gap-1 bg-primary text-primary-foreground font-body text-[10px] font-medium px-2 py-1 rounded-md cursor-pointer hover:opacity-90 transition-opacity">
                      <Upload size={11} />
                      {uploading === page.key ? "..." : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(page.key, e)}
                        className="hidden"
                        disabled={uploading === page.key}
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden divide-y">
          {pages.map((page) => {
            const hero = getHero(page.key);
            return (
              <div key={page.key} className="flex items-center gap-3 p-2.5 hover:bg-muted/40 transition-colors">
                <div className="relative w-24 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                  {hero?.image_url ? (
                    <img src={hero.image_url} alt={page.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon size={14} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-foreground truncate">{page.label}</p>
                  <p className="font-body text-[11px] text-muted-foreground truncate">/{page.key}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {hero?.image_url && (
                    <button
                      onClick={() => handleRecrop(hero.image_url!, page.key)}
                      className="text-muted-foreground hover:text-foreground p-1.5"
                      title="Zuschnitt"
                    >
                      <Crop size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => setMediaPickerKey(page.key)}
                    className="text-muted-foreground hover:text-foreground p-1.5"
                    title="Mediathek"
                  >
                    <FolderOpen size={13} />
                  </button>
                  <label className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-body text-[11px] font-medium px-2 py-1 rounded-md cursor-pointer hover:opacity-90 transition-opacity">
                    <Upload size={11} />
                    {uploading === page.key ? "..." : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(page.key, e)}
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

      <MediaPickerModal
        open={!!mediaPickerKey}
        onClose={() => setMediaPickerKey(null)}
        onSelect={handleMediaSelect}
        accept="image"
        title="Bild aus Mediathek wählen"
      />

      <ImageCropModal
        open={!!cropModal}
        imageSrc={cropModal?.src || ""}
        aspect={21 / 9}
        onClose={() => setCropModal(null)}
        onCropDone={(blob) => handleCroppedUpload(blob, cropModal?.pageKey)}
      />
    </div>
  );
};

export default AdminHeroes;
