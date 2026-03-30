import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Upload, Check, FileImage, FileVideo, File, Search, FolderOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface MediaFile {
  name: string;
  id: string;
  url: string;
  metadata: {
    size: number;
    mimetype: string;
  };
  created_at: string;
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  accept?: "image" | "video" | "all";
  title?: string;
}

const formatBytes = (bytes: number) => {
  if (!bytes) return "–";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

const getFileIcon = (mime: string) => {
  if (mime?.startsWith("image")) return <FileImage size={16} className="text-primary" />;
  if (mime?.startsWith("video")) return <FileVideo size={16} className="text-primary" />;
  return <File size={16} className="text-muted-foreground" />;
};

const MediaPickerModal = ({ open, onClose, onSelect, accept = "all", title = "Medien auswählen" }: MediaPickerModalProps) => {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileInfo, setUploadFileInfo] = useState<{ size: number; type: string; width?: number; height?: number } | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "image" | "video" | "other">("all");

  useEffect(() => {
    if (open) {
      loadFiles();
      setSelectedUrl(null);
      setUploadProgress(null);
      setUploadFileInfo(null);
    }
  }, [open]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      // List all folders and files recursively
      const folders = ["slider", "heroes", "team", "agencies", "career-thumbs", "career-videos", "media"];
      const allFiles: MediaFile[] = [];

      const results = await Promise.all(
        folders.map((folder) =>
          supabase.storage.from("site-images").list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } })
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
              id: file.id || path,
              url: publicUrl,
              metadata: {
                size: (file.metadata as any)?.size || 0,
                mimetype: (file.metadata as any)?.mimetype || "",
              },
              created_at: file.created_at || "",
            });
          });
        }
      });

      // Sort by date desc
      allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setFiles(allFiles);
    } catch (err: any) {
      toast.error("Fehler beim Laden: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(img.src); };
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (file: File) => {
    setUploadFileName(file.name);
    const info: { size: number; type: string; width?: number; height?: number } = { size: file.size, type: file.type };

    if (file.type.startsWith("image")) {
      const dims = await getImageDimensions(file);
      info.width = dims.width;
      info.height = dims.height;
    }
    setUploadFileInfo(info);
    setUploadProgress(0);

    // Use XMLHttpRequest for real progress
    const ext = file.name.split(".").pop();
    const path = `media/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Nicht angemeldet");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/site-images/${path}`;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
        xhr.setRequestHeader("x-upsert", "true");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload fehlgeschlagen (${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error("Netzwerkfehler"));
        xhr.send(file);
      });

      const { data: { publicUrl } } = supabase.storage.from("site-images").getPublicUrl(path);
      setUploadProgress(100);
      toast.success("Hochgeladen!");

      // Auto-select the uploaded file
      setSelectedUrl(publicUrl);
      // Refresh library
      await loadFiles();
    } catch (err: any) {
      toast.error(err.message);
      setUploadProgress(null);
    }
  };

  const acceptStr = accept === "image" ? "image/*" : accept === "video" ? "video/*" : "*/*";

  const filteredFiles = files.filter((f) => {
    const mime = f.metadata.mimetype || "";
    if (accept === "image" && !mime.startsWith("image")) return false;
    if (accept === "video" && !mime.startsWith("video")) return false;
    if (filter === "image" && !mime.startsWith("image")) return false;
    if (filter === "video" && !mime.startsWith("video")) return false;
    if (filter === "other" && (mime.startsWith("image") || mime.startsWith("video"))) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border rounded-2xl w-[900px] max-h-[80vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setTab("library")}
            className={`flex items-center gap-2 px-5 py-3 font-body text-sm font-medium border-b-2 transition-colors ${
              tab === "library" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderOpen size={16} /> Mediathek
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`flex items-center gap-2 px-5 py-3 font-body text-sm font-medium border-b-2 transition-colors ${
              tab === "upload" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload size={16} /> Neues hochladen
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {tab === "library" && (
            <div>
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
                {accept === "all" && (
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
                )}
              </div>

              {loading ? (
                <p className="font-body text-sm text-muted-foreground text-center py-8">Laden...</p>
              ) : filteredFiles.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground text-center py-8">Keine Dateien gefunden</p>
              ) : (
                <div className="grid grid-cols-4 gap-3 max-h-[400px] overflow-auto">
                  {filteredFiles.map((file) => {
                    const isImage = file.metadata.mimetype?.startsWith("image");
                    const isVideo = file.metadata.mimetype?.startsWith("video");
                    const isSelected = selectedUrl === file.url;
                    return (
                      <button
                        key={file.id}
                        onClick={() => setSelectedUrl(file.url)}
                        className={`group relative aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-all hover:shadow-md ${
                          isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                        }`}
                      >
                        {isImage ? (
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        ) : isVideo ? (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                            <FileVideo size={28} />
                            <span className="font-body text-[10px] truncate max-w-[90%]">{file.name}</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                            <File size={28} />
                            <span className="font-body text-[10px] truncate max-w-[90%]">{file.name}</span>
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                            <Check size={12} />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-foreground/70 px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="font-body text-[9px] text-primary-foreground truncate">{file.name}</p>
                          <p className="font-body text-[8px] text-primary-foreground/70">{formatBytes(file.metadata.size)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "upload" && (
            <div>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-12 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                <Upload size={32} className="text-muted-foreground mb-3" />
                <span className="font-body text-sm text-foreground font-medium">Datei auswählen</span>
                <span className="font-body text-xs text-muted-foreground mt-1">
                  {accept === "image" ? "JPG, PNG, WebP" : accept === "video" ? "MP4, WebM, MOV" : "Alle Dateitypen"}
                </span>
                <input
                  type="file"
                  accept={acceptStr}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleUpload(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
              </label>

              {uploadFileInfo && (
                <div className="mt-4 bg-muted/50 border border-border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    {getFileIcon(uploadFileInfo.type)}
                    <span className="font-body text-sm font-medium text-foreground">{uploadFileName}</span>
                    {uploadProgress === 100 && <Check size={16} className="text-primary ml-auto" />}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 font-body text-xs text-muted-foreground">
                    <span>Format: <strong className="text-foreground">{uploadFileName.split(".").pop()?.toUpperCase()}</strong></span>
                    <span>Grösse: <strong className="text-foreground">{formatBytes(uploadFileInfo.size)}</strong></span>
                    <span>MIME: <strong className="text-foreground">{uploadFileInfo.type}</strong></span>
                    {uploadFileInfo.width && uploadFileInfo.height && (
                      <span>Auflösung: <strong className="text-foreground">{uploadFileInfo.width} × {uploadFileInfo.height} px</strong></span>
                    )}
                  </div>
                  {uploadProgress !== null && (
                    <div>
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="font-body text-[10px] text-muted-foreground mt-1">
                        {uploadProgress === 100 ? "Upload abgeschlossen ✓" : `${uploadProgress}%`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t bg-muted/30">
          <p className="font-body text-xs text-muted-foreground">
            {selectedUrl ? "1 Datei ausgewählt" : "Keine Datei ausgewählt"}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="font-body text-sm text-muted-foreground px-4 py-2 hover:text-foreground">Abbrechen</button>
            <button
              onClick={() => { if (selectedUrl) { onSelect(selectedUrl); onClose(); } }}
              disabled={!selectedUrl}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              <Check size={16} /> Auswählen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPickerModal;
