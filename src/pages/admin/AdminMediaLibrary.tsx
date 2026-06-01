import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, Search, FileImage, FileVideo, File, Check, Download, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
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

  const folders = ["slider", "heroes", "team", "agencies", "career-thumbs", "career-videos", "media"];

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
  };

  const filteredFiles = files.filter((f) => {
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
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") showPrev();
      else if (e.key === "ArrowRight") showNext();
      else if (e.key === "Escape") setPreviewIndex(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previewIndex, filteredFiles.length]);

  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const imageCount = files.filter((f) => f.mimetype.startsWith("image")).length;
  const videoCount = files.filter((f) => f.mimetype.startsWith("video")).length;

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
                  {/* Actions overlay */}
                  <div
                    className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setPreviewIndex(filteredFiles.findIndex((f) => f.path === file.path))}
                      className="bg-card/90 rounded-full p-2 hover:bg-card"
                    >
                      <Eye size={14} className="text-foreground" />
                    </button>
                    <a href={file.url} target="_blank" rel="noreferrer" className="bg-card/90 rounded-full p-2 hover:bg-card">
                      <Download size={14} className="text-foreground" />
                    </a>
                    <button onClick={() => handleDelete(file)} className="bg-card/90 rounded-full p-2 hover:bg-destructive hover:text-destructive-foreground">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 backdrop-blur-sm" onClick={() => setPreviewIndex(null)}>
          <button
            onClick={(e) => { e.stopPropagation(); setPreviewIndex(null); }}
            className="absolute top-4 right-4 bg-card/90 hover:bg-card rounded-full p-2 z-10"
            aria-label="Schliessen"
          >
            <X size={18} />
          </button>
          {filteredFiles.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card rounded-full p-3 z-10"
                aria-label="Vorheriges"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); showNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card rounded-full p-3 z-10"
                aria-label="Nächstes"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {previewFile.mimetype.startsWith("image") ? (
              <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[78vh] rounded-lg object-contain" />
            ) : previewFile.mimetype.startsWith("video") ? (
              <video key={previewFile.path} src={previewFile.url} controls autoPlay className="max-w-full max-h-[78vh] rounded-lg" />
            ) : (
              <div className="bg-card rounded-lg p-12 text-center">
                <File size={48} className="mx-auto text-muted-foreground mb-3" />
                <p className="font-body text-sm text-muted-foreground">Vorschau nicht verfügbar</p>
                <a href={previewFile.url} target="_blank" rel="noreferrer" className="font-body text-sm text-primary underline mt-2 block">Herunterladen</a>
              </div>
            )}
            <div className="bg-card/90 backdrop-blur rounded-lg px-4 py-2 flex items-center gap-4 font-body text-xs">
              <span className="text-foreground font-medium truncate max-w-xs">{previewFile.name}</span>
              <span className="text-muted-foreground">{formatBytes(previewFile.size)}</span>
              <span className="text-muted-foreground">{previewFile.folder}</span>
              <span className="text-muted-foreground">{(previewIndex ?? 0) + 1} / {filteredFiles.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMediaLibrary;
