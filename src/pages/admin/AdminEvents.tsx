import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, Calendar, MapPin, Users, Loader2, ImageIcon, ChevronLeft, ChevronRight, Check, FileText, Settings2, Eye as EyeIcon, Send, Copy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import MediaPickerModal from "@/components/MediaPickerModal";
import RichTextEditor from "@/components/RichTextEditor";

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
};

const empty = {
  id: "" as string | null,
  title: "",
  slug: "",
  description: "",
  cover_image_url: "",
  category_id: "",
  location: "",
  location_url: "",
  start_at: "",
  end_at: "",
  registration_enabled: true,
  registration_deadline: "",
  capacity: "" as number | "",
  contact_person_id: "",
  confirmation_text: "Mit Ihrer Anmeldung bestätigen Sie Ihre Teilnahme am Event. Bitte erscheinen Sie pünktlich.",
  confirmation_questions: [] as any[],
  published: false,
};

const AdminEvents = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [step, setStep] = useState(0);
  const [picker, setPicker] = useState(false);
  const [registrationsFor, setRegistrationsFor] = useState<string | null>(null);

  useEffect(() => { if (editing) setStep(0); }, [editing?.id]);

  const { data: events } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data } = await supabase.from("events" as any).select("*, news_categories(name, color), team_members(name, image_url)").order("start_at", { ascending: false }) as any;
      return data || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["news-categories"],
    queryFn: async () => (await supabase.from("news_categories" as any).select("*").order("sort_order") as any).data || [],
  });

  const { data: teamMembers } = useQuery({
    queryKey: ["team-members-min"],
    queryFn: async () => (await supabase.from("team_members").select("id, name, image_url, role_de").eq("active", true).order("name")).data || [],
  });

  const { data: regCounts } = useQuery({
    queryKey: ["event-reg-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("event_registrations" as any).select("event_id") as any;
      const m: Record<string, number> = {};
      (data || []).forEach((r: any) => { m[r.event_id] = (m[r.event_id] || 0) + 1; });
      return m;
    },
  });

  const { data: registrations } = useQuery({
    queryKey: ["event-registrations", registrationsFor],
    enabled: !!registrationsFor,
    queryFn: async () => {
      const { data: regs } = await supabase.from("event_registrations" as any).select("*").eq("event_id", registrationsFor).order("created_at") as any;
      const ids = (regs || []).map((r: any) => r.user_id);
      const { data: profs } = await supabase.from("profiles").select("id, display_name, avatar_url").in("id", ids as any);
      const map = Object.fromEntries((profs || []).map((p: any) => [p.id, p]));
      return (regs || []).map((r: any) => ({ ...r, profile: map[r.user_id] }));
    },
  });

  const save = useMutation({
    mutationFn: async (form: typeof empty) => {
      const payload: any = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description,
        cover_image_url: form.cover_image_url || null,
        category_id: form.category_id || null,
        location: form.location || null,
        location_url: form.location_url || null,
        start_at: new Date(form.start_at).toISOString(),
        end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
        registration_enabled: form.registration_enabled,
        registration_deadline: form.registration_deadline ? new Date(form.registration_deadline).toISOString() : null,
        capacity: form.capacity ? Number(form.capacity) : null,
        contact_person_id: form.contact_person_id || null,
        confirmation_text: form.confirmation_text || null,
        published: form.published,
        author_id: user?.id,
      };
      if (form.id) {
        const { error } = await supabase.from("events" as any).update(payload).eq("id", form.id) as any;
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events" as any).insert(payload) as any;
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Event gespeichert");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("events" as any).delete().eq("id", id); },
    onSuccess: () => { toast.success("Gelöscht"); qc.invalidateQueries({ queryKey: ["admin-events"] }); },
  });

  const duplicate = (e: any) => {
    setEditing({
      id: null,
      title: `${e.title} (Kopie)`,
      slug: slugify(`${e.title}-kopie-${Date.now().toString(36)}`),
      description: e.description || "",
      cover_image_url: e.cover_image_url || "",
      category_id: e.category_id || "",
      location: e.location || "",
      location_url: e.location_url || "",
      start_at: toLocalInput(e.start_at),
      end_at: toLocalInput(e.end_at),
      registration_enabled: e.registration_enabled,
      registration_deadline: toLocalInput(e.registration_deadline),
      capacity: e.capacity || "",
      contact_person_id: e.contact_person_id || "",
      confirmation_text: e.confirmation_text || "Mit Ihrer Anmeldung bestätigen Sie Ihre Teilnahme am Event. Bitte erscheinen Sie pünktlich.",
      published: false,
    });
    toast.info("Event als Vorlage geladen — passe Titel & Datum an");
  };

  const removeReg = useMutation({
    mutationFn: async (id: string) => { await supabase.from("event_registrations" as any).delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["event-registrations"] }); qc.invalidateQueries({ queryKey: ["event-reg-counts"] }); },
  });

  const upcoming = useMemo(() => (events || []).filter((e: any) => new Date(e.start_at) >= new Date()), [events]);
  const past = useMemo(() => (events || []).filter((e: any) => new Date(e.start_at) < new Date()), [events]);

  const regsEvent = events?.find((e: any) => e.id === registrationsFor);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">Termine, Schulungen & Anmeldungen verwalten</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90">
          <Plus size={16} /> Neues Event
        </button>
      </div>

      {[
        { title: "Bevorstehende Events", list: upcoming, empty: "Keine bevorstehenden Events" },
        { title: "Vergangene Events", list: past, empty: "Keine vergangenen Events" },
      ].map((section) => (
        <div key={section.title} className="mb-10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{section.title}</h2>
          <div className="space-y-3">
            {section.list.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center border rounded-xl bg-card">{section.empty}</div>}
            {section.list.map((e: any) => {
              const start = new Date(e.start_at);
              const count = regCounts?.[e.id] || 0;
              return (
                <div key={e.id} className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:shadow-sm transition-shadow">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 shrink-0 flex flex-col items-center justify-center text-primary">
                    <span className="text-xs font-semibold uppercase">{start.toLocaleDateString("de-CH", { month: "short" })}</span>
                    <span className="text-xl font-bold leading-none">{start.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {e.news_categories && <span className="text-xs font-semibold uppercase" style={{ color: e.news_categories.color }}>{e.news_categories.name}</span>}
                      {!e.published && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Entwurf</span>}
                      {e.published && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Veröffentlicht</span>}
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{e.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="inline-flex items-center gap-1"><Calendar size={11} /> {start.toLocaleString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {e.location && <span className="inline-flex items-center gap-1"><MapPin size={11} /> {e.location}</span>}
                      {e.registration_enabled && <span className="inline-flex items-center gap-1"><Users size={11} /> {count}{e.capacity ? ` / ${e.capacity}` : ""}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {e.registration_enabled && (
                      <button onClick={() => setRegistrationsFor(e.id)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Anmeldungen ansehen">
                        <Users size={16} />
                      </button>
                    )}
                    <button onClick={() => duplicate(e)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Als Vorlage duplizieren"><Copy size={16} /></button>
                    <button onClick={() => setEditing({
                      id: e.id, title: e.title, slug: e.slug, description: e.description || "",
                      cover_image_url: e.cover_image_url || "", category_id: e.category_id || "",
                      location: e.location || "", location_url: e.location_url || "",
                      start_at: toLocalInput(e.start_at), end_at: toLocalInput(e.end_at),
                      registration_enabled: e.registration_enabled, registration_deadline: toLocalInput(e.registration_deadline),
                      capacity: e.capacity || "", contact_person_id: e.contact_person_id || "", published: e.published,
                      confirmation_text: e.confirmation_text || "Mit Ihrer Anmeldung bestätigen Sie Ihre Teilnahme am Event. Bitte erscheinen Sie pünktlich.",
                    })} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil size={16} /></button>
                    <button onClick={() => { if (confirm("Event wirklich löschen?")) del.mutate(e.id); }} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Registrations Modal */}
      {registrationsFor && regsEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setRegistrationsFor(null); }}>
          <div className="bg-card border rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Anmeldungen</h2>
                <p className="text-xs text-muted-foreground">{regsEvent.title} — {registrations?.length || 0}{regsEvent.capacity ? ` / ${regsEvent.capacity}` : ""} Teilnehmer</p>
              </div>
              <button onClick={() => setRegistrationsFor(null)} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {registrations?.length === 0 && <p className="text-center text-muted-foreground py-8">Noch keine Anmeldungen</p>}
              {registrations?.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border bg-background">
                  <div className="h-10 w-10 rounded-full bg-primary/10 overflow-hidden shrink-0">
                    {r.profile?.avatar_url ? <img src={r.profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-primary">{(r.profile?.display_name || "?").slice(0, 2).toUpperCase()}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.profile?.display_name || r.user_id}</p>
                    <p className="text-xs text-muted-foreground">Angemeldet: {new Date(r.created_at).toLocaleString("de-CH")}</p>
                    {r.note && <p className="text-xs text-muted-foreground italic mt-0.5">„{r.note}“</p>}
                  </div>
                  <button onClick={() => removeReg.mutate(r.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Anmeldung entfernen"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div className="bg-card border rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{editing.id ? "Event bearbeiten" : "Neues Event erstellen"}</h2>
                  <p className="text-xs text-muted-foreground">Schritt {step + 1} von 3 — {["Inhalt & Termin", "Anmeldung", "Veröffentlichung"][step]}</p>
                </div>
                <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { i: 0, label: "Inhalt", icon: FileText },
                  { i: 1, label: "Anmeldung", icon: Users },
                  { i: 2, label: "Optionen", icon: Settings2 },
                ].map((s, idx, arr) => {
                  const Icon = s.icon;
                  const done = step > s.i;
                  const active = step === s.i;
                  return (
                    <div key={s.i} className="flex items-center flex-1">
                      <button type="button" onClick={() => setStep(s.i)} className="flex items-center gap-2 group">
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {done ? <Check size={14} /> : <Icon size={14} />}
                        </span>
                        <span className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"} hidden sm:inline`}>{s.label}</span>
                      </button>
                      {idx < arr.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${done ? "bg-primary/40" : "bg-muted"}`} />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Titel *</label>
                    <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} placeholder="z.B. Q1 Schulung 2026" className="mt-1 w-full px-3 py-2.5 rounded-lg border bg-background text-base font-medium" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">URL-Slug</label>
                      <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border bg-background font-mono text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Kategorie</label>
                      <select value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm">
                        <option value="">— Keine —</option>
                        {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Start *</label>
                      <input type="datetime-local" value={editing.start_at} onChange={(e) => setEditing({ ...editing, start_at: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Ende (optional)</label>
                      <input type="datetime-local" value={editing.end_at} onChange={(e) => setEditing({ ...editing, end_at: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1"><MapPin size={12} /> Ort</label>
                      <input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="z.B. SSM Hauptsitz Rothenburg" className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Karten-Link (optional)</label>
                      <input value={editing.location_url} onChange={(e) => setEditing({ ...editing, location_url: e.target.value })} placeholder="https://maps.google.com/…" className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground inline-flex items-center gap-2 mb-2"><ImageIcon size={16} /> Cover-Bild</label>
                    {editing.cover_image_url ? (
                      <div className="relative rounded-2xl overflow-hidden border aspect-[16/9] bg-muted">
                        <img src={editing.cover_image_url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button type="button" onClick={() => setPicker(true)} className="px-3 py-1.5 rounded-lg bg-background/90 backdrop-blur text-xs font-medium border hover:bg-background">Ersetzen</button>
                          <button type="button" onClick={() => setEditing({ ...editing, cover_image_url: "" })} className="p-1.5 rounded-lg bg-background/90 backdrop-blur text-destructive border hover:bg-background"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setPicker(true)} className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                        <ImageIcon size={32} />
                        <span className="text-sm font-medium">Cover auswählen</span>
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Beschreibung</label>
                    <RichTextEditor value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} placeholder="Was erwartet die Teilnehmer? Programm, Ablauf, weitere Infos…" />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={editing.registration_enabled} onChange={(e) => setEditing({ ...editing, registration_enabled: e.target.checked })} className="mt-1 h-4 w-4 rounded" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Anmeldung aktivieren</p>
                        <p className="text-xs text-muted-foreground">Mitarbeitende können sich für dieses Event an- und abmelden.</p>
                      </div>
                    </label>
                  </div>
                  {editing.registration_enabled && (
                    <>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Anmeldeschluss (optional)</label>
                          <input type="datetime-local" value={editing.registration_deadline} onChange={(e) => setEditing({ ...editing, registration_deadline: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Max. Teilnehmer (optional)</label>
                          <input type="number" min={1} value={editing.capacity} onChange={(e) => setEditing({ ...editing, capacity: e.target.value ? Number(e.target.value) : "" })} placeholder="unbegrenzt" className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Ansprechperson (optional)</label>
                    <select value={editing.contact_person_id} onChange={(e) => setEditing({ ...editing, contact_person_id: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm">
                      <option value="">— Keine —</option>
                      {teamMembers?.map((m: any) => <option key={m.id} value={m.id}>{m.name}{m.role_de ? ` — ${m.role_de}` : ""}</option>)}
                    </select>
                  </div>
                  {editing.registration_enabled && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Bestätigungstext im Teilnahme-Popup</label>
                      <textarea value={editing.confirmation_text} onChange={(e) => setEditing({ ...editing, confirmation_text: e.target.value })} rows={4} placeholder="Wird im Bestätigungs-Popup vor der Anmeldung angezeigt." className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                      <p className="text-[11px] text-muted-foreground mt-1">Dieser Text erscheint im Pop-up, bevor Mitarbeitende ihre Teilnahme bestätigen.</p>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="mt-1 h-4 w-4 rounded" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Veröffentlichen</p>
                        <p className="text-xs text-muted-foreground">Event ist sofort im Portal sichtbar.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t px-6 py-4 flex items-center justify-between gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border text-muted-foreground hover:text-foreground hover:bg-muted">Abbrechen</button>
              <div className="flex gap-2">
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border hover:bg-muted">
                    <ChevronLeft size={14} /> Zurück
                  </button>
                )}
                {step < 2 ? (
                  <button onClick={() => setStep(step + 1)} disabled={step === 0 && (!editing.title || !editing.start_at)} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    Weiter <ChevronRight size={14} />
                  </button>
                ) : (
                  <button onClick={() => save.mutate(editing)} disabled={!editing.title || !editing.start_at || save.isPending} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {save.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {editing.published ? "Veröffentlichen" : "Speichern"}
                  </button>
                )}
              </div>
            </div>
          </div>
          <MediaPickerModal open={picker} onClose={() => setPicker(false)} accept="image" title="Cover-Bild wählen" onSelect={(url) => { setEditing({ ...editing, cover_image_url: url }); setPicker(false); }} />
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
