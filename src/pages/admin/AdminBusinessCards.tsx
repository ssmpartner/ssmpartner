import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Download, Loader2, IdCard } from "lucide-react";
import { toast } from "sonner";
import { generateVCard } from "@/components/ContactCardModal";
import {
  PAGE_W_MM, PAGE_H_MM, BLEED_MM, PT_TO_MM, SCREEN, QR, ROW, ICONS, ICON_GRID, ICON_STROKE, LOGO_PATHS, FONT_FAMILY,
  loadCardFonts, computeLayout, formatSwissPhone, businessCardFileName, type CardData, type CardFonts, type CardLayout,
} from "@/lib/businessCard/layout";
import { qrRuns } from "@/lib/businessCard/qr";
import { buildBusinessCardPdf } from "@/lib/businessCard/pdf";

const WEBSITE = "www.ssmpartner.ch";
type Member = { id: string; name: string; role_de: string | null; phone: string | null; email: string | null; agency_id: string | null; agencies: { name: string; address: string | null } | null };

const agencyAddress = (a: Member["agencies"]) =>
  (a?.address || "").split(/\r?\n/).map((s) => s.trim().replace(/,$/, "")).filter(Boolean).join(", ");

function dataFor(m: Member): CardData {
  return { name: m.name || "", role: m.role_de || "", phone: formatSwissPhone(m.phone), email: m.email || "", website: WEBSITE, address: agencyAddress(m.agencies) };
}
function vcardFor(d: CardData) {
  const v = generateVCard({ name: d.name, role_de: d.role, phone: d.phone, email: d.email, agency_address: d.address });
  return v.replace("END:VCARD", "URL:https://www.ssmpartner.ch\nEND:VCARD");
}
function download(bytes: Uint8Array, name: string) {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
  const a = document.createElement("a"); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

const k = PT_TO_MM;
function Front({ layout, vcard }: { layout: CardLayout; vcard: string }) {
  const { n, runs } = useMemo(() => qrRuns(vcard), [vcard]);
  const m = QR.size / n;
  return (
    <svg viewBox={`0 0 ${PAGE_W_MM} ${PAGE_H_MM}`} className="w-full rounded-md shadow-md" style={{ background: SCREEN.white }}>
      {runs.map(([r, s, len], i) => <rect key={i} x={QR.x + s * m} y={QR.y + r * m} width={len * m + 0.01} height={m + 0.01} fill={SCREEN.green} />)}
      {[layout.name, layout.role].map((t, i) => (
        <text key={i} x={t.x} y={t.y} fontSize={t.size * k} fontFamily={FONT_FAMILY[t.font]} fill={SCREEN.black}>{t.text}</text>
      ))}
      {layout.rows.map((r) => (
        <g key={r.key}>
          <circle cx={r.cx} cy={r.cy} r={ROW.circleD / 2} fill={SCREEN.green} />
          <g transform={`translate(${r.cx - ROW.iconSize / 2} ${r.cy - ROW.iconSize / 2}) scale(${ROW.iconSize / ICON_GRID})`}>
            <path d={ICONS[r.key]} fill="none" stroke={SCREEN.white} strokeWidth={ICON_STROKE} strokeLinecap="round" />
          </g>
          <text x={r.x} y={r.y} fontSize={r.size * k} fontFamily={FONT_FAMILY.medium} fill={r.overflow ? "hsl(var(--destructive))" : SCREEN.black}>{r.text}</text>
        </g>
      ))}
      <TrimLine />
    </svg>
  );
}
const TrimLine = () => (
  <rect x={BLEED_MM} y={BLEED_MM} width={PAGE_W_MM - 2 * BLEED_MM} height={PAGE_H_MM - 2 * BLEED_MM} fill="none" stroke="#888" strokeWidth={0.15} strokeDasharray="0.8 0.6" />
);
const Back = () => (
  <svg viewBox={`0 0 ${PAGE_W_MM} ${PAGE_H_MM}`} className="w-full rounded-md shadow-md">
    <rect width={PAGE_W_MM} height={PAGE_H_MM} fill={SCREEN.green} />
    <g transform={`scale(${k})`}>{LOGO_PATHS.map((p, i) => <path key={i} d={p} fill={SCREEN.white} fillRule="evenodd" />)}</g>
    <TrimLine />
  </svg>
);

export default function AdminBusinessCards() {
  const [fonts, setFonts] = useState<CardFonts | null>(null);
  const [fontError, setFontError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<CardData | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { loadCardFonts().then(setFonts).catch((e) => setFontError(e.message)); }, []);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["business-card-members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("team_members").select("id,name,role_de,phone,email,agency_id,agencies(name,address)").order("name");
      if (error) throw error;
      return (data || []) as unknown as Member[];
    },
  });
  const filtered = members.filter((m) => `${m.name} ${m.agencies?.name || ""}`.toLowerCase().includes(search.toLowerCase()));
  const selected = members.find((m) => m.id === selectedId) || null;

  const select = (m: Member) => { setSelectedId(m.id); setForm(dataFor(m)); };
  const layout = useMemo(() => (form && fonts ? computeLayout(form, fonts.measure) : null), [form, fonts]);
  const vcard = form ? vcardFor(form) : "";

  const exportOne = async () => {
    if (!form || !layout || !fonts) return;
    setBusy(true);
    try { download(await buildBusinessCardPdf(layout, vcard, fonts), businessCardFileName(form.name)); }
    catch (e: any) { toast.error("PDF konnte nicht erstellt werden: " + e.message); }
    finally { setBusy(false); }
  };
  const exportAll = async () => {
    if (!fonts) return;
    setBusy(true);
    try {
      for (const m of members.filter((x) => checked.has(x.id))) {
        const d = dataFor(m);
        download(await buildBusinessCardPdf(computeLayout(d, fonts.measure), vcardFor(d), fonts), businessCardFileName(d.name));
        await new Promise((r) => setTimeout(r, 400));
      }
      toast.success(`${checked.size} PDF erstellt`);
    } catch (e: any) { toast.error("Export fehlgeschlagen: " + e.message); }
    finally { setBusy(false); }
  };

  const set = (key: keyof CardData) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => (f ? { ...f, [key]: e.target.value } : f));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><IdCard className="h-6 w-6" /> Visitenkarten-Generator</h1>
        <p className="text-sm text-muted-foreground mt-1">Datenformat 87 × 57 mm inkl. 1 mm Beschnitt, CMYK – direkt bei Flyeralarm hochladbar (Visitenkarten 85 × 55 mm).</p>
      </div>
      {fonts?.fallback && (
        <div className="rounded-xl border-2 border-yellow-400 bg-yellow-100 text-yellow-900 p-4 flex gap-3 font-semibold">
          <AlertTriangle className="h-5 w-5 shrink-0" /> Schnitt Bold/Medium fehlt – Ersatzschrift aktiv, nicht für den Druck freigeben
        </div>
      )}
      {fontError && <div className="rounded-xl bg-destructive/10 text-destructive p-4">{fontError}</div>}

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <Input placeholder="Teammitglied suchen…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="max-h-[480px] overflow-y-auto divide-y">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin m-4" /> : filtered.map((m) => (
              <div key={m.id} className={`flex items-center gap-2 py-2 px-1 cursor-pointer rounded ${selectedId === m.id ? "bg-muted" : "hover:bg-muted/50"}`} onClick={() => select(m)}>
                <Checkbox checked={checked.has(m.id)} onClick={(e) => e.stopPropagation()} onCheckedChange={(v) => setChecked((s) => { const n = new Set(s); v ? n.add(m.id) : n.delete(m.id); return n; })} />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{m.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.agencies?.name || "Keine Agentur"}</div>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full" variant="outline" disabled={!checked.size || busy || !fonts} onClick={exportAll}>
            <Download className="h-4 w-4 mr-2" /> Alle als PDF herunterladen ({checked.size})
          </Button>
        </div>

        <div className="space-y-6">
          {!form ? <p className="text-muted-foreground">Bitte links ein Teammitglied wählen.</p> : (
            <>
              <div className="rounded-2xl border bg-card p-4 grid sm:grid-cols-2 gap-3">
                {([["name", "Name"], ["role", "Funktion"], ["phone", "Telefon"], ["email", "E-Mail"], ["website", "Website"], ["address", "Adresse"]] as [keyof CardData, string][]).map(([key, label]) => (
                  <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                    <Label>{label}</Label>
                    <Input value={form[key]} onChange={set(key)} disabled={key === "website"} />
                  </div>
                ))}
                {selected && !agencyAddress(selected.agencies) && (
                  <div className="sm:col-span-2 rounded-lg bg-yellow-100 text-yellow-900 p-3 text-sm flex gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {selected.agency_id ? "Die Agentur dieses Mitglieds hat keine Adresse hinterlegt." : "Dieses Mitglied ist keiner Agentur zugeordnet."} Bitte Adresse manuell eintragen.
                  </div>
                )}
                {layout?.warnings.map((w) => (
                  <div key={w} className="sm:col-span-2 rounded-lg bg-destructive/10 text-destructive p-3 text-sm flex gap-2"><AlertTriangle className="h-4 w-4" />{w}</div>
                ))}
              </div>
              {layout && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div><p className="text-xs text-muted-foreground mb-2">Vorderseite</p><Front layout={layout} vcard={vcard} /></div>
                  <div><p className="text-xs text-muted-foreground mb-2">Rückseite</p><Back /></div>
                </div>
              )}
              <Button onClick={exportOne} disabled={!layout || busy}>
                {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />} PDF herunterladen
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
