import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState,
  useReactFlow, ConnectionMode, type Connection, type Edge, type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CopyPlus, Copy, Download, FileDown, Plus, Save, Send, Trash2, Building2, LayoutGrid, Loader2 } from "lucide-react";
import { nodeTypes } from "@/components/orgchart/OrgNodes";
import { exportPdf, exportPng } from "@/components/orgchart/exportOrgChart";

type Chart = { id: string; title: string; is_published: boolean; nodes: any; edges: any; updated_at: string };

const edgeDefaults = { type: "smoothstep", style: { strokeWidth: 2 } };

function autoLayout(nodes: Node[], edges: Edge[]): Node[] {
  const children = new Map<string, string[]>();
  const hasParent = new Set<string>();
  edges.forEach(e => { children.set(e.source, [...(children.get(e.source) || []), e.target]); hasParent.add(e.target); });
  const roots = nodes.filter(n => !hasParent.has(n.id));
  const pos = new Map<string, { x: number; y: number }>();
  let cursor = 0;
  const W = 260, H = 150;
  const place = (id: string, depth: number, seen: Set<string>): number => {
    if (seen.has(id)) return pos.get(id)?.x ?? 0;
    seen.add(id);
    const kids = (children.get(id) || []).filter(k => !seen.has(k));
    let x: number;
    if (!kids.length) { x = cursor; cursor += W; }
    else { const xs = kids.map(k => place(k, depth + 1, seen)); x = (xs[0] + xs[xs.length - 1]) / 2; }
    pos.set(id, { x, y: depth * H });
    return x;
  };
  const seen = new Set<string>();
  roots.forEach(r => place(r.id, 0, seen));
  nodes.forEach(n => { if (!pos.has(n.id)) place(n.id, 0, seen); });
  return nodes.map(n => ({ ...n, position: pos.get(n.id)! }));
}

const Editor = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const rf = useReactFlow();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [search, setSearch] = useState("");
  const [unitLabel, setUnitLabel] = useState("");

  const { data: charts = [], isLoading } = useQuery({
    queryKey: ["org-charts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("org_charts").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Chart[];
    },
  });

  const { data: members = [] } = useQuery({
    queryKey: ["org-team-pool"],
    queryFn: async () => {
      const { data, error } = await supabase.from("team_members")
        .select("id,name,image_url,role_de,badge,agency_id,agencies(name)").eq("active", true).order("name");
      if (error) throw error;
      return data as any[];
    },
  });

  const current = charts.find(c => c.id === selectedId);

  // Load chart only when switching versions (not on background refresh)
  useEffect(() => {
    if (!selectedId && charts.length) setSelectedId((charts.find(c => c.is_published) || charts[0]).id);
  }, [charts, selectedId]);
  useEffect(() => {
    const c = charts.find(x => x.id === selectedId);
    if (!c) return;
    setTitle(c.title); setNodes(c.nodes || []); setEdges((c.edges || []).map((e: any) => ({ ...e, sourceHandle: e.sourceHandle ?? "b", targetHandle: e.targetHandle ?? "t" }))); setDirty(false);
    setTimeout(() => rf.fitView({ padding: 0.2 }), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // A person may appear several times in one chart; show how often instead of hiding them.
  const usedCount = useMemo(() => {
    const m = new Map<string, number>();
    nodes.forEach(n => { const id = (n.data as any)?.memberId; if (id) m.set(id, (m.get(id) || 0) + 1); });
    return m;
  }, [nodes]);
  const pool = members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const selectedNodes = nodes.filter(n => n.selected);

  const COLORS = ["#243e3a", "#B3B69C", "#2563eb", "#0891b2", "#16a34a", "#ca8a04", "#ea580c", "#dc2626", "#db2777", "#7c3aed", "#64748b"];
  const setColor = (color?: string) => {
    setNodes(ns => ns.map(n => n.selected ? { ...n, data: { ...n.data, color } } : n));
    setDirty(true);
  };
  const duplicateSelected = () => {
    if (!selectedNodes.length) return;
    const stamp = Date.now();
    const copies = selectedNodes.map((n, i) => ({
      ...n, id: `${n.id.split("-dup")[0]}-dup${stamp}${i}`, selected: true,
      position: { x: n.position.x + 40, y: n.position.y + 40 }, data: { ...n.data },
    }));
    setNodes(ns => [...ns.map(n => ({ ...n, selected: false })), ...copies]);
    setDirty(true);
  };

  // Dragging a node moves everything hanging below it (its whole subtree).
  const dragRef = useRef<{ start: { x: number; y: number }; ids: Map<string, { x: number; y: number }> } | null>(null);
  const descendants = (rootIds: string[]) => {
    const out = new Set<string>(); const stack = [...rootIds]; const roots = new Set(rootIds);
    while (stack.length) {
      const id = stack.pop()!;
      edges.forEach(e => {
        if (e.source === id && !out.has(e.target) && !roots.has(e.target)) { out.add(e.target); stack.push(e.target); }
      });
    }
    return out;
  };
  const onNodeDragStart = (_: any, node: Node) => {
    const dragged = node.selected ? nodes.filter(n => n.selected).map(n => n.id) : [node.id];
    const ids = new Map<string, { x: number; y: number }>();
    descendants(dragged).forEach(id => { const n = nodes.find(x => x.id === id); if (n && !n.selected) ids.set(id, { ...n.position }); });
    dragRef.current = { start: { ...node.position }, ids };
  };
  const onNodeDrag = (_: any, node: Node) => {
    const d = dragRef.current; if (!d || !d.ids.size) return;
    const dx = node.position.x - d.start.x, dy = node.position.y - d.start.y;
    setNodes(ns => ns.map(n => { const p = d.ids.get(n.id); return p ? { ...n, position: { x: p.x + dx, y: p.y + dy } } : n; }));
  };
  const onNodeDragStop = () => { dragRef.current = null; };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input,textarea,select")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") { e.preventDefault(); duplicateSelected(); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  });

  const center = () => {
    const el = document.querySelector(".react-flow") as HTMLElement | null;
    const r = el?.getBoundingClientRect();
    return rf.screenToFlowPosition({ x: (r?.left ?? 0) + (r?.width ?? 600) / 2, y: (r?.top ?? 0) + (r?.height ?? 400) / 2 });
  };

  const addMember = (m: any, position?: { x: number; y: number }) => {
    setNodes(ns => [...ns, {
      id: `p-${m.id}-${Date.now()}`, type: "person", position: position || center(),
      data: { memberId: m.id, name: m.name, image: m.image_url, role: m.role_de, agency: m.agencies?.name },
    }]);
    setDirty(true);
  };
  const addUnit = () => {
    if (!unitLabel.trim()) return;
    setNodes(ns => [...ns, { id: `u-${Date.now()}`, type: "unit", position: center(), data: { label: unitLabel.trim() } }]);
    setUnitLabel(""); setDirty(true);
  };

  const onConnect = useCallback((c: Connection) => { setEdges(es => addEdge({ ...c, ...edgeDefaults }, es)); setDirty(true); }, [setEdges]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("application/org-member");
    const m = members.find(x => x.id === id);
    if (m) addMember(m, rf.screenToFlowPosition({ x: e.clientX, y: e.clientY }));
  };

  const createVersion = async (copyFrom?: Chart) => {
    setBusy(true);
    const { data, error } = await supabase.from("org_charts").insert({
      title: copyFrom ? `${copyFrom.title} (Kopie)` : `Organigramm ${new Date().toLocaleDateString("de-CH")}`,
      nodes: copyFrom ? (nodes as any) : [], edges: copyFrom ? (edges as any) : [], created_by: user?.id,
    }).select().single();
    setBusy(false);
    if (error) return toast.error("Version konnte nicht erstellt werden");
    await qc.invalidateQueries({ queryKey: ["org-charts"] });
    setSelectedId(data.id);
    toast.success(copyFrom ? "Version dupliziert" : "Neue Version erstellt");
  };

  const save = async () => {
    if (!current) return;
    setBusy(true);
    const { error } = await supabase.from("org_charts").update({
      title: title.trim() || current.title, nodes: nodes as any, edges: edges as any, updated_at: new Date().toISOString(),
    }).eq("id", current.id);
    setBusy(false);
    if (error) return toast.error("Speichern fehlgeschlagen");
    setDirty(false); qc.invalidateQueries({ queryKey: ["org-charts"] }); toast.success("Gespeichert");
  };

  const publish = async () => {
    if (!current) return;
    await save();
    await supabase.from("org_charts").update({ is_published: false }).eq("is_published", true).neq("id", current.id);
    const { error } = await supabase.from("org_charts").update({ is_published: true }).eq("id", current.id);
    if (error) return toast.error("Publizieren fehlgeschlagen");
    qc.invalidateQueries({ queryKey: ["org-charts"] }); toast.success("Im Portal publiziert");
  };

  const remove = async () => {
    if (!current) return;
    const { error } = await supabase.from("org_charts").delete().eq("id", current.id);
    if (error) return toast.error("Löschen fehlgeschlagen");
    setSelectedId(null); qc.invalidateQueries({ queryKey: ["org-charts"] }); toast.success("In den Papierkorb verschoben");
  };

  const doExport = async (kind: "png" | "pdf") => {
    if (!nodes.length) return toast.error("Das Organigramm ist leer");
    try { setBusy(true); kind === "png" ? await exportPng(nodes, title) : await exportPdf(nodes, title); }
    catch { toast.error("Export fehlgeschlagen"); } finally { setBusy(false); }
  };

  if (isLoading) return <div className="p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (!charts.length) return (
    <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Noch kein Organigramm</h2>
      <p className="text-muted-foreground mb-6">Erstellen Sie die erste Version und ziehen Sie Teammitglieder auf die Fläche.</p>
      <Button onClick={() => createVersion()} disabled={busy}><Plus className="h-4 w-4 mr-2" />Erste Version erstellen</Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-3 shadow-sm">
        <select className="h-10 rounded-xl border bg-background px-3 text-sm" value={selectedId ?? ""}
          onChange={e => { setSelectedId(e.target.value); }}>
          {charts.map(c => <option key={c.id} value={c.id}>{c.title}{c.is_published ? " (Publiziert)" : ""}</option>)}
        </select>
        <Input className="w-64" value={title} onChange={e => { setTitle(e.target.value); setDirty(true); }} placeholder="Versionsname" />
        {current?.is_published ? <Badge>Publiziert</Badge> : <Badge variant="secondary">Entwurf</Badge>}
        {dirty && <span className="text-xs text-muted-foreground">Ungespeicherte Änderungen</span>}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button size="sm" onClick={save} disabled={busy || !dirty}><Save className="h-4 w-4 mr-1" />Speichern</Button>
          <Button size="sm" variant="outline" onClick={publish} disabled={busy}><Send className="h-4 w-4 mr-1" />Publizieren</Button>
          <Button size="sm" variant="outline" onClick={() => createVersion()} disabled={busy}><Plus className="h-4 w-4 mr-1" />Neu</Button>
          <Button size="sm" variant="outline" onClick={() => current && createVersion(current)} disabled={busy}><Copy className="h-4 w-4 mr-1" />Duplizieren</Button>
          <Button size="sm" variant="outline" onClick={() => doExport("png")} disabled={busy}><Download className="h-4 w-4 mr-1" />PNG</Button>
          <Button size="sm" variant="outline" onClick={() => doExport("pdf")} disabled={busy}><FileDown className="h-4 w-4 mr-1" />PDF</Button>
          <Button size="sm" variant="outline" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <aside className="rounded-2xl border bg-card p-3 shadow-sm space-y-3 lg:h-[75vh] flex flex-col">
          <div>
            <p className="text-sm font-semibold mb-2">Organisationseinheit</p>
            <div className="flex gap-2">
              <Input value={unitLabel} onChange={e => setUnitLabel(e.target.value)} placeholder="z. B. Geschäftsleitung"
                onKeyDown={e => e.key === "Enter" && addUnit()} />
              <Button size="icon" variant="outline" onClick={addUnit}><Building2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => { setNodes(ns => autoLayout(ns, edges)); setDirty(true); setTimeout(() => rf.fitView({ padding: 0.2 }), 50); }}>
            <LayoutGrid className="h-4 w-4 mr-1" />Automatisch anordnen
          </Button>
          {selectedNodes.length > 0 && (
            <div className="rounded-xl border p-2 space-y-2">
              <p className="text-sm font-semibold">Auswahl ({selectedNodes.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map(c => (
                  <button key={c} title={c} onClick={() => setColor(c)} className="h-6 w-6 rounded-full border shadow-sm" style={{ backgroundColor: c }} />
                ))}
                <label className="h-6 w-6 rounded-full border overflow-hidden cursor-pointer" title="Eigene Farbe">
                  <input type="color" className="h-8 w-8 -m-1 cursor-pointer" onChange={e => setColor(e.target.value)} />
                </label>
                <button onClick={() => setColor(undefined)} className="text-xs underline text-muted-foreground">Standard</button>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={duplicateSelected}>
                <CopyPlus className="h-4 w-4 mr-1" />Duplizieren (Strg+D)
              </Button>
            </div>
          )}
          <div className="flex-1 min-h-0 flex flex-col">
            <p className="text-sm font-semibold mb-2">Team ({pool.length})</p>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suchen…" className="mb-2" />
            <div className="overflow-y-auto space-y-1 flex-1 max-h-96 lg:max-h-none">
              {pool.map(m => (
                <button key={m.id} draggable onDragStart={e => e.dataTransfer.setData("application/org-member", m.id)}
                  onClick={() => addMember(m)}
                  className="w-full flex items-center gap-2 rounded-xl p-2 text-left hover:bg-muted cursor-grab">
                  {m.image_url ? <img src={m.image_url} alt="" className="h-8 w-8 rounded-full object-cover" /> : <div className="h-8 w-8 rounded-full bg-muted" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}{usedCount.get(m.id) ? <span className="ml-1 text-xs text-primary">({usedCount.get(m.id)}×)</span> : null}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.agencies?.name || m.role_de}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Ziehen oder klicken zum Hinzufügen. Linien von einem beliebigen Punkt (oben, unten, links, rechts) ziehen. Verschieben nimmt alle darunterliegenden mit. Auswahl mit Entf löschen.</p>
        </aside>

        <div className="rounded-2xl border bg-background shadow-sm h-[75vh] overflow-hidden" style={{ colorScheme: "light" }} onDragOver={e => e.preventDefault()} onDrop={onDrop}>
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} defaultEdgeOptions={edgeDefaults}
            onNodesChange={c => { onNodesChange(c); if (([] as any[]).concat(c as unknown as any).some((x: any) => x.type !== "select" && x.type !== "dimensions")) setDirty(true); }}
            onEdgesChange={c => { onEdgesChange(c); if (([] as any[]).concat(c as unknown as any).some((x: any) => x.type !== "select")) setDirty(true); }}
            onConnect={onConnect} connectionMode={ConnectionMode.Loose} onNodeDragStart={onNodeDragStart} onNodeDrag={onNodeDrag} onNodeDragStop={onNodeDragStop} fitView snapToGrid snapGrid={[10, 10]} deleteKeyCode={["Delete", "Backspace"]} proOptions={{ hideAttribution: true }}>
            <Background gap={20} color="#c3ccc6" />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Version löschen?</AlertDialogTitle>
            <AlertDialogDescription>«{current?.title}» wird in den Papierkorb verschoben und kann dort wiederhergestellt werden.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const AdminOrgChart = () => (
  <div>
    <h1 className="text-2xl font-semibold mb-1">Organigramm</h1>
    <p className="text-muted-foreground mb-6">Struktur gestalten, Versionen verwalten und als PNG oder PDF exportieren.</p>
    <ReactFlowProvider><Editor /></ReactFlowProvider>
  </div>
);
export default AdminOrgChart;
