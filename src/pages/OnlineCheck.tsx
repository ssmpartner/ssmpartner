import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Volume2, VolumeX, Sparkles, Shield, Car, Home, Scale, Heart, PiggyBank, ChevronRight, CheckCircle2, ArrowRight, ArrowLeft, Lock, Award, Clock, Globe, Smartphone, Briefcase, Search, Loader2, TrendingDown, MapPin, Calendar, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MAPBOX_TOKEN = "pk.eyJ1Ijoic3NtcGFydG5lciIsImEiOiJjbW40bDI4engwMWg3MnFzbnp4emJua2hhIn0.5u0JuVsRDe6DSNBOEpSh1A";

/* ─── Mapbox Address Autocomplete ─── */
const AddressAutocomplete = ({ value, onChange, onSelect }: {
  value: string;
  onChange: (val: string) => void;
  onSelect: (data: { address: string; plz: string; ort: string }) => void;
}) => {
  const [suggestions, setSuggestions] = useState<Array<{ place_name: string; postcode: string; place: string; street: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchAddress = (query: string) => {
    onChange(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=ch&types=place,postcode,address&language=de&limit=5&access_token=${MAPBOX_TOKEN}`
        );
        const data = await resp.json();
        const results = (data.features || []).map((f: any) => {
          const postcode = f.context?.find((c: any) => c.id?.startsWith("postcode"))?.text
            || (f.place_type?.includes("postcode") ? f.text : "");
          const place = f.context?.find((c: any) => c.id?.startsWith("place"))?.text
            || (f.place_type?.includes("place") ? f.text : "");
          const street = f.place_type?.includes("address") ? (f.text + (f.address ? ` ${f.address}` : "")) : "";
          return { place_name: f.place_name, postcode, place, street };
        }).filter((r: any) => r.postcode || r.place);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch { setSuggestions([]); }
    }, 300);
  };

  const selectSuggestion = (s: { place_name: string; postcode: string; place: string; street: string }) => {
    onChange(s.street || s.place_name.split(",")[0] || "");
    onSelect({ address: s.street || "", plz: s.postcode, ort: s.place });
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={value}
          onChange={e => searchAddress(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full text-sm bg-muted rounded-xl pl-9 pr-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground"
          placeholder="Strasse und Hausnummer eingeben…"
        />
      </div>
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button key={i} onMouseDown={() => selectSuggestion(s)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2">
              <MapPin size={12} className="text-muted-foreground shrink-0" />
              <span className="text-foreground truncate">{s.place_name}</span>
              {s.postcode && <span className="text-xs text-primary font-medium ml-auto shrink-0">{s.postcode}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
              className="max-h-[500px] overflow-y-auto space-y-4 p-5 bg-card/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl"
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
        <div className="relative bg-card/70 backdrop-blur-xl rounded-2xl p-4 flex items-end gap-3 shadow-lg border border-white/20">
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
            rows={2}
            className="flex-1 resize-none text-base bg-transparent outline-none text-foreground placeholder:text-muted-foreground py-2 max-h-32"
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
  { id: "leben", label: "Lebensversicherung", icon: Briefcase, color: "from-teal-500 to-teal-600", desc: "Absicherung für Ihre Familie" },
  { id: "krankenkasse", label: "Krankenkasse", icon: Heart, color: "from-rose-500 to-rose-600", desc: "Grund- & Zusatzversicherung vergleichen" },
];

/* ─── Product-specific questions ─── */
type ProductQuestion = { key: string; label: string; type: "text" | "select" | "number"; options?: string[]; placeholder?: string };

const productQuestions: Record<string, ProductQuestion[]> = {
  hausrat: [
    { key: "wohnform", label: "Wohnform", type: "select", options: ["Mietwohnung", "Eigentumswohnung", "Einfamilienhaus", "Reihenhaus"] },
    { key: "wohnflaeche", label: "Wohnfläche (m²)", type: "number", placeholder: "z.B. 80" },
    { key: "versicherungssumme", label: "Gewünschte Versicherungssumme (CHF)", type: "select", options: ["50'000", "75'000", "100'000", "150'000", "200'000+"] },
    { key: "vorschaeden", label: "Vorschäden in den letzten 5 Jahren?", type: "select", options: ["Nein", "1 Schadenfall", "2+ Schadenfälle"] },
  ],
  auto: [
    { key: "marke", label: "Marke & Modell", type: "text", placeholder: "z.B. VW Golf" },
    { key: "jahrgang", label: "Jahrgang", type: "number", placeholder: "z.B. 2021" },
    { key: "km", label: "Jährliche Kilometer", type: "select", options: ["< 10'000 km", "10'000–15'000 km", "15'000–20'000 km", "20'000–30'000 km", "> 30'000 km"] },
    { key: "fahrausweis_seit", label: "Fahrausweis seit (Jahr)", type: "number", placeholder: "z.B. 2015" },
    { key: "deckung", label: "Gewünschte Deckung", type: "select", options: ["Haftpflicht", "Haftpflicht + Teilkasko", "Haftpflicht + Vollkasko"] },
  ],
  rechtsschutz: [
    { key: "bereich", label: "Rechtsschutz-Bereich", type: "select", options: ["Privat", "Verkehr", "Beruf", "Privat + Verkehr", "Rundum (alle Bereiche)"] },
    { key: "haushalt", label: "Haushaltsgrösse", type: "select", options: ["Einzelperson", "Paar (ohne Kinder)", "Familie (mit Kindern)"] },
    { key: "vorverfahren", label: "Laufende Rechtsstreitigkeiten?", type: "select", options: ["Nein", "Ja"] },
  ],
  vorsorge: [
    { key: "einkommen", label: "Brutto-Jahreseinkommen (CHF)", type: "select", options: ["< 50'000", "50'000–80'000", "80'000–120'000", "120'000–150'000", "> 150'000"] },
    { key: "bvg", label: "Haben Sie eine Pensionskasse (BVG)?", type: "select", options: ["Ja", "Nein", "Unsicher"] },
    { key: "anlagestrategie", label: "Bevorzugte Anlagestrategie", type: "select", options: ["Konservativ (Sparkonto)", "Ausgewogen (Fonds)", "Dynamisch (Aktien-orientiert)"] },
    { key: "einzahlung", label: "Geplante Jahreseinzahlung 3a (CHF)", type: "select", options: ["< 3'000", "3'000–5'000", "5'000–7'056 (Maximum)", "Maximalbetrag"] },
  ],
  leben: [
    { key: "art", label: "Art der Lebensversicherung", type: "select", options: ["Risikolebensversicherung", "Gemischte Lebensversicherung", "Fondsgebundene Lebensversicherung"] },
    { key: "versicherungssumme", label: "Gewünschte Versicherungssumme (CHF)", type: "select", options: ["100'000", "200'000", "300'000", "500'000", "1'000'000+"] },
    { key: "laufzeit", label: "Gewünschte Laufzeit", type: "select", options: ["10 Jahre", "15 Jahre", "20 Jahre", "Bis Pensionierung"] },
    { key: "raucher", label: "Raucher?", type: "select", options: ["Nein", "Ja"] },
  ],
  krankenkasse: [
    { key: "aktuelle_kasse", label: "Aktuelle Krankenkasse", type: "text", placeholder: "z.B. CSS, Helsana, Swica…" },
    { key: "modell", label: "Gewünschtes Modell", type: "select", options: ["Standard (freie Arztwahl)", "Hausarzt-Modell", "HMO", "Telmed"] },
    { key: "franchise", label: "Franchise", type: "select", options: ["300 CHF", "500 CHF", "1'000 CHF", "1'500 CHF", "2'000 CHF", "2'500 CHF"] },
    { key: "zusatz", label: "Zusatzversicherung gewünscht?", type: "select", options: ["Nein", "Spital halbprivat", "Spital privat", "Komplementärmedizin", "Zahnversicherung", "Mehrere"] },
  ],
};

/* ─── VAG45 Partner Mapping ─── */
const categoryToBranches: Record<string, string[]> = {
  hausrat: ["Hausrat- und Gebäudeversicherung", "Haftpflichtversicherung (Privatkunden)"],
  auto: ["Motorfahrzeugversicherung"],
  rechtsschutz: ["Rechtsschutzversicherung"],
  vorsorge: ["Kollektivlebensversicherung", "Anteilsgebundene Lebensversicherung", "Sonstige Lebensversicherung"],
  leben: ["Kollektivlebensversicherung", "Anteilsgebundene Lebensversicherung", "Sonstige Lebensversicherung"],
};

const Vag45PartnerBadge = ({ catId }: { catId: string }) => {
  const branchKeywords = categoryToBranches[catId];
  const { data: partners } = useQuery({
    queryKey: ["vag45-partners-wizard", catId],
    queryFn: async () => {
      const { data } = await supabase.from("vag45_partners").select("*").eq("active", true).order("sort_order");
      if (!data || !branchKeywords) return [];
      return data.filter(p => branchKeywords.some(kw => p.branch.toLowerCase().includes(kw.toLowerCase())));
    },
    enabled: !!branchKeywords,
  });

  if (!partners || partners.length === 0) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Shield size={14} className="text-primary" />
        <span className="text-xs font-bold text-primary">Unsere Versicherungspartner (VAG 45)</span>
      </div>
      {partners.map(p => (
        <div key={p.id} className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">{p.company}</span>
          <span className="text-muted-foreground">{p.branch}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── BAG Premium API Types ─── */
type BagOffer = {
  insurer: string;
  model: string;
  deductible: number;
  accident: boolean;
  price: { base: number; accident: number; total: number; currency: string };
};

const BAG_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bag-premiums`;

/* ─── BAG Premium Comparison Component ─── */
const BagPremiumComparison = ({ plz, birthDate, franchise, modell, selectedOffer, onSelectOffer }: {
  plz: string; birthDate: string; franchise: string; modell: string;
  selectedOffer: BagOffer | null;
  onSelectOffer: (offer: BagOffer | null) => void;
}) => {
  const [offers, setOffers] = useState<BagOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [region, setRegion] = useState("");
  const lastParamsRef = useRef("");

  const calculateAge = (bd: string) => {
    const birth = new Date(bd);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
    return age;
  };

  const modelMap: Record<string, string> = {
    "Standard (freie Arztwahl)": "standard",
    "Hausarzt-Modell": "hausarzt",
    "HMO": "hmo",
    "Telmed": "telmed",
  };

  const deductibleMap: Record<string, number> = {
    "300 CHF": 300, "500 CHF": 500, "1'000 CHF": 1000,
    "1'500 CHF": 1500, "2'000 CHF": 2000, "2'500 CHF": 2500,
  };

  const canSearch = plz.length >= 4 && birthDate && franchise;

  const fetchPremiums = useCallback(async () => {
    if (!canSearch) return;
    const paramKey = `${plz}-${birthDate}-${franchise}-${modell}`;
    if (paramKey === lastParamsRef.current) return;
    lastParamsRef.current = paramKey;
    setLoading(true);
    setSearched(true);
    try {
      const age = calculateAge(birthDate);
      const deductible = deductibleMap[franchise] || 2500;
      const model = modelMap[modell] || undefined;

      const resp = await fetch(BAG_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ plz, age, deductible, accident: false, model, limit: 100, insurer: "Visana" }),
      });
      const data = await resp.json();
      setOffers(data.offers || []);
      setRegion(data.region || "");
      onSelectOffer(null);
    } catch {
      setOffers([]);
    }
    setLoading(false);
  }, [plz, birthDate, franchise, modell, canSearch]);

  // Auto-fetch when all params are filled
  useEffect(() => {
    if (canSearch) fetchPremiums();
  }, [canSearch, fetchPremiums]);

  const isSelected = (o: BagOffer) =>
    selectedOffer?.insurer === o.insurer && selectedOffer?.model === o.model && selectedOffer?.deductible === o.deductible && selectedOffer?.price.total === o.price.total;

  return (
    <div className="mt-4 bg-muted/50 rounded-xl p-4 space-y-3 border border-border">
      <div className="flex items-center gap-2">
        <TrendingDown size={16} className="text-primary" />
        <h5 className="text-sm font-bold text-foreground">Visana Prämien 2026 (BAG)</h5>
        {loading && <Loader2 size={14} className="animate-spin text-primary" />}
      </div>

      {!canSearch && (
        <p className="text-xs text-muted-foreground">Bitte PLZ, Geburtsdatum und Franchise ausfüllen, um Prämien zu laden.</p>
      )}

      {searched && !loading && offers.length === 0 && (
        <p className="text-xs text-muted-foreground italic">Keine Angebote gefunden. Prüfen Sie die PLZ.</p>
      )}

      {offers.length > 0 && (
        <div className="space-y-2">
          {region && <p className="text-[11px] text-muted-foreground">Region: {region}</p>}
          <p className="text-xs text-muted-foreground">Wählen Sie Ihr bevorzugtes Angebot:</p>
          <div className="grid gap-2">
            {(() => {
              const minPrice = Math.min(...offers.map(o => o.price.total));
              return offers.map((o, i) => {
                const isCheapest = o.price.total === minPrice;
                return (
                  <button
                    key={i}
                    onClick={() => onSelectOffer(isSelected(o) ? null : o)}
                    className={`relative flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      isSelected(o)
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : isCheapest ? "border-primary/50 bg-primary/5 hover:bg-primary/10" : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    {isCheapest && (
                      <span className="absolute -top-2 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Günstigste</span>
                    )}
                    <div className="flex items-center gap-2">
                      {isSelected(o) ? (
                        <CheckCircle2 size={16} className="text-primary shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{o.insurer}</p>
                        <p className="text-xs text-muted-foreground">{o.model} · Franchise CHF {o.deductible}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">CHF {o.price.total.toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground">pro Monat</p>
                    </div>
                  </button>
                );
              });
            })()}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">Quelle: BAG / priminfo.admin.ch · Visana Prämien 2026</p>
        </div>
      )}
    </div>
  );
};

/* ─── Nearby Agency Card ─── */
const NearbyAgencyCard = ({ plz }: { plz: string }) => {
  const navigate = useNavigate();
  const { data: agencies } = useQuery({
    queryKey: ["agencies-nearby", plz],
    queryFn: async () => {
      const { data } = await supabase.from("agencies").select("*").eq("active", true).order("sort_order");
      return data || [];
    },
  });

  // Simple PLZ-based proximity: match first 2 digits of PLZ for region
  const nearestAgency = agencies?.find(a => {
    if (!a.address || !plz) return false;
    const agencyPlz = a.address.match(/\b(\d{4})\b/)?.[1];
    if (!agencyPlz) return false;
    return agencyPlz.slice(0, 2) === plz.slice(0, 2);
  }) || agencies?.[0];

  if (!nearestAgency) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-primary" />
        <h4 className="text-sm font-bold text-primary">Ihre Agentur in der Nähe</h4>
      </div>
      <div className="flex items-start gap-4">
        {nearestAgency.image_url && (
          <img src={nearestAgency.image_url} alt={nearestAgency.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
        )}
        <div className="flex-1 space-y-1">
          <p className="text-sm font-bold text-foreground">{nearestAgency.name}</p>
          {nearestAgency.address && <p className="text-xs text-muted-foreground">{nearestAgency.address}</p>}
          {nearestAgency.leader_name && (
            <p className="text-xs text-foreground">
              <span className="text-muted-foreground">Ihr Finanzcoach:</span> <span className="font-medium">{nearestAgency.leader_name}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Ein Berater aus unserer Agentur <strong>{nearestAgency.name}</strong> wird sich nach Ihrer Anfrage persönlich bei Ihnen melden.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/agenturen/${nearestAgency.slug}`)}
          className="flex-1 text-xs py-2 px-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-center font-medium"
        >
          Agentur ansehen
        </button>
        <a
          href="/kontakt"
          className="flex-1 text-xs py-2 px-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-center font-medium inline-flex items-center justify-center gap-1"
        >
          <Calendar size={12} /> Termin vereinbaren
        </a>
      </div>
    </div>
  );
};

/* ─── Coverage packages (fallback, overridden by DB) ─── */
const coveragePackagesFallback: Record<string, { basis: string; komfort: string; premium: string }> = {
  hausrat: { basis: "ab CHF 8.–/Mt.", komfort: "ab CHF 15.–/Mt.", premium: "ab CHF 25.–/Mt." },
  auto: { basis: "ab CHF 45.–/Mt.", komfort: "ab CHF 75.–/Mt.", premium: "ab CHF 110.–/Mt." },
  rechtsschutz: { basis: "ab CHF 12.–/Mt.", komfort: "ab CHF 22.–/Mt.", premium: "ab CHF 35.–/Mt." },
  vorsorge: { basis: "Sparkonto 3a", komfort: "Fonds-Lösung", premium: "Individuelle Strategie" },
  leben: { basis: "ab CHF 30.–/Mt.", komfort: "ab CHF 55.–/Mt.", premium: "ab CHF 90.–/Mt." },
  krankenkasse: { basis: "Grundversicherung", komfort: "Grund + Spital halbprivat", premium: "Grund + Spital privat + Zusatz" },
};

const packageDetails: Record<string, { title: string; desc: string; color: string; badge?: string }> = {
  basis: { title: "Basis", desc: "Solider Grundschutz zum besten Preis", color: "border-border" },
  komfort: { title: "Komfort", desc: "Erweiterter Schutz für mehr Sicherheit", color: "border-primary", badge: "Beliebt" },
  premium: { title: "Premium", desc: "Maximaler Schutz ohne Kompromisse", color: "border-accent" },
};

/* ─── Step Indicator ─── */
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const labels = ["Produkt", "Persönlich", "Deckung", "Zusammenfassung", "Offertenanfrage"];
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            i < currentStep ? "bg-primary/10 text-primary" : i === currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            {i < currentStep ? <CheckCircle2 size={12} /> : <span className="w-4 text-center">{i + 1}</span>}
            <span className="hidden sm:inline">{label}</span>
          </div>
          {i < labels.length - 1 && <ChevronRight size={14} className="text-muted-foreground mx-1" />}
        </div>
      ))}
    </div>
  );
};

/* ─── Insurance Wizard Component ─── */
const InsuranceWizard = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [personalData, setPersonalData] = useState({
    firstName: "", lastName: "", email: "", phone: "", birthDate: "", address: "", plz: "", ort: "", zivilstand: "",
  });
  const [addressInput, setAddressInput] = useState("");
  const [productDetails, setProductDetails] = useState<Record<string, Record<string, string>>>({});
  const [selectedPackages, setSelectedPackages] = useState<Record<string, string>>({});
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [selectedBagOffer, setSelectedBagOffer] = useState<BagOffer | null>(null);

  const { data: dbPricing = [] } = useQuery({
    queryKey: ["wizard-pricing-public"],
    queryFn: async () => {
      const { data } = await supabase.from("wizard_pricing").select("*").eq("active", true).order("sort_order");
      return data || [];
    },
  });

  const getCoveragePackages = (catId: string) => {
    const rows = dbPricing.filter((p: any) => p.category === catId);
    if (rows.length > 0) {
      const result: Record<string, string> = {};
      rows.forEach((r: any) => { result[r.tier] = r.price_text; });
      return result;
    }
    const fb = coveragePackagesFallback[catId];
    return fb || { basis: "—", komfort: "—", premium: "—" };
  };

  const getPricingDescription = (catId: string, tier: string) => {
    const row = dbPricing.find((p: any) => p.category === catId && p.tier === tier);
    return row?.description || packageDetails[tier]?.desc || "";
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const updateProductDetail = (productId: string, key: string, value: string) => {
    setProductDetails(prev => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [key]: value },
    }));
  };

  const generateRefNumber = () => {
    const now = new Date();
    return `SSM-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  };

  const handleSubmit = async () => {
    const ref = generateRefNumber();
    setReferenceNumber(ref);

    const details = selectedCategories.map(id => {
      const cat = wizardCategories.find(c => c.id === id)!;
      const answers = productDetails[id] || {};
      const pkg = selectedPackages[id] || "nicht gewählt";
      const qText = Object.entries(answers).map(([k, v]) => `  ${k}: ${v}`).join("\n");
      let result = `${cat.label} (Paket: ${pkg}):\n${qText}`;
      if (id === "krankenkasse" && selectedBagOffer) {
        result += `\n  Gewähltes Visana-Angebot: ${selectedBagOffer.insurer} – ${selectedBagOffer.model} – CHF ${selectedBagOffer.price.total.toFixed(2)}/Mt. (Franchise ${selectedBagOffer.deductible})`;
      }
      return result;
    }).join("\n\n");

    const message = `Ref: ${ref}\n\nProdukte: ${selectedCategories.map(id => wizardCategories.find(c => c.id === id)?.label).join(", ")}\n\nAdresse: ${personalData.address}, ${personalData.plz} ${personalData.ort}\nZivilstand: ${personalData.zivilstand || "k.A."}\nGeburtsdatum: ${personalData.birthDate || "k.A."}\n\n--- Produktdetails ---\n${details}`;

    try {
      await supabase.from("inquiries").insert({
        name: `${personalData.firstName} ${personalData.lastName}`,
        email: personalData.email,
        phone: personalData.phone || null,
        subject: `Online-Check ${ref}: ${selectedCategories.join(", ")}`,
        message,
        source: "onlinecheck",
      });
      setStep(4);
    } catch {
      // handled by UI
    }
  };

  const isPersonalValid = personalData.firstName && personalData.lastName && personalData.email && personalData.birthDate && personalData.plz && personalData.ort;

  const inputClass = "w-full text-sm bg-muted rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground";
  const selectClass = "w-full text-sm bg-muted rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground appearance-none";

  return (
    <div className="space-y-6">
      {step > 0 && step < 6 && <StepIndicator currentStep={step - 1} totalSteps={6} />}

      <AnimatePresence mode="wait">
        {/* ─── Step 0: Product Selection ─── */}
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Versicherungs-Check</h2>
              <p className="text-muted-foreground mt-2">Wählen Sie die gewünschten Versicherungen — mehrere gleichzeitig möglich.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {wizardCategories.map(cat => {
                const selected = selectedCategories.includes(cat.id);
                return (
                  <motion.button key={cat.id} onClick={() => toggleCategory(cat.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${selected ? "border-primary bg-primary/5 shadow-lg" : "border-border bg-card hover:border-accent hover:shadow-md"}`}
                  >
                    {selected && <div className="absolute top-3 right-3"><CheckCircle2 size={20} className="text-primary" /></div>}
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
                <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold hover:opacity-90 transition-opacity">
                  Weiter <ArrowRight size={18} />
                </button>
                <p className="text-xs text-muted-foreground mt-2">{selectedCategories.length} Versicherung(en) ausgewählt</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── Step 1: Personal Info ─── */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="max-w-2xl mx-auto">
              <button onClick={() => setStep(0)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft size={14} /> Zurück</button>
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">Persönliche Angaben</h3>
                  <p className="text-sm text-muted-foreground mt-1">Diese Daten benötigen wir für Ihr individuelles Angebot.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Vorname *</label>
                    <input value={personalData.firstName} onChange={e => setPersonalData(p => ({ ...p, firstName: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Nachname *</label>
                    <input value={personalData.lastName} onChange={e => setPersonalData(p => ({ ...p, lastName: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Geburtsdatum *</label>
                    <input type="date" value={personalData.birthDate} onChange={e => setPersonalData(p => ({ ...p, birthDate: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Zivilstand</label>
                    <select value={personalData.zivilstand} onChange={e => setPersonalData(p => ({ ...p, zivilstand: e.target.value }))} className={selectClass}>
                      <option value="">Bitte wählen</option>
                      <option>Ledig</option>
                      <option>Verheiratet</option>
                      <option>Geschieden</option>
                      <option>Verwitwet</option>
                      <option>Eingetragene Partnerschaft</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-1 block">Strasse & Nr. *</label>
                    <AddressAutocomplete
                      value={addressInput}
                      onChange={setAddressInput}
                      onSelect={({ address, plz, ort }) => setPersonalData(p => ({ ...p, address: address || addressInput, plz, ort }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">PLZ *</label>
                    <input value={personalData.plz} onChange={e => setPersonalData(p => ({ ...p, plz: e.target.value }))} className={inputClass} placeholder="z.B. 3000" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Ort *</label>
                    <input value={personalData.ort} onChange={e => setPersonalData(p => ({ ...p, ort: e.target.value }))} className={inputClass} placeholder="z.B. Bern" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">E-Mail *</label>
                    <input type="email" value={personalData.email} onChange={e => setPersonalData(p => ({ ...p, email: e.target.value }))} className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-1 block">Telefon</label>
                    <input value={personalData.phone} onChange={e => setPersonalData(p => ({ ...p, phone: e.target.value }))} className={inputClass} placeholder="Optional" />
                  </div>
                </div>
                <button onClick={() => setStep(2)} disabled={!isPersonalValid}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold disabled:opacity-40 hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2">
                  Weiter zu den Detailfragen <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Step 2: Product-Specific Questions ─── */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="max-w-3xl mx-auto">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft size={14} /> Zurück</button>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">Produktspezifische Angaben</h3>
                  <p className="text-sm text-muted-foreground mt-1">Bitte füllen Sie die Detailfragen pro Versicherung aus.</p>
                </div>
                {selectedCategories.map(catId => {
                  const cat = wizardCategories.find(c => c.id === catId)!;
                  const questions = productQuestions[catId] || [];
                  return (
                    <div key={catId} className="bg-card rounded-2xl border border-border p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                          <cat.icon size={18} className="text-white" />
                        </div>
                        <h4 className="font-heading font-bold text-foreground">{cat.label}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {questions.map(q => (
                          <div key={q.key}>
                            <label className="text-sm font-medium text-foreground mb-1 block">{q.label}</label>
                            {q.type === "select" ? (
                              <select value={productDetails[catId]?.[q.key] || ""} onChange={e => updateProductDetail(catId, q.key, e.target.value)} className={selectClass}>
                                <option value="">Bitte wählen</option>
                                {q.options?.map(o => <option key={o}>{o}</option>)}
                              </select>
                            ) : (
                              <input type={q.type === "number" ? "number" : "text"} value={productDetails[catId]?.[q.key] || ""} onChange={e => updateProductDetail(catId, q.key, e.target.value)}
                                className={inputClass} placeholder={q.placeholder} />
                            )}
                          </div>
                        ))}
                      </div>
                      {catId !== "krankenkasse" && <Vag45PartnerBadge catId={catId} />}
                      {catId === "krankenkasse" && (
                        <BagPremiumComparison
                          plz={personalData.plz}
                          birthDate={personalData.birthDate}
                          franchise={productDetails.krankenkasse?.franchise || ""}
                          modell={productDetails.krankenkasse?.modell || ""}
                          selectedOffer={selectedBagOffer}
                          onSelectOffer={setSelectedBagOffer}
                        />
                      )}
                    </div>
                  );
                })}
                <button onClick={() => setStep(3)}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2">
                  Weiter zur Deckungsauswahl <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Step 3: Coverage Package Selection ─── */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft size={14} /> Zurück</button>
              <div className="space-y-8">
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">Deckungspaket wählen</h3>
                  <p className="text-sm text-muted-foreground mt-1">Wählen Sie für jede Versicherung Ihr bevorzugtes Paket.</p>
                </div>
                {selectedCategories.map(catId => {
                  const cat = wizardCategories.find(c => c.id === catId)!;
                  const packages = getCoveragePackages(catId);
                  return (
                    <div key={catId} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <cat.icon size={16} className="text-primary" />
                        <h4 className="font-heading font-bold text-foreground text-sm">{cat.label}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {(["basis", "komfort", "premium"] as const).map(tier => {
                          const pkg = packageDetails[tier];
                          const isSelected = selectedPackages[catId] === tier;
                          return (
                            <button key={tier} onClick={() => setSelectedPackages(prev => ({ ...prev, [catId]: tier }))}
                              className={`relative p-4 rounded-xl border-2 text-left transition-all ${isSelected ? "border-primary bg-primary/5 shadow-md" : `${pkg.color} bg-card hover:shadow-sm`}`}
                            >
                              {pkg.badge && (
                                <span className="absolute -top-2.5 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{pkg.badge}</span>
                              )}
                              <h5 className="font-heading font-bold text-foreground">{pkg.title}</h5>
                              <p className="text-xs text-muted-foreground mt-0.5">{getPricingDescription(catId, tier)}</p>
                              <p className="text-sm font-bold text-primary mt-2">{packages[tier] || "—"}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => setStep(4)}
                  disabled={selectedCategories.some(id => !selectedPackages[id])}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold disabled:opacity-40 hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2">
                  Weiter zur Zusammenfassung <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Step 4: Zusammenfassung ─── */}
        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setStep(3)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft size={14} /> Zurück</button>
              <div className="space-y-8">
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">Zusammenfassung</h3>
                  <p className="text-sm text-muted-foreground mt-1">Übersicht Ihrer Angaben und gewählten Pakete.</p>
                </div>

                {/* Personal data summary */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                  <h4 className="text-sm font-bold text-foreground mb-2">Persönliche Daten</h4>
                  <p className="text-sm text-foreground">{personalData.firstName} {personalData.lastName}</p>
                  <p className="text-sm text-muted-foreground">{personalData.address && `${personalData.address}, `}{personalData.plz} {personalData.ort}</p>
                  <p className="text-sm text-muted-foreground">{personalData.email} · {personalData.phone || "Kein Telefon"}</p>
                  <p className="text-sm text-muted-foreground">Geb.: {personalData.birthDate} · {personalData.zivilstand || "k.A."}</p>
                </div>

                {/* Product summaries */}
                {selectedCategories.map(catId => {
                  const cat = wizardCategories.find(c => c.id === catId)!;
                  const details = productDetails[catId] || {};
                  const pkg = selectedPackages[catId];
                  return (
                    <div key={catId} className="bg-muted/50 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <cat.icon size={16} className="text-primary" />
                          <h4 className="text-sm font-bold text-foreground">{cat.label}</h4>
                        </div>
                        {pkg && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium capitalize">{pkg}</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {Object.entries(details).filter(([,v]) => v).map(([k, v]) => (
                          <p key={k} className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{k}:</span> {v}</p>
                        ))}
                      </div>
                      {catId === "krankenkasse" && selectedBagOffer && (
                        <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex items-center gap-1.5 mb-1">
                            <CheckCircle2 size={14} className="text-primary" />
                            <span className="text-xs font-bold text-primary">Gewähltes Visana-Angebot</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">{selectedBagOffer.insurer}</p>
                              <p className="text-xs text-muted-foreground">{selectedBagOffer.model} · Franchise CHF {selectedBagOffer.deductible}</p>
                            </div>
                            <p className="text-sm font-bold text-primary">CHF {selectedBagOffer.price.total.toFixed(2)}/Mt.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button onClick={() => setStep(5)}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2">
                  Weiter zur Offertenanfrage <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Step 5: Offertenanfrage ─── */}
        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="max-w-3xl mx-auto">
              <button onClick={() => setStep(4)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft size={14} /> Zurück</button>
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">Offertenanfrage</h3>
                  <p className="text-sm text-muted-foreground mt-1">Senden Sie Ihre Anfrage ab — wir melden uns innert 24h.</p>
                </div>

                {/* Nearby Agency */}
                <NearbyAgencyCard plz={personalData.plz} />

                {/* AGB Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agbAccepted} onChange={e => setAgbAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-ring" />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    Ich habe die <a href="/rechtliches" className="text-primary underline hover:text-accent">Datenschutzerklärung</a> gelesen und bin mit der Verarbeitung meiner Daten zur Angebotserstellung einverstanden. Die SSM Partner AG wird mich innert 24 Stunden kontaktieren.
                  </span>
                </label>

                <button onClick={handleSubmit} disabled={!agbAccepted}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-bold disabled:opacity-40 hover:opacity-90 transition-opacity">
                  Anfrage einreichen
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Step 6: Confirmation ─── */}
        {step === 6 && (
          <motion.div key="s6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground">Vielen Dank für Ihre Anfrage!</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Wir erstellen Ihr persönliches Angebot und melden uns innert 24 Stunden bei Ihnen.
            </p>
            <div className="mt-4 inline-block bg-muted rounded-xl px-6 py-3">
              <p className="text-xs text-muted-foreground">Ihre Referenznummer</p>
              <p className="text-lg font-heading font-bold text-foreground tracking-wider">{referenceNumber}</p>
            </div>

            {/* Post-submit options */}
            <div className="mt-10 max-w-lg mx-auto">
              <p className="text-sm font-medium text-foreground mb-4">Wie möchten Sie weiterfahren?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => { setStep(0); setSelectedCategories([]); setProductDetails({}); setSelectedPackages({}); setAgbAccepted(false); }}
                  className="flex items-center justify-center gap-2 p-4 bg-primary text-primary-foreground rounded-xl font-heading font-bold hover:opacity-90 transition-opacity"
                >
                  <Plus size={18} />
                  Weitere Versicherung abschliessen
                </button>
                <a
                  href="/kontakt"
                  className="flex items-center justify-center gap-2 p-4 bg-card border-2 border-primary text-primary rounded-xl font-heading font-bold hover:bg-primary/5 transition-colors"
                >
                  <Calendar size={18} />
                  Termin vereinbaren
                </a>
              </div>
            </div>

            <div className="mt-6">
              <button onClick={() => { setStep(0); setSelectedCategories([]); setPersonalData({ firstName: "", lastName: "", email: "", phone: "", birthDate: "", address: "", plz: "", ort: "", zivilstand: "" }); setAddressInput(""); setProductDetails({}); setSelectedPackages({}); setAgbAccepted(false); }}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                Komplett neu starten
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Trust Bar ─── */
const TrustBar = () => {
  const items = [
    { icon: Lock, label: "SSL-verschlüsselt" },
    { icon: Shield, label: "FINMA-reguliert" },
    { icon: Clock, label: "Antwort innert 24h" },
    { icon: Award, label: "Unabhängige Beratung" },
    { icon: Smartphone, label: "100% Digital" },
  ];
  return (
    <div className="bg-muted/50 border-t border-border py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-10">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-2 text-muted-foreground">
            <item.icon size={18} className="text-primary" />
            <span className="text-xs font-medium">{item.label}</span>
          </div>
        ))}
      </div>
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

  const heroImg = hero?.image_url || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full">
        <div className="w-full h-[50vh] lg:h-[55vh] overflow-hidden relative">
          <img src={heroImg} alt={hero?.alt_text || "Online-Beratung"} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

          {/* Title on hero */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white drop-shadow-lg">
                Online-Beratung
              </h1>
              <p className="text-white/80 mt-2 text-sm md:text-base max-w-lg mx-auto">
                Stellen Sie Ihre Fragen direkt an unseren KI-Berater
              </p>
            </motion.div>
          </div>

          {/* Rounded overlap */}
          <div
            className="absolute bottom-0 left-0 right-0 h-10 lg:h-14 rounded-t-[2rem] lg:rounded-t-[2.5rem] bg-background"
            style={{ boxShadow: "0 -10px 30px rgba(0,0,0,0.15)" }}
          />
        </div>
      </div>

      {/* Chat Overlay — positioned to bridge hero and wizard */}
      <div className="relative z-10 -mt-32 lg:-mt-40 px-4 mb-8">
        <div className="max-w-3xl mx-auto">
          <ChatOverlay />
        </div>
      </div>

      {/* Wizard Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <InsuranceWizard />
        </div>
      </section>

      {/* Trust Bar */}
      <TrustBar />
    </div>
  );
};

export default OnlineCheck;
