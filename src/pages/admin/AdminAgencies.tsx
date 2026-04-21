import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, Pencil, X, Upload, ChevronUp, ChevronDown, Users } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  name: "",
  slug: "",
  address: "",
  phone: "",
  email: "",
  description_de: "",
  description_fr: "",
  description_it: "",
  description_en: "",
  leader_name: "",
  leader_role: "",
  opening_hours: "",
  map_lat: "",
  map_lng: "",
};

const AdminAgencies = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState<string | null>(null);

  const { data: agencies, isLoading } = useQuery({
    queryKey: ["admin-agencies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agencies").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: memberCounts } = useQuery({
    queryKey: ["admin-agencies-member-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("agency_id")
        .not("agency_id", "is", null);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        if (row.agency_id) counts[row.agency_id] = (counts[row.agency_id] || 0) + 1;
      });
      return counts;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: any) => {
      const prepared = {
        ...item,
        map_lat: item.map_lat ? parseFloat(item.map_lat) : null,
        map_lng: item.map_lng ? parseFloat(item.map_lng) : null,
      };
      if (prepared.id) {
        const { id, ...rest } = prepared;
        const { error } = await supabase.from("agencies").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const maxOrder = agencies?.length ? Math.max(...agencies.map((a) => a.sort_order)) + 1 : 0;
        const { error } = await supabase.from("agencies").insert({ ...prepared, sort_order: maxOrder });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agencies"] });
      setEditing(null);
      setAdding(false);
      toast.success("Gespeichert");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agencies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agencies"] });
      toast.success("Gelöscht");
    },
  });

  const moveMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      if (!agencies) return;
      const idx = agencies.findIndex((a) => a.id === id);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= agencies.length) return;
      const a = agencies[idx];
      const b = agencies[swapIdx];
      await supabase.from("agencies").update({ sort_order: b.sort_order }).eq("id", a.id);
      await supabase.from("agencies").update({ sort_order: a.sort_order }).eq("id", b.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-agencies"] }),
  });

  const handleImageUpload = async (agencyId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(agencyId);
    try {
      const ext = file.name.split(".").pop();
      const path = `agencies/${agencyId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("site-images").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);
      await supabase.from("agencies").update({ image_url: publicUrl }).eq("id", agencyId);
      queryClient.invalidateQueries({ queryKey: ["admin-agencies"] });
      toast.success("Bild hochgeladen");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const startEdit = (agency: any) => {
    setEditing(agency.id);
    setForm({
      name: agency.name,
      slug: agency.slug,
      address: agency.address || "",
      phone: agency.phone || "",
      email: agency.email || "",
      description_de: agency.description_de || "",
      description_fr: agency.description_fr || "",
      description_it: agency.description_it || "",
      description_en: agency.description_en || "",
      leader_name: agency.leader_name || "",
      leader_role: agency.leader_role || "",
      opening_hours: agency.opening_hours || "",
      map_lat: agency.map_lat?.toString() || "",
      map_lng: agency.map_lng?.toString() || "",
    });
  };

  const startAdd = () => {
    setAdding(true);
    setEditing(null);
    setForm(emptyForm);
  };

  const closeModal = () => {
    setEditing(null);
    setAdding(false);
  };

  const isModalOpen = adding || editing !== null;

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isModalOpen]);

  const handleSave = () => {
    if (editing) {
      saveMutation.mutate({ id: editing, ...form });
    } else {
      saveMutation.mutate(form);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Agenturen</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Verwalten Sie die Agentur-Standorte.</p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Neue Agentur
        </button>
      </div>

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : (
        <div className="space-y-4">
          {agencies?.map((agency, idx) => (
            <div key={agency.id} className="bg-card border rounded-xl overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {/* Thumbnail */}
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  {agency.image_url ? (
                    <img src={agency.image_url} alt={agency.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">—</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm font-semibold text-foreground">{agency.name}</h3>
                  <p className="font-body text-xs text-muted-foreground truncate">{agency.address || "Keine Adresse"}</p>
                </div>

                {/* Member count */}
                <span
                  title="Anzahl Mitarbeiter"
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded"
                >
                  <Users size={12} />
                  {memberCounts?.[agency.id] ?? 0}
                </span>

                {/* Status */}
                <span className={`font-body text-xs px-2 py-1 rounded ${agency.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {agency.active ? "Aktiv" : "Inaktiv"}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveMutation.mutate({ id: agency.id, direction: "up" })} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-1"><ChevronUp size={14} /></button>
                  <button onClick={() => moveMutation.mutate({ id: agency.id, direction: "down" })} disabled={idx === (agencies?.length || 0) - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-1"><ChevronDown size={14} /></button>
                  <label className="text-muted-foreground hover:text-foreground cursor-pointer p-1">
                    <Upload size={14} />
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(agency.id, e)} className="hidden" disabled={uploading === agency.id} />
                  </label>
                  <button onClick={() => startEdit(agency)} className="text-muted-foreground hover:text-foreground p-1"><Pencil size={14} /></button>
                  <button onClick={() => deleteMutation.mutate(agency.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-card border rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
              <h3 className="font-heading text-base font-semibold text-foreground">
                {adding ? "Neue Agentur" : "Agentur bearbeiten"}
              </h3>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="z.B. rothenburg" className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Telefon</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">E-Mail</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Agenturleiter Name</label>
                  <input value={form.leader_name} onChange={(e) => setForm({ ...form, leader_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Agenturleiter Rolle</label>
                  <input value={form.leader_role} onChange={(e) => setForm({ ...form, leader_role: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Breitengrad (Lat)</label>
                  <input value={form.map_lat} onChange={(e) => setForm({ ...form, map_lat: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Längengrad (Lng)</label>
                  <input value={form.map_lng} onChange={(e) => setForm({ ...form, map_lng: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Adresse</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Öffnungszeiten</label>
                <textarea value={form.opening_hours} onChange={(e) => setForm({ ...form, opening_hours: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
              </div>

              <div className="space-y-3 pt-2 border-t">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Beschreibungen</p>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Deutsch</label>
                  <textarea value={form.description_de} onChange={(e) => setForm({ ...form, description_de: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Französisch</label>
                  <textarea value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Italienisch</label>
                  <textarea value={form.description_it} onChange={(e) => setForm({ ...form, description_it: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Englisch</label>
                  <textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t shrink-0 bg-muted/30">
              <button
                onClick={closeModal}
                className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {saveMutation.isPending ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgencies;
