import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import {
  Play, X, Scale, Palmtree, BadgePercent, GraduationCap, HeartHandshake,
  Mail, Building2, MessageCircleQuestion, ArrowRight, Send, FileText,
  Users, MessageSquare, Handshake, FileCheck, Rocket, PartyPopper,
  ChevronRight, CheckCircle2,
} from "lucide-react";

/* ── Bewerbungsprozess phases ── */
const phases = [
  {
    phase: "Phase 1", label: "Bewerbung", motto: "Der erste Schritt zählt!", sub: "Zeig, was dich ausmacht!",
    icon: Send, color: "#6A9387",
    steps: [
      { title: "Bewerbung", icon: Send, desc: "Hast du die passende Stelle gefunden? Bewirb dich online über unser Bewerbungsformular. Du erhältst sofort eine Eingangsbestätigung." },
      { title: "Bewerbungsunterlagen", icon: FileText, desc: "Deine Bewerbungsunterlagen werden vom HR-Recruiting-Partner geprüft und zur Beurteilung an die zuständige Führungsperson weitergeleitet." },
      { title: "Auswahl", icon: Users, desc: "Wir prüfen deine Qualifikation, Fähigkeit und Soft-Skills. Passt du zu SSM, laden wir dich gerne zu einem ersten Kennenlernen ein. Du hörst innerhalb von rund einer Arbeitswoche von uns." },
    ],
  },
  {
    phase: "Phase 2", label: "Kennenlernen", motto: "Deine Chance wartet!", sub: "Überzeuge mit Persönlichkeit!",
    icon: MessageSquare, color: "#4A7A6E",
    steps: [
      { title: "Erstes Gespräch «Kennenlernen»", icon: MessageSquare, desc: "Im ersten Gespräch erfährst du mehr über uns und die Stelle. Wir lernen dich und deine Wünsche kennen. Wenn auf beiden Seiten alles passt, laden wir dich zu einem zweiten Gespräch ein." },
      { title: "Zweites Gespräch «oder Schnuppern»", icon: Users, desc: "Im Aussendienst wirst du zu einem zweiten Gespräch eingeladen, und im Innendienst laden wir dich je nach Position zu einem Schnuppertag ein. So erhältst du einen Einblick in unseren Arbeitsalltag." },
    ],
  },
  {
    phase: "Phase 3", label: "Angebot & Vertrag", motto: "Der Erfolg rückt näher!", sub: "Fast geschafft!",
    icon: Handshake, color: "#3A6A5E",
    steps: [
      { title: "Angebot", icon: FileCheck, desc: "Du hast uns überzeugt! Wir machen dir ein konkretes Angebot." },
      { title: "Vertrag", icon: Handshake, desc: "Du entscheidest dich für SSM. Dein Vertrag ist innerhalb von fünf Tagen in deiner Mailbox." },
    ],
  },
  {
    phase: "Phase 4", label: "Willkommen!", motto: "Auf geht's zum neuen Abenteuer!", sub: "Willkommen an Board!",
    icon: PartyPopper, color: "#2A5A4E",
    steps: [
      { title: "Willkommen an Board!", icon: Rocket, desc: "Dein erster Tag bei SSM ist da! Wir freuen uns, dich im Team zu begrüssen. Damit du dich schnell bei uns zu Hause fühlst, gibt dir unser «WelcomeDay» einen ersten Einblick in unser Unternehmen. Wir wünschen dir viel Erfolg und Freude!" },
    ],
  },
];

const Career = () => {
  const { t } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [showProcess, setShowProcess] = useState(false);
  const [activePhase, setActivePhase] = useState(0);

  const { data: recruitingPartner } = useQuery({
    queryKey: ["recruiting-partner"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_recruiting_partner", true)
        .eq("active", true)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: videoCards } = useQuery({
    queryKey: ["career-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_videos")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const reasons = [
    { num: "01", title: t("career.why.1.title"), desc: t("career.why.1.desc") },
    { num: "02", title: t("career.why.2.title"), desc: t("career.why.2.desc") },
    { num: "03", title: t("career.why.3.title"), desc: t("career.why.3.desc") },
  ];

  const steps = [
    { title: t("career.onboarding.1.title"), desc: t("career.onboarding.1.desc") },
    { title: t("career.onboarding.2.title"), desc: t("career.onboarding.2.desc") },
    { title: t("career.onboarding.3.title"), desc: t("career.onboarding.3.desc") },
    { title: t("career.onboarding.4.title"), desc: t("career.onboarding.4.desc") },
  ];

  return (
    <main>
      <PageHero pageKey="career" fallbackImage="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80" />

      {/* ── Hero Text ── */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl relative">
          <AnimatedSection>
            <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
              {t("career.hero.title")}
            </h1>
            <p className="font-body text-base text-muted-foreground mt-6 leading-relaxed">
              {t("career.hero.sub")}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/kontakt?subject=career"
                className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-3 rounded-xl text-white hover:opacity-90 transition-colors"
                style={{ backgroundColor: "#6A9387" }}
              >
                <Mail size={16} /> {t("career.hero.cta")}
              </Link>
              <button
                onClick={() => { setShowProcess(true); setActivePhase(0); }}
                className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
              >
                Bewerbungsprozess erkunden <ArrowRight size={16} />
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Image Divider ── */}
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
          alt="Teamarbeit"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #243e3a99, #6A938766)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-heading text-2xl lg:text-3xl font-bold text-white text-center px-6 drop-shadow-lg">
            «Gemeinsam gestalten wir die Zukunft der Finanzberatung.»
          </p>
        </div>
      </div>

      {/* ── Video Cards ── */}
      {videoCards && videoCards.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-6 lg:px-8">
            <AnimatedSection>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">Einblick in unsere Welt</h2>
              <p className="font-body text-base text-muted-foreground mt-4 max-w-2xl leading-relaxed">
                Erleben Sie, wie der Arbeitsalltag bei SSM Partner aussieht — authentisch, motivierend und voller Möglichkeiten.
              </p>
              <div className="brand-rule mt-4" />
            </AnimatedSection>
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mt-12">
              {videoCards.map((card, i) => (
                <AnimatedSection key={card.id} delay={i * 0.15}>
                  <button
                    onClick={() => card.video_url && setActiveVideo(card.video_url)}
                    className="group relative w-full aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer border border-border"
                    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
                  >
                    {card.image_url ? (
                      <img src={card.image_url} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                    <div className="absolute inset-0 bg-foreground/30 group-hover:bg-[#243e3a]/60 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play size={28} className="ml-1" style={{ color: "#243e3a" }} />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/50 to-transparent">
                      <h3 className="font-heading text-lg font-semibold text-white drop-shadow-lg">{card.title}</h3>
                    </div>
                  </button>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Was dich erwartet ── */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">Was dich erwartet bei SSM</h2>
            <div className="brand-rule mt-4" />
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-12">
            {[
              { icon: HeartHandshake, label: "Work-Life-Balance" },
              { icon: Scale, label: "Faire Vergütung" },
              { icon: Palmtree, label: "Ferien" },
              { icon: BadgePercent, label: "Rabatte" },
              { icon: GraduationCap, label: "Aus- & Weiterbildung" },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="flex flex-col items-center text-center gap-4 rounded-2xl border border-border bg-background p-6 lg:p-8 hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#6A9387" }}>
                    <item.icon size={28} className="text-white" />
                  </div>
                  <span className="font-heading text-sm font-semibold text-foreground">{item.label}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why SSM ── */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6 lg:px-8 grid md:grid-cols-3 gap-12 lg:gap-16">
          {reasons.map((r, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <span className="font-heading text-5xl font-bold" style={{ color: "#6A938730" }}>{r.num}</span>
              <h3 className="font-heading text-base font-semibold text-foreground mt-3">{r.title}</h3>
              <p className="font-body text-sm text-muted-foreground mt-3 leading-relaxed">{r.desc}</p>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── Image Divider 2 ── */}
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
          alt="Moderne Büros"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #243e3acc, #6A938788)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-heading text-2xl lg:text-3xl font-bold text-white text-center px-6 drop-shadow-lg">
            Moderne Arbeitsplätze. Inspirierendes Umfeld.
          </p>
        </div>
      </div>

      {/* ── Ansprechpartner ── */}
      {recruitingPartner && (
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-6 lg:px-8">
            <AnimatedSection>
              <div className="relative rounded-2xl border border-border overflow-hidden bg-card" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <div className="flex flex-col md:flex-row items-stretch">
                  <div className="md:w-64 lg:w-72 shrink-0">
                    {recruitingPartner.image_url ? (
                      <img src={recruitingPartner.image_url} alt={recruitingPartner.name} className="w-full h-full object-cover min-h-[240px] md:min-h-full" />
                    ) : (
                      <div className="w-full h-full min-h-[240px] bg-muted flex items-center justify-center">
                        <span className="font-heading text-4xl text-muted-foreground">{recruitingPartner.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center">
                    <span className="font-body text-xs font-medium uppercase tracking-widest text-muted-foreground">Dein Ansprechpartner</span>
                    <h3 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mt-2">{recruitingPartner.name}</h3>
                    <p className="font-body text-sm font-medium mt-1" style={{ color: "#6A9387" }}>
                      {recruitingPartner.role_de || "Recruiting Partner"}
                    </p>
                    <p className="font-body text-sm text-muted-foreground mt-4 leading-relaxed max-w-lg">
                      Spontane Bewerbung? Oder hast du eine Frage? {recruitingPartner.name.split(" ")[0]} nimmt sich für deine offenen Fragen Zeit. Entdecke unten die nächsten Schritte im Bewerbungsprozess.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-6">
                      <Link to="/kontakt?subject=career" className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-2.5 rounded-xl text-white hover:opacity-90 transition-colors" style={{ backgroundColor: "#6A9387" }}>
                        <Mail size={16} /> Jetzt bewerben
                      </Link>
                      <Link to="/agenturen" className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors">
                        <Building2 size={16} /> Unsere Agenturen
                      </Link>
                      <Link to="/kontakt?subject=other" className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors">
                        <MessageCircleQuestion size={16} /> Frage stellen
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ── Onboarding Steps ── */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">{t("career.onboarding.title")}</h2>
            <p className="font-body text-base text-muted-foreground mt-4 max-w-2xl leading-relaxed">
              Von der Bewerbung bis zum ersten Arbeitstag — wir begleiten dich durch jeden Schritt.
            </p>
            <div className="brand-rule mt-4" />
          </AnimatedSection>
          <div className="grid md:grid-cols-4 gap-8 lg:gap-12 mt-16">
            {steps.map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center font-heading text-sm font-bold text-white" style={{ backgroundColor: "#6A9387" }}>{i + 1}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <h3 className="font-heading text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={0.4} className="mt-12">
            <button
              onClick={() => { setShowProcess(true); setActivePhase(0); }}
              className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-3 rounded-xl text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: "#6A9387" }}
            >
              Bewerbungsprozess erkunden <ArrowRight size={16} />
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Video Modal ── */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setActiveVideo(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActiveVideo(null)} className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors">
              <X size={20} className="text-white" />
            </button>
            <video src={activeVideo} autoPlay controls className="w-full h-full object-cover bg-black" />
          </div>
        </div>
      )}

      {/* ── Bewerbungsprozess Modal ── */}
      <AnimatePresence>
        {showProcess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-8"
            onClick={() => setShowProcess(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-3xl bg-background rounded-2xl shadow-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-background rounded-t-2xl border-b">
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">Dein Weg zu uns</h2>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">Schritt für Schritt zum neuen Job</p>
                  </div>
                  <button onClick={() => setShowProcess(false)} className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors">
                    <X size={18} className="text-foreground" />
                  </button>
                </div>
                {/* Phase tabs */}
                <div className="flex overflow-x-auto px-5 pb-0 gap-0">
                  {phases.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhase(i)}
                      className={`flex items-center gap-1.5 px-4 py-3 font-body text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                        activePhase === i ? "text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                      style={activePhase === i ? { color: p.color, borderColor: p.color } : {}}
                    >
                      {i < activePhase ? <CheckCircle2 size={14} style={{ color: "#6A9387" }} /> : <p.icon size={14} />}
                      <span className="hidden sm:inline">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 lg:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePhase}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Motto */}
                    <div className="text-center mb-10">
                      <span className="inline-flex items-center gap-2 font-body text-[11px] font-medium uppercase tracking-widest px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: phases[activePhase].color }}>
                        {phases[activePhase].phase}
                      </span>
                      <h3 className="font-heading text-2xl font-bold text-foreground mt-4">{phases[activePhase].motto}</h3>
                      <p className="font-body text-sm text-muted-foreground mt-1">{phases[activePhase].sub}</p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-5">
                      {phases[activePhase].steps.map((step, si) => (
                        <motion.div
                          key={si}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: si * 0.1 }}
                          className="flex gap-4"
                        >
                          <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: phases[activePhase].color }}>
                            <step.icon size={18} className="text-white" />
                          </div>
                          <div className="flex-1 bg-card border border-border rounded-xl p-5">
                            <h4 className="font-heading text-sm font-semibold text-foreground">{step.title}</h4>
                            <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{step.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Nav */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t">
                      {activePhase > 0 ? (
                        <button onClick={() => setActivePhase(activePhase - 1)} className="font-body text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                          <ChevronRight size={14} className="rotate-180" /> {phases[activePhase - 1].label}
                        </button>
                      ) : <div />}
                      {activePhase < phases.length - 1 ? (
                        <button onClick={() => setActivePhase(activePhase + 1)} className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-2.5 rounded-xl text-white hover:opacity-90 transition-colors" style={{ backgroundColor: phases[activePhase + 1].color }}>
                          {phases[activePhase + 1].label} <ChevronRight size={14} />
                        </button>
                      ) : (
                        <Link to="/kontakt?subject=career" onClick={() => setShowProcess(false)} className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-2.5 rounded-xl text-white hover:opacity-90 transition-colors" style={{ backgroundColor: "#6A9387" }}>
                          <Send size={14} /> Jetzt bewerben
                        </Link>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Career;
