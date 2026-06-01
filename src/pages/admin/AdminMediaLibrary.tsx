import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, Search, FileImage, FileVideo, File, Check, Download, Eye, X, ChevronLeft, ChevronRight, Pencil, Archive, ArchiveRestore, Calendar, HardDrive, Folder, Copy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface MediaFile {
  name: string;
  folder: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
  created_at: string;
}

const formatBytes = (bytes: number) => {
  if (!bytes) return "–";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

const AdminMediaLibrary = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video" | "other">("all");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileInfo, setUploadFileInfo] = useState<{ size: number; type: string; width?: number; height?: number } | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [busy, setBusy] = useState(false);

  const folders = ["slider", "heroes", "team", "agencies", "career-thumbs", "career-videos", "media", "archive"];

  useEffect(() => { loadFiles(); }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const allFiles: MediaFile[] = [];
      const results = await Promise.all(
        folders.map((folder) =>
          supabase.storage.from("site-images").list(folder, { limit: 500, sortBy: { column: "created_at", order: "desc" } })
        )
      );

      results.forEach((result, i) => {
        if (result.data) {
          result.data.forEach((file) => {
            if (file.name === ".emptyFolderPlaceholder") return;
            const path = `${folders[i]}/${file.name}`;
            const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);
            allFiles.push({
              name: file.name,
              folder: folders[i],
              path,
              url: publicUrl,
              size: (file.metadata as any)?.size || 0,
              mimetype: (file.metadata as any)?.mimetype || "",
              created_at: file.created_at || "",
            });
          });
        }
      });

      allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setFiles(allFiles);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: globalThis.File) => {
    setUploadFileName(file.name);
    const info: { size: number; type: string; width?: number; height?: number } = { size: file.size, type: file.type };

    if (file.type.startsWith("image")) {
      const dims = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(img.src); };
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = URL.createObjectURL(file);
      });
      info.width = dims.width;
      info.height = dims.height;
    }
    setUploadFileInfo(info);
    setUploadProgress(0);

    try {
      const ext = file.name.split(".").pop();
      const path = `media/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Nicht angemeldet");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/site-images/${path}`;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
        xhr.setRequestHeader("x-upsert", "true");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload fehlgeschlagen (${xhr.status})`));
        xhr.onerror = () => reject(new Error("Netzwerkfehler"));
        xhr.send(file);
      });

      setUploadProgress(100);
      toast.success("Hochgeladen!");
      await loadFiles();
    } catch (err: any) {
      toast.error(err.message);
      setUploadProgress(null);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`"${file.name}" wirklich löschen?`)) return;
    const { error } = await supabase.storage.from("site-images").remove([file.path]);
    if (error) { toast.error(error.message); return; }
    toast.success("Gelöscht");
    setFiles((prev) => prev.filter((f) => f.path !== file.path));
    setPreviewIndex(null);
  };

  const handleRename = async (file: MediaFile, newName: string) => {
    const clean = newName.trim().replace(/[/\\]/g, "-");
    if (!clean || clean === file.name) { setRenaming(false); return; }
    setBusy(true);
    const newPath = `${file.folder}/${clean}`;
    const { error } = await supabase.storage.from("site-images").move(file.path, newPath);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Umbenannt");
    setRenaming(false);
    await loadFiles();
  };

  const handleArchive = async (file: MediaFile) => {
    setBusy(true);
    const isArchived = file.folder === "archive";
    const newPath = isArchived
      ? `media/${file.name}`
      : `archive/${file.folder}__${file.name}`;
    const { error } = await supabase.storage.from("site-images").move(file.path, newPath);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isArchived ? "Wiederhergestellt" : "Archiviert");
    await loadFiles();
    setPreviewIndex(null);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => toast.success("URL kopiert"));
  };

  const filteredFiles = files.filter((f) => {
    const isArchived = f.folder === "archive";
    if (showArchive ? !isArchived : isArchived) return false;
    if (filter === "image" && !f.mimetype.startsWith("image")) return false;
    if (filter === "video" && !f.mimetype.startsWith("video")) return false;
    if (filter === "other" && (f.mimetype.startsWith("image") || f.mimetype.startsWith("video"))) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const previewFile = previewIndex !== null ? filteredFiles[previewIndex] : null;
  const showPrev = () => {
    if (previewIndex === null || filteredFiles.length === 0) return;
    setPreviewIndex((previewIndex - 1 + filteredFiles.length) % filteredFiles.length);
  };
  const showNext = () => {
    if (previewIndex === null || filteredFiles.length === 0) return;
    setPreviewIndex((previewIndex + 1) % filteredFiles.length);
  };

  useEffect(() => {
    if (previewIndex === null) return;
    setRenaming(false);
    const handler = (e: KeyboardEvent) => {
      if (renaming) return;
      if (e.key === "ArrowLeft") showPrev();
      else if (e.key === "ArrowRight") showNext();
      else if (e.key === "Escape") setPreviewIndex(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previewIndex, filteredFiles.length, renaming]);

  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const activeFiles = files.filter((f) => f.folder !== "archive");
  const imageCount = activeFiles.filter((f) => f.mimetype.startsWith("image")).length;
  const videoCount = activeFiles.filter((f) => f.mimetype.startsWith("video")).length;
  const archiveCount = files.filter((f) => f.folder === "archive").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Mediathek</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Alle hochgeladenen Dateien verwalten</p>
        </div>
        <label className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 cursor-pointer">
          <Upload size={18} /> Hochladen
          <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); e.target.value = ""; }} />
        </label>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Gesamt", value: files.length },
          { label: "Bilder", value: imageCount },
          { label: "Videos", value: videoCount },
          { label: "Speicher", value: formatBytes(totalSize) },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-lg p-4">
            <p className="font-body text-xs text-muted-foreground">{s.label}</p>
            <p className="font-heading text-xl font-semibold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Upload progress */}
      {uploadFileInfo && uploadProgress !== null && uploadProgress < 100 && (
        <div className="mb-4 bg-muted/50 border border-border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <FileImage size={14} className="text-primary" />
            <span className="font-body text-sm font-medium text-foreground">{uploadFileName}</span>
          </div>
          <div className="flex gap-4 font-body text-xs text-muted-foreground">
            <span>{uploadFileName.split(".").pop()?.toUpperCase()}</span>
            <span>{formatBytes(uploadFileInfo.size)}</span>
            {uploadFileInfo.width && <span>{uploadFileInfo.width} × {uploadFileInfo.height} px</span>}
          </div>
          <Progress value={uploadProgress} className="h-2" />
          <p className="font-body text-[10px] text-muted-foreground">{uploadProgress}%</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Datei suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border pl-9 pr-3 py-2 font-body text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "image", "video", "other"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg font-body text-xs font-medium transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Alle" : f === "image" ? "Bilder" : f === "video" ? "Videos" : "Andere"}
            </button>
          ))}
          <button
            onClick={() => setShowArchive((v) => !v)}
            className={`px-3 py-2 rounded-lg font-body text-xs font-medium transition-colors inline-flex items-center gap-1.5 ml-2 ${
              showArchive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Archive size={12} /> Archiv {archiveCount > 0 && `(${archiveCount})`}
          </button>
        </div>
      </div>

      {/* File grid */}
      {loading ? (
        <p className="font-body text-sm text-muted-foreground text-center py-12">Laden...</p>
      ) : filteredFiles.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground text-center py-12">Keine Dateien gefunden</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredFiles.map((file) => {
            const isImage = file.mimetype.startsWith("image");
            const isVideo = file.mimetype.startsWith("video");
            return (
              <div key={file.path} className="group bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div
                  className="aspect-square bg-muted relative cursor-pointer"
                  onClick={() => setPreviewIndex(filteredFiles.findIndex((f) => f.path === file.path))}
                >
                  {isImage ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : isVideo ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                      <FileVideo size={28} />
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                      <File size={28} />
                    </div>
                  )}
                  {/* Actions overlay (bubbles click to parent for preview) */}
                  <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-card/90 rounded-full p-2 hover:bg-card pointer-events-auto"
                    >
                      <Download size={14} className="text-foreground" />
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                      className="bg-card/90 rounded-full p-2 hover:bg-destructive hover:text-destructive-foreground pointer-events-auto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="font-body text-[10px] text-foreground truncate">{file.name}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-body text-[9px] text-muted-foreground">{formatBytes(file.size)}</span>
                    <span className="font-body text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{file.folder}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 backdrop-blur-sm p-6" onClick={() => setPreviewIndex(null)}>
          {/* Window */}
          <div
            className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Window title bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
              <span className="font-body text-[10px] text-muted-foreground tabular-nums w-16">
                {(previewIndex ?? 0) + 1} / {filteredFiles.length}
              </span>
              <div className="flex-1 text-center min-w-0">
                {renaming ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRename(previewFile, renameValue)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(previewFile, renameValue);
                      if (e.key === "Escape") setRenaming(false);
                    }}
                    className="font-body text-xs text-foreground bg-background border border-border rounded px-2 py-0.5 w-2/3 text-center focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                ) : (
                  <button
                    onClick={() => { setRenameValue(previewFile.name); setRenaming(true); }}
                    className="font-body text-xs text-foreground truncate inline-flex items-center gap-1.5 hover:text-primary group"
                    title="Umbenennen"
                  >
                    {previewFile.name}
                    <Pencil size={11} className="opacity-0 group-hover:opacity-60" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setPreviewIndex(null)}
                className="w-7 h-7 rounded-md hover:bg-muted-foreground/10 inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Schliessen"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body: preview + sidebar */}
            <div className="flex flex-1 min-h-0">
              <div className="flex-1 bg-muted/30 flex items-center justify-center p-6 min-h-0 overflow-auto relative">
                {filteredFiles.length > 1 && (
                  <>
                    <button
                      onClick={showPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card border border-border rounded-full p-2 shadow-md z-10"
                      aria-label="Vorheriges"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={showNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card border border-border rounded-full p-2 shadow-md z-10"
                      aria-label="Nächstes"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
                {previewFile.mimetype.startsWith("image") ? (
                  <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-full object-contain rounded" />
                ) : previewFile.mimetype.startsWith("video") ? (
                  <video key={previewFile.path} src={previewFile.url} controls autoPlay className="max-w-full max-h-full rounded" />
                ) : (
                  <div className="text-center">
                    <File size={48} className="mx-auto text-muted-foreground mb-3" />
                    <p className="font-body text-sm text-muted-foreground">Vorschau nicht verfügbar</p>
                  </div>
                )}
              </div>

              <aside className="w-64 border-l border-border bg-card flex flex-col">
                <div className="p-4 space-y-3 flex-1 overflow-auto">
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Details</p>
                    <div className="space-y-2 font-body text-xs">
                      <div className="flex items-center gap-2 text-foreground">
                        <Folder size={12} className="text-muted-foreground" />
                        <span className="capitalize">{previewFile.folder}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <HardDrive size={12} className="text-muted-foreground" />
                        <span>{formatBytes(previewFile.size)}</span>
                      </div>
                      {previewFile.created_at && (
                        <div className="flex items-center gap-2 text-foreground">
                          <Calendar size={12} className="text-muted-foreground" />
                          <span>{new Date(previewFile.created_at).toLocaleDateString("de-CH")}</span>
                        </div>
                      )}
                      <div className="text-muted-foreground text-[11px]">{previewFile.mimetype || "–"}</div>
                    </div>
                  </div>

                  <div>
                    <p className="font-body text-[10px] uppercase tracking-wide text-muted-foreground mb-1">URL</p>
                    <button
                      onClick={() => copyUrl(previewFile.url)}
                      className="w-full flex items-center gap-2 bg-muted/60 hover:bg-muted text-foreground rounded-md px-2 py-1.5 font-body text-[11px] truncate"
                    >
                      <Copy size={12} className="shrink-0" />
                      <span className="truncate">{previewFile.url}</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-border p-3 space-y-1.5">
                  <button
                    onClick={() => { setRenameValue(previewFile.name); setRenaming(true); }}
                    disabled={busy}
                    className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md bg-muted/60 hover:bg-muted font-body text-xs text-foreground disabled:opacity-50"
                  >
                    <Pencil size={13} /> Umbenennen
                  </button>
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md bg-muted/60 hover:bg-muted font-body text-xs text-foreground"
                  >
                    <Download size={13} /> Herunterladen
                  </a>
                  <button
                    onClick={() => handleArchive(previewFile)}
                    disabled={busy}
                    className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md bg-muted/60 hover:bg-muted font-body text-xs text-foreground disabled:opacity-50"
                  >
                    {previewFile.folder === "archive" ? <><ArchiveRestore size={13} /> Wiederherstellen</> : <><Archive size={13} /> Archivieren</>}
                  </button>
                  <button
                    onClick={() => handleDelete(previewFile)}
                    disabled={busy}
                    className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground text-destructive font-body text-xs disabled:opacity-50"
                  >
                    <Trash2 size={13} /> Löschen
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMediaLibrary;
