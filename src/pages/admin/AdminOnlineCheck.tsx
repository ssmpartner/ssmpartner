import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Volume2, Bot, Save, DollarSign } from "lucide-react";

const CATEGORIES = [
  { id: "hausrat", label: "Hausrat" },
  { id: "auto", label: "Auto" },
  { id: "rechtsschutz", label: "Rechtsschutz" },
  { id: "vorsorge", label: "Vorsorge / Säule 3a" },
  { id: "leben", label: "Lebensversicherung" },
  { id: "krankenkasse", label: "Krankenkasse" },
];

const TIERS = ["basis", "komfort", "premium"];

type PricingRow = {
  id: string;
  category: string;
  tier: string;
  label: string;
  price_text: string;
  price_value: number | null;
  description: string | null;
  api_source: string | null;
  active: boolean;
};

const AdminOnlineCheck = () => {
  const qc = useQueryClient();

  const { data: pricing = [], isLoading } = useQuery({
    queryKey: ["wizard-pricing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wizard_pricing")
        .select("*")
        .order("category")
        .order("sort_order");
      if (error) throw error;
      return data as PricingRow[];
    },
  });

  const [edits, setEdits] = useState<Record<string, Partial<PricingRow>>>({});

  const updateField = (id: string, field: string, value: string | number | null) => {
    setEdits(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const entries = Object.entries(edits);
      for (const [id, changes] of entries) {
        const { error } = await supabase
          .from("wizard_pricing")
          .update(changes as any)
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Preise gespeichert");
      setEdits({});
      qc.invalidateQueries({ queryKey: ["wizard-pricing"] });
    },
    onError: () => toast.error("Fehler beim Speichern"),
  });

  const getVal = (row: PricingRow, field: keyof PricingRow) => {
    return edits[row.id]?.[field] !== undefined ? edits[row.id][field] : row[field];
  };

  const hasChanges = Object.keys(edits).length > 0;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Online-Beratung</h1>
        <p className="text-muted-foreground mt-1">Verwalten Sie den KI-Chat, Wizard-Preise und Einstellungen.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot size={20} /> KI-Chat Konfiguration</CardTitle>
            <CardDescription>Der Chat nutzt die gleiche Wissensbasis wie der Chat-Widget. Verwalten Sie diese unter "KI-Chat Wissen".</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">✅ Der KI-Chat ist aktiv und nutzt die Wissensbasis aus dem Bereich "KI-Chat Wissen".</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Volume2 size={20} /> ElevenLabs Sprachausgabe</CardTitle>
            <CardDescription>Die Sprachausgabe ermöglicht es Besuchern, die KI-Antworten als Audio abzuspielen.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">✅ ElevenLabs TTS ist konfiguriert.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><DollarSign size={20} /> Wizard-Preise verwalten</CardTitle>
                <CardDescription className="mt-1">Richtwerte pro Versicherung und Paket. Diese werden im Wizard angezeigt.</CardDescription>
              </div>
              {hasChanges && (
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} size="sm">
                  <Save size={14} className="mr-1" />
                  {saveMutation.isPending ? "Speichern..." : "Änderungen speichern"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Laden...</p>
            ) : (
              <div className="space-y-6">
                {CATEGORIES.map(cat => {
                  const rows = pricing.filter(p => p.category === cat.id);
                  if (rows.length === 0) return null;
                  return (
                    <div key={cat.id} className="space-y-3">
                      <h4 className="font-heading font-bold text-foreground text-sm border-b border-border pb-1">{cat.label}</h4>
                      <div className="grid gap-3">
                        {TIERS.map(tier => {
                          const row = rows.find(r => r.tier === tier);
                          if (!row) return null;
                          return (
                            <div key={row.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end bg-muted/50 p-3 rounded-lg">
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Label</label>
                                <Input
                                  value={getVal(row, "label") as string}
                                  onChange={e => updateField(row.id, "label", e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Preis-Text (Anzeige)</label>
                                <Input
                                  value={getVal(row, "price_text") as string}
                                  onChange={e => updateField(row.id, "price_text", e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Beschreibung</label>
                                <Input
                                  value={(getVal(row, "description") as string) || ""}
                                  onChange={e => updateField(row.id, "description", e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">API-Quelle (optional)</label>
                                <Input
                                  value={(getVal(row, "api_source") as string) || ""}
                                  onChange={e => updateField(row.id, "api_source", e.target.value || null)}
                                  placeholder="z.B. priminfo.admin.ch"
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings size={20} /> API-Anbindung (Zukunft)</CardTitle>
            <CardDescription>Vorbereitet für externe Prämien-APIs. Das Feld "API-Quelle" pro Paket kann genutzt werden, um Preise automatisch zu laden.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">🔜 Sobald eine Versicherungsgesellschaft eine API bereitstellt, kann diese hier pro Produkt hinterlegt werden.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOnlineCheck;
