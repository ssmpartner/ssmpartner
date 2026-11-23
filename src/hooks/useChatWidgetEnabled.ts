import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Reads the chat widget visibility setting. Default: enabled (true) when no row exists.
export const useChatWidgetEnabled = () => {
  const { data } = useQuery({
    queryKey: ["chat-widget-enabled"],
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("body")
        .eq("page", "settings")
        .eq("section_key", "chat_widget_enabled")
        .eq("lang", "de")
        .maybeSingle();
      if (error) throw error;
      return data?.body !== "false";
    },
  });
  // Hidden until the setting has loaded, so a disabled widget never flashes up.
  return data === true;
};
