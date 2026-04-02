import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Volume2, VolumeX, Sparkles, Shield, Car, Home, Scale, Heart, PiggyBank, ChevronRight, CheckCircle2, ArrowRight, ArrowLeft, Lock, Award, Clock, Globe, Smartphone, Briefcase } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

/* ─── Chat Overlay Component ─── */
const ChatOverlay = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const playTTS = useCallback(async (text: string) => {
    if (!ttsEnabled) return;
    try {
      const cleanText = text.replace(/\[.*?\]\(.*?\)/g, "").replace(/[*_#`]/g, "").trim();
      if (!cleanText) return;
      const response = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: cleanText.slice(0, 500) }),
      });
      if (!response.ok) throw new Error("TTS failed");
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      await audio.play();
    } catch (e) {
      console.error("TTS error:", e);
    }
  }, [ttsEnabled]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (!chatOpen) setChatOpen(true);
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
        setMessages(prev => [...prev, { role: "assistant", content: err.error || "Entschuldigung, ein Fehler ist aufgetreten." }]);
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
      if (assistantSoFar && ttsEnabled) playTTS(assistantSoFar);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Entschuldigung, der Service ist momentan nicht verfügbar." }]);
    }
    setIsLoading(false);
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith("/")) navigate(href);
    else window.open(href, "_blank");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="relative">
      {/* Chat messages area - expands when conversation starts */}
      <AnimatePresence>
        {chatOpen && messages.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 overflow-hidden"
          >
            <div
              ref={scrollRef}
              className="max-h-[400px] overflow-y-auto space-y-4 p-4 bg-card/80 backdrop-blur-md rounded-2xl border border-border/50"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%]">
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                          <Sparkles size={10} className="text-primary" />
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium">SSM Berater</span>
                      </div>
                    )}
                    <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}>
                      {msg.role === "assistant" ? (
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => (
                              <button onClick={() => href && handleLinkClick(href)} className="text-primary underline font-semibold hover:text-accent transition-colors">
                                {children}
                              </button>
                            ),
                            p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-xl rounded-bl-sm px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <motion.div
        className="relative"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Animated gradient border */}
        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[gradient-shift_4s_ease-in-out_infinite] opacity-80" />
        <div className="relative bg-card rounded-2xl p-3 flex items-end gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles size={16} className="text-primary" />
            </div>
          </div>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Fragen Sie unseren KI-Berater..."
            rows={1}
            className="flex-1 resize-none text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground py-2 max-h-24"
            disabled={isLoading}
          />
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`p-2 rounded-lg transition-colors ${ttsEnabled ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground"}`}
              title={ttsEnabled ? "Sprachausgabe aus" : "Sprachausgabe an"}
            >
              {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Wizard Categories ─── */
const wizardCategories = [
  { id: "hausrat", label: "Hausratversicherung", icon: Home, color: "from-blue-500 to-blue-600", desc: "Schutz für Ihr Zuhause und Hab & Gut" },
  { id: "auto", label: "Autoversicherung", icon: Car, color: "from-emerald-500 to-emerald-600", desc: "Haftpflicht, Teil- & Vollkasko" },
  { id: "rechtsschutz", label: "Rechtsschutz", icon: Scale, color: "from-purple-500 to-purple-600", desc: "Rechtliche Absicherung für alle Fälle" },
  { id: "vorsorge", label: "Vorsorge / Säule 3a", icon: PiggyBank, color: "from-amber-500 to-amber-600", desc: "Steueroptimierte Altersvorsorge" },
  { id: "krankenkasse", label: "Krankenkasse", icon: Heart, color: "from-rose-500 to-rose-600", desc: "Grund- & Zusatzversicherung vergleichen" },
];

/* ─── Insurance Wizard Component ─── */
const InsuranceWizard = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [step, setStep] = useState(0); // 0 = select categories, 1 = form, 2 = done
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", birthDate: "", plz: "", notes: "",
  });

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) return;

    const message = `Versicherungsanfrage für: ${selectedCategories.map(id => wizardCategories.find(c => c.id === id)?.label).join(", ")}\n\nGeburtsdatum: ${formData.birthDate || "k.A."}\nPLZ: ${formData.plz || "k.A."}\nNotizen: ${formData.notes || "Keine"}`;

    try {
      await supabase.from("inquiries").insert({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone || null,
        subject: `Online-Check: ${selectedCategories.join(", ")}`,
        message,
        source: "onlinecheck",
      });
      setStep(2);
    } catch {
      // handle error
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Versicherungs-Check</h2>
              <p className="text-muted-foreground mt-2">Wählen Sie die gewünschten Versicherungen — wir erstellen Ihr persönliches Angebot innert 24 Stunden.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {wizardCategories.map((cat) => {
                const selected = selectedCategories.includes(cat.id);
                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                      selected
                        ? "border-primary bg-primary/5 shadow-lg"
                        : "border-border bg-card hover:border-accent hover:shadow-md"
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 size={20} className="text-primary" />
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3`}>
                      <cat.icon size={22} className="text-white" />
                    </div>
                    <h3 className="font-heading font-bold text-foreground text-sm">{cat.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
                  </motion.button>
                );
              })}
            </div>

            {selectedCategories.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold hover:opacity-90 transition-opacity"
                >
                  Weiter
                  <ArrowRight size={18} />
                </button>
                <p className="text-xs text-muted-foreground mt-2">{selectedCategories.length} Versicherung(en) ausgewählt</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="max-w-2xl mx-auto">
              <button onClick={() => setStep(0)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ArrowLeft size={14} /> Zurück zur Auswahl
              </button>

              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">Ihre Angaben</h3>
                  <p className="text-sm text-muted-foreground mt-1">Für: {selectedCategories.map(id => wizardCategories.find(c => c.id === id)?.label).join(", ")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Vorname *</label>
                    <input value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                      className="w-full text-sm bg-muted rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Nachname *</label>
                    <input value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                      className="w-full text-sm bg-muted rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">E-Mail *</label>
                    <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full text-sm bg-muted rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Telefon</label>
                    <input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className="w-full text-sm bg-muted rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Geburtsdatum</label>
                    <input type="date" value={formData.birthDate} onChange={e => setFormData(p => ({ ...p, birthDate: e.target.value }))}
                      className="w-full text-sm bg-muted rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">PLZ</label>
                    <input value={formData.plz} onChange={e => setFormData(p => ({ ...p, plz: e.target.value }))}
                      className="w-full text-sm bg-muted rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground" placeholder="z.B. 3000" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Bemerkungen</label>
                  <textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={3}
                    className="w-full text-sm bg-muted rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                    placeholder="Besondere Wünsche oder Fragen..." />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!formData.firstName || !formData.lastName || !formData.email}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  Angebot anfordern
                </button>
                <p className="text-[11px] text-muted-foreground text-center">Sie erhalten Ihr persönliches Angebot innert 24 Stunden per E-Mail.</p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground">Vielen Dank!</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Ihre Anfrage wurde erfolgreich übermittelt. Wir erstellen Ihr persönliches Angebot und melden uns innert 24 Stunden bei Ihnen.
            </p>
            <button
              onClick={() => { setStep(0); setSelectedCategories([]); setFormData({ firstName: "", lastName: "", email: "", phone: "", birthDate: "", plz: "", notes: "" }); }}
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Neue Anfrage starten
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main Page ─── */
const OnlineCheck = () => {
  const { data: hero } = useQuery({
    queryKey: ["page-hero", "onlinecheck"],
    queryFn: async () => {
      const { data } = await supabase.from("page_heroes").select("*").eq("page_key", "onlinecheck").maybeSingle();
      return data;
    },
  });

  const heroImg = hero?.image_url || "/placeholder.svg";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero with Chat Overlay */}
      <div className="relative w-full">
        <div className="w-full h-[50vh] lg:h-[55vh] overflow-hidden relative">
          <img src={heroImg} alt={hero?.alt_text || "Online-Beratung"} className="w-full h-full object-cover" />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

          {/* Chat overlay on hero */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-6"
            >
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-white drop-shadow-lg">
                Online-Beratung
              </h1>
              <p className="text-white/80 mt-2 text-sm md:text-base max-w-lg mx-auto">
                Stellen Sie Ihre Fragen direkt an unseren KI-Berater
              </p>
            </motion.div>
            <div className="w-full max-w-2xl">
              <ChatOverlay />
            </div>
          </div>

          {/* Rounded overlap */}
          <div
            className="absolute bottom-0 left-0 right-0 h-10 lg:h-14 rounded-t-[2rem] lg:rounded-t-[2.5rem] bg-background"
            style={{ boxShadow: "0 -10px 30px rgba(0,0,0,0.15)" }}
          />
        </div>
      </div>

      {/* Wizard Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <InsuranceWizard />
        </div>
      </section>
    </div>
  );
};

export default OnlineCheck;
