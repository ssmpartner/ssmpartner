import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Heart, MessageSquare, Eye, Trash2, EyeOff, AlertTriangle, Send } from "lucide-react";
import { toast } from "sonner";

const formatDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "long", year: "numeric" }) : "";
const formatDateTime = (iso: string) => new Date(iso).toLocaleString("de-CH", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const PortalNewsDetail = () => {
  const { slug } = useParams();
  const { user, role, profile, loading } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const isSuperadmin = role === "superadmin";

  const { data: post, isLoading } = useQuery({
    queryKey: ["news-detail", slug],
    enabled: !!user && !!slug,
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts" as any)
        .select("*, news_categories(name, color)")
        .eq("slug", slug)
        .maybeSingle() as any;
      return data;
    },
  });

  // Track view
  useEffect(() => {
    if (!post?.id || !user?.id) return;
    supabase.from("news_views" as any).insert({ post_id: post.id, user_id: user.id }).then(() => {});
  }, [post?.id, user?.id]);

  const { data: stats } = useQuery({
    queryKey: ["news-stats", post?.id],
    enabled: !!post?.id,
    queryFn: async () => {
      const [{ data: likes }, { data: views }, { data: myLike }] = await Promise.all([
        supabase.from("news_likes" as any).select("id, user_id").eq("post_id", post.id) as any,
        supabase.from("news_views" as any).select("id").eq("post_id", post.id) as any,
        supabase.from("news_likes" as any).select("id").eq("post_id", post.id).eq("user_id", user!.id).maybeSingle() as any,
      ]);
      return { likes: likes?.length || 0, views: views?.length || 0, liked: !!myLike };
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["news-comments", post?.id],
    enabled: !!post?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("news_comments" as any)
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: false }) as any;
      const userIds = [...new Set((data || []).map((c: any) => c.user_id))];
      const { data: profs } = await supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds as any);
      const pmap = Object.fromEntries((profs || []).map((p: any) => [p.id, p]));
      return (data || []).map((c: any) => ({ ...c, profile: pmap[c.user_id] }));
    },
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (stats?.liked) {
        await supabase.from("news_likes" as any).delete().eq("post_id", post.id).eq("user_id", user!.id);
      } else {
        await supabase.from("news_likes" as any).insert({ post_id: post.id, user_id: user!.id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["news-stats", post?.id] }),
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!comment.trim()) throw new Error("Leer");
      const { error } = await supabase.from("news_comments" as any).insert({ post_id: post.id, user_id: user!.id, content: comment.trim() }) as any;
      if (error) throw error;
    },
    onSuccess: () => {
      setComment("");
      toast.success("Kommentar gepostet");
      queryClient.invalidateQueries({ queryKey: ["news-comments", post?.id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const moderateComment = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "hide" | "delete" }) => {
      if (action === "delete") {
        await supabase.from("news_comments" as any).delete().eq("id", id);
      } else {
        await supabase.from("news_comments" as any).update({ hidden: true } as any).eq("id", id);
      }
    },
    onSuccess: () => {
      toast.success("Erledigt");
      queryClient.invalidateQueries({ queryKey: ["news-comments", post?.id] });
    },
  });

  if (loading || isLoading) return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!post) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">News nicht gefunden</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/portal/news" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Alle News
          </Link>
          <Link to="/portal" className="text-sm text-muted-foreground hover:text-foreground">Portal</Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          {post.news_categories && (
            <span className="font-semibold uppercase tracking-wide" style={{ color: post.news_categories.color }}>{post.news_categories.name}</span>
          )}
          <span>•</span>
          <span>{formatDate(post.published_at || post.created_at)}</span>
          {post.is_important && (
            <span className="ml-2 inline-flex items-center gap-1 bg-destructive/10 text-destructive text-xs font-semibold px-2 py-0.5 rounded-full">
              <AlertTriangle size={11} /> Pflichtlektüre
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 leading-tight">{post.title}</h1>
        {post.cover_image_url && (
          <div className="aspect-[16/9] bg-muted rounded-2xl overflow-hidden mb-8">
            <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="prose prose-lg max-w-none text-foreground whitespace-pre-wrap leading-relaxed mb-8">
          {post.content}
        </div>

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((t: string) => (
              <span key={t} className="text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground">#{t}</span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 py-4 border-y mb-10">
          <button
            onClick={() => toggleLike.mutate()}
            className={`inline-flex items-center gap-2 transition-colors ${stats?.liked ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}
          >
            <Heart size={18} fill={stats?.liked ? "currentColor" : "none"} />
            <span className="font-medium">{stats?.likes ?? 0}</span>
          </button>
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <MessageSquare size={18} /> {comments?.length ?? 0}
          </span>
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Eye size={18} /> {stats?.views ?? 0}
          </span>
        </div>

        {/* Comments */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-6">Kommentare</h2>

          {post.comments_enabled ? (
            <div className="mb-8 flex gap-3">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
                  {(profile?.display_name || user.email || "?")[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Kommentar schreiben…"
                  rows={3}
                  className="w-full rounded-2xl border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={() => addComment.mutate()}
                  disabled={!comment.trim() || addComment.isPending}
                  className="mt-2 inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send size={14} /> Senden
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic mb-8">Kommentare sind für diesen Beitrag deaktiviert.</p>
          )}

          <div className="space-y-4">
            {comments?.length === 0 && <p className="text-sm text-muted-foreground">Noch keine Kommentare.</p>}
            {comments?.map((c: any) => (
              <div key={c.id} className={`flex gap-3 p-4 rounded-2xl ${c.hidden ? "bg-muted/30 opacity-60" : "bg-muted/40"}`}>
                {c.profile?.avatar_url ? (
                  <img src={c.profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                    {(c.profile?.display_name || "?")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="text-sm">
                      <span className="font-semibold text-foreground">{c.profile?.display_name || "Unbekannt"}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{formatDateTime(c.created_at)}</span>
                      {c.hidden && <span className="ml-2 text-xs text-destructive">[ausgeblendet]</span>}
                    </div>
                    {isSuperadmin && (
                      <div className="flex gap-1">
                        {!c.hidden && (
                          <button onClick={() => moderateComment.mutate({ id: c.id, action: "hide" })} className="p-1 text-muted-foreground hover:text-foreground" title="Ausblenden">
                            <EyeOff size={14} />
                          </button>
                        )}
                        <button onClick={() => moderateComment.mutate({ id: c.id, action: "delete" })} className="p-1 text-muted-foreground hover:text-destructive" title="Löschen">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
};

export default PortalNewsDetail;