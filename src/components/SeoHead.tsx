import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://ssmpartner.ch";

type SeoRow = {
  route: string;
  title: string | null;
  description: string | null;
  og_image: string | null;
  noindex: boolean;
};

export default function SeoHead() {
  const { pathname } = useLocation();

  const { data: rows = [] } = useQuery({
    queryKey: ["seo_settings_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("route,title,description,og_image,noindex");
      if (error) throw error;
      return (data ?? []) as SeoRow[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Find best match: exact, then parametric (e.g. /agenturen/:slug → /agenturen)
  const match =
    rows.find((r) => r.route === pathname) ||
    rows.find((r) => r.route !== "/" && pathname.startsWith(r.route + "/"));

  if (!match) return null;

  const canonical = `${SITE_URL}${pathname}`;

  return (
    <Helmet>
      {match.title && <title>{match.title}</title>}
      {match.description && <meta name="description" content={match.description} />}
      <link rel="canonical" href={canonical} />
      {match.title && <meta property="og:title" content={match.title} />}
      {match.description && <meta property="og:description" content={match.description} />}
      <meta property="og:url" content={canonical} />
      {match.og_image && <meta property="og:image" content={match.og_image} />}
      {match.noindex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  );
}