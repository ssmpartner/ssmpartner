import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Eye, Trash2, Loader2, CheckCircle2, Archive } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PdfFlipbook } from "@/components/starterbrief/PdfFlipbook";
import { signedStarterbriefUrl } from "@/lib/starterbrief";

const AdminStarterbrief = () => {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);
  const [toDelete, setToDelete] = useState<any>(null);

  const { data: editions = [], isLoading } = useQuery({
    queryKey: ["admin-starterbrief"],
    queryFn: async () => {
      const { data, error } = await supabase.from("starterbrief_editions").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-starterbrief"] }); qc.invalidateQueries({ queryKey: ["starterbrief-editions"] }); };

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<string | null>(null);

  const xhrUpload = (path: string, f: File, token: string) => new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/starterbrief/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
    xhr.setRequestHeader("Content-Type", "application/pdf");
    xhr.upload.onprogress = e => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error(`Upload fehlgeschlagen (${xhr.status}): ${xhr.responseText}`));
    xhr.onerror = () => reject(new Error("Netzwerkfehler beim Upload"));
    xhr.send(f);
  });

  const upload = async (f: File | null = file) => {
    if (!f) return toast.error("Bitte zuerst ein PDF wählen");
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return toast.error("Bitte eine PDF-Datei wählen");
    const t = title.trim() || f.name.replace(/\.pdf$/i, "");
    setUploading(true); setProgress(0); setDone(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Nicht angemeldet");
      const path = `${Date.now()}-${f.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await xhrUpload(path, f, token);
      const { error } = await supabase.from("starterbrief_editions").insert({ title: t, description: description || null, pdf_url: path, created_by: sess.session?.user.id });
      if (error) throw error;
      toast.success(`«${t}» hochgeladen – jetzt unten publizieren`);
      setDone(t); setTitle(""); setDescription(""); setFile(null); refresh();
    } catch (e: any) { toast.error(e.message); } finally { setUploading(false); }
  };

  const pick = (f: File | null) => { setFile(f); setDone(null); if (f) upload(f); };

  const setPublished = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from("starterbrief_editions").update({ is_published: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => { toast.success(v.value ? "Publiziert" : "Ins Archiv verschoben"); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const setPublic = async (id: string, value: boolean) => {
    const { error } = await supabase.from("starterbrief_editions").update({ is_public: value } as any).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(value ? "Öffentlich sichtbar (ohne Anmeldung)" : "Nur für angemeldete Benutzer"); refresh(); }
  };

  const remove = async () => {
    const { error } = await supabase.from("starterbrief_editions").delete().eq("id", toDelete.id);
    if (error) toast.error(error.message); else { toast.success("In den Papierkorb verschoben"); refresh(); }
    setToDelete(null);
  };

  const openPreview = async (e: any) => {
    try { setPreview({ url: await signedStarterbriefUrl(e.pdf_url), title: e.title }); } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Starterbrief</h1>
        <p className="text-muted-foreground text-sm">PDF hochladen und im Portal als «SSM Academy Starterbrief» publizieren. Es ist immer nur eine Ausgabe publiziert, alle anderen bleiben im Archiv.</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
        <h2 className="font-semibold">Neue Ausgabe</h2>
        <Input placeholder="Titel (optional, sonst Dateiname), z.B. Starterbrief 2026" value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea placeholder="Kurzbeschreibung (optional)" value={description} onChange={e => setDescription(e.target.value)} />
        <label
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); pick(e.dataTransfer.files?.[0] || null); }}
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl p-8 cursor-pointer hover:bg-muted/50">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{uploading ? `Wird hochgeladen: ${file?.name}` : "PDF hierher ziehen oder klicken – der Upload startet sofort"}</span>
          <input type="file" accept="application/pdf" className="hidden" onChange={e => { pick(e.target.files?.[0] || null); e.target.value = ""; }} disabled={uploading} />
        </label>
        {uploading && (
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />{progress < 100 ? `${progress}% hochgeladen` : "Wird gespeichert …"}</p>
          </div>
        )}
        {done && !uploading && (
          <p className="text-sm text-primary flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />«{done}» wurde hochgeladen. Klicken Sie unten auf «Publizieren», damit es im Portal erscheint.</p>
        )}
      </div>

      <div className="rounded-2xl border bg-card shadow-sm divide-y">
        <h2 className="font-semibold p-4">Ausgaben & Archiv</h2>
        {isLoading ? <p className="p-4 text-muted-foreground">Lädt …</p> : editions.length === 0 ? <p className="p-4 text-muted-foreground">Noch keine Ausgaben.</p> :
          editions.map(e => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold flex items-center gap-2">{e.title}
                  {e.is_published ? <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">Publiziert</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Archiv</span>}
                </p>
                <label className="flex items-center gap-2 text-xs text-muted-foreground mt-1 cursor-pointer">
                  <input type="checkbox" className="accent-primary" checked={(e as any).is_public !== false} onChange={ev => setPublic(e.id, ev.target.checked)} />
                  Öffentlich (ohne Anmeldung sichtbar){(e as any).is_public === false ? " – aktuell nur für angemeldete Benutzer" : ""}
                </label>
                <p className="text-xs text-muted-foreground">Erstellt {new Date(e.created_at).toLocaleDateString("de-CH")}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openPreview(e)}><Eye className="h-4 w-4 mr-1" />Vorschau</Button>
                {e.is_published
                  ? <Button size="sm" variant="outline" onClick={() => setPublished.mutate({ id: e.id, value: false })}><Archive className="h-4 w-4 mr-1" />Archivieren</Button>
                  : <Button size="sm" onClick={() => setPublished.mutate({ id: e.id, value: true })}><CheckCircle2 className="h-4 w-4 mr-1" />Publizieren</Button>}
                <Button size="sm" variant="ghost" onClick={() => setToDelete(e)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
      </div>

      <Dialog open={!!preview} onOpenChange={o => !o && setPreview(null)}>
        <DialogContent className="max-w-6xl">
          <DialogHeader><DialogTitle>{preview?.title}</DialogTitle></DialogHeader>
          {preview && <PdfFlipbook url={preview.url} title={preview.title} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ausgabe löschen?</AlertDialogTitle>
            <AlertDialogDescription>«{toDelete?.title}» wird in den Papierkorb verschoben.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Abbrechen</AlertDialogCancel><AlertDialogAction onClick={remove}>Löschen</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default AdminStarterbrief;
