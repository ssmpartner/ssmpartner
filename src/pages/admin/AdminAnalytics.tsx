import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Eye, Users, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar,
} from "recharts";
import { useState } from "react";

type Row = {
  id: string;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  session_id: string | null;
  created_at: string;
};

const RANGES = {
  "24h": { label: "Letzte 24 Stunden", days: 1 },
  "7d":  { label: "Letzte 7 Tage", days: 7 },
  "30d": { label: "Letzte 30 Tage", days: 30 },
  "90d": { label: "Letzte 90 Tage", days: 90 },
} as const;

type RangeKey = keyof typeof RANGES;

function parseDevice(ua: string | null): "Mobile" | "Tablet" | "Desktop" {
  if (!ua) return "Desktop";
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "Mobile";
  return "Desktop";
}

function parseBrowser(ua: string | null): string {
  if (!ua) return "Unbekannt";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Andere";
}

function refSource(ref: string | null): string {
  if (!ref) return "Direkt";
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (host.includes("google")) return "Google";
    if (host.includes("bing")) return "Bing";
    if (host.includes("facebook")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("youtube")) return "YouTube";
    if (host.includes("ssmpartner")) return "Direkt";
    return host;
  } catch {
    return "Direkt";
  }
}

export default function AdminAnalytics() {
  const [range, setRange] = useState<RangeKey>("7d");
  const days = RANGES[range].days;

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["page_views", range],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("page_views")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10000);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    refetchInterval: 60000,
  });

  const totalViews = rows.length;
  const uniqueSessions = new Set(rows.map((r) => r.session_id || r.id)).size;

  // Time series
  const buckets = new Map<string, { views: number; visitors: Set<string> }>();
  const fmt = (d: Date) =>
    days <= 1
      ? `${d.getHours().toString().padStart(2, "0")}:00`
      : `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}`;

  // pre-fill buckets
  const now = new Date();
  const steps = days <= 1 ? 24 : days;
  for (let i = steps - 1; i >= 0; i--) {
    const d = new Date(now);
    if (days <= 1) d.setHours(d.getHours() - i, 0, 0, 0);
    else { d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0); }
    buckets.set(fmt(d), { views: 0, visitors: new Set() });
  }

  rows.forEach((r) => {
    const d = new Date(r.created_at);
    if (days <= 1) d.setMinutes(0, 0, 0);
    else d.setHours(0, 0, 0, 0);
    const key = fmt(d);
    const b = buckets.get(key);
    if (b) {
      b.views += 1;
      b.visitors.add(r.session_id || r.id);
    }
  });

  const chartData = Array.from(buckets.entries()).map(([key, v]) => ({
    label: key,
    views: v.views,
    visitors: v.visitors.size,
  }));

  const topList = (getter: (r: Row) => string, limit = 10) => {
    const map = new Map<string, number>();
    rows.forEach((r) => {
      const k = getter(r);
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  };

  const topPages = topList((r) => r.path);
  const topReferrers = topList((r) => refSource(r.referrer));
  const topDevices = topList((r) => parseDevice(r.user_agent));
  const topBrowsers = topList((r) => parseBrowser(r.user_agent));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" /> Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Website-Besucher und Seitenaufrufe
          </p>
        </div>
        <Tabs value={range} onValueChange={(v) => setRange(v as RangeKey)}>
          <TabsList>
            {Object.entries(RANGES).map(([k, v]) => (
              <TabsTrigger key={k} value={k}>{v.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Seitenaufrufe</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalViews.toLocaleString("de-CH")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eindeutige Besucher</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{uniqueSessions.toLocaleString("de-CH")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aufrufe / Besucher</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {uniqueSessions > 0 ? (totalViews / uniqueSessions).toFixed(1) : "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="views" name="Aufrufe" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="visitors" name="Besucher" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Top Seiten</CardTitle></CardHeader>
          <CardContent>
            <TopTable rows={topPages} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Verweisquellen</CardTitle></CardHeader>
          <CardContent>
            <TopTable rows={topReferrers} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Geräte</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDevices.map(([name, value]) => ({ name, value }))}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Browser</CardTitle></CardHeader>
          <CardContent>
            <TopTable rows={topBrowsers} />
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Lade Analytics…</p>
      )}
      {!isLoading && totalViews === 0 && (
        <p className="text-sm text-muted-foreground">
          Noch keine Aufrufe im gewählten Zeitraum.
        </p>
      )}
    </div>
  );
}

function TopTable({ rows }: { rows: [string, number][] }) {
  const max = rows[0]?.[1] || 1;
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground">Keine Daten</p>;
  }
  return (
    <div className="space-y-2">
      {rows.map(([key, value]) => (
        <div key={key} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate pr-2">{key}</span>
            <span className="text-muted-foreground tabular-nums">{value}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}