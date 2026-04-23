import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Megaphone, ChevronRight } from "lucide-react";

export const UrgentNewsBanner = () => {
  const { data: urgent } = useQuery({
    queryKey: ["urgent-news-banner"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts" as any)
        .select("id, title, slug, excerpt")
        .eq("is_urgent_banner", true)
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle() as any;
      return data;
    },
  });

  if (!urgent) return null;

  return (
    <Link
      to={`/portal/news/${urgent.slug}`}
      className="block bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
        <Megaphone className="h-5 w-5 shrink-0 animate-pulse" />
        <div className="flex-1 min-w-0">
          <span className="font-semibold">{urgent.title}</span>
          {urgent.excerpt && <span className="ml-2 opacity-90 hidden sm:inline">— {urgent.excerpt}</span>}
        </div>
        <ChevronRight className="h-5 w-5 shrink-0" />
      </div>
    </Link>
  );
};