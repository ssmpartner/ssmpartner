import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Trash2, ChevronRight, ChevronDown, Clock, Globe } from "lucide-react";
import { toast } from "sonner";

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
      if (expandedId) setExpandedId(null);
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
        <div className="space-y-2">
          {sessions.map((session) => (
            <div key={session.id} className="bg-card border rounded-xl overflow-hidden">
              {/* Session header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
              >
                {expandedId === session.id ? (
                  <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-body text-xs px-2 py-0.5 rounded-full ${
                      session.source === "onlinecheck"
                        ? "bg-accent/10 text-accent-foreground"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {sourceLabel(session.source)}
                    </span>
                    {session.page_url && (
                      <span className="font-body text-xs text-muted-foreground flex items-center gap-1">
                        <Globe size={10} />
                        {session.page_url}
                      </span>
                    )}
                  </div>
                </div>

                <span className="font-body text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                  <Clock size={12} />
                  {formatDate(session.created_at)}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Chat-Verlauf endgültig löschen?")) {
                      deleteMutation.mutate(session.id);
                    }
                  }}
                  className="text-muted-foreground hover:text-destructive shrink-0 ml-2"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Expanded messages */}
              {expandedId === session.id && (
                <div className="border-t px-4 py-4 space-y-3 bg-muted/20 max-h-[500px] overflow-y-auto">
                  {!messages?.length ? (
                    <p className="font-body text-xs text-muted-foreground italic">Keine Nachrichten gespeichert.</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border"
                          }`}
                        >
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChatLogs;
