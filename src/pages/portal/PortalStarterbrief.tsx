import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PdfFlipbook } from "@/components/starterbrief/PdfFlipbook";
import { signedStarterbriefUrl } from "@/lib/starterbrief";

const PortalStarterbrief = () => {
  const { user, loading } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const { data: editions = [], isLoading } = useQuery({
    queryKey: ["starterbrief-editions", !!user],
    enabled: !loading,
    queryFn: async () => {
      const { data, error } = await supabase.from("starterbrief_editions").select("*")
        .order("is_published", { ascending: false }).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const active = editions.find(e => e.id === selected) || editions.find(e => e.is_published);
  useEffect(() => {
    setUrl(null);
    if (active) signedStarterbriefUrl(active.pdf_url).then(setUrl).catch(() => setUrl(null));
  }, [active?.id]);

  if (loading) return null;
  const archive = !user ? [] : editions.filter(e => e.id !== active?.id && (e.is_published || e.published_at));

  return (
    <div className="min-h-screen bg-background px-4 md:px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          {user ? <Link to="/portal" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Zurück zum Portal</Link> : <span />}
          <button onClick={() => { navigator.clipboard.writeText("https://ssmpartner.ch/portal/starterbrief"); toast.success("Öffentlicher Link kopiert"); }} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"><Share2 className="h-4 w-4" /> Link teilen</button>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-semibold text-foreground">SSM Academy Starterbrief</h1>
        </div>
        {active && <p className="text-muted-foreground mb-6">{active.title}{active.description ? ` – ${active.description}` : ""}</p>}
        {isLoading ? <div className="h-96 rounded-2xl bg-muted animate-pulse" />
          : !active ? <p className="text-muted-foreground py-20 text-center">Aktuell ist kein Starterbrief veröffentlicht.</p>
          : url ? <PdfFlipbook url={url} title={active.title} /> : <div className="h-96 rounded-2xl bg-muted animate-pulse" />}
        {archive.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Archiv</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {archive.map(e => (
                <button key={e.id} onClick={() => { setSelected(e.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="text-left rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition">
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-muted-foreground">{e.published_at ? new Date(e.published_at).toLocaleDateString("de-CH") : ""}{e.is_published ? " · Aktuell" : ""}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default PortalStarterbrief;
