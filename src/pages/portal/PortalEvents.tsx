import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, Search, Check, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PortalEvents = () => {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [confirmEvent, setConfirmEvent] = useState<any | null>(null);

  const { data: events } = useQuery({
    queryKey: ["portal-events"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("events" as any).select("*, news_categories(name, color), team_members(id, name, image_url, role_de, email, phone)").eq("published", true).order("start_at") as any;
      return data || [];
    },
  });

  const { data: regCounts } = useQuery({
    queryKey: ["events-reg-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("event_registrations" as any).select("event_id") as any;
      const m: Record<string, number> = {};
      (data || []).forEach((r: any) => { m[r.event_id] = (m[r.event_id] || 0) + 1; });
      return m;
    },
  });

  const { data: myRegs } = useQuery({
    queryKey: ["my-event-regs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("event_registrations" as any).select("event_id, id").eq("user_id", user!.id) as any;
      return Object.fromEntries((data || []).map((r: any) => [r.event_id, r.id]));
    },
  });

  const register = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from("event_registrations" as any).insert({ event_id: eventId, user_id: user!.id }) as any;
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Teilnahme bestätigt"); setConfirmEvent(null); qc.invalidateQueries({ queryKey: ["my-event-regs"] }); qc.invalidateQueries({ queryKey: ["events-reg-counts"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const unregister = useMutation({
    mutationFn: async (regId: string) => {
      const { error } = await supabase.from("event_registrations" as any).delete().eq("id", regId) as any;
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Abgemeldet"); qc.invalidateQueries({ queryKey: ["my-event-regs"] }); qc.invalidateQueries({ queryKey: ["events-reg-counts"] }); },
  });

  const months = useMemo(() => {
    const set = new Set<string>();
    (events || []).forEach((e: any) => {
      const d = new Date(e.start_at);
      set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(set).sort();
  }, [events]);

  const filtered = useMemo(() => {
    const now = new Date();
    return (events || []).filter((e: any) => {
      const start = new Date(e.start_at);
      if (filter === "upcoming" && start < now) return false;
      if (filter === "past" && start >= now) return false;
      if (monthFilter) {
        const ym = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
        if (ym !== monthFilter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return e.title.toLowerCase().includes(q) || (e.location || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [events, filter, monthFilter, search]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/portal" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Zurück zum Portal
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Events & Termine</h1>
          <div className="w-32" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Events durchsuchen…" className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {(["upcoming", "past", "all"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-medium ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                {f === "upcoming" ? "Bevorstehend" : f === "past" ? "Vergangen" : "Alle"}
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
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Keine Events gefunden.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((e: any) => {
              const start = new Date(e.start_at);
              const end = e.end_at ? new Date(e.end_at) : null;
              const count = regCounts?.[e.id] || 0;
              const myRegId = myRegs?.[e.id];
              const isFull = e.capacity && count >= e.capacity;
              const past = start < new Date();
              const deadline = e.registration_deadline ? new Date(e.registration_deadline) : null;
              const deadlinePassed = deadline && deadline < new Date();

              return (
                <div key={e.id} className="rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    {e.cover_image_url && (
                      <div className="md:w-64 aspect-[16/9] md:aspect-auto bg-muted shrink-0">
                        <img src={e.cover_image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
                      <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-1 shrink-0 md:w-20">
                        <div className="text-center bg-primary/10 text-primary rounded-xl px-3 py-2 md:py-3 md:w-full">
                          <div className="text-xs font-semibold uppercase">{start.toLocaleDateString("de-CH", { month: "short" })}</div>
                          <div className="text-2xl font-bold leading-none">{start.getDate()}</div>
                          <div className="text-xs mt-0.5 opacity-70">{start.getFullYear()}</div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {e.news_categories && <span className="text-xs font-semibold uppercase" style={{ color: e.news_categories.color }}>{e.news_categories.name}</span>}
                          {past && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Vergangen</span>}
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">{e.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                          <span className="inline-flex items-center gap-1.5"><Calendar size={13} /> {start.toLocaleString("de-CH", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}{end ? ` – ${end.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" })}` : ""}</span>
                          {e.location && (
                            e.location_url ? (
                              <a href={e.location_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary"><MapPin size={13} /> {e.location} <ExternalLink size={11} /></a>
                            ) : (
                              <span className="inline-flex items-center gap-1.5"><MapPin size={13} /> {e.location}</span>
                            )
                          )}
                          {e.registration_enabled && <span className="inline-flex items-center gap-1.5"><Users size={13} /> {count}{e.capacity ? ` / ${e.capacity}` : ""} angemeldet</span>}
                        </div>
                        {e.description && <div className="prose prose-sm text-foreground/80 max-w-none line-clamp-3" dangerouslySetInnerHTML={{ __html: e.description }} />}
                        {e.team_members && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="text-xs">Ansprechperson:</span>
                            {e.team_members.image_url && <img src={e.team_members.image_url} alt="" className="h-6 w-6 rounded-full object-cover" />}
                            <span className="font-medium text-foreground">{e.team_members.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 flex md:flex-col gap-2 md:w-44">
                        {e.registration_enabled && !past && (
                          myRegId ? (
                            <button onClick={() => unregister.mutate(myRegId)} disabled={unregister.isPending} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 font-medium text-sm">
                              <Check size={16} /> Angemeldet
                            </button>
                          ) : (
                            <button onClick={() => register.mutate(e.id)} disabled={register.isPending || isFull || deadlinePassed} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                              {register.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                              {isFull ? "Ausgebucht" : deadlinePassed ? "Anmeldeschluss" : "Anmelden"}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default PortalEvents;
