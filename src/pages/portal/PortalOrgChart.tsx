import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ReactFlow, ReactFlowProvider, ConnectionMode, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Download, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { nodeTypes } from "@/components/orgchart/OrgNodes";
import { exportPdf, exportPng } from "@/components/orgchart/exportOrgChart";

const PortalOrgChart = () => {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const { data: chart, isLoading } = useQuery({
    queryKey: ["org-chart-published"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("org_charts").select("*").eq("is_published", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const nodes = (chart?.nodes as any[]) || [];
  const run = async (k: "png" | "pdf") => {
    try { setBusy(true); k === "png" ? await exportPng(nodes, chart!.title) : await exportPdf(nodes, chart!.title); }
    catch { toast.error("Export fehlgeschlagen"); } finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen bg-background px-4 md:px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <Link to="/portal" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"><ArrowLeft className="h-4 w-4" />Zurück zum Portal</Link>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-foreground">{chart?.title || "Organigramm"}</h1>
          {chart && <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => run("png")}><Download className="h-4 w-4 mr-1" />PNG</Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => run("pdf")}><FileDown className="h-4 w-4 mr-1" />PDF</Button>
          </div>}
        </div>
        {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : !chart ? (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">Es ist noch kein Organigramm publiziert.</div>
        ) : (
          <div className="rounded-2xl border bg-card shadow-sm h-[78vh] overflow-hidden" style={{ colorScheme: "light" }}>
            <ReactFlowProvider>
              <ReactFlow nodes={nodes} edges={((chart.edges as any[]) || []).map((e: any) => ({ ...e, sourceHandle: e.sourceHandle ?? "b", targetHandle: e.targetHandle ?? "t" }))} connectionMode={ConnectionMode.Loose} nodeTypes={nodeTypes} fitView
                nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} proOptions={{ hideAttribution: true }}>
                <Background gap={20} color="#c3ccc6" /><Controls showInteractive={false} />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        )}
      </div>
    </div>
  );
};
export default PortalOrgChart;
