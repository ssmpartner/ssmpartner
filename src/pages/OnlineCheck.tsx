import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Volume2, VolumeX, Mic, MicOff, Sparkles, Shield, Car, Home, Scale, Heart, PiggyBank } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageHero from "@/components/PageHero";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

const suggestions = [
  { icon: Shield, label: "Versicherungscheck", message: "Ich möchte meine Versicherungen überprüfen lassen." },
  { icon: Home, label: "Hausratversicherung", message: "Ich brauche Hilfe bei der Hausratversicherung." },
  { icon: Car, label: "Autoversicherung", message: "Ich suche eine gute Autoversicherung." },
  { icon: Scale, label: "Rechtsschutz", message: "Wie funktioniert eine Rechtsschutzversicherung?" },
  { icon: PiggyBank, label: "Vorsorge / 3a", message: "Was sind meine Optionen für die Säule 3a?" },
  { icon: Heart, label: "Krankenkasse", message: "Ich möchte meine Krankenkasse wechseln." },
];

const OnlineCheck = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const playTTS = useCallback(async (text: string) => {
    if (!ttsEnabled) return;
    try {
      // Strip markdown for cleaner TTS
      const cleanText = text.replace(/\[.*?\]\(.*?\)/g, "").replace(/[*_#`]/g, "").trim();
      if (!cleanText) return;
      
      setIsPlayingAudio(true);
      const response = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: cleanText.slice(0, 500) }), // limit length
      });

      if (!response.ok) throw new Error("TTS failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlayingAudio(false);
      await audio.play();
    } catch (e) {
      console.error("TTS error:", e);
      setIsPlayingAudio(false);
    }
  }, [ttsEnabled]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
  }, []);

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

      // Play TTS after stream completes
      if (assistantSoFar && ttsEnabled) {
        playTTS(assistantSoFar);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Entschuldigung, der Service ist momentan nicht verfügbar." }]);
    }
    setIsLoading(false);
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith("/")) {
      navigate(href);
    } else {
      window.open(href, "_blank");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHero pageKey="onlinecheck" fallbackImage="/placeholder.svg" />

      {/* Main Chat Area */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10 pb-8">
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden min-h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Sparkles size={20} className="text-accent" />
              </div>
              <div>
                <h1 className="font-heading text-lg font-bold">SSM Online-Beratung</h1>
                <p className="text-xs opacity-70">KI-gestützte Versicherungsberatung</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { 
                  if (ttsEnabled) stopAudio();
                  setTtsEnabled(!ttsEnabled); 
                }}
                className={`p-2 rounded-lg transition-colors ${ttsEnabled ? "bg-accent/20 text-accent" : "bg-white/10 text-white/60 hover:text-white"}`}
                title={ttsEnabled ? "Sprachausgabe deaktivieren" : "Sprachausgabe aktivieren"}
              >
                {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sparkles size={28} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-foreground">
                    Wie kann ich Ihnen helfen?
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Stellen Sie mir Fragen zu Versicherungen, Vorsorge oder nutzen Sie unseren interaktiven Versicherungscheck.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl">
                  {suggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => sendMessage(s.message)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all text-center group"
                    >
                      <s.icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-foreground">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${msg.role === "user" ? "" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles size={12} className="text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">SSM Berater</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => (
                            <button
                              onClick={() => href && handleLinkClick(href)}
                              className="text-primary underline font-semibold hover:text-accent transition-colors"
                            >
                              {children}
                            </button>
                          ),
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles size={12} className="text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex items-end gap-3 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Stellen Sie Ihre Frage..."
                  rows={1}
                  className="w-full resize-none text-sm bg-muted rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground max-h-32"
                  disabled={isLoading}
                  style={{ minHeight: "44px" }}
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              KI-gestützte Beratung • Ihre Daten werden vertraulich behandelt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineCheck;
