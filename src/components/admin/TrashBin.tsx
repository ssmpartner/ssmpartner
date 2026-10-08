import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const TABLE_LABELS: Record<string, string> = {
  team_members: "Teammitglied", agencies: "Agentur", agency_members: "Agentur-Mitglied",
  agency_reviews: "Bewertung", news_posts: "News", news_categories: "News-Kategorie",
  events: "Event", career_faqs: "Karriere-FAQ", career_videos: "Karriere-Video",
  job_positions: "Stelle", slider_images: "Slider-Bild", vag45_downloads: "VAG45-Download",
  vag45_partners: "VAG45-Partner", chatbot_knowledge: "Chatbot-Wissen", nav_items: "Menüpunkt",
  inquiries: "Anfrage", page_heroes: "Hero-Bild", wizard_pricing: "Preis", seo_settings: "SEO",
  site_content: "Seiteninhalt",
};

const TrashBin = () => {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["trash-bin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deleted_records")
        .select("id, table_name, label, deleted_at")
        .order("deleted_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const restore = async (id: string) => {
    setBusy(id);
    const { error } = await supabase.rpc("restore_deleted_record", { _id: id });
    setBusy(null);
    if (error) return toast.error("Wiederherstellen fehlgeschlagen: " + error.message);
    toast.success("Wiederhergestellt");
    qc.invalidateQueries();
  };

  const purge = async (id: string) => {
    setBusy(id);
    const { error } = await supabase.from("deleted_records").delete().eq("id", id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Endgültig gelöscht");
    qc.invalidateQueries({ queryKey: ["trash-bin"] });
  };

  const shown = (items || []).filter((i) => !filter || i.table_name === filter);
  const types = Array.from(new Set((items || []).map((i) => i.table_name)));

  return (
    <div className="bg-card border rounded-xl p-6 mt-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Trash2 size={20} className="text-primary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Papierkorb</h2>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-background border border-border px-3 py-1.5 font-body text-sm rounded-lg">
          <option value="">Alle</option>
          {types.map((t) => <option key={t} value={t}>{TABLE_LABELS[t] || t}</option>)}
        </select>
      </div>
      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : !shown.length ? (
        <p className="font-body text-sm text-muted-foreground">Der Papierkorb ist leer.</p>
      ) : (
        <ul className="divide-y divide-border">
          {shown.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="font-body text-sm text-foreground truncate">{i.label}</p>
                <p className="font-body text-xs text-muted-foreground">
                  {TABLE_LABELS[i.table_name] || i.table_name} · gelöscht am {new Date(i.deleted_at).toLocaleString("de-CH")}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button disabled={busy === i.id} onClick={() => restore(i.id)} className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-body text-xs px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50">
                  <RotateCcw size={14} /> Wiederherstellen
                </button>
                <button disabled={busy === i.id} onClick={() => purge(i.id)} className="font-body text-xs text-destructive px-2 py-1.5 hover:underline disabled:opacity-50">
                  Endgültig löschen
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrashBin;
