import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Modal that blocks the portal until the user acknowledges all important
 * news posts they have access to but haven't acknowledged yet.
 */
export const ImportantNewsModal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const { data: pending } = useQuery({
    queryKey: ["important-news-pending", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: posts } = await supabase
        .from("news_posts" as any)
        .select("id, title, slug, content, cover_image_url, published_at, news_categories(name, color)")
        .eq("is_important", true)
        .eq("published", true)
        .order("published_at", { ascending: false }) as any;

      if (!posts?.length) return [];
      const { data: acks } = await supabase
        .from("news_acknowledgements" as any)
        .select("post_id")
        .eq("user_id", user!.id) as any;

      const ackIds = new Set((acks || []).map((a: any) => a.post_id));
      return posts.filter((p: any) => !ackIds.has(p.id));
    },
  });

  const ackMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("news_acknowledgements" as any)
        .insert({ post_id: postId, user_id: user!.id }) as any;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Bestätigung gespeichert");
      queryClient.invalidateQueries({ queryKey: ["important-news-pending"] });
    },
  });

  useEffect(() => {
    setConfirmed(false);
  }, [index]);

  if (!pending || pending.length === 0) return null;
  const current = pending[index];
  if (!current) return null;

  const handleConfirm = async () => {
    await ackMutation.mutateAsync(current.id);
    if (index + 1 < pending.length) {
      setIndex(index + 1);
    } else {
      setIndex(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card border rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-destructive text-destructive-foreground px-6 py-4 flex items-center gap-3">
          <AlertTriangle className="h-6 w-6" />
          <div>
            <p className="font-semibold">Wichtige Mitteilung</p>
            <p className="text-xs opacity-90">
              Pflichtbestätigung erforderlich {pending.length > 1 && `· ${index + 1} von ${pending.length}`}
            </p>
          </div>
        </div>

        {current.cover_image_url && (
          <div className="aspect-[21/9] bg-muted overflow-hidden">
            <img src={current.cover_image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {current.news_categories && (
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: current.news_categories.color }}>
              {current.news_categories.name}
            </span>
          )}
          <h2 className="text-2xl font-semibold text-foreground mt-2 mb-4">{current.title}</h2>
          <div
            className="prose prose-sm max-w-none text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: current.content || "" }}
          />
        </div>

        <div className="border-t p-6 bg-muted/30 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-input"
            />
            <span className="text-sm text-foreground">
              Ich habe die Mitteilung <strong>gelesen und verstanden</strong>.
            </span>
          </label>
          <button
            onClick={handleConfirm}
            disabled={!confirmed || ackMutation.isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium px-6 py-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle2 size={18} />
            {ackMutation.isPending ? "Speichern…" : "Lesebestätigung abgeben"}
          </button>
        </div>
      </div>
    </div>
  );
};