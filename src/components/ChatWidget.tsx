import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const quickActions = [
  { label: "Stelle suchen", message: "Ich suche eine neue Stelle. Was bietet ihr an?" },
  { label: "Agentur finden", message: "Welche Agentur ist in meiner Nähe?" },
  { label: "Kontakt aufnehmen", message: "Wie kann ich euch kontaktieren?" },
];

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Fehler" }));
        setMessages(prev => [...prev, { role: "assistant", content: err.error || "Entschuldigung, es ist ein Fehler aufgetreten." }]);
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Entschuldigung, der Chat ist momentan nicht verfügbar." }]);
    }
    setIsLoading(false);
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith("/")) {
      navigate(href);
      setOpen(false);
    } else {
      window.open(href, "_blank");
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#243e3a] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow"
            aria-label="Chat öffnen"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#243e3a] text-white">
              <div>
                <p className="font-heading text-sm font-bold">SSM Partner Assistent</p>
                <p className="text-xs text-white/70">Wir helfen Ihnen gerne</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2">
                    <p className="text-sm text-foreground">
                      Willkommen bei SSM Partner! 👋 Wie kann ich Ihnen helfen?
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((qa) => (
                      <button
                        key={qa.label}
                        onClick={() => sendMessage(qa.message)}
                        className="flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full border border-[#B3B69C] text-[#243e3a] hover:bg-[#B3B69C]/10 transition-colors"
                      >
                        {qa.label}
                        <ArrowRight size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm font-body ${
                      msg.role === "user"
                        ? "bg-[#243e3a] text-white rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => (
                            <button
                              onClick={() => href && handleLinkClick(href)}
                              className="text-[#243e3a] underline font-semibold hover:text-[#B3B69C] transition-colors"
                            >
                              {children}
                            </button>
                          ),
                          p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-xl rounded-bl-sm px-3 py-2">
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex items-center gap-2 p-3 border-t"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nachricht eingeben..."
                className="flex-1 text-sm font-body bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[#B3B69C] text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-lg bg-[#243e3a] text-white disabled:opacity-40 hover:bg-[#243e3a]/90 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
