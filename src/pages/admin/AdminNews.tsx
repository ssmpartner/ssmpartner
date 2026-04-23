import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X, AlertTriangle, Pin, Megaphone, BarChart3, Eye, Heart, MessageSquare, CheckCircle2, Loader2, Tag, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

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
  category_id: "",
  tags: "",
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
      setEditing({ ...editing, selected_roles: editingVisibility.roles, selected_agencies: editingVisibility.agencies });
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
        category_id: form.category_id || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
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
                    cover_image_url: p.cover_image_url || "", category_id: p.category_id || "",
                    tags: (p.tags || []).join(", "), visibility: p.visibility, is_important: p.is_important,
                    is_urgent_banner: p.is_urgent_banner, is_highlight: p.is_highlight,
                    comments_enabled: p.comments_enabled, published: p.published,
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div className="bg-card border rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-foreground">{editing.id ? "News bearbeiten" : "Neue News"}</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-muted rounded-lg"><X size={18}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} placeholder="Titel" className="w-full px-3 py-2 rounded-lg border bg-background text-lg font-medium" />
              <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="slug-url" className="w-full px-3 py-2 rounded-lg border bg-background font-mono text-sm" />
              <textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} placeholder="Kurzbeschreibung (Auszug)" rows={2} className="w-full px-3 py-2 rounded-lg border bg-background" />
              <textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} placeholder="Inhalt der News…" rows={10} className="w-full px-3 py-2 rounded-lg border bg-background" />
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1"><ImageIcon size={12}/> Cover-Bild URL</label>
                  <input value={editing.cover_image_url} onChange={(e) => setEditing({ ...editing, cover_image_url: e.target.value })} placeholder="https://…" className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm" />
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
                <label className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1"><Tag size={12}/> Tags (Komma-getrennt)</label>
                <input value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} placeholder="produkt, schulung, q1-2026" className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-sm" />
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-semibold text-foreground">Sichtbarkeit</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {(["all","roles","agencies","mixed"] as const).map((v) => (
                    <button key={v} type="button" onClick={() => setEditing({ ...editing, visibility: v })} className={`px-3 py-2 rounded-lg border text-sm ${editing.visibility===v?"bg-primary text-primary-foreground border-primary":"bg-background hover:bg-muted"}`}>
                      {v === "all" ? "Alle" : v === "roles" ? "Pro Rolle" : v === "agencies" ? "Pro Agentur" : "Kombiniert"}
                    </button>
                  ))}
                </div>

                {(editing.visibility === "roles" || editing.visibility === "mixed") && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Rollen auswählen:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {APP_ROLES.map((r) => {
                        const on = editing.selected_roles.includes(r);
                        return (
                          <button key={r} type="button" onClick={() => setEditing({ ...editing, selected_roles: on ? editing.selected_roles.filter((x) => x !== r) : [...editing.selected_roles, r] })} className={`text-xs px-2.5 py-1 rounded-full ${on?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground"}`}>
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {(editing.visibility === "agencies" || editing.visibility === "mixed") && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Agenturen auswählen:</p>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                      {agencies?.map((a: any) => {
                        const on = editing.selected_agencies.includes(a.id);
                        return (
                          <button key={a.id} type="button" onClick={() => setEditing({ ...editing, selected_agencies: on ? editing.selected_agencies.filter((x) => x !== a.id) : [...editing.selected_agencies, a.id] })} className={`text-xs px-2.5 py-1 rounded-full ${on?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground"}`}>
                            {a.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <Toggle label="Veröffentlichen" checked={editing.published} onChange={(v) => setEditing({ ...editing, published: v })} />
                <Toggle label="Highlight (Top-Beitrag)" checked={editing.is_highlight} onChange={(v) => setEditing({ ...editing, is_highlight: v })} />
                <Toggle label="Wichtig (Pflicht-Lesebestätigung als Popup)" checked={editing.is_important} onChange={(v) => setEditing({ ...editing, is_important: v })} />
                <Toggle label="Dringend-Banner im Portal anzeigen" checked={editing.is_urgent_banner} onChange={(v) => setEditing({ ...editing, is_urgent_banner: v })} />
                <Toggle label="Kommentare erlauben" checked={editing.comments_enabled} onChange={(v) => setEditing({ ...editing, comments_enabled: v })} />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border">Abbrechen</button>
              <button onClick={() => savePost.mutate(editing)} disabled={!editing.title || savePost.isPending} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {savePost.isPending && <Loader2 size={14} className="animate-spin"/>} Speichern
              </button>
            </div>
          </div>
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

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-center justify-between py-1 cursor-pointer">
    <span className="text-sm text-foreground">{label}</span>
    <button type="button" onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  </label>
);

export default AdminNews;