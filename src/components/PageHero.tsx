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
      <div className="w-full h-[35vh] lg:h-[42vh] overflow-hidden">
        <img
          src={imageUrl}
          alt={hero?.alt_text || ""}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Green line */}
      <div className="w-full h-1.5" style={{ backgroundColor: "#B3B69C" }} />
      {/* Rounded overlap — content slides over hero */}
      <div className="relative -mt-8 lg:-mt-12">
        <div
          className="w-full h-10 lg:h-14 rounded-t-[2rem] lg:rounded-t-[2.5rem] bg-background"
          style={{ boxShadow: "0 -8px 24px rgba(0,0,0,0.06)" }}
        />
      </div>
    </div>
  );
};

export default PageHero;
