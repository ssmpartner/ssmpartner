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
    <div className="w-full pt-16 lg:pt-20">
      {/* Hero image */}
      <div className="w-full h-[35vh] lg:h-[45vh] overflow-hidden">
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
