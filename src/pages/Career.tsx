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
  ChevronRight, CheckCircle2, ChevronDown,
} from "lucide-react";
import ssmPattern from "@/assets/ssm-structure-pattern.png";
import { useCmsContent } from "@/hooks/useCmsContent";

/* ── FAQ Accordion Item ── */
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
        <span className="font-heading text-sm font-semibold text-foreground">{question}</span>
        <ChevronDown size={18} className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="font-body text-sm text-muted-foreground px-5 pb-5 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Bewerbungsprozess phases (localized via t) ── */
const buildPhases = (t: (k: string) => string) => [
  {
    phase: t("career.phase.1.phase"), label: t("career.phase.1.label"),
    motto: t("career.phase.1.motto"), sub: t("career.phase.1.sub"),
    icon: Send, color: "#6A9387",
    steps: [
      { title: t("career.phase.1.step1.title"), icon: Send, desc: t("career.phase.1.step1.desc") },
      { title: t("career.phase.1.step2.title"), icon: FileText, desc: t("career.phase.1.step2.desc") },
      { title: t("career.phase.1.step3.title"), icon: Users, desc: t("career.phase.1.step3.desc") },
    ],
  },
  {
    phase: t("career.phase.2.phase"), label: t("career.phase.2.label"),
    motto: t("career.phase.2.motto"), sub: t("career.phase.2.sub"),
    icon: MessageSquare, color: "#4A7A6E",
    steps: [
      { title: t("career.phase.2.step1.title"), icon: MessageSquare, desc: t("career.phase.2.step1.desc") },
      { title: t("career.phase.2.step2.title"), icon: Users, desc: t("career.phase.2.step2.desc") },
    ],
  },
  {
    phase: t("career.phase.3.phase"), label: t("career.phase.3.label"),
    motto: t("career.phase.3.motto"), sub: t("career.phase.3.sub"),
    icon: Handshake, color: "#3A6A5E",
    steps: [
      { title: t("career.phase.3.step1.title"), icon: FileCheck, desc: t("career.phase.3.step1.desc") },
      { title: t("career.phase.3.step2.title"), icon: Handshake, desc: t("career.phase.3.step2.desc") },
    ],
  },
  {
    phase: t("career.phase.4.phase"), label: t("career.phase.4.label"),
    motto: t("career.phase.4.motto"), sub: t("career.phase.4.sub"),
    icon: PartyPopper, color: "#2A5A4E",
    steps: [
      { title: t("career.phase.4.step1.title"), icon: Rocket, desc: t("career.phase.4.step1.desc") },
    ],
  },
];

const Career = () => {
  const { t, lang } = useLanguage();
  const { cmsTitle, cmsBody } = useCmsContent("career");
  const phases = buildPhases(t);
  const localized = (obj: any, base: string) => obj?.[`${base}_${lang}`] || obj?.[`${base}_de`] || "";
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [showProcess, setShowProcess] = useState(false);
  const [activePhase, setActivePhase] = useState(0);
  const [showApply, setShowApply] = useState(false);

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

  const { data: faqs } = useQuery({
    queryKey: ["career-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_faqs")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: processImage } = useQuery({
    queryKey: ["career-process-hero"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_heroes")
        .select("image_url")
        .eq("page_key", "career-process")
        .maybeSingle();
      if (error) throw error;
      return data?.image_url || null;
    },
  });

  const { data: dividerImages } = useQuery({
    queryKey: ["career-divider-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_heroes")
        .select("page_key, image_url")
        .in("page_key", ["career-divider-1", "career-divider-2"]);
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((d) => { if (d.image_url) map[d.page_key] = d.image_url; });
      return map;
    },
  });

  const reasons = [
    { num: "01", title: cmsTitle("career_why_1", t("career.why.1.title")), desc: cmsBody("career_why_1", t("career.why.1.desc")) },
    { num: "02", title: cmsTitle("career_why_2", t("career.why.2.title")), desc: cmsBody("career_why_2", t("career.why.2.desc")) },
    { num: "03", title: cmsTitle("career_why_3", t("career.why.3.title")), desc: cmsBody("career_why_3", t("career.why.3.desc")) },
  ];

  const steps = [
    { title: t("career.onboarding.1.title"), desc: t("career.onboarding.1.desc") },
    { title: t("career.onboarding.2.title"), desc: t("career.onboarding.2.desc") },
    { title: t("career.onboarding.3.title"), desc: t("career.onboarding.3.desc") },
    { title: t("career.onboarding.4.title"), desc: t("career.onboarding.4.desc") },
  ];

  return (
    <main>
      <PageHero pageKey="career" />

      {/* ── Hero Text ── */}
      <section className="py-24 lg:py-32 relative overflow-hidden bg-background">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url(${ssmPattern})`, backgroundSize: "900px auto", backgroundPosition: "right bottom", backgroundRepeat: "no-repeat", opacity: 0.07, mixBlendMode: "multiply", transform: "scaleY(-1)" }} />
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl relative z-10">
          <AnimatedSection>
            <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-semibold text-foreground leading-tight">
              {cmsTitle("career_hero", t("career.hero.title"))}
            </h1>
            <p className="font-body text-base text-muted-foreground mt-6 leading-relaxed">
              {cmsBody("career_hero", t("career.hero.sub"))}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => setShowApply(true)}
                className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-3 rounded-xl text-white hover:opacity-90 transition-colors"
                style={{ backgroundColor: "#6A9387" }}
              >
                <Mail size={16} /> {t("career.hero.cta")}
              </button>
              <button
                onClick={() => { setShowProcess(true); setActivePhase(0); }}
                className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
              >
                {t("career.exploreProcess")} <ArrowRight size={16} />
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Image Divider ── */}
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img
          src={dividerImages?.["career-divider-1"] || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"}
          alt="Teamarbeit"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #243e3a99, #6A938766)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-heading text-2xl lg:text-3xl font-semibold text-white text-center px-6 drop-shadow-lg">
            {cmsBody("career_divider_1", t("career.divider1"))}
          </p>
        </div>
      </div>

      {/* ── Video Cards ── */}
      {videoCards && videoCards.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-6 lg:px-8">
            <AnimatedSection>
              <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-foreground">{cmsTitle("career_videos", t("career.videos.title"))}</h2>
              <p className="font-body text-base text-muted-foreground mt-4 max-w-2xl leading-relaxed">
                {cmsBody("career_videos", t("career.videos.body"))}
              </p>
              <div className="brand-rule mt-4" />
            </AnimatedSection>
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mt-12">
              {videoCards.map((card, i) => (
                <AnimatedSection key={card.id} delay={i * 0.15}>
                  <motion.button
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    onClick={() => card.video_url && setActiveVideo(card.video_url)}
                    className="group relative w-full aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer border border-border hover:shadow-2xl transition-shadow duration-300"
                    style={{ boxShadow: "0 16px 48px -8px rgba(0,0,0,0.15), 0 8px 24px -4px rgba(106,147,135,0.2)" }}
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
                  </motion.button>
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
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-foreground">{cmsTitle("career_benefits", t("career.benefits.title"))}</h2>
            <div className="brand-rule mt-4" />
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-12">
            {[
              { icon: HeartHandshake, label: t("career.benefit.balance") },
              { icon: Scale, label: t("career.benefit.pay") },
              { icon: Palmtree, label: t("career.benefit.holidays") },
              { icon: BadgePercent, label: t("career.benefit.discounts") },
              { icon: GraduationCap, label: t("career.benefit.training") },
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
              <span className="font-heading text-5xl font-semibold" style={{ color: "#6A938730" }}>{r.num}</span>
              <h3 className="font-heading text-base font-semibold text-foreground mt-3">{r.title}</h3>
              <p className="font-body text-sm text-muted-foreground mt-3 leading-relaxed">{r.desc}</p>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── Image Divider 2 ── */}
      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img
          src={dividerImages?.["career-divider-2"] || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"}
          alt="Moderne Büros"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #243e3acc, #6A938788)" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-heading text-2xl lg:text-3xl font-semibold text-white text-center px-6 drop-shadow-lg">
            {cmsBody("career_divider_2", t("career.divider2"))}
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
                    <span className="font-body text-xs font-medium uppercase tracking-widest text-muted-foreground">{t("career.partner.label")}</span>
                    <h3 className="font-heading text-2xl lg:text-3xl font-semibold text-foreground mt-2">{recruitingPartner.name}</h3>
                    <p className="font-body text-sm font-medium mt-1" style={{ color: "#6A9387" }}>
                      {localized(recruitingPartner, "role") || t("career.partner.defaultRole")}
                    </p>
                    <p className="font-body text-sm text-muted-foreground mt-4 leading-relaxed max-w-lg">
                      {t("career.partner.body").replace("{name}", recruitingPartner.name.split(" ")[0])}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-6">
                      <button onClick={() => setShowApply(true)} className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-2.5 rounded-xl text-white hover:opacity-90 transition-colors" style={{ backgroundColor: "#6A9387" }}>
                        <Mail size={16} /> {t("career.partner.applyNow")}
                      </button>
                      <Link to="/agenturen" className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors">
                        <Building2 size={16} /> {t("career.partner.agencies")}
                      </Link>
                      <Link to="/kontakt?subject=other" className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors">
                        <MessageCircleQuestion size={16} /> {t("career.partner.askQuestion")}
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
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Left: Image */}
            {processImage && (
              <div className="w-full lg:w-[420px] shrink-0">
                <AnimatedSection>
                  <img
                    src={processImage}
                    alt="Ihr Weg zu uns"
                    className="w-full h-full min-h-[320px] lg:min-h-[480px] object-cover rounded-2xl"
                    style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
                  />
                </AnimatedSection>
              </div>
            )}

            {/* Right: Title + Steps vertical */}
            <div className="flex-1 flex flex-col justify-center">
              <AnimatedSection>
                <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-foreground">{t("career.onboarding.title")}</h2>
                <p className="font-body text-base text-muted-foreground mt-4 max-w-lg leading-relaxed">
                  {t("career.onboarding.body")}
                </p>
                <div className="brand-rule mt-4" />
              </AnimatedSection>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { icon: Rocket, title: t("career.path.start.title"), desc: t("career.path.start.desc") },
                  { icon: HeartHandshake, title: t("career.path.empower.title"), desc: t("career.path.empower.desc") },
                  { icon: Scale, title: t("career.path.lead.title"), desc: t("career.path.lead.desc") },
                ].map((card, i) => (
                  <AnimatedSection key={card.title} delay={i * 0.15}>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                      className="bg-white rounded-2xl p-6 flex flex-col items-center text-center gap-4"
                      style={{ boxShadow: "0 8px 30px rgba(106,147,135,0.15)" }}
                    >
                      <span
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: "#6A9387" }}
                      >
                        <card.icon size={22} />
                      </span>
                      <h3 className="font-heading text-lg font-semibold text-foreground">{card.title}</h3>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                    </motion.div>
                  </AnimatedSection>
                ))}
              </div>

              <AnimatedSection delay={0.4} className="mt-8">
                <button
                  onClick={() => { setShowProcess(true); setActivePhase(0); }}
                  className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-3 rounded-xl text-white hover:opacity-90 transition-colors"
                  style={{ backgroundColor: "#6A9387" }}
                >
                  {t("career.exploreProcess")} <ArrowRight size={16} />
                </button>
              </AnimatedSection>
            </div>
          </div>
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
                    <h2 className="font-heading text-xl font-semibold text-foreground">{t("career.process.title")}</h2>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">{t("career.process.sub")}</p>
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
                      <h3 className="font-heading text-2xl font-semibold text-foreground mt-4">{phases[activePhase].motto}</h3>
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
                        <button onClick={() => { setShowProcess(false); setShowApply(true); }} className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-2.5 rounded-xl text-white hover:opacity-90 transition-colors" style={{ backgroundColor: "#6A9387" }}>
                          <Send size={14} /> {t("career.partner.applyNow")}
                        </button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAQ ── */}
      {faqs && faqs.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <AnimatedSection>
              <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-foreground text-center">{t("career.faq.title")}</h2>
              <p className="font-body text-base text-muted-foreground mt-4 text-center">
                {t("career.faq.body")}
              </p>
              <div className="brand-rule mt-4 mx-auto" />
            </AnimatedSection>
            <div className="mt-12 space-y-3">
              {faqs.map((faq, i) => (
                <AnimatedSection key={faq.id} delay={i * 0.05}>
                  <FaqItem question={faq.question} answer={faq.answer} />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bewerbung iFrame Modal ── */}
      <AnimatePresence>
        {showApply && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-8"
            onClick={() => setShowApply(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-3xl bg-background rounded-2xl shadow-2xl my-8 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-foreground">{t("career.apply.title")}</h2>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">{t("career.apply.sub")}</p>
                </div>
                <button onClick={() => setShowApply(false)} className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors">
                  <X size={18} className="text-foreground" />
                </button>
              </div>
              <iframe
                src="https://recruit.ssmpartner.ch/bewerbung"
                className="w-full border-0"
                style={{ height: "80vh" }}
                title="Bewerbungsformular"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Career;
