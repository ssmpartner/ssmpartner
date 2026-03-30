import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PageHeroProps {
  pageKey: string;
  fallbackImage?: string;
}

const PageHero = ({ pageKey, fallbackImage }: PageHeroProps) => {
  const { data: hero } = useQuery({
    queryKey: ["page-hero", pageKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_heroes")
        .select("*")
        .eq("page_key", pageKey)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const imageUrl = hero?.image_url || fallbackImage;

  if (!imageUrl) return null;

  return (
    <div className="w-full">
      {/* Hero image — full top, behind navbar */}
      <div className="w-full h-[45vh] lg:h-[55vh] overflow-hidden">
        <img
          src={imageUrl}
          alt={hero?.alt_text || ""}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Green line */}
      <div className="w-full h-1.5" style={{ backgroundColor: "#243e3a" }} />
    </div>
  );
};

export default PageHero;
