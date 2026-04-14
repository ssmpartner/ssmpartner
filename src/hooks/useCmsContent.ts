import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

export const useCmsContent = (page: string) => {
  const { lang } = useLanguage();

  const { data: content } = useQuery({
    queryKey: ["site-content", page, lang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("page", page)
        .eq("lang", lang)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const cms = useMemo(() => {
    const map: Record<string, { title?: string | null; body?: string | null; link_text?: string | null; link_url?: string | null }> = {};
    content?.forEach((item) => {
      map[item.section_key] = { title: item.title, body: item.body, link_text: item.link_text, link_url: item.link_url };
    });
    return map;
  }, [content]);

  /** Get CMS title or fallback */
  const cmsTitle = (key: string, fallback: string) => cms[key]?.title || fallback;
  /** Get CMS body or fallback */
  const cmsBody = (key: string, fallback: string) => cms[key]?.body || fallback;

  return { cms, cmsTitle, cmsBody };
};
