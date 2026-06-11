import { useEffect, useMemo, useState, forwardRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, AlertTriangle, Pin, Megaphone, BarChart3, Eye, Heart, MessageSquare, CheckCircle2, Loader2, Tag, Image as ImageIcon, Video, ChevronLeft, ChevronRight, Check, FileText, Settings2, Eye as EyeIcon, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import MediaPickerModal from "@/components/MediaPickerModal";
import RichTextEditor from "@/components/RichTextEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const APP_ROLES = ["superadmin","admin","backoffice","analyst","teamleiter","controlling","geschaeftsleitung","hr","agency_manager","vertriebsleiter","agenturleiter","finanzcoach","trainee","verkaufsleiter"] as const;

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Tab = "posts" | "categories" | "stats";

const empty = {
  id: "" as string | null,
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  cover_video_url: "",
  media_urls: [] as string[],
  category_id: "",
  tags: "",
  contact_person_id: "",
  visibility: "all" as "all" | "roles" | "agencies" | "mixed",
  is_important: false,
  is_urgent_banner: false,
  is_highlight: false,
  comments_enabled: true,
  published: false,
  selected_roles: [] as string[],
  selected_agencies: [] as string[],
};

const AdminNews = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [statsPostId, setStatsPostId] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ id: "", name: "", color: "#243e3a" });
  const [step, setStep] = useState(0);
  const [picker, setPicker] = useState<null | "cover_image" | "cover_video" | "media">(null);

  useEffect(() => { if (editing) setStep(0); }, [editing?.id]);

  const { data: posts } = useQuery({
    queryKey: ["admin-news-posts"],
    queryFn: async () => {
      const { data } = await supabase.from("news_posts" as any).select("*, news_categories(name, color)").order("created_at", { ascending: false }) as any;
      return data || [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["news-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("news_categories" as any).select("*").order("sort_order") as any;
      return data || [];
    },
  });

  const { data: agencies } = useQuery({
    queryKey: ["all-agencies-min"],
    queryFn: async () => {
      const { data } = await supabase.from("agencies").select("id, name").order("name");
      return data || [];
    },
  });

  const { data: teamMembers } = useQuery({
    queryKey: ["team-members-min"],
    queryFn: async () => (await supabase.from("team_members").select("id, name, image_url, role_de").eq("active", true).order("name")).data || [],
  });

  const { data: editingVisibility } = useQuery({
    queryKey: ["news-edit-visibility", editing?.id],
    enabled: !!editing?.id,
    queryFn: async () => {
      const [{ data: roles }, { data: ags }] = await Promise.all([
        supabase.from("news_visibility_roles" as any).select("role").eq("post_id", editing!.id) as any,
        supabase.from("news_visibility_agencies" as any).select("agency_id").eq("post_id", editing!.id) as any,
      ]);
      return {
        roles: (roles || []).map((r: any) => r.role),
        agencies: (ags || []).map((a: any) => a.agency_id),
      };
    },
  });

  useEffect(() => {
    if (editingVisibility && editing) {
      setEditing((prev) => prev ? { ...prev, selected_roles: editingVisibility.roles, selected_agencies: editingVisibility.agencies } : prev);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingVisibility]);

  const savePost = useMutation({
    mutationFn: async (form: typeof empty) => {
      const payload: any = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt || null,
        content: form.content,
        cover_image_url: form.cover_image_url || null,
        cover_video_url: form.cover_video_url || null,
        media_urls: form.media_urls || [],
        category_id: form.category_id || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        contact_person_id: form.contact_person_id || null,
        visibility: form.visibility,
        is_important: form.is_important,
        is_urgent_banner: form.is_urgent_banner,
        is_highlight: form.is_highlight,
        comments_enabled: form.comments_enabled,
        published: form.published,
        published_at: form.published ? new Date().toISOString() : null,
        author_id: user?.id,
      };

      let postId = form.id;
      if (postId) {
        const { error } = await supabase.from("news_posts" as any).update(payload).eq("id", postId) as any;
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("news_posts" as any).insert(payload).select("id").single() as any;
        if (error) throw error;
        postId = data.id;
      }

      // Replace visibility records
      await supabase.from("news_visibility_roles" as any).delete().eq("post_id", postId);
      await supabase.from("news_visibility_agencies" as any).delete().eq("post_id", postId);
      if (form.visibility === "roles" || form.visibility === "mixed") {
        if (form.selected_roles.length) {
          await supabase.from("news_visibility_roles" as any).insert(form.selected_roles.map((r) => ({ post_id: postId, role: r })));
        }
      }
      if (form.visibility === "agencies" || form.visibility === "mixed") {
        if (form.selected_agencies.length) {
          await supabase.from("news_visibility_agencies" as any).insert(form.selected_agencies.map((a) => ({ post_id: postId, agency_id: a })));
        }
      }
    },
    onSuccess: () => {
      toast.success("Gespeichert");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin-news-posts"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news_posts" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Gelöscht");
      queryClient.invalidateQueries({ queryKey: ["admin-news-posts"] });
    },
  });

  const saveCat = useMutation({
    mutationFn: async () => {
      if (newCat.id) {
        await supabase.from("news_categories" as any).update({ name: newCat.name, color: newCat.color, slug: slugify(newCat.name) }).eq("id", newCat.id);
      } else {
        await supabase.from("news_categories" as any).insert({ name: newCat.name, color: newCat.color, slug: slugify(newCat.name) });
      }
    },
    onSuccess: () => {
      setNewCat({ id: "", name: "", color: "#243e3a" });
      queryClient.invalidateQueries({ queryKey: ["news-categories"] });
      toast.success("Kategorie gespeichert");
    },
  });

  const deleteCat = useMutation({
    mutationFn: async (id: string) => { await supabase.from("news_categories" as any).delete().eq("id", id); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["news-categories"] }),
  });

  // Stats query for selected post
  const { data: stats } = useQuery({
    queryKey: ["admin-news-stats", statsPostId],
    enabled: !!statsPostId,
    queryFn: async () => {
      const [{ data: views }, { data: acks }, { data: likes }, { data: comments }] = await Promise.all([
        supabase.from("news_views" as any).select("user_id, viewed_at").eq("post_id", statsPostId) as any,
        supabase.from("news_acknowledgements" as any).select("user_id, acknowledged_at").eq("post_id", statsPostId) as any,
        supabase.from("news_likes" as any).select("user_id").eq("post_id", statsPostId) as any,
        supabase.from("news_comments" as any).select("id").eq("post_id", statsPostId) as any,
      ]);
      const userIds = [...new Set([...(views||[]).map((v:any)=>v.user_id), ...(acks||[]).map((a:any)=>a.user_id)])];
      const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", userIds as any);
      const pmap = Object.fromEntries((profs||[]).map((p:any)=>[p.id,p.display_name]));
      return {
        views: (views||[]).map((v:any)=>({ ...v, name: pmap[v.user_id] || v.user_id })),
        acks: (acks||[]).map((a:any)=>({ ...a, name: pmap[a.user_id] || a.user_id })),
        likes: likes?.length || 0,
        comments: comments?.length || 0,
      };
    },
  });

  const statsPost = useMemo(() => posts?.find((p: any) => p.id === statsPostId), [posts, statsPostId]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">News & Kommunikation</h1>
          <p className="text-sm text-muted-foreground mt-1">Interne Mitteilungen, Pflichtbestätigungen und Statistik</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90"
        >
          <Plus size={16} /> Neue News
        </button>
      </div>

      <div className="flex gap-2 border-b mb-6">
        {([["posts","Beiträge"],["categories","Kategorien"],["stats","Statistik"]] as [Tab, string][]).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab===k?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <div className="space-y-3">
          {posts?.length === 0 && <div className="text-center py-12 text-muted-foreground">Noch keine News vorhanden</div>}
          {posts?.map((p: any) => (
            <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:shadow-sm transition-shadow">
              <div className="w-16 h-16 rounded-xl bg-muted shrink-0 overflow-hidden">
                {p.cover_image_url ? <img src={p.cover_image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {p.news_categories && <span className="text-xs font-semibold uppercase" style={{ color: p.news_categories.color }}>{p.news_categories.name}</span>}
                  {!p.published && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Entwurf</span>}
                  {p.published && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Veröffentlicht</span>}
                  {p.is_highlight && <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700"><Pin size={10}/>Highlight</span>}
                  {p.is_important && <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive"><AlertTriangle size={10}/>Wichtig</span>}
                  {p.is_urgent_banner && <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-700"><Megaphone size={10}/>Banner</span>}
                </div>
                <h3 className="font-semibold text-foreground truncate">{p.title}</h3>
                <p className="text-xs text-muted-foreground">Sichtbarkeit: {p.visibility}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setStatsPostId(p.id); setTab("stats"); }} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Statistik">
                  <BarChart3 size={16}/>
                </button>
                <button
                  onClick={() => setEditing({
                    id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt || "", content: p.content || "",
                    cover_image_url: p.cover_image_url || "", cover_video_url: p.cover_video_url || "",
                    media_urls: p.media_urls || [], category_id: p.category_id || "",
                    tags: (p.tags || []).join(", "), visibility: p.visibility, is_important: p.is_important,
                    is_urgent_banner: p.is_urgent_banner, is_highlight: p.is_highlight,
                    comments_enabled: p.comments_enabled, published: p.published,
                    contact_person_id: p.contact_person_id || "",
                    selected_roles: [], selected_agencies: [],
                  })}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                ><Pencil size={16}/></button>
                <button onClick={() => { if(confirm("News wirklich löschen?")) deletePost.mutate(p.id); }} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "categories" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {categories?.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card">
                <span className="h-5 w-5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="flex-1 font-medium text-foreground">{c.name}</span>
                <button onClick={() => setNewCat({ id: c.id, name: c.name, color: c.color })} className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Pencil size={14}/></button>
                <button onClick={() => deleteCat.mutate(c.id)} className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl border bg-card">
            <h3 className="font-semibold text-foreground mb-4">{newCat.id ? "Kategorie bearbeiten" : "Neue Kategorie"}</h3>
            <div className="space-y-3">
              <input value={newCat.name} onChange={(e) => setNewCat({...newCat, name: e.target.value})} placeholder="Name" className="w-full px-3 py-2 rounded-lg border bg-background" />
              <div className="flex items-center gap-3">
                <input type="color" value={newCat.color} onChange={(e) => setNewCat({...newCat, color: e.target.value})} className="h-10 w-16 rounded border" />
                <input value={newCat.color} onChange={(e) => setNewCat({...newCat, color: e.target.value})} className="flex-1 px-3 py-2 rounded-lg border bg-background font-mono text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveCat.mutate()} disabled={!newCat.name} className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50">Speichern</button>
                {newCat.id && <button onClick={() => setNewCat({ id: "", name: "", color: "#243e3a" })} className="px-4 py-2 rounded-lg border">Abbrechen</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "stats" && (
        <div>
          <select
            value={statsPostId || ""}
            onChange={(e) => setStatsPostId(e.target.value || null)}
            className="mb-6 w-full md:w-96 px-4 py-2 rounded-lg border bg-background"
          >
            <option value="">— News auswählen —</option>
            {posts?.map((p: any) => (<option key={p.id} value={p.id}>{p.title}</option>))}
          </select>

          {statsPost && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Eye} label="Aufrufe" value={stats.views.length} />
                <StatCard icon={CheckCircle2} label="Bestätigungen" value={stats.acks.length} highlight={statsPost.is_important} />
                <StatCard icon={Heart} label="Likes" value={stats.likes} />
                <StatCard icon={MessageSquare} label="Kommentare" value={stats.comments} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border bg-card">
                  <h3 className="font-semibold text-foreground mb-3 inline-flex items-center gap-2"><Eye size={16}/> Wer hat gesehen ({stats.views.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {stats.views.length === 0 && <p className="text-sm text-muted-foreground">Noch keine Views</p>}
                    {stats.views.map((v: any) => (
                      <div key={v.user_id} className="flex justify-between text-sm py-1.5 border-b last:border-0">
                        <span className="text-foreground">{v.name}</span>
                        <span className="text-muted-foreground">{new Date(v.viewed_at).toLocaleString("de-CH")}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {statsPost.is_important && (
                  <div className="p-5 rounded-2xl border bg-card">
                    <h3 className="font-semibold text-foreground mb-3 inline-flex items-center gap-2"><CheckCircle2 size={16}/> Lesebestätigungen ({stats.acks.length})</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {stats.acks.length === 0 && <p className="text-sm text-muted-foreground">Noch keine Bestätigungen</p>}
                      {stats.acks.map((a: any) => (
                        <div key={a.user_id} className="flex justify-between text-sm py-1.5 border-b last:border-0">
                          <span className="text-foreground">{a.name}</span>
                          <span className="text-muted-foreground">{new Date(a.acknowledged_at).toLocaleString("de-CH")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">
            {/* Header with Stepper */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{editing.id ? "News bearbeiten" : "Neue News erstellen"}</h2>
                  <p className="text-xs text-muted-foreground">Schritt {step + 1} von 4 — {["Inhalt","Medien","Sichtbarkeit","Veröffentlichung"][step]}</p>
                </div>
                <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-muted rounded-lg"><X size={18}/></button>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { i: 0, label: "Inhalt", icon: FileText },
                  { i: 1, label: "Medien", icon: ImageIcon },
                  { i: 2, label: "Sichtbarkeit", icon: EyeIcon },
                  { i: 3, label: "Optionen", icon: Settings2 },
                ].map((s, idx, arr) => {
                  const Icon = s.icon;
                  const done = step > s.i;
                  const active = step === s.i;
                  return (
                    <div key={s.i} className="flex items-center flex-1">
                      <button type="button" onClick={() => setStep(s.i)} className="flex items-center gap-2 group">
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {done ? <Check size={14}/> : <Icon size={14}/>}
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
              {/* Step 1: Content */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Titel *</label>
                    <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} placeholder="Aussagekräftiger Titel der News" className="mt-1 w-full px-3 py-2.5 rounded-lg border bg-background text-base font-medium" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">URL-Slug</label>
                      <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="slug-url" className="mt-1 w-full px-3 py-2 rounded-lg border bg-background font-mono text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Kategorie</label>
                      <select value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm">
                        <option value="">— Keine —</option>
                        {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Kurzbeschreibung (Auszug)</label>
                    <textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} placeholder="Kurze Zusammenfassung für die Übersicht…" rows={2} className="mt-1 w-full px-3 py-2 rounded-lg border bg-background" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Inhalt *</label>
                    <div className="mt-1">
                      <RichTextEditor value={editing.content} onChange={(v) => setEditing({ ...editing, content: v })} placeholder="Schreibe hier den vollständigen News-Inhalt…" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1"><Tag size={12}/> Tags (Komma-getrennt)</label>
                    <input value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} placeholder="produkt, schulung, q1-2026" className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Ansprechperson (aus Team)</label>
                    <select value={editing.contact_person_id} onChange={(e) => setEditing({ ...editing, contact_person_id: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm">
                      <option value="">— Keine —</option>
                      {teamMembers?.map((m: any) => <option key={m.id} value={m.id}>{m.name}{m.role_de ? ` — ${m.role_de}` : ""}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Media */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Cover Image */}
                  <div>
                    <label className="text-sm font-semibold text-foreground inline-flex items-center gap-2 mb-2"><ImageIcon size={16}/> Cover-Bild</label>
                    {editing.cover_image_url ? (
                      <div className="relative rounded-2xl overflow-hidden border aspect-[16/9] bg-muted">
                        <img src={editing.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button type="button" onClick={() => setPicker("cover_image")} className="px-3 py-1.5 rounded-lg bg-background/90 backdrop-blur text-xs font-medium border hover:bg-background">Ersetzen</button>
                          <button type="button" onClick={() => setEditing({ ...editing, cover_image_url: "" })} className="p-1.5 rounded-lg bg-background/90 backdrop-blur text-destructive border hover:bg-background"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setPicker("cover_image")} className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                        <ImageIcon size={32}/>
                        <span className="text-sm font-medium">Cover-Bild auswählen oder hochladen</span>
                      </button>
                    )}
                  </div>

                  {/* Cover Video */}
                  <div>
                    <label className="text-sm font-semibold text-foreground inline-flex items-center gap-2 mb-2"><Video size={16}/> Cover-Video (optional)</label>
                    <p className="text-xs text-muted-foreground mb-2">Wird statt des Bildes als Kopf des Beitrags angezeigt.</p>
                    {editing.cover_video_url ? (
                      <div className="relative rounded-2xl overflow-hidden border aspect-video bg-black">
                        <video src={editing.cover_video_url} controls className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button type="button" onClick={() => setPicker("cover_video")} className="px-3 py-1.5 rounded-lg bg-background/90 backdrop-blur text-xs font-medium border hover:bg-background">Ersetzen</button>
                          <button type="button" onClick={() => setEditing({ ...editing, cover_video_url: "" })} className="p-1.5 rounded-lg bg-background/90 backdrop-blur text-destructive border hover:bg-background"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setPicker("cover_video")} className="w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                        <Video size={32}/>
                        <span className="text-sm font-medium">Cover-Video auswählen oder hochladen</span>
                      </button>
                    )}
                  </div>

                  {/* Additional media gallery */}
                  <div>
                    <label className="text-sm font-semibold text-foreground inline-flex items-center gap-2 mb-2"><Plus size={16}/> Zusätzliche Medien (Galerie)</label>
                    <p className="text-xs text-muted-foreground mb-2">Bilder oder Videos, die unter dem Beitrag angezeigt werden.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {editing.media_urls.map((url, idx) => {
                        const isVideo = /\.(mp4|webm|mov)$/i.test(url);
                        return (
                          <div key={url + idx} className="relative aspect-square rounded-xl overflow-hidden border bg-muted group">
                            {isVideo ? (
                              <video src={url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            )}
                            <button type="button" onClick={() => setEditing({ ...editing, media_urls: editing.media_urls.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/90 backdrop-blur text-destructive opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                          </div>
                        );
                      })}
                      <button type="button" onClick={() => setPicker("media")} className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                        <Plus size={20}/>
                        <span className="text-xs">Hinzufügen</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Visibility */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Wer darf diese News sehen?</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {(["all","roles","agencies","mixed"] as const).map((v) => (
                        <button key={v} type="button" onClick={() => setEditing({ ...editing, visibility: v })} className={`px-3 py-3 rounded-xl border text-sm font-medium transition-colors ${editing.visibility===v?"bg-primary text-primary-foreground border-primary":"bg-background hover:bg-muted"}`}>
                          {v === "all" ? "Alle" : v === "roles" ? "Pro Rolle" : v === "agencies" ? "Pro Agentur" : "Kombiniert"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(editing.visibility === "roles" || editing.visibility === "mixed") && (
                    <div className="p-4 rounded-xl border bg-muted/30">
                      <p className="text-xs font-semibold text-foreground mb-2">Rollen auswählen:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {APP_ROLES.map((r) => {
                          const on = editing.selected_roles.includes(r);
                          return (
                            <button key={r} type="button" onClick={() => setEditing({ ...editing, selected_roles: on ? editing.selected_roles.filter((x) => x !== r) : [...editing.selected_roles, r] })} className={`text-xs px-2.5 py-1.5 rounded-full transition-colors ${on?"bg-primary text-primary-foreground":"bg-background border text-muted-foreground hover:text-foreground"}`}>
                              {r}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {(editing.visibility === "agencies" || editing.visibility === "mixed") && (
                    <div className="p-4 rounded-xl border bg-muted/30">
                      <p className="text-xs font-semibold text-foreground mb-2">Agenturen auswählen:</p>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                        {agencies?.map((a: any) => {
                          const on = editing.selected_agencies.includes(a.id);
                          return (
                            <button key={a.id} type="button" onClick={() => setEditing({ ...editing, selected_agencies: on ? editing.selected_agencies.filter((x) => x !== a.id) : [...editing.selected_agencies, a.id] })} className={`text-xs px-2.5 py-1.5 rounded-full transition-colors ${on?"bg-primary text-primary-foreground":"bg-background border text-muted-foreground hover:text-foreground"}`}>
                              {a.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Options */}
              {step === 3 && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border bg-muted/30 space-y-1">
                    <Toggle label="Veröffentlichen" hint="News ist sofort im Portal sichtbar" checked={editing.published} onChange={(v) => setEditing({ ...editing, published: v })} />
                    <Toggle label="Highlight" hint="Als Top-Beitrag prominent angezeigt" checked={editing.is_highlight} onChange={(v) => setEditing({ ...editing, is_highlight: v })} />
                    <Toggle label="Wichtig — Pflicht-Lesebestätigung" hint="Erscheint als Popup beim Portal-Login" checked={editing.is_important} onChange={(v) => setEditing({ ...editing, is_important: v })} />
                    <Toggle label="Dringend-Banner" hint="Wird oben im Portal als Banner eingeblendet" checked={editing.is_urgent_banner} onChange={(v) => setEditing({ ...editing, is_urgent_banner: v })} />
                    <Toggle label="Kommentare erlauben" hint="Mitarbeitende können diskutieren" checked={editing.comments_enabled} onChange={(v) => setEditing({ ...editing, comments_enabled: v })} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex items-center justify-between gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border text-muted-foreground hover:text-foreground hover:bg-muted">Abbrechen</button>
              <div className="flex gap-2">
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border hover:bg-muted">
                    <ChevronLeft size={14}/> Zurück
                  </button>
                )}
                {step < 3 ? (
                  <button onClick={() => setStep(step + 1)} disabled={step === 0 && !editing.title} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    Weiter <ChevronRight size={14}/>
                  </button>
                ) : (
                  <button onClick={() => savePost.mutate(editing)} disabled={!editing.title || savePost.isPending} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {savePost.isPending ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>}
                    {editing.published ? "Veröffentlichen" : "Speichern"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Media Picker */}
          <MediaPickerModal
            open={picker !== null}
            onClose={() => setPicker(null)}
            accept={picker === "cover_video" ? "video" : picker === "media" ? "all" : "image"}
            title={picker === "cover_video" ? "Cover-Video wählen" : picker === "media" ? "Medien hinzufügen" : "Cover-Bild wählen"}
            onSelect={(url) => {
              if (picker === "cover_image") setEditing({ ...editing, cover_image_url: url });
              else if (picker === "cover_video") setEditing({ ...editing, cover_video_url: url });
              else if (picker === "media") setEditing({ ...editing, media_urls: [...editing.media_urls, url] });
              setPicker(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: number; highlight?: boolean }) => (
  <div className={`p-5 rounded-2xl border bg-card ${highlight ? "ring-2 ring-destructive/30" : ""}`}>
    <div className="flex items-center justify-between mb-2">
      <Icon size={18} className="text-muted-foreground" />
      <span className="text-2xl font-semibold text-foreground">{value}</span>
    </div>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

const Toggle = forwardRef<HTMLButtonElement, { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }>(({ label, hint, checked, onChange }, ref) => (
  <div className="flex items-center justify-between py-2.5 gap-4">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    </div>
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
    </button>
  </div>
));
Toggle.displayName = "Toggle";

export default AdminNews;