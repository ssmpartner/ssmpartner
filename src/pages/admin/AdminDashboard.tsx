import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Image, FileText, Users, Briefcase, Newspaper, Calendar, MessageSquare,
  Mail, Eye, Heart, MessageCircle, UserCheck, TrendingUp, MapPin,
  ArrowRight, Building2, AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const StatCard = ({ label, count, icon: Icon, to, color, sub }: any) => (
  <Link
    to={to}
    className="bg-card border rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 group"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={18} className="text-primary-foreground" />
      </div>
      <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <p className="font-heading text-2xl font-semibold text-foreground">{count ?? "—"}</p>
    <p className="font-body text-xs text-muted-foreground mt-1">{label}</p>
    {sub && <p className="font-body text-[11px] text-muted-foreground/80 mt-1">{sub}</p>}
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
    { label: "Slider-Bilder", count: stats?.sliderCount, icon: Image, to: "/admin/slider", color: "bg-primary" },
    { label: "Seitentexte", count: stats?.contentCount, icon: FileText, to: "/admin/content", color: "bg-info" },
    { label: "Team-Mitglieder", count: stats?.teamCount, icon: Users, to: "/admin/team", color: "bg-success" },
    { label: "Offene Stellen", count: stats?.jobCount, icon: Briefcase, to: "/admin/jobs", color: "bg-warning" },
    { label: "Agenturen", count: stats?.agencyCount, icon: Building2, to: "/admin/agencies", color: "bg-primary" },
  ];

  const portalCards = [
    { label: "News (veröffentlicht)", count: stats?.newsPublished, sub: `${stats?.newsCount ?? 0} gesamt`, icon: Newspaper, to: "/admin/news", color: "bg-primary" },
    { label: "Bevorstehende Events", count: stats?.eventsUpcoming, sub: `${stats?.eventsCount ?? 0} gesamt`, icon: Calendar, to: "/admin/events", color: "bg-info" },
    { label: "Event-Anmeldungen", count: stats?.registrationsTotal, icon: UserCheck, to: "/admin/events", color: "bg-success" },
    { label: "Neue Anfragen", count: stats?.inquiriesNew, sub: `${stats?.inquiriesTotal ?? 0} gesamt`, icon: Mail, to: "/admin/inquiries", color: "bg-warning" },
  ];

  const engagementCards = [
    { label: "News-Aufrufe (7T)", count: stats?.newsViewsWeek, icon: Eye, to: "/admin/news", color: "bg-primary" },
    { label: "Likes gesamt", count: stats?.newsLikes, icon: Heart, to: "/admin/news", color: "bg-info" },
    { label: "Kommentare", count: stats?.newsComments, icon: MessageCircle, to: "/admin/news", color: "bg-success" },
    { label: "Chat-Sessions (7T)", count: stats?.chatSessionsWeek, icon: MessageSquare, to: "/admin/chat-logs", color: "bg-warning" },
  ];

  const statusStyle: Record<string, string> = {
    new: "bg-warning/10 text-warning",
    in_progress: "bg-info/10 text-info",
    done: "bg-success/10 text-success",
    archived: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Überblick über Website, Portal und Engagement</p>
      </div>

      {/* Website */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-muted-foreground" />
          <h2 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">Website-Inhalte</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {websiteCards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      </section>

      {/* Portal */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Newspaper size={16} className="text-muted-foreground" />
          <h2 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">Portal & Kommunikation</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {portalCards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      </section>

      {/* Engagement */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Heart size={16} className="text-muted-foreground" />
          <h2 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">Engagement (letzte 7 Tage)</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {engagementCards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      </section>

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
