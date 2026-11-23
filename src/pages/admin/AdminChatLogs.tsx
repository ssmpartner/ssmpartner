import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Trash2, Clock, Globe } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ChatMessage {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  source: string;
  page_url: string | null;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

const AdminChatLogs = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["admin-chat-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as ChatSession[];
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["admin-chat-messages", expandedId],
    queryFn: async () => {
      if (!expandedId) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", expandedId)
        .order("created_at");
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!expandedId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-sessions"] });
      setExpandedId(null);
      toast.success("Chat-Verlauf gelöscht");
    },
  });

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("de-CH", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatDay = (d: string) =>
    new Date(d).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });

  const selected = sessions?.find((s) => s.id === expandedId) ?? null;

  const sourceLabel = (s: string) => {
    switch (s) {
      case "onlinecheck": return "Online-Beratung";
      default: return "Website-Chat";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Chat-Verläufe</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Alle Gespräche aus dem KI-Chat – zur Analyse und Verbesserung der Wissensbasis.
          </p>
        </div>
        <span className="font-body text-sm text-muted-foreground">
          {sessions?.length || 0} Gespräche
        </span>
      </div>

      {isLoading ? (
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      ) : !sessions?.length ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <MessageSquare size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="font-body text-sm text-muted-foreground">Noch keine Chat-Verläufe vorhanden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,420px)_1fr] gap-4 items-start">
          {/* Liste */}
          <div className="space-y-2 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto pr-1">
            {sessions.map((session) => {
              const active = expandedId === session.id;
              return (
                <div
                  key={session.id}
                  onClick={() => setExpandedId(session.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                    active ? "bg-primary/10 border-primary" : "bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className={`font-body text-xs px-2 py-0.5 rounded-full ${
                      session.source === "onlinecheck" ? "bg-accent/10 text-accent-foreground" : "bg-primary/10 text-primary"
                    }`}>
                      {sourceLabel(session.source)}
                    </span>
                    {session.page_url && (
                      <p className="font-body text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                        <Globe size={10} className="shrink-0" />
                        <span className="truncate">{session.page_url}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-body text-xs font-semibold text-foreground">{formatDay(session.created_at)}</p>
                    <p className="font-body text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock size={10} /> {formatTime(session.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail */}
          <div className="bg-card border rounded-xl lg:sticky lg:top-4 flex flex-col lg:max-h-[calc(100vh-200px)]">
            {!selected ? (
              <div className="p-12 text-center">
                <MessageSquare size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="font-body text-sm text-muted-foreground">Gespräch links auswählen, um den ganzen Chat zu sehen.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold text-foreground">{sourceLabel(selected.source)}</p>
                    <p className="font-body text-xs text-muted-foreground">
                      {formatDate(selected.created_at)} · {messages?.length || 0} Nachrichten
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteId(selected.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    aria-label="Chat löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="px-4 py-4 space-y-3 bg-muted/20 overflow-y-auto flex-1 min-h-[300px]">
                  {!messages?.length ? (
                    <p className="font-body text-xs text-muted-foreground italic">Keine Nachrichten gespeichert.</p>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                          msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                        }`}>
                          <p className="font-body text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`font-body text-[10px] mt-1 ${
                            msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                          }`}>
                            {formatDate(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chat-Verlauf löschen?</AlertDialogTitle>
            <AlertDialogDescription>Das Gespräch wird gelöscht.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteMutation.mutate(deleteId); setDeleteId(null); }}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminChatLogs;
