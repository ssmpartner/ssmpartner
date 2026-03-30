import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import { Play, X } from "lucide-react";

const Career = () => {
  const { t } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

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
      <section className="py-16 lg:py-24 border-t">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {videoCards.map((card, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <button
                  onClick={() => setActiveVideo(card.videoUrl)}
                  className="group relative w-full aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer border border-border"
                  style={{ boxShadow: "0 12px 40px -8px hsl(var(--primary) / 0.15)" }}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
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
