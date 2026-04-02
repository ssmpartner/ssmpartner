import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PageHeroProps {
  pageKey: string;
  fallbackImage?: string;
}

const PageHero = ({ pageKey, fallbackImage }: PageHeroProps) => {
  const { data: hero, isLoading } = useQuery({
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

  if (isLoading) return (
    <div className="w-full relative">
      <div className="w-full h-[35vh] lg:h-[42vh] bg-muted relative">
        <div
          className="absolute bottom-0 left-0 right-0 h-10 lg:h-14 rounded-t-[2rem] lg:rounded-t-[2.5rem] bg-background"
          style={{ boxShadow: "0 -10px 30px rgba(0,0,0,0.15)" }}
        />
      </div>
    </div>
  );

  if (!imageUrl) return (
    <div className="w-full relative">
      <div className="w-full h-[35vh] lg:h-[42vh] bg-muted relative">
        <div
          className="absolute bottom-0 left-0 right-0 h-10 lg:h-14 rounded-t-[2rem] lg:rounded-t-[2.5rem] bg-background"
          style={{ boxShadow: "0 -10px 30px rgba(0,0,0,0.15)" }}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full relative">
      {/* Hero image — full top, behind navbar */}
      <div className="w-full h-[35vh] lg:h-[42vh] overflow-hidden relative">
        <img
          src={imageUrl}
          alt={hero?.alt_text || ""}
          className="w-full h-full object-cover"
        />
        {/* Floating rounded overlap with shadow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-10 lg:h-14 rounded-t-[2rem] lg:rounded-t-[2.5rem] bg-background"
          style={{ boxShadow: "0 -10px 30px rgba(0,0,0,0.15)" }}
        />
      </div>
    </div>
  );
};

export default PageHero;
