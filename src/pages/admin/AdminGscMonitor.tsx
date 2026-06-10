import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Activity, AlertCircle, CheckCircle2, RefreshCw, ExternalLink,
  Eye, BarChart3, Clock,
} from "lucide-react";

type Issue = {
  id: string;
  detected_at: string;
  last_seen_at: string;
  resolved_at: string | null;
  source: string;
  severity: string;
  url: string | null;
  issue_code: string | null;
  message: string;
  acknowledged: boolean;
};

type Run = {
  id: string;
  ran_at: string;
  status: string;
  duration_ms: number | null;
  issues_found: number;
  error_message: string | null;
  performance: any;
};

export default function AdminGscMonitor() {
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  const { data: issues = [] } = useQuery({
    queryKey: ["gsc_issues", showResolved],
    queryFn: async () => {
      let q = supabase.from("gsc_monitor_issues").select("*").order("detected_at", { ascending: false });
      if (!showResolved) q = q.is("resolved_at", null);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Issue[];
    },
  });

  const { data: runs = [] } = useQuery({
    queryKey: ["gsc_runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gsc_monitor_runs").select("*")
        .order("ran_at", { ascending: false }).limit(20);
      if (error) throw error;
      return (data ?? []) as Run[];
    },
  });

  const lastRun = runs[0];
  const lastPerf = lastRun?.performance;

  const runNow = async () => {
    setRunning(true);
    try {
      const { error } = await supabase.functions.invoke("gsc-monitor", { body: {} });
      if (error) throw error;
      toast.success("Prüfung abgeschlossen");
      qc.invalidateQueries({ queryKey: ["gsc_issues"] });
      qc.invalidateQueries({ queryKey: ["gsc_runs"] });
      qc.invalidateQueries({ queryKey: ["gsc_open_issues_count"] });
    } catch (e: any) {
      toast.error("Fehler: " + e.message);
    } finally {
      setRunning(false);
    }
  };

  const acknowledge = async (id: string) => {
    const { error } = await supabase.from("gsc_monitor_issues")
      .update({ acknowledged: true }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["gsc_issues"] });
    qc.invalidateQueries({ queryKey: ["gsc_open_issues_count"] });
  };

  const openIssues = issues.filter((i) => !i.resolved_at);
  const errorCount = openIssues.filter((i) => i.severity === "error").length;
  const warnCount = openIssues.filter((i) => i.severity === "warning").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Activity className="h-6 w-6" /> Search Console Monitoring
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automatische Tägliche Prüfung von Indexierungs- und Crawling-Problemen
          </p>
        </div>
        <Button onClick={runNow} disabled={running}>
          <RefreshCw className={`h-4 w-4 mr-2 ${running ? "animate-spin" : ""}`} />
          Jetzt prüfen
        </Button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Offene Fehler</div>
                <div className={`text-3xl font-semibold mt-1 ${errorCount > 0 ? "text-red-600" : "text-green-600"}`}>
                  {errorCount}
                </div>
              </div>
              {errorCount > 0
                ? <AlertCircle className="h-8 w-8 text-red-500" />
                : <CheckCircle2 className="h-8 w-8 text-green-500" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground">Offene Warnungen</div>
            <div className={`text-3xl font-semibold mt-1 ${warnCount > 0 ? "text-yellow-600" : ""}`}>
              {warnCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground">Klicks (28T)</div>
            <div className="text-3xl font-semibold mt-1">
              {lastPerf?.totals?.clicks ?? "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground">Impressionen (28T)</div>
            <div className="text-3xl font-semibold mt-1">
              {lastPerf?.totals?.impressions ?? "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last run info */}
      {lastRun && (
        <Card>
          <CardContent className="pt-6 flex items-center gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              Letzte Prüfung: <span className="text-foreground font-medium">
                {new Date(lastRun.ran_at).toLocaleString("de-CH")}
              </span>
            </div>
            <Badge variant={lastRun.status === "success" ? "default" : "secondary"}>
              {lastRun.status === "success" ? "Erfolgreich" : "Mit Warnungen"}
            </Badge>
            <span className="text-muted-foreground">
              {lastRun.issues_found} Probleme gefunden · {lastRun.duration_ms} ms
            </span>
          </CardContent>
        </Card>
      )}

      {/* Issues */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" /> Probleme
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowResolved((s) => !s)}>
            <Eye className="h-4 w-4 mr-1" />
            {showResolved ? "Nur offene" : "Inkl. gelöste"}
          </Button>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
              Keine Probleme – alles in Ordnung.
            </div>
          ) : (
            <div className="space-y-2">
              {issues.map((i) => (
                <div
                  key={i.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    i.resolved_at ? "bg-muted/30 opacity-70" :
                    i.severity === "error" ? "bg-red-50 border-red-200" :
                    "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  {i.severity === "error"
                    ? <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    : <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{i.message}</span>
                      <Badge variant="outline" className="text-xs">{i.source}</Badge>
                      {i.resolved_at && <Badge variant="secondary" className="text-xs">gelöst</Badge>}
                      {i.acknowledged && !i.resolved_at && <Badge variant="secondary" className="text-xs">bestätigt</Badge>}
                    </div>
                    {i.url && (
                      <a href={i.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1 mt-1">
                        {i.url} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Erkannt: {new Date(i.detected_at).toLocaleString("de-CH")}
                      {i.resolved_at && ` · Gelöst: ${new Date(i.resolved_at).toLocaleString("de-CH")}`}
                    </div>
                  </div>
                  {!i.resolved_at && !i.acknowledged && (
                    <Button size="sm" variant="ghost" onClick={() => acknowledge(i.id)}>
                      Bestätigen
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Run history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Verlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            {runs.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <span>{new Date(r.ran_at).toLocaleString("de-CH")}</span>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{r.issues_found} Probleme</span>
                  <Badge variant={r.status === "success" ? "default" : "secondary"} className="text-xs">
                    {r.status}
                  </Badge>
                </div>
              </div>
            ))}
            {runs.length === 0 && (
              <p className="text-muted-foreground text-center py-4">Noch keine Prüfung durchgeführt.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}