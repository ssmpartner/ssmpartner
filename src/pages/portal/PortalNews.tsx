import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Search, ArrowLeft, Filter, Calendar, MapPin, ArrowRight } from "lucide-react";
import { NewsCard, NewsCardData } from "@/components/news/NewsCard";
import { UrgentNewsBanner } from "@/components/news/UrgentNewsBanner";
import { ImportantNewsModal } from "@/components/news/ImportantNewsModal";

const PortalNews = () => {
  const { user, loading } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState<string>("");

  const { data: categories } = useQuery({
    queryKey: ["news-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("news_categories" as any).select("*").order("sort_order") as any;
      return data || [];
    },
  });

  const { data: news } = useQuery({
    queryKey: ["portal-news-all"],
    enabled: !!user,
    queryFn: async () => {
      const { data: posts } = await supabase
        .from("news_posts" as any)
        .select("id, title, slug, excerpt, cover_image_url, tags, published_at, created_at, is_important, is_highlight, category_id, news_categories(name, color)")
        .eq("published", true)
        .order("published_at", { ascending: false }) as any;

      const ids = (posts || []).map((p: any) => p.id);
      if (!ids.length) return [];

      const [{ data: likes }, { data: comments }, { data: views }] = await Promise.all([
        supabase.from("news_likes" as any).select("post_id").in("post_id", ids) as any,
        supabase.from("news_comments" as any).select("post_id").in("post_id", ids).eq("hidden", false) as any,
        supabase.from("news_views" as any).select("post_id").in("post_id", ids) as any,
      ]);

      const tally = (rows: any[]) => {
        const m: Record<string, number> = {};
        (rows || []).forEach((r: any) => { m[r.post_id] = (m[r.post_id] || 0) + 1; });
        return m;
      };
      const lc = tally(likes), cc = tally(comments), vc = tally(views);

      return (posts || []).map((p: any): NewsCardData => ({
        ...p,
        category: p.news_categories,
        _count: { likes: lc[p.id] || 0, comments: cc[p.id] || 0, views: vc[p.id] || 0 },
      }));
    },
  });

  const allTags = useMemo(() => {
    const s = new Set<string>();
    news?.forEach((n) => n.tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [news]);

  const months = useMemo(() => {
    const set = new Set<string>();
    (news || []).forEach((n: any) => {
      const iso = n.published_at || n.created_at;
      if (!iso) return;
      const d = new Date(iso);
      set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(set).sort().reverse();
  }, [news]);

  const filtered = useMemo(() => {
    return (news || []).filter((n) => {
      if (activeCategory && (n as any).category_id !== activeCategory) return false;
      if (activeTag && !n.tags?.includes(activeTag)) return false;
      if (monthFilter) {
        const iso = (n as any).published_at || (n as any).created_at;
        if (!iso) return false;
        const d = new Date(iso);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (ym !== monthFilter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.excerpt?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [news, activeCategory, activeTag, search, monthFilter]);

  const highlight = filtered.find((n) => n.is_highlight) || filtered[0];
  const rest = filtered.filter((n) => n.id !== highlight?.id);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <ImportantNewsModal />
      <UrgentNewsBanner />

      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/portal" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} /> Zurück zum Portal
          </Link>
          <h1 className="text-lg font-semibold text-foreground">News & Kommunikation</h1>
          <div className="w-32" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Filter bar */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="News durchsuchen…"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !activeCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              Alle Kategorien
            </button>
            {categories?.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id ? "text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
                style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
              >
                {cat.name}
              </button>
            ))}
            <div className="ml-auto inline-flex items-center gap-2">
              <Calendar size={14} className="text-muted-foreground" />
              <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="px-3 py-1.5 rounded-full text-sm border bg-card">
                <option value="">Alle Monate</option>
                {months.map((m) => {
                  const [y, mm] = m.split("-");
                  const label = new Date(Number(y), Number(mm) - 1, 1).toLocaleDateString("de-CH", { month: "long", year: "numeric" });
                  return <option key={m} value={m}>{label}</option>;
                })}
              </select>
            </div>
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <Filter size={14} className="text-muted-foreground" />
              {activeTag && (
                <button onClick={() => setActiveTag(null)} className="text-xs text-primary underline">
                  Tag-Filter zurücksetzen
                </button>
              )}
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                    activeTag === tag ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Keine News gefunden.</div>
        ) : (
          <>
            {highlight && (
              <div className="mb-10">
                <NewsCard news={highlight} variant="highlight" />
              </div>
            )}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((n) => (
                  <NewsCard key={n.id} news={n} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default PortalNews;