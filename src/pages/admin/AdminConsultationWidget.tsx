import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Loader2, Video } from "lucide-react";
import { toast } from "sonner";
import { ONLINE_WIDGET_SETTING, widgetSettingEnabled } from "@/lib/websiteWidgets";

export default function AdminConsultationWidget() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const { data: enabled, isPending, isError } = useQuery({
    queryKey: ["consultation-widget-enabled"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("body")
        .eq("page", "settings").eq("section_key", ONLINE_WIDGET_SETTING).eq("lang", "de").maybeSingle();
      if (error) throw error;
      return widgetSettingEnabled(data?.body, false);
    },
    staleTime: 0,
  });
  const toggle = async (value: boolean) => {
    setSaving(true);
    try {
      const { data, error: lookupError } = await supabase.from("site_content").select("id")
        .eq("page", "settings").eq("section_key", ONLINE_WIDGET_SETTING).eq("lang", "de").maybeSingle();
      if (lookupError) throw lookupError;
      const body = String(value);
      const { error } = data
        ? await supabase.from("site_content").update({ body }).eq("id", data.id)
        : await supabase.from("site_content").insert({ page: "settings", section_key: ONLINE_WIDGET_SETTING, lang: "de", body });
      if (error) throw error;
      qc.setQueryData(["consultation-widget-enabled"], value);
      await qc.invalidateQueries({ queryKey: ["consultation-widget-enabled"] });
      toast.success(value ? "Beratungs-Widget eingeblendet" : "Beratungs-Widget ausgeblendet");
    } catch { toast.error("Einstellung konnte nicht gespeichert werden"); }
    finally { setSaving(false); }
  };
  return <div className="max-w-2xl">
    <h1 className="font-heading text-2xl font-semibold text-foreground mb-8">Beratungs-Widget</h1>
    <div className="bg-card border rounded-2xl p-6 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <Video size={24} className="text-primary shrink-0" />
        <div>
          <h2 id="consultation-widget-label" className="font-heading font-semibold">Auf der Website anzeigen</h2>
          <p className="text-sm text-muted-foreground mt-1">{isError ? "Einstellung konnte nicht geladen werden." : isPending ? "Laden…" : enabled ? "Eingeblendet" : "Ausgeblendet"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {(isPending || saving) && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
        <Switch aria-labelledby="consultation-widget-label" checked={enabled === true} disabled={isPending || isError || saving} onCheckedChange={toggle} />
      </div>
    </div>
  </div>;
}