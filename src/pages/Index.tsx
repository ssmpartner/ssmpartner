import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import CountUp from "@/components/CountUp";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Send, ChevronLeft, ChevronRight, MapPin,
  Shield, TrendingUp, Building2, Users, Briefcase,
  ArrowRight, Star, HeartHandshake, Award
} from "lucide-react";

const fallbackSlides = [
  {
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
    headline: "Ihr Partner für Finanzen",
    subline: "Massgeschneiderte Lösungen für Versicherung, Vorsorge und Finanzierung.",
  },
  {
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1920&q=80",
    headline: "Transparenz & Vertrauen",
    subline: "Wir bringen Klarheit in den Finanz- und Versicherungsmarkt.",
  },
  {
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80",
    headline: "Technologie trifft Beratung",
    subline: "Innovation und persönliche Betreuung — das Beste aus beiden Welten.",
  },
];

const services = [
  { icon: Shield, title: "home.services.1.title", desc: "home.services.1.desc" },
  { icon: TrendingUp, title: "home.services.2.title", desc: "home.services.2.desc" },
  { icon: Building2, title: "home.services.3.title", desc: "home.services.3.desc" },
];

const Index = () => {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);

  const { data: dbSlides } = useQuery({
    queryKey: ["slider-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slider_images")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: agencies } = useQuery({
    queryKey: ["home-agencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agencies")
        .select("name, slug, image_url")
        .eq("active", true)
        .order("sort_order")
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const { data: jobCount } = useQuery({
    queryKey: ["home-job-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("job_positions")
        .select("*", { count: "exact", head: true })
        .eq("active", true);
      if (error) throw error;
      return count || 0;
    },
  });

  const slides = dbSlides && dbSlides.length > 0
    ? dbSlides.map((s) => ({ image: s.image_url, headline: s.headline || "", subline: s.subline || "" }))
    : fallbackSlides;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <main>
      {/* Hero Slider — 75vh */}
      <section className="relative w-full overflow-hidden" style={{ height: "75vh" }}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={slide.image}
              alt={slide.headline || `Slide ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} />
            {(slide.headline || slide.subline) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                {slide.headline && (
                  <h1
                    className="font-heading text-white leading-tight max-w-3xl"
                    style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 500 }}
                  >
                    {slide.headline}
                  </h1>
                )}
                {slide.subline && (
                  <p className="mt-4 max-w-xl" style={{ fontSize: "clamp(14px, 1.5vw, 18px)", color: "rgba(255,255,255,0.8)" }}>
                    {slide.subline}
                  </p>
                )}
                <div className="flex gap-4 mt-8">
                  <Link
                    to="/kontakt"
                    className="font-body text-sm font-semibold px-8 py-3.5 rounded-xl transition-all hover:opacity-90 uppercase tracking-wider"
                    style={{ backgroundColor: "#B3B69C", color: "#fff" }}
                  >
                    Beratung anfragen
                  </Link>
                  <Link
                    to="/ueber-uns"
                    className="font-body text-sm font-medium px-8 py-3.5 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all uppercase tracking-wider"
                  >
                    Mehr erfahren
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={prev}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className="w-2.5 h-2.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === current ? "#B3B69C" : "rgba(179,182,156,0.45)",
                transform: i === current ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </section>

      {/* Overlap CTA Bar */}
      <div className="relative z-20 -mt-9 px-6 lg:px-8">
        <div
          className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-10 py-5"
          style={{
            backgroundColor: "#B3B69C",
            borderRadius: "18px",
            boxShadow: "0 8px 32px rgba(36,62,58,0.18), 0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <p className="font-body text-base sm:text-lg font-medium text-white text-center sm:text-left">
            Persönliche Beratung — wir sind für Sie da.
          </p>
          <Link
            to="/kontakt"
            className="shrink-0 font-body text-sm font-semibold px-7 py-3 rounded-xl transition-all hover:opacity-90 uppercase tracking-wider"
            style={{ backgroundColor: "#243e3a", color: "#ffffff" }}
          >
            Jetzt Kontakt aufnehmen
          </Link>
        </div>
      </div>

      {/* Animated Quote Banner */}
      <QuoteBanner />

      {/* Wer wir sind */}
      <section className="py-24 lg:py-32 bg-card">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <p className="font-body text-sm font-medium text-primary uppercase tracking-wider mb-3">Über SSM Partner</p>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
                {t("home.who.title")}
              </h2>
              <div className="w-16 h-1 rounded-full mt-4" style={{ backgroundColor: "#B3B69C" }} />
              <p className="font-body text-base text-muted-foreground mt-6 leading-relaxed">
                {t("home.who.text")}
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  to="/ueber-uns"
                  className="inline-flex items-center gap-2 font-body text-sm font-semibold px-6 py-3 rounded-xl transition-all hover:opacity-90 uppercase tracking-wider bg-primary text-primary-foreground"
                >
                  {t("home.who.cta")}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/agenturen"
                  className="inline-flex items-center gap-2 font-body text-sm font-medium px-6 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-all"
                >
                  <MapPin size={16} />
                  Unsere Standorte
                </Link>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden aspect-[3/4]" style={{ boxShadow: "0 8px 32px rgba(36,62,58,0.12)" }}>
                    <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80" alt="Team" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden aspect-[3/4]" style={{ boxShadow: "0 8px 32px rgba(36,62,58,0.12)" }}>
                    <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80" alt="Beratung" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          <AnimatedSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="font-body text-sm font-medium text-primary uppercase tracking-wider mb-3">Unsere Dienstleistungen</p>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
                {t("home.services.title")}
              </h2>
              <div className="w-16 h-1 rounded-full mt-4 mx-auto" style={{ backgroundColor: "#B3B69C" }} />
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="bg-card border rounded-2xl p-8 h-full transition-shadow hover:shadow-xl"
                    style={{ boxShadow: "0 4px 24px rgba(36,62,58,0.08)" }}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(179,182,156,0.15)" }}>
                      <Icon size={24} className="text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-3">{t(service.title)}</h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{t(service.desc)}</p>
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="relative container mx-auto px-6 lg:px-8 max-w-3xl text-center">
          <AnimatedSection>
            <Star size={32} className="mx-auto mb-6" style={{ color: "#B3B69C" }} />
            <blockquote className="font-heading text-2xl lg:text-3xl font-medium text-white leading-relaxed">
              {t("home.trust.quote")}
            </blockquote>
            <p className="font-body text-sm mt-6" style={{ color: "rgba(255,255,255,0.6)" }}>
              {t("home.trust.author")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Agenturen Teaser */}
      {agencies && agencies.length > 0 && (
        <section className="py-24 lg:py-32 bg-card">
          <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
            <AnimatedSection>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-14">
                <div>
                  <p className="font-body text-sm font-medium text-primary uppercase tracking-wider mb-3">Schweizweit für Sie da</p>
                  <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">Unsere Standorte</h2>
                  <div className="w-16 h-1 rounded-full mt-4" style={{ backgroundColor: "#B3B69C" }} />
                </div>
                <Link
                  to="/agenturen"
                  className="inline-flex items-center gap-2 font-body text-sm font-medium text-primary hover:underline"
                >
                  Alle Agenturen
                  <ArrowRight size={16} />
                </Link>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {agencies.map((agency, i) => (
                <AnimatedSection key={agency.slug} delay={i * 0.08}>
                  <Link to={`/agenturen/${agency.slug}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="group rounded-2xl overflow-hidden border bg-background transition-shadow hover:shadow-xl"
                      style={{ boxShadow: "0 4px 24px rgba(36,62,58,0.08)" }}
                    >
                      <div className="aspect-[16/10] bg-muted overflow-hidden">
                        {agency.image_url ? (
                          <img src={agency.image_url} alt={agency.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <Building2 size={32} className="text-primary/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-heading text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{agency.name}</h3>
                      </div>
                    </motion.div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Karriere CTA */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <div className="rounded-2xl overflow-hidden aspect-[16/10]" style={{ boxShadow: "0 8px 32px rgba(36,62,58,0.12)" }}>
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                  alt="Karriere bei SSM"
                  className="w-full h-full object-cover"
                />
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.15}>
              <p className="font-body text-sm font-medium text-primary uppercase tracking-wider mb-3">Karriere</p>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
                Werde Teil unseres Teams
              </h2>
              <div className="w-16 h-1 rounded-full mt-4" style={{ backgroundColor: "#B3B69C" }} />
              <p className="font-body text-base text-muted-foreground mt-6 leading-relaxed">
                Entdecke spannende Karrieremöglichkeiten bei SSM Partner. Wir bieten dir ein inspirierendes Arbeitsumfeld, faire Vergütung und echte Entwicklungsperspektiven.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-6">
                {[
                  { icon: HeartHandshake, text: "Work-Life-Balance" },
                  { icon: Award, text: "Weiterbildung" },
                  { icon: Users, text: "Starkes Team" },
                ].map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-2 font-body text-xs font-medium px-3 py-1.5 rounded-full border border-border text-foreground">
                    <item.icon size={14} className="text-primary" />
                    {item.text}
                  </span>
                ))}
              </div>
              {jobCount !== undefined && jobCount > 0 && (
                <p className="font-body text-sm text-muted-foreground mt-4">
                  <span className="font-semibold text-foreground">{jobCount}</span> offene Stellen warten auf dich
                </p>
              )}
              <Link
                to="/karriere"
                className="inline-flex items-center gap-2 font-body text-sm font-semibold px-6 py-3 rounded-xl transition-all hover:opacity-90 uppercase tracking-wider bg-primary text-primary-foreground mt-8"
              >
                <Briefcase size={16} />
                Karriere entdecken
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Phone CTA */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl">
          <div>
            <h3 className="font-heading text-lg font-semibold text-white">
              {t("home.phone.title")}
            </h3>
            <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              {t("home.phone.sub")}
            </p>
          </div>
          <a
            href="tel:+41412202050"
            className="font-heading text-2xl lg:text-3xl font-bold text-white hover:opacity-80 transition-opacity whitespace-nowrap flex items-center gap-3"
          >
            <Phone size={24} />
            +41 41 220 20 50
          </a>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 lg:py-32 bg-card">
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center">
          <AnimatedSection>
            <p className="font-body text-sm font-medium text-primary uppercase tracking-wider mb-3">Kontakt</p>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
              Lassen Sie uns ins Gespräch kommen
            </h2>
            <div className="w-16 h-1 rounded-full mt-4 mx-auto" style={{ backgroundColor: "#B3B69C" }} />
            <p className="font-body text-base text-muted-foreground mt-6 leading-relaxed max-w-xl mx-auto">
              Ob Versicherungsfrage, Finanzplanung oder Karriereanfrage — wir sind persönlich für Sie da. Schreiben Sie uns oder besuchen Sie uns direkt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link
                to="/kontakt"
                className="inline-flex items-center justify-center gap-2 font-body text-sm font-semibold px-8 py-3.5 rounded-xl transition-all hover:opacity-90 uppercase tracking-wider bg-primary text-primary-foreground"
              >
                <Send size={16} />
                Kontakt aufnehmen
              </Link>
              <Link
                to="/agenturen"
                className="inline-flex items-center justify-center gap-2 font-body text-sm font-medium px-8 py-3.5 rounded-xl border border-border text-foreground hover:bg-muted transition-all"
              >
                <MapPin size={16} />
                Agentur in Ihrer Nähe
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Index;
