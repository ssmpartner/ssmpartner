import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Image, FileText, Users, Briefcase, Newspaper, Calendar, MessageSquare,
  Mail, Eye, Heart, MessageCircle, UserCheck, TrendingUp, MapPin,
  ArrowRight, Building2, AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

/** Compact stat — inline icon + number, minimal chrome */
const MiniStat = ({ label, count, icon: Icon, to, sub, accent }: any) => (
  <Link
    to={to}
    className="group flex items-center gap-3 bg-card border rounded-xl px-3 py-2.5 hover:border-primary/40 hover:shadow-sm transition-all"
  >
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent || "bg-muted text-foreground"}`}>
      <Icon size={14} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline gap-1.5">
        <span className="font-heading text-lg font-semibold text-foreground leading-none">{count ?? "—"}</span>
        {sub && <span className="text-[10px] text-muted-foreground truncate">{sub}</span>}
      </div>
      <p className="font-body text-[11px] text-muted-foreground truncate mt-0.5">{label}</p>
    </div>
    <ArrowRight size={12} className="text-muted-foreground/40 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
  </Link>
);

/** Featured highlight tile — for the 1-2 most important KPIs */
const HighlightStat = ({ label, count, icon: Icon, to, sub }: any) => (
  <Link
    to={to}
    className="group relative overflow-hidden bg-primary text-primary-foreground rounded-2xl p-4 hover:shadow-lg transition-all"
  >
    <div className="relative z-10 flex items-start justify-between">
      <div>
        <p className="font-heading text-3xl font-semibold leading-none">{count ?? "—"}</p>
        <p className="font-body text-xs opacity-80 mt-2">{label}</p>
        {sub && <p className="font-body text-[10px] opacity-60 mt-0.5">{sub}</p>}
      </div>
      <Icon size={18} className="opacity-60" />
    </div>
    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary-foreground/10 blur-2xl" />
  </Link>
);

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const c = (table: string, filter?: (q: any) => any) => {
        let q = supabase.from(table as any).select("*", { count: "exact", head: true });
        if (filter) q = filter(q);
        return q.then(({ count }: any) => count || 0);
      };
      const nowIso = new Date().toISOString();
      const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
      const [
        sliderCount, contentCount, teamCount, jobCount, agencyCount,
        newsCount, newsPublished, eventsCount, eventsUpcoming,
        inquiriesNew, inquiriesTotal, registrationsTotal,
        chatSessionsWeek, newsViewsWeek, newsLikes, newsComments,
      ] = await Promise.all([
        c("slider_images"),
        c("site_content"),
        c("team_members"),
        c("job_positions", (q) => q.eq("active", true)),
        c("agencies", (q) => q.eq("active", true)),
        c("news_posts"),
        c("news_posts", (q) => q.eq("published", true)),
        c("events"),
        c("events", (q) => q.eq("published", true).gte("start_at", nowIso)),
        c("inquiries", (q) => q.eq("status", "new")),
        c("inquiries"),
        c("event_registrations"),
        c("chat_sessions", (q) => q.gte("created_at", weekAgo)),
        c("news_views", (q) => q.gte("viewed_at", weekAgo)),
        c("news_likes"),
        c("news_comments", (q) => q.eq("hidden", false)),
      ]);
      return {
        sliderCount, contentCount, teamCount, jobCount, agencyCount,
        newsCount, newsPublished, eventsCount, eventsUpcoming,
        inquiriesNew, inquiriesTotal, registrationsTotal,
        chatSessionsWeek, newsViewsWeek, newsLikes, newsComments,
      };
    },
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["admin-dashboard-upcoming-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events" as any)
        .select("id, title, slug, start_at, location, capacity, cover_image_url")
        .eq("published", true)
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true })
        .limit(5) as any;
      const ids = (data || []).map((e: any) => e.id);
      if (!ids.length) return [];
      const { data: regs } = await supabase
        .from("event_registrations" as any)
        .select("event_id")
        .in("event_id", ids) as any;
      const tally: Record<string, number> = {};
      (regs || []).forEach((r: any) => { tally[r.event_id] = (tally[r.event_id] || 0) + 1; });
      return (data || []).map((e: any) => ({ ...e, registered: tally[e.id] || 0 }));
    },
  });

  const { data: latestInquiries } = useQuery({
    queryKey: ["admin-dashboard-latest-inquiries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("inquiries")
        .select("id, name, email, subject, source, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: topNews } = useQuery({
    queryKey: ["admin-dashboard-top-news"],
    queryFn: async () => {
      const { data: posts } = await supabase
        .from("news_posts" as any)
        .select("id, title, slug, published_at, cover_image_url")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(20) as any;
      const ids = (posts || []).map((p: any) => p.id);
      if (!ids.length) return [];
      const [{ data: views }, { data: likes }] = await Promise.all([
        supabase.from("news_views" as any).select("post_id").in("post_id", ids) as any,
        supabase.from("news_likes" as any).select("post_id").in("post_id", ids) as any,
      ]);
      const tally = (rows: any[]) => {
        const m: Record<string, number> = {};
        (rows || []).forEach((r: any) => { m[r.post_id] = (m[r.post_id] || 0) + 1; });
        return m;
      };
      const v = tally(views || []), l = tally(likes || []);
      return (posts || [])
        .map((p: any) => ({ ...p, views: v[p.id] || 0, likes: l[p.id] || 0 }))
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, 5);
    },
  });

  const websiteCards = [
    { label: "Slider-Bilder", count: stats?.sliderCount, icon: Image, to: "/admin/slider", accent: "bg-primary/10 text-primary" },
    { label: "Seitentexte", count: stats?.contentCount, icon: FileText, to: "/admin/content", accent: "bg-info/10 text-info" },
    { label: "Team", count: stats?.teamCount, icon: Users, to: "/admin/team", accent: "bg-success/10 text-success" },
    { label: "Offene Stellen", count: stats?.jobCount, icon: Briefcase, to: "/admin/jobs", accent: "bg-warning/10 text-warning" },
    { label: "Agenturen", count: stats?.agencyCount, icon: Building2, to: "/admin/agencies", accent: "bg-accent/30 text-accent-foreground" },
  ];

  const engagementCards = [
    { label: "News-Aufrufe (7T)", count: stats?.newsViewsWeek, icon: Eye, to: "/admin/news", accent: "bg-primary/10 text-primary" },
    { label: "Likes", count: stats?.newsLikes, icon: Heart, to: "/admin/news", accent: "bg-destructive/10 text-destructive" },
    { label: "Kommentare", count: stats?.newsComments, icon: MessageCircle, to: "/admin/news", accent: "bg-info/10 text-info" },
    { label: "Chat-Sessions (7T)", count: stats?.chatSessionsWeek, icon: MessageSquare, to: "/admin/chat-logs", accent: "bg-success/10 text-success" },
    { label: "Event-Anmeldungen", count: stats?.registrationsTotal, icon: UserCheck, to: "/admin/events", accent: "bg-warning/10 text-warning" },
  ];

  const statusStyle: Record<string, string> = {
    new: "bg-warning/10 text-warning",
    in_progress: "bg-info/10 text-info",
    done: "bg-success/10 text-success",
    archived: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Überblick über Website, Portal und Engagement</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* Highlights — Portal & Kommunikation as featured tiles */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Newspaper size={14} className="text-muted-foreground" />
          <h2 className="font-heading text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Portal & Kommunikation</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <HighlightStat label="Neue Anfragen" count={stats?.inquiriesNew} sub={`${stats?.inquiriesTotal ?? 0} gesamt`} icon={Mail} to="/admin/inquiries" />
          <HighlightStat label="Bevorstehende Events" count={stats?.eventsUpcoming} sub={`${stats?.eventsCount ?? 0} gesamt`} icon={Calendar} to="/admin/events" />
          <HighlightStat label="News veröffentlicht" count={stats?.newsPublished} sub={`${stats?.newsCount ?? 0} gesamt`} icon={Newspaper} to="/admin/news" />
          <HighlightStat label="Event-Anmeldungen" count={stats?.registrationsTotal} icon={UserCheck} to="/admin/events" />
        </div>
      </section>

      {/* Website + Engagement side-by-side, compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-muted-foreground" />
            <h2 className="font-heading text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Website-Inhalte</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {websiteCards.map((c) => <MiniStat key={c.label} {...c} />)}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Heart size={14} className="text-muted-foreground" />
            <h2 className="font-heading text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Engagement (7 Tage)</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {engagementCards.map((c) => <MiniStat key={c.label} {...c} />)}
          </div>
        </section>
      </div>

      {/* Two-column: Upcoming Events + Latest Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <section className="bg-card border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <h3 className="font-heading text-base font-semibold text-foreground">Bevorstehende Events</h3>
            </div>
            <Link to="/admin/events" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
              Verwalten <ArrowRight size={12} />
            </Link>
          </div>
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <ul className="space-y-3">
              {upcomingEvents.map((e: any) => {
                const start = new Date(e.start_at);
                const pct = e.capacity ? Math.min(100, Math.round((e.registered / e.capacity) * 100)) : null;
                return (
                  <li key={e.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/40 transition-colors">
                    <div className="text-center bg-primary/10 text-primary rounded-xl px-3 py-2 shrink-0 min-w-[56px]">
                      <div className="text-[10px] font-semibold uppercase">{start.toLocaleDateString("de-CH", { month: "short" })}</div>
                      <div className="text-lg font-bold leading-none">{start.getDate()}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{e.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{start.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })} Uhr</span>
                        {e.location && <span className="inline-flex items-center gap-1"><MapPin size={10} /> {e.location}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-foreground">
                        {e.registered}{e.capacity ? `/${e.capacity}` : ""}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Anmeldungen</div>
                      {pct !== null && (
                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">Keine bevorstehenden Events</div>
          )}
        </section>

        {/* Latest Inquiries */}
        <section className="bg-card border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-primary" />
              <h3 className="font-heading text-base font-semibold text-foreground">Neueste Anfragen</h3>
            </div>
            <Link to="/admin/inquiries" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
              Alle <ArrowRight size={12} />
            </Link>
          </div>
          {latestInquiries && latestInquiries.length > 0 ? (
            <ul className="space-y-2">
              {latestInquiries.map((i: any) => (
                <li key={i.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/40 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <AlertCircle size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{i.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{i.subject || i.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyle[i.status] || "bg-muted text-muted-foreground"}`}>
                      {i.status}
                    </span>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {new Date(i.created_at).toLocaleDateString("de-CH")}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">Keine Anfragen</div>
          )}
        </section>
      </div>

      {/* Top News */}
      <section className="bg-card border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            <h3 className="font-heading text-base font-semibold text-foreground">Top News (nach Aufrufen)</h3>
          </div>
          <Link to="/admin/news" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
            Alle News <ArrowRight size={12} />
          </Link>
        </div>
        {topNews && topNews.length > 0 ? (
          <ul className="space-y-2">
            {topNews.map((n: any, idx: number) => (
              <li key={n.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/40 transition-colors">
                <span className="font-heading text-sm font-semibold text-muted-foreground w-5 text-center shrink-0">{idx + 1}</span>
                {n.cover_image_url ? (
                  <img src={n.cover_image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{n.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.published_at ? new Date(n.published_at).toLocaleDateString("de-CH") : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  <span className="inline-flex items-center gap-1"><Eye size={12} /> {n.views}</span>
                  <span className="inline-flex items-center gap-1"><Heart size={12} /> {n.likes}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">Noch keine News veröffentlicht</div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
