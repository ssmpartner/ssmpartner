import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Trash2, Upload, Crop, FolderOpen, Search, X, CheckSquare, Square, Pencil, Eye, EyeOff, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import ImageCropModal from "@/components/ImageCropModal";
import MediaPickerModal from "@/components/MediaPickerModal";

const categories = [
  { value: "", label: "Alle" },
  { value: "geschaeftsleitung", label: "Geschäftsleitung" },
  { value: "fachfuehrung", label: "Fachführung" },
  { value: "erweitertes_team", label: "Erweitertes Team" },
  { value: "agentur", label: "Alle Agenturen" },
];

const badgeOptions = [
  { value: "", label: "– Kein Badge –" },
  { value: "verkaufsleiter", label: "Verkaufsleiter" },
  { value: "teamleiter", label: "Teamleiter" },
  { value: "finanzexperte", label: "Finanzexperte" },
  { value: "finanzcoach", label: "Finanzcoach" },
  { value: "finanzcoach_vbv", label: "Finanzcoach VBV" },
  { value: "trainee", label: "Trainee" },
];

const emptyForm = { name: "", role_de: "", role_fr: "", role_it: "", role_en: "", category: "geschaeftsleitung", agency_id: "", is_agency_leader: false, is_recruiting_partner: false, image_url: "", phone: "", email: "", badge: "", user_id: "", active: true };

const AdminTeam = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => (localStorage.getItem("admin-team-view") as "grid" | "list") || "grid");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [cropModal, setCropModal] = useState<{ src: string; memberId?: string } | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState<{ memberId?: string } | null>(null);

  useEffect(() => { localStorage.setItem("admin-team-view", viewMode); }, [viewMode]);

  const { data: agencies } = useQuery({
    queryKey: ["admin-agencies-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agencies").select("id, name").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: members, isLoading } = useQuery({
    queryKey: ["admin-team"],
    queryFn: async () => {
      const { data, error } = await supabase.from("team_members").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: appUsers } = useQuery({
    queryKey: ["admin-users-for-team"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("manage-users", { body: { action: "list" } });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.users as Array<{ id: string; email: string; display_name: string }>;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: typeof form & { id?: string }) => {
      const agencyId = item.agency_id || null;
      const cat = agencyId ? "agentur" : item.category;
      const payload = {
        name: item.name,
        role_de: item.role_de,
        role_fr: item.role_fr,
        role_it: item.role_it,
        role_en: item.role_en,
        category: cat,
        agency_id: agencyId,
        is_agency_leader: item.is_agency_leader,
        is_recruiting_partner: item.is_recruiting_partner,
        image_url: item.image_url || null,
        phone: item.phone || null,
        email: item.email || null,
        badge: item.badge || null,
        user_id: item.user_id || null,
        active: item.active !== false,
      };
      if (item.id) {
        const { error } = await supabase.from("team_members").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("team_members").insert({
          ...payload,
          sort_order: members?.length || 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      setEditingId(null);
      setForm(emptyForm);
      toast.success("Gespeichert");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      toast.success("Gelöscht");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("team_members").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      setSelected([]);
      setBulkDeleteOpen(false);
      toast.success("Gelöscht");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const bulkActiveMutation = useMutation({
    mutationFn: async ({ ids, active }: { ids: string[]; active: boolean }) => {
      const { error } = await supabase.from("team_members").update({ active }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      setSelected([]);
      toast.success("Status aktualisiert");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleFileSelect = (file: File, memberId?: string) => {
    const reader = new FileReader();
    reader.onload = () => setCropModal({ src: reader.result as string, memberId });
    reader.readAsDataURL(file);
  };

  const handleCroppedUpload = async (blob: Blob, memberId?: string) => {
    setUploading(true);
    setCropModal(null);
    try {
      const id = memberId || "new-" + Date.now();
      const path = `team/${id}-${Date.now()}.jpg`;
      const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
      const { error: uploadError } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);

      if (memberId) {
        const { error } = await supabase.from("team_members").update({ image_url: publicUrl }).eq("id", memberId);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ["admin-team"] });
        toast.success("Foto hochgeladen");
      } else {
        setForm((prev) => ({ ...prev, image_url: publicUrl }));
        toast.success("Foto hochgeladen — bitte speichern");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleMediaSelect = (url: string, memberId?: string) => {
    setCropModal({ src: url, memberId });
    setMediaPickerOpen(null);
  };

  const handleRecrop = (imageUrl: string, memberId: string) => {
    setCropModal({ src: imageUrl, memberId });
  };

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      role_de: m.role_de || "",
      role_fr: m.role_fr || "",
      role_it: m.role_it || "",
      role_en: m.role_en || "",
      category: m.category || "geschaeftsleitung",
      agency_id: m.agency_id || "",
      is_agency_leader: m.is_agency_leader || false,
      is_recruiting_partner: m.is_recruiting_partner || false,
      image_url: m.image_url || "",
      phone: m.phone || "",
      email: m.email || "",
      badge: m.badge || "",
      user_id: m.user_id || "",
      active: m.active !== false,
    });
  };

  const filteredMembers = members?.filter((m) => {
    // Category filter
    if (filter) {
      if (filter === "agentur") {
        if (m.category !== "agentur") return false;
      } else if (filter.startsWith("agency-")) {
        const agencyId = filter.replace("agency-", "");
        if (!(m.category === "agentur" && (m as any).agency_id === agencyId)) return false;
      } else if (m.category !== filter) {
        return false;
      }
    }
    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = [m.name, m.role_de, m.email, m.phone].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const allVisibleSelected = !!filteredMembers?.length && filteredMembers.every((m) => selected.includes(m.id));
  const toggleSelectAll = () => {
    if (!filteredMembers) return;
    if (allVisibleSelected) setSelected((p) => p.filter((id) => !filteredMembers.some((m) => m.id === id)));
    else setSelected((p) => Array.from(new Set([...p, ...filteredMembers.map((m) => m.id)])));
  };
  const toggleSelect = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  // Close edit modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditingId(null);
    };
    if (editingId) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingId]);

  const inputClass = "w-full bg-background border border-border px-3 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring";

  const isModalOpen = !!editingId;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Team</h1>
        <button
          onClick={() => { setEditingId("new"); setForm(emptyForm); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90"
        >
          <Plus size={18} /> Mitglied hinzufügen
        </button>
      </div>

      {/* Toolbar: search + filter + view toggle on one line */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-background border border-border pl-8 pr-7 font-body text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={12} />
            </button>
          )}
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 bg-background border border-border font-body text-xs px-2.5 pr-7 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring min-w-[160px]"
        >
          {categories.map((c) => {
            const count =
              c.value === ""
                ? members?.length || 0
                : c.value === "agentur"
                ? members?.filter((m) => m.category === "agentur").length || 0
                : members?.filter((m) => m.category === c.value).length || 0;
            return (
              <option key={c.value} value={c.value}>
                {c.label} ({count})
              </option>
            );
          })}
          {agencies && agencies.length > 0 && (
            <optgroup label="Agenturen">
              {agencies.map((a) => {
                const count = members?.filter((m) => m.category === "agentur" && (m as any).agency_id === a.id).length || 0;
                return (
                  <option key={`agency-${a.id}`} value={`agency-${a.id}`}>
                    {a.name} ({count})
                  </option>
                );
              })}
            </optgroup>
          )}
        </select>

        <div className="inline-flex items-center h-9 bg-background border border-border rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center justify-center w-8 h-full rounded-md transition-colors ${
              viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Kachelansicht"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center justify-center w-8 h-full rounded-md transition-colors ${
              viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Listenansicht"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Selection toolbar */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="font-body text-sm font-medium text-foreground">
            {selected.length} ausgewählt
          </span>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <button
              onClick={() => bulkActiveMutation.mutate({ ids: selected, active: true })}
              disabled={bulkActiveMutation.isPending}
              className="inline-flex items-center gap-1.5 bg-card border border-border font-body text-xs px-3 py-1.5 rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <Eye size={12} /> Aktivieren
            </button>
            <button
              onClick={() => bulkActiveMutation.mutate({ ids: selected, active: false })}
              disabled={bulkActiveMutation.isPending}
              className="inline-flex items-center gap-1.5 bg-card border border-border font-body text-xs px-3 py-1.5 rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <EyeOff size={12} /> Deaktivieren
            </button>
            <button
              onClick={() => setBulkDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 bg-destructive text-destructive-foreground font-body text-xs px-3 py-1.5 rounded-lg hover:opacity-90"
            >
              <Trash2 size={12} /> Löschen
            </button>
            <button onClick={() => setSelected([])} className="font-body text-xs text-muted-foreground hover:text-foreground px-2">
              Aufheben
            </button>
          </div>
        </div>
      )}

      {/* Select all bar */}
      {filteredMembers && filteredMembers.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground"
          >
            {allVisibleSelected ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} />}
            {allVisibleSelected ? "Auswahl aufheben" : "Alle auswählen"} ({filteredMembers.length})
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredMembers?.length === 0 && (
            <div className="col-span-full text-center py-12 font-body text-sm text-muted-foreground">
              Keine Teammitglieder gefunden.
            </div>
          )}
          {filteredMembers?.map((m, idx) => {
            const isSel = selected.includes(m.id);
            return (
              <div
                key={m.id}
                className={`bg-card border rounded-lg overflow-hidden transition-all ${
                  isSel ? "ring-2 ring-primary border-primary" : ""
                } ${m.active === false ? "opacity-60" : ""}`}
              >
                <div className="aspect-[4/3] bg-muted relative group">
                  {/* Selection checkbox */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(m.id); }}
                    className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                      isSel
                        ? "bg-primary text-primary-foreground"
                        : "bg-card/90 text-muted-foreground opacity-0 group-hover:opacity-100"
                    }`}
                    title="Auswählen"
                  >
                    {isSel ? <CheckSquare size={14} /> : <Square size={14} />}
                  </button>

                  {m.active === false && (
                    <span className="absolute top-2 right-2 z-10 font-body text-[9px] bg-foreground/70 text-background px-1.5 py-0.5 rounded">
                      Inaktiv
                    </span>
                  )}

                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-heading text-2xl">
                      {m.name.charAt(0)}
                    </div>
                  )}

                  {/* Image action overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer">
                      <span className="font-body text-[10px] text-primary-foreground bg-foreground/80 px-2 py-1 rounded inline-flex items-center gap-1">
                        <Upload size={10} />{uploading ? "..." : "Upload"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileSelect(e.target.files[0], m.id);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <button
                      onClick={() => setMediaPickerOpen({ memberId: m.id })}
                      className="font-body text-[10px] text-primary-foreground bg-foreground/80 px-2 py-1 rounded inline-flex items-center gap-1"
                    >
                      <FolderOpen size={10} />Mediathek
                    </button>
                    {m.image_url && (
                      <button
                        onClick={() => handleRecrop(m.image_url!, m.id)}
                        className="font-body text-[10px] text-primary-foreground bg-foreground/80 px-2 py-1 rounded inline-flex items-center gap-1"
                      >
                        <Crop size={10} />Crop
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-2.5 flex items-center justify-between gap-1">
                  <div onClick={() => startEdit(m)} role="button" className="cursor-pointer min-w-0 flex-1">
                    <h3 className="font-heading text-xs font-semibold text-foreground truncate">{m.name}</h3>
                    <p className="font-body text-[10px] text-muted-foreground truncate">{m.role_de}</p>
                    <span className="font-body text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground mt-0.5 inline-block">
                      {m.category === "fachfuehrung"
                        ? "Fachführung"
                        : m.category === "erweitertes_team"
                        ? "Erw. Team"
                        : m.category === "agentur"
                        ? `${agencies?.find((a) => a.id === (m as any).agency_id)?.name || "Agentur"}${(m as any).is_agency_leader ? " ★" : ""}`
                        : "GL"}
                    </span>
                    {(m as any).badge && (
                      <span className="font-body text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded mt-0.5 inline-block ml-1">
                        {badgeOptions.find(b => b.value === (m as any).badge)?.label || (m as any).badge}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-center shrink-0">
                    <button
                      onClick={() => {
                        if (idx > 0 && filteredMembers) {
                          const prev = filteredMembers[idx - 1];
                          Promise.all([
                            supabase.from("team_members").update({ sort_order: prev.sort_order }).eq("id", m.id),
                            supabase.from("team_members").update({ sort_order: m.sort_order }).eq("id", prev.id),
                          ]).then(() => queryClient.invalidateQueries({ queryKey: ["admin-team"] }));
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground text-xs"
                      title="Nach oben"
                    >▲</button>
                    <button
                      onClick={() => {
                        if (filteredMembers && idx < filteredMembers.length - 1) {
                          const next = filteredMembers[idx + 1];
                          Promise.all([
                            supabase.from("team_members").update({ sort_order: next.sort_order }).eq("id", m.id),
                            supabase.from("team_members").update({ sort_order: m.sort_order }).eq("id", next.id),
                          ]).then(() => queryClient.invalidateQueries({ queryKey: ["admin-team"] }));
                        }
                      }}
                      className="text-muted-foreground hover:text-foreground text-xs"
                      title="Nach unten"
                    >▼</button>
                    <button
                      onClick={() => startEdit(m)}
                      className="text-muted-foreground hover:text-primary"
                      title="Bearbeiten"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => { setDeleteTarget(m); setDeleteConfirm(""); }}
                      className="text-muted-foreground hover:text-destructive"
                      title="Löschen"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
          {filteredMembers?.length === 0 && (
            <div className="text-center py-12 font-body text-sm text-muted-foreground">
              Keine Teammitglieder gefunden.
            </div>
          )}
          {filteredMembers?.map((m) => {
            const isSel = selected.includes(m.id);
            return (
              <div
                key={m.id}
                className={`flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors ${
                  isSel ? "bg-primary/5" : ""
                } ${m.active === false ? "opacity-60" : ""}`}
              >
                <button
                  onClick={() => toggleSelect(m.id)}
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                    isSel ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {isSel ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0">
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-heading text-sm">
                      {m.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div onClick={() => startEdit(m)} role="button" className="cursor-pointer min-w-0 flex-1 grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-4 min-w-0">
                    <h3 className="font-heading text-sm font-semibold text-foreground truncate">{m.name}</h3>
                    <p className="font-body text-xs text-muted-foreground truncate">{m.role_de}</p>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <span className="font-body text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                      {m.category === "fachfuehrung"
                        ? "Fachführung"
                        : m.category === "erweitertes_team"
                        ? "Erw. Team"
                        : m.category === "agentur"
                        ? `${agencies?.find((a) => a.id === (m as any).agency_id)?.name || "Agentur"}${(m as any).is_agency_leader ? " ★" : ""}`
                        : "GL"}
                    </span>
                    {(m as any).badge && (
                      <span className="font-body text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">
                        {badgeOptions.find(b => b.value === (m as any).badge)?.label || (m as any).badge}
                      </span>
                    )}
                  </div>
                  <div className="col-span-3 min-w-0 hidden md:block">
                    <p className="font-body text-xs text-muted-foreground truncate">{m.email || "—"}</p>
                    <p className="font-body text-xs text-muted-foreground truncate">{m.phone || "—"}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    {m.active === false && (
                      <span className="font-body text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Inaktiv</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(m)} className="p-1.5 text-muted-foreground hover:text-primary" title="Bearbeiten">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => { setDeleteTarget(m); setDeleteConfirm(""); }} className="p-1.5 text-muted-foreground hover:text-destructive" title="Löschen">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setEditingId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-card z-10">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {editingId === "new" ? "Neues Teammitglied" : "Teammitglied bearbeiten"}
              </h2>
              <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex gap-4">
                {/* Image preview + upload */}
                <div className="shrink-0">
                  <div className="w-24 h-28 bg-muted rounded-lg overflow-hidden relative group">
                    {form.image_url ? (
                      <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-heading text-2xl">
                        {form.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload size={16} className="text-primary-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file, editingId === "new" ? undefined : editingId!);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex gap-1 mt-1 justify-center">
                    <button
                      type="button"
                      onClick={() => setMediaPickerOpen({ memberId: editingId === "new" ? undefined : editingId! })}
                      className="font-body text-[10px] text-primary hover:underline"
                    >
                      <FolderOpen size={12} className="inline mr-0.5" />Mediathek
                    </button>
                    {form.image_url && (
                      <button
                        type="button"
                        onClick={() => handleRecrop(form.image_url, editingId === "new" ? "new" : editingId!)}
                        className="font-body text-[10px] text-primary hover:underline"
                      >
                        <Crop size={12} className="inline mr-0.5" />Crop
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <label className="font-heading text-xs font-medium text-muted-foreground block mb-1.5">Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-heading text-xs font-medium text-muted-foreground block mb-1.5">Kategorie</label>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, agency_id: "" })} className={inputClass}>
                        <option value="geschaeftsleitung">Geschäftsleitung</option>
                        <option value="fachfuehrung">Fachführung</option>
                        <option value="erweitertes_team">Erweitertes Team</option>
                        <option value="agentur">Agentur-Zuweisung</option>
                      </select>
                    </div>
                    {form.category === "agentur" && (
                      <div>
                        <label className="font-heading text-xs font-medium text-muted-foreground block mb-1.5">Agentur</label>
                        <select value={form.agency_id} onChange={(e) => setForm({ ...form, agency_id: e.target.value })} className={inputClass}>
                          <option value="">– Agentur wählen –</option>
                          {agencies?.map((a) => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
                      <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded border-border" />
                      Aktiv
                    </label>
                    {form.category === "agentur" && (
                      <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
                        <input type="checkbox" checked={form.is_agency_leader} onChange={(e) => setForm({ ...form, is_agency_leader: e.target.checked })} className="rounded border-border" />
                        Agenturleiter/in
                      </label>
                    )}
                    <label className="flex items-center gap-2 font-body text-sm text-foreground cursor-pointer">
                      <input type="checkbox" checked={form.is_recruiting_partner} onChange={(e) => setForm({ ...form, is_recruiting_partner: e.target.checked })} className="rounded border-border" />
                      Recruiting Partner
                    </label>
                  </div>
                  {form.category === "agentur" && (
                    <div>
                      <label className="font-heading text-xs font-medium text-muted-foreground block mb-1.5">Badge</label>
                      <select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className={inputClass}>
                        {badgeOptions.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-heading text-xs font-medium text-muted-foreground block mb-1.5">Telefon</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="font-heading text-xs font-medium text-muted-foreground block mb-1.5">E-Mail</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="font-heading text-xs font-medium text-muted-foreground block mb-1.5">
                  Verknüpfter Benutzer (optional)
                </label>
                <select
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">– Kein Benutzer verknüpft –</option>
                  {appUsers
                    ?.slice()
                    .sort((a, b) => (a.display_name || a.email).localeCompare(b.display_name || b.email))
                    .map((u) => {
                      const taken = members?.find((m: any) => m.user_id === u.id && m.id !== editingId);
                      return (
                        <option key={u.id} value={u.id} disabled={!!taken}>
                          {(u.display_name || u.email)} — {u.email}{taken ? ` (bereits: ${taken.name})` : ""}
                        </option>
                      );
                    })}
                </select>
                <p className="font-body text-[10px] text-muted-foreground mt-1">
                  Verknüpft das Teamprofil mit einem CMS-Benutzerkonto (1:1).
                </p>
              </div>

              <div>
                <label className="font-heading text-xs font-medium text-muted-foreground block mb-1.5">Rollen (mehrsprachig)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Rolle (DE)" value={form.role_de} onChange={(e) => setForm({ ...form, role_de: e.target.value })} className={inputClass} />
                  <input placeholder="Rolle (FR)" value={form.role_fr} onChange={(e) => setForm({ ...form, role_fr: e.target.value })} className={inputClass} />
                  <input placeholder="Rolle (IT)" value={form.role_it} onChange={(e) => setForm({ ...form, role_it: e.target.value })} className={inputClass} />
                  <input placeholder="Rolle (EN)" value={form.role_en} onChange={(e) => setForm({ ...form, role_en: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex items-center justify-between sticky bottom-0 bg-card">
              {editingId !== "new" ? (
                <button
                  onClick={() => {
                    const m = members?.find((x) => x.id === editingId);
                    if (m) { setDeleteTarget(m); setDeleteConfirm(""); setEditingId(null); }
                  }}
                  className="inline-flex items-center gap-1.5 font-body text-sm text-destructive hover:underline"
                >
                  <Trash2 size={14} /> Löschen
                </button>
              ) : <span />}
              <div className="flex gap-2">
                <button onClick={() => setEditingId(null)} className="font-body text-sm text-muted-foreground px-4 py-2">Abbrechen</button>
                <button
                  onClick={() => saveMutation.mutate(editingId === "new" ? form : { ...form, id: editingId! })}
                  disabled={saveMutation.isPending}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  <Save size={16} /> Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal (single) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card border rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 size={18} className="text-destructive" />
                </div>
                <h2 className="font-heading text-lg font-semibold text-foreground">Teammitglied löschen</h2>
              </div>
              <p className="font-body text-sm text-muted-foreground">
                Diese Aktion kann nicht rückgängig gemacht werden.
                <span className="font-semibold text-foreground"> {deleteTarget.name}</span> wird unwiderruflich gelöscht.
              </p>
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1.5">
                  Geben Sie zur Bestätigung <span className="font-mono font-semibold text-foreground">LÖSCHEN</span> ein:
                </label>
                <input
                  autoFocus
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="LÖSCHEN"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="font-body text-sm text-muted-foreground px-4 py-2">Abbrechen</button>
              <button
                disabled={deleteConfirm !== "LÖSCHEN" || deleteMutation.isPending}
                onClick={() => {
                  deleteMutation.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }}
                className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground font-body text-sm px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} /> Endgültig löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirmation */}
      {bulkDeleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={() => setBulkDeleteOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card border rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 size={18} className="text-destructive" />
                </div>
                <h2 className="font-heading text-lg font-semibold text-foreground">{selected.length} Mitglieder löschen</h2>
              </div>
              <p className="font-body text-sm text-muted-foreground">
                Diese Aktion kann nicht rückgängig gemacht werden. Es werden <span className="font-semibold text-foreground">{selected.length}</span> Teammitglieder unwiderruflich gelöscht.
              </p>
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1.5">
                  Geben Sie zur Bestätigung <span className="font-mono font-semibold text-foreground">LÖSCHEN</span> ein:
                </label>
                <input
                  autoFocus
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="LÖSCHEN"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button onClick={() => { setBulkDeleteOpen(false); setDeleteConfirm(""); }} className="font-body text-sm text-muted-foreground px-4 py-2">Abbrechen</button>
              <button
                disabled={deleteConfirm !== "LÖSCHEN" || bulkDeleteMutation.isPending}
                onClick={() => bulkDeleteMutation.mutate(selected)}
                className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground font-body text-sm px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} /> Endgültig löschen
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageCropModal
        open={!!cropModal}
        imageSrc={cropModal?.src || ""}
        aspect={3 / 4}
        onClose={() => setCropModal(null)}
        onCropDone={(blob) => handleCroppedUpload(blob, cropModal?.memberId)}
      />

      <MediaPickerModal
        open={!!mediaPickerOpen}
        onClose={() => setMediaPickerOpen(null)}
        onSelect={(url) => handleMediaSelect(url, mediaPickerOpen?.memberId)}
        accept="image"
        title="Teamfoto aus Mediathek wählen"
      />
    </div>
  );
};

export default AdminTeam;
