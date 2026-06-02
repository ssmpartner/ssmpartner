import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SocialPlatform = "linkedin" | "instagram" | "youtube" | "facebook";

export const SOCIAL_PLATFORMS: SocialPlatform[] = ["linkedin", "instagram", "youtube", "facebook"];

export const useSocialLinks = () => {
  const { data } = useQuery({
    queryKey: ["social-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("section_key, link_url")
        .eq("page", "social")
        .eq("lang", "de");
      if (error) throw error;
      return data;
    },
  });

  const map: Partial<Record<SocialPlatform, string>> = {};
  data?.forEach((row) => {
    if (row.link_url) map[row.section_key as SocialPlatform] = row.link_url;
  });
  return map;
};