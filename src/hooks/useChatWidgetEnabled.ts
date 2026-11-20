import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Reads the chat widget visibility setting. Default: enabled (true) when no row exists.
export const useChatWidgetEnabled = () => {
  const { data } = useQuery({
    queryKey: ["chat-widget-enabled"],
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
  return data !== false;
};
