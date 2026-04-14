import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Eye, X, Mail, Phone, Building2, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "Neu", color: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In Bearbeitung", color: "bg-yellow-100 text-yellow-700" },
  done: { label: "Erledigt", color: "bg-green-100 text-green-700" },
  archived: { label: "Archiviert", color: "bg-muted text-muted-foreground" },
};

const AdminInquiries = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      toast.success("Status aktualisiert");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      setSelected(null);
      toast.success("Anfrage gelöscht");
    },
  });

  const filtered = filterStatus === "all"
    ? inquiries
    : inquiries?.filter((i) => i.status === filterStatus);

  const counts = {
    all: inquiries?.length || 0,
    new: inquiries?.filter((i) => i.status === "new").length || 0,
    in_progress: inquiries?.filter((i) => i.status === "in_progress").length || 0,
    done: inquiries?.filter((i) => i.status === "done").length || 0,
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground mb-8">Anfragen</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { key: "all", label: "Gesamt", count: counts.all, icon: Mail },
          { key: "new", label: "Neu", count: counts.new, icon: AlertCircle },
          { key: "in_progress", label: "In Bearbeitung", count: counts.in_progress, icon: Clock },
          { key: "done", label: "Erledigt", count: counts.done, icon: CheckCircle },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilterStatus(s.key)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
              filterStatus === s.key ? "bg-primary/10 border-primary" : "bg-card hover:bg-muted"
            }`}
          >
            <s.icon size={20} className={filterStatus === s.key ? "text-primary" : "text-muted-foreground"} />
            <div className="text-left">
              <p className="font-heading text-xl font-semibold text-foreground">{s.count}</p>
              <p className="font-body text-xs text-muted-foreground">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : !filtered?.length ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <Mail size={40} className="text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-body text-sm text-muted-foreground">Keine Anfragen vorhanden.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left font-body text-xs font-medium text-muted-foreground px-4 py-3">Datum</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground px-4 py-3">E-Mail</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground px-4 py-3">Quelle</th>
                <th className="text-left font-body text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right font-body text-xs font-medium text-muted-foreground px-4 py-3">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((inq) => {
                const st = statusLabels[inq.status] || statusLabels.new;
                return (
                  <tr key={inq.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground">
                      {new Date(inq.created_at).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 font-body text-sm font-medium text-foreground">{inq.name}</td>
                    <td className="px-4 py-3 font-body text-sm text-muted-foreground">{inq.email}</td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground">
                      {inq.source === "agency" ? (
                        <span className="inline-flex items-center gap-1">
                          <Building2 size={12} />
                          {inq.agency_name || "Agentur"}
                        </span>
                      ) : inq.source === "contact" ? "Kontaktseite" : inq.source}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={inq.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: inq.id, status: e.target.value })}
                        className={`font-body text-xs px-2 py-1 rounded border-0 cursor-pointer ${st.color}`}
                      >
                        <option value="new">Neu</option>
                        <option value="in_progress">In Bearbeitung</option>
                        <option value="done">Erledigt</option>
                        <option value="archived">Archiviert</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelected(inq)} className="text-muted-foreground hover:text-foreground mr-2">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => deleteMutation.mutate(inq.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">Anfrage Details</h3>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-body text-xs text-muted-foreground mb-1">Datum</p>
                <p className="font-body text-sm text-foreground">
                  {new Date(selected.created_at).toLocaleDateString("de-CH", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-1">Name</p>
                  <p className="font-body text-sm font-medium text-foreground">{selected.name}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-1">E-Mail</p>
                  <a href={`mailto:${selected.email}`} className="font-body text-sm text-primary hover:underline flex items-center gap-1">
                    <Mail size={12} /> {selected.email}
                  </a>
                </div>
              </div>
              {selected.phone && (
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-1">Telefon</p>
                  <a href={`tel:${selected.phone}`} className="font-body text-sm text-primary hover:underline flex items-center gap-1">
                    <Phone size={12} /> {selected.phone}
                  </a>
                </div>
              )}
              {selected.source === "agency" && selected.agency_name && (
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-1">Agentur</p>
                  <p className="font-body text-sm text-foreground flex items-center gap-1">
                    <Building2 size={12} /> {selected.agency_name}
                  </p>
                </div>
              )}
              {selected.recipient_name && (
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-1">Ansprechperson</p>
                  <p className="font-body text-sm text-foreground">{selected.recipient_name}</p>
                </div>
              )}
              {selected.subject && (
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-1">Betreff</p>
                  <p className="font-body text-sm text-foreground">{selected.subject}</p>
                </div>
              )}
              <div>
                <p className="font-body text-xs text-muted-foreground mb-1">Nachricht</p>
                <p className="font-body text-sm text-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-4">{selected.message}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href={`mailto:${selected.email}?subject=Re: Ihre Anfrage`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Mail size={14} /> Antworten
              </a>
              <button
                onClick={() => {
                  updateStatusMutation.mutate({ id: selected.id, status: "done" });
                  setSelected(null);
                }}
                className="inline-flex items-center justify-center gap-2 border bg-card text-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                <CheckCircle size={14} /> Erledigt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
