import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/hooks/useSocialLinks";

const LABELS: Record<SocialPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
};

const AdminSocialLinks = () => {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_content")
        .select("section_key, link_url")
        .eq("page", "social")
        .eq("lang", "de");
      const map: Record<string, string> = {};
      SOCIAL_PLATFORMS.forEach((p) => (map[p] = ""));
      data?.forEach((r) => (map[r.section_key] = r.link_url || ""));
      setValues(map);
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    for (const platform of SOCIAL_PLATFORMS) {
      const url = values[platform] || "";
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("page", "social")
        .eq("section_key", platform)
        .eq("lang", "de")
        .maybeSingle();
      if (existing) {
        await supabase.from("site_content").update({ link_url: url }).eq("id", existing.id);
      } else {
        await supabase.from("site_content").insert({ page: "social", section_key: platform, lang: "de", link_url: url });
      }
    }
    setSaving(false);
    qc.invalidateQueries({ queryKey: ["social-links"] });
    toast.success("Social Media Links gespeichert");
  };

  const inputClass = "w-full bg-background border border-border px-3 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground mb-1">Social Media Links</h1>
      <p className="font-body text-sm text-muted-foreground mb-8">
        Verwalte die Links zu den Social-Media-Profilen. Leere Felder werden im Footer und auf der Kontaktseite ausgeblendet.
      </p>

      <div className="bg-card border rounded-xl p-6 space-y-4">
        {loading ? (
          <p className="font-body text-sm text-muted-foreground">Laden...</p>
        ) : (
          SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform}>
              <label className="font-body text-xs font-semibold text-foreground flex items-center gap-2 mb-1.5">
                <Link2 size={14} /> {LABELS[platform]}
              </label>
              <input
                type="url"
                placeholder={`https://${platform}.com/...`}
                value={values[platform] || ""}
                onChange={(e) => setValues((v) => ({ ...v, [platform]: e.target.value }))}
                className={inputClass}
              />
            </div>
          ))
        )}

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Speichern..." : "Speichern"}
        </button>
      </div>
    </div>
  );
};

export default AdminSocialLinks;