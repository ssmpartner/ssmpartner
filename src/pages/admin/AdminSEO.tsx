import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Search, CheckCircle2, AlertCircle, XCircle, ExternalLink, Save,
} from "lucide-react";
import { toast } from "sonner";

const SITE_URL = "https://ssmpartner.ch";

type SeoRow = {
  id: string;
  route: string;
  label: string;
  title: string | null;
  description: string | null;
  og_image: string | null;
  noindex: boolean;
};

type Check = {
  ok: boolean;
  label: string;
  detail?: string;
  warn?: boolean;
};

export default function AdminSEO() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Record<string, Partial<SeoRow>>>({});

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["seo_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .order("route");
      if (error) throw error;
      return (data ?? []) as SeoRow[];
    },
  });

  // Live checks
  const [checks, setChecks] = useState<Check[]>([]);
  useEffect(() => {
    const run = async () => {
      const out: Check[] = [];
      const title = document.title;
      out.push({
        ok: !!title && title.length >= 10 && title.length <= 65,
        warn: !!title && (title.length < 10 || title.length > 65),
        label: "Title-Tag",
        detail: title ? `${title} (${title.length} Zeichen, optimal 30–60)` : "Fehlt",
      });
      const desc = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
      out.push({
        ok: !!desc && desc.length >= 50 && desc.length <= 165,
        warn: !!desc && (desc.length < 50 || desc.length > 165),
        label: "Meta-Description",
        detail: desc ? `${desc.length} Zeichen, optimal 70–160` : "Fehlt",
      });
      const lang = document.documentElement.lang;
      out.push({ ok: !!lang, label: "HTML lang Attribut", detail: lang || "Fehlt" });
      const viewport = document.querySelector('meta[name="viewport"]');
      out.push({ ok: !!viewport, label: "Viewport Meta-Tag", detail: viewport ? "Vorhanden" : "Fehlt" });
      const ogTitle = document.querySelector('meta[property="og:title"]');
      out.push({ ok: !!ogTitle, label: "Open Graph Tags", detail: ogTitle ? "Vorhanden" : "Fehlt" });
      const ogImage = document.querySelector('meta[property="og:image"]');
      out.push({ ok: !!ogImage, label: "Social Sharing Bild (og:image)", detail: ogImage ? "Vorhanden" : "Fehlt" });

      // Sitemap / robots checks
      try {
        const r = await fetch("/robots.txt", { cache: "no-store" });
        out.push({ ok: r.ok, label: "robots.txt", detail: r.ok ? "Vorhanden" : "Fehlt" });
      } catch {
        out.push({ ok: false, label: "robots.txt", detail: "Fehler" });
      }
      try {
        const r = await fetch("/sitemap.xml", { cache: "no-store" });
        const text = r.ok ? await r.text() : "";
        const urls = (text.match(/<url>/g) || []).length;
        out.push({
          ok: r.ok && urls > 0,
          label: "sitemap.xml",
          detail: r.ok ? `${urls} URLs eingetragen` : "Fehlt",
        });
      } catch {
        out.push({ ok: false, label: "sitemap.xml", detail: "Fehler" });
      }

      setChecks(out);
    };
    run();
  }, [rows]);

  const score = checks.length
    ? Math.round((checks.filter((c) => c.ok).length / checks.length) * 100)
    : 0;

  const setField = (id: string, field: keyof SeoRow, value: any) => {
    setEditing((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const save = async (row: SeoRow) => {
    const changes = editing[row.id];
    if (!changes) return;
    const { error } = await supabase
      .from("seo_settings")
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (error) {
      toast.error("Fehler beim Speichern: " + error.message);
      return;
    }
    toast.success(`SEO für ${row.route} gespeichert`);
    setEditing((prev) => {
      const next = { ...prev };
      delete next[row.id];
      return next;
    });
    qc.invalidateQueries({ queryKey: ["seo_settings"] });
    qc.invalidateQueries({ queryKey: ["seo_settings_all"] });
  };

  const val = (row: SeoRow, field: keyof SeoRow): any =>
    editing[row.id]?.[field] !== undefined ? editing[row.id]![field] : row[field];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Search className="h-6 w-6" /> SEO Optimierung
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suchmaschinen-Metadaten verwalten und Status prüfen
        </p>
      </div>

      {/* Score / Checklist */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>SEO-Status</CardTitle>
          <div className="flex items-center gap-3">
            <div className={`text-3xl font-semibold ${score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600"}`}>
              {score}%
            </div>
            <Badge variant={score >= 80 ? "default" : "secondary"}>
              {score >= 80 ? "Sehr gut" : score >= 60 ? "Gut" : "Verbesserungswürdig"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {checks.map((c, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/40">
                {c.ok ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                ) : c.warn ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="text-sm">
                  <div className="font-medium">{c.label}</div>
                  {c.detail && <div className="text-muted-foreground text-xs">{c.detail}</div>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" /> sitemap.xml
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" /> robots.txt
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(SITE_URL)}`}
                target="_blank" rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" /> Google Rich Results Test
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={`https://pagespeed.web.dev/report?url=${encodeURIComponent(SITE_URL)}`}
                target="_blank" rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" /> PageSpeed Insights
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Per-route editor */}
      <Card>
        <CardHeader>
          <CardTitle>Seiten-Metadaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && <p className="text-sm text-muted-foreground">Lade…</p>}
          {rows.map((row) => {
            const title = (val(row, "title") as string) || "";
            const desc = (val(row, "description") as string) || "";
            const dirty = !!editing[row.id];
            return (
              <div key={row.id} className="border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-semibold">{row.label}</div>
                    <code className="text-xs text-muted-foreground">{row.route}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`noidx-${row.id}`} className="text-xs">noindex</Label>
                    <Switch
                      id={`noidx-${row.id}`}
                      checked={!!val(row, "noindex")}
                      onCheckedChange={(v) => setField(row.id, "noindex", v)}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Title ({title.length}/60)</Label>
                  <Input
                    value={title}
                    onChange={(e) => setField(row.id, "title", e.target.value)}
                    placeholder="Seitentitel"
                  />
                </div>
                <div>
                  <Label className="text-xs">Description ({desc.length}/160)</Label>
                  <Textarea
                    rows={2}
                    value={desc}
                    onChange={(e) => setField(row.id, "description", e.target.value)}
                    placeholder="Kurze Seitenbeschreibung für Suchmaschinen"
                  />
                </div>
                <div>
                  <Label className="text-xs">Social-Sharing-Bild (URL, optional)</Label>
                  <Input
                    value={(val(row, "og_image") as string) || ""}
                    onChange={(e) => setField(row.id, "og_image", e.target.value)}
                    placeholder="https://…/image.jpg"
                  />
                </div>

                {/* Google preview */}
                <div className="bg-muted/40 rounded-lg p-3 text-sm">
                  <div className="text-xs text-muted-foreground mb-1">Google-Vorschau</div>
                  <div className="text-[#1a0dab] text-base truncate">{title || "—"}</div>
                  <div className="text-green-700 text-xs">{SITE_URL}{row.route}</div>
                  <div className="text-[#4d5156] text-sm line-clamp-2">{desc || "—"}</div>
                </div>

                {dirty && (
                  <Button size="sm" onClick={() => save(row)}>
                    <Save className="h-4 w-4 mr-1" /> Speichern
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}