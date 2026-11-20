import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

const AdminChatWidget = () => {
  const qc = useQueryClient();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_content")
        .select("body")
        .eq("page", "settings")
        .eq("section_key", "chat_widget_enabled")
        .eq("lang", "de")
        .maybeSingle();
      setEnabled(data?.body !== "false");
      setLoading(false);
    })();
  }, []);

  const handleToggle = async (value: boolean) => {
    setEnabled(value);
    setSaving(true);
    const { data: existing } = await supabase
      .from("site_content")
      .select("id")
      .eq("page", "settings")
      .eq("section_key", "chat_widget_enabled")
      .eq("lang", "de")
      .maybeSingle();
    const body = value ? "true" : "false";
    const { error } = existing
      ? await supabase.from("site_content").update({ body }).eq("id", existing.id)
      : await supabase.from("site_content").insert({ page: "settings", section_key: "chat_widget_enabled", lang: "de", body });
    setSaving(false);
    if (error) {
      setEnabled(!value);
      toast.error("Speichern fehlgeschlagen");
      return;
    }
    qc.invalidateQueries({ queryKey: ["chat-widget-enabled"] });
    toast.success(value ? "KI-Chat aktiviert" : "KI-Chat deaktiviert");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground mb-1">KI-Chat (unten rechts)</h1>
      <p className="font-body text-sm text-muted-foreground mb-8">
        Steuere, ob der KI-Chat unten rechts auf der Website erscheint.
      </p>

      <div className="bg-card border rounded-xl p-6">
        {loading ? (
          <p className="font-body text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Laden...
          </p>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MessageCircle size={20} />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">KI-Chat auf der Website anzeigen</h2>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  {enabled
                    ? "Der KI-Chat ist für Besucher sichtbar."
                    : "Der KI-Chat ist ausgeblendet. Besucher sehen ihn nicht."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {saving && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
              <Switch checked={enabled} onCheckedChange={handleToggle} disabled={saving} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatWidget;
