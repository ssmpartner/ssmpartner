import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ONLINE_WIDGET_SETTING, widgetSettingEnabled } from "@/lib/websiteWidgets";

export const useConsultationWidgetEnabled = () => useQuery({
  queryKey: ["consultation-widget-enabled"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_content").select("body")
      .eq("page", "settings").eq("section_key", ONLINE_WIDGET_SETTING).eq("lang", "de").maybeSingle();
    if (error) throw error;
    return widgetSettingEnabled(data?.body, false);
  },
  staleTime: 0,
  refetchInterval: 30_000,
  refetchOnWindowFocus: true,
}).data === true;