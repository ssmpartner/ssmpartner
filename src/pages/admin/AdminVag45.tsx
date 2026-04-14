import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Download, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaPickerModal from "@/components/MediaPickerModal";

/* ─── Downloads ─── */

type Dl = {
  id: string;
  lang: string;
  description: string;
  url: string;
  sort_order: number;
  active: boolean;
};

const emptyDl: Omit<Dl, "id"> = { lang: "", description: "", url: "", sort_order: 0, active: true };

/* ─── Partners ─── */

type Partner = {
  id: string;
  section: string;
  branch: string;
  category: string;
  company: string;
  address: string;
  contact_email: string;
  privacy_url: string;
  sort_order: number;
  active: boolean;
};

const emptyPartner: Omit<Partner, "id"> = {
  section: "life",
  branch: "",
  category: "",
  company: "",
  address: "",
  contact_email: "",
  privacy_url: "",
  sort_order: 0,
  active: true,
};

const AdminVag45 = () => {
  const qc = useQueryClient();

  /* ── Downloads state ── */
  const [dlOpen, setDlOpen] = useState(false);
  const [dlForm, setDlForm] = useState<Omit<Dl, "id"> & { id?: string }>(emptyDl);
  const [mediaOpen, setMediaOpen] = useState(false);

  const { data: downloads = [], isLoading: dlLoading } = useQuery({
    queryKey: ["vag45_downloads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vag45_downloads").select("*").order("sort_order");
      if (error) throw error;
      return data as Dl[];
    },
  });

  const dlSave = useMutation({
    mutationFn: async (form: typeof dlForm) => {
      const { id, ...rest } = form;
      if (id) {
        const { error } = await supabase.from("vag45_downloads").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("vag45_downloads").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vag45_downloads"] }); setDlOpen(false); toast.success("Gespeichert"); },
  });

  const dlDelete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vag45_downloads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vag45_downloads"] }); toast.success("Gelöscht"); },
  });

  /* ── Partners state ── */
  const [pOpen, setPOpen] = useState(false);
  const [pForm, setPForm] = useState<Omit<Partner, "id"> & { id?: string }>(emptyPartner);
  const [pSection, setPSection] = useState<"life" | "damage">("life");

  const { data: partners = [], isLoading: pLoading } = useQuery({
    queryKey: ["vag45_partners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vag45_partners").select("*").order("sort_order");
      if (error) throw error;
      return data as Partner[];
    },
  });

  const pSave = useMutation({
    mutationFn: async (form: typeof pForm) => {
      const { id, ...rest } = form;
      if (id) {
        const { error } = await supabase.from("vag45_partners").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("vag45_partners").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vag45_partners"] }); setPOpen(false); toast.success("Gespeichert"); },
  });

  const pDelete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vag45_partners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vag45_partners"] }); toast.success("Gelöscht"); },
  });

  const filteredPartners = partners.filter((p) => p.section === pSection);

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-semibold">VAG 45 verwalten</h1>

      <Tabs defaultValue="downloads">
        <TabsList>
          <TabsTrigger value="downloads" className="gap-2"><Download size={16} /> Downloads</TabsTrigger>
          <TabsTrigger value="partners" className="gap-2"><Shield size={16} /> Versicherungspartner</TabsTrigger>
        </TabsList>

        {/* ═══════ DOWNLOADS TAB ═══════ */}
        <TabsContent value="downloads" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="font-heading text-lg font-semibold">Download-Dokumente</h2>
            <Button size="sm" onClick={() => { setDlForm(emptyDl); setDlOpen(true); }}>
              <Plus size={16} /> Hinzufügen
            </Button>
          </div>

          {dlLoading ? (
            <p className="text-muted-foreground text-sm">Laden…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sprache</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>URL / Datei</TableHead>
                  <TableHead className="w-16">Pos.</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {downloads.map((dl) => (
                  <TableRow key={dl.id}>
                    <TableCell className="font-medium">{dl.lang}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{dl.description}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      <a href={dl.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{dl.url.split("/").pop()}</a>
                    </TableCell>
                    <TableCell>{dl.sort_order}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setDlForm(dl); setDlOpen(true); }}><Pencil size={14} /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 size={14} /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Löschen?</AlertDialogTitle>
                              <AlertDialogDescription>Download «{dl.lang}» wirklich löschen?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction onClick={() => dlDelete.mutate(dl.id)}>Löschen</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Download edit dialog */}
          <Dialog open={dlOpen} onOpenChange={setDlOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{dlForm.id ? "Download bearbeiten" : "Neuer Download"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Sprache</Label>
                  <Input value={dlForm.lang} onChange={(e) => setDlForm({ ...dlForm, lang: e.target.value })} placeholder="z.B. Deutsch" />
                </div>
                <div>
                  <Label>Beschreibung</Label>
                  <Textarea value={dlForm.description} onChange={(e) => setDlForm({ ...dlForm, description: e.target.value })} rows={2} />
                </div>
                <div>
                  <Label>Dokument-URL</Label>
                  <div className="flex gap-2">
                    <Input className="flex-1" value={dlForm.url} onChange={(e) => setDlForm({ ...dlForm, url: e.target.value })} placeholder="https://…" />
                    <Button variant="outline" size="sm" onClick={() => setMediaOpen(true)}>Mediathek</Button>
                  </div>
                </div>
                <div>
                  <Label>Sortierung</Label>
                  <Input type="number" value={dlForm.sort_order} onChange={(e) => setDlForm({ ...dlForm, sort_order: Number(e.target.value) })} />
                </div>
                <Button className="w-full" onClick={() => dlSave.mutate(dlForm)} disabled={dlSave.isPending}>
                  {dlSave.isPending ? "Speichere…" : "Speichern"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <MediaPickerModal
            open={mediaOpen}
            onClose={() => setMediaOpen(false)}
            onSelect={(url) => { setDlForm({ ...dlForm, url }); setMediaOpen(false); }}
            title="Dokument auswählen"
          />
        </TabsContent>

        {/* ═══════ PARTNERS TAB ═══════ */}
        <TabsContent value="partners" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="font-heading text-lg font-semibold">Versicherungspartner</h2>
              <div className="flex gap-1">
                <Button size="sm" variant={pSection === "life" ? "default" : "outline"} onClick={() => setPSection("life")}>Leben (A)</Button>
                <Button size="sm" variant={pSection === "damage" ? "default" : "outline"} onClick={() => setPSection("damage")}>Schaden (B)</Button>
              </div>
            </div>
            <Button size="sm" onClick={() => { setPForm({ ...emptyPartner, section: pSection }); setPOpen(true); }}>
              <Plus size={16} /> Hinzufügen
            </Button>
          </div>

          {pLoading ? (
            <p className="text-muted-foreground text-sm">Laden…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Versicherungszweig</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Gesellschaft</TableHead>
                  <TableHead className="w-16">Pos.</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm max-w-xs">{p.branch}</TableCell>
                    <TableCell className="text-sm">{p.category}</TableCell>
                    <TableCell className="text-sm">{p.company}</TableCell>
                    <TableCell>{p.sort_order}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setPForm(p); setPOpen(true); }}><Pencil size={14} /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 size={14} /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Löschen?</AlertDialogTitle>
                              <AlertDialogDescription>Partner «{p.company}» wirklich löschen?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction onClick={() => pDelete.mutate(p.id)}>Löschen</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Partner edit dialog */}
          <Dialog open={pOpen} onOpenChange={setPOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{pForm.id ? "Partner bearbeiten" : "Neuer Partner"}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Rubrik</Label>
                  <Select value={pForm.section} onValueChange={(v) => setPForm({ ...pForm, section: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="life">Lebensversicherung (A)</SelectItem>
                      <SelectItem value="damage">Schadenversicherung (B)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sortierung</Label>
                  <Input type="number" value={pForm.sort_order} onChange={(e) => setPForm({ ...pForm, sort_order: Number(e.target.value) })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Versicherungszweig</Label>
                  <Input value={pForm.branch} onChange={(e) => setPForm({ ...pForm, branch: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>FINMA-Kategorie</Label>
                  <Input value={pForm.category} onChange={(e) => setPForm({ ...pForm, category: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Gesellschaft</Label>
                  <Input value={pForm.company} onChange={(e) => setPForm({ ...pForm, company: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Adresse</Label>
                  <Input value={pForm.address} onChange={(e) => setPForm({ ...pForm, address: e.target.value })} />
                </div>
                <div>
                  <Label>Kontakt-Email</Label>
                  <Input value={pForm.contact_email} onChange={(e) => setPForm({ ...pForm, contact_email: e.target.value })} />
                </div>
                <div>
                  <Label>Datenschutz-URL</Label>
                  <Input value={pForm.privacy_url} onChange={(e) => setPForm({ ...pForm, privacy_url: e.target.value })} />
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => pSave.mutate(pForm)} disabled={pSave.isPending}>
                {pSave.isPending ? "Speichere…" : "Speichern"}
              </Button>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminVag45;
