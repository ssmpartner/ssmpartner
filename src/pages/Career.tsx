import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import { Play, X, Scale, Palmtree, BadgePercent, GraduationCap, HeartHandshake, Mail, Building2, MessageCircleQuestion } from "lucide-react";

const Career = () => {
  const { t } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

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

  const positions = [
    { role: "Finanzcoach (Aussendienst)", location: "Rothenburg / Schweizweit", workload: "80–100%" },
    { role: "Key Account Manager", location: "Rothenburg", workload: "100%" },
    { role: "Teamleiter/in", location: "Rothenburg", workload: "100%" },
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
      {/* Hero */}
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
            <Link to="/kontakt" className="inline-block mt-6 font-body text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              {t("career.hero.cta")}
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Video Cards */}
      {videoCards && videoCards.length > 0 && (
        <section className="py-16 lg:py-24 border-t">
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
                    style={{ boxShadow: "0 12px 40px -8px hsl(var(--primary) / 0.15)" }}
                  >
                    {card.image_url ? (
                      <img src={card.image_url} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                    <div className="absolute inset-0 bg-foreground/30 group-hover:bg-primary/60 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary-foreground/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play size={28} className="text-primary ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-heading text-lg font-semibold text-primary-foreground drop-shadow-lg">{card.title}</h3>
                    </div>
                  </button>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Was dich erwartet */}
      <section className="py-16 lg:py-24 border-t">
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
                <div className="flex flex-col items-center text-center gap-4 rounded-2xl border border-border p-6 lg:p-8 hover:shadow-lg transition-shadow">
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

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setActiveVideo(null)}>
          <div className="absolute inset-0 bg-foreground/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-foreground/60 hover:bg-foreground/80 flex items-center justify-center transition-colors"
            >
              <X size={20} className="text-primary-foreground" />
            </button>
            <video
              src={activeVideo}
              autoPlay
              controls
              className="w-full h-full object-cover bg-foreground"
            />
          </div>
        </div>
      )}

      {/* Ansprechpartner Floating Box */}
      {recruitingPartner && (
        <section className="py-16 lg:py-24 border-t">
          <div className="container mx-auto px-6 lg:px-8">
            <AnimatedSection>
              <div className="relative rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "0 16px 48px -12px hsl(var(--primary) / 0.12)" }}>
                <div className="flex flex-col md:flex-row items-stretch">
                  {/* Photo */}
                  <div className="md:w-64 lg:w-72 shrink-0">
                    {recruitingPartner.image_url ? (
                      <img
                        src={recruitingPartner.image_url}
                        alt={recruitingPartner.name}
                        className="w-full h-full object-cover min-h-[240px] md:min-h-full"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[240px] bg-muted flex items-center justify-center">
                        <span className="font-heading text-4xl text-muted-foreground">{recruitingPartner.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  {/* Content */}
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
                      <Link
                        to="/kontakt?subject=career"
                        className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-2.5 rounded-xl text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: "#6A9387" }}
                      >
                        <Mail size={16} /> Jetzt bewerben
                      </Link>
                      <Link
                        to="/agenturen"
                        className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
                      >
                        <Building2 size={16} /> Unsere Agenturen
                      </Link>
                      <Link
                        to="/kontakt?subject=other"
                        className="inline-flex items-center gap-2 font-body text-sm font-medium px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
                      >
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

      {/* Why SSM */}
      <section className="py-24 lg:py-32 border-t bg-card">
        <div className="container mx-auto px-6 lg:px-8 grid md:grid-cols-3 gap-12 lg:gap-16">
          {reasons.map((r, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <span className="font-heading text-5xl font-bold text-primary/20">{r.num}</span>
              <h3 className="font-heading text-base font-semibold text-foreground mt-3">{r.title}</h3>
              <p className="font-body text-sm text-muted-foreground mt-3 leading-relaxed">{r.desc}</p>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-24 lg:py-32 border-t">
        <div className="container mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">{t("career.positions.title")}</h2>
            <div className="brand-rule mt-4" />
          </AnimatedSection>

          <div className="mt-12">
            <div className="hidden md:grid grid-cols-4 gap-4 pb-3 border-b text-xs font-body text-muted-foreground uppercase tracking-widest">
              <span>{t("career.positions.role")}</span>
              <span>{t("career.positions.location")}</span>
              <span>{t("career.positions.workload")}</span>
              <span />
            </div>
            {positions.map((p, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div className="grid md:grid-cols-4 gap-2 md:gap-4 py-5 border-b items-center hover:bg-muted/50 transition-colors px-2 -mx-2 rounded-lg">
                  <span className="font-body text-sm font-medium text-foreground">{p.role}</span>
                  <span className="font-body text-sm text-muted-foreground">{p.location}</span>
                  <span className="font-body text-sm text-muted-foreground">{p.workload}</span>
                  <Link to="/kontakt" className="font-body text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    {t("career.positions.more")}
                  </Link>
                </div>
              </AnimatedSection>
            ))}
            <AnimatedSection className="mt-6">
              <Link to="/kontakt" className="font-body text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                {t("career.positions.spontaneous")}
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Onboarding */}
      <section className="py-24 lg:py-32 border-t bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">{t("career.onboarding.title")}</h2>
            <div className="brand-rule mt-4" />
          </AnimatedSection>
          <div className="grid md:grid-cols-4 gap-8 lg:gap-12 mt-16">
            {steps.map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center font-heading text-sm font-bold text-primary-foreground">{i + 1}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <h3 className="font-heading text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Career;
