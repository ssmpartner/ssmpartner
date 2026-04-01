import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";

import { motion } from "framer-motion";
import {
  Phone, Send, ChevronLeft, ChevronRight, MapPin,
  Shield, TrendingUp, Building2, Users, Briefcase,
  ArrowRight, Star, HeartHandshake, Award
} from "lucide-react";
import ssmPattern from "@/assets/ssm-structure-pattern.png";

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

const serviceIcons = [Shield, TrendingUp, Building2];

const Index = () => {
  const { t, lang: language } = useLanguage();
  const [current, setCurrent] = useState(0);

  // Slider images
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

  // Agencies for teaser
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

  // Job count
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

  // CMS texts for home page
  const { data: cmsContent } = useQuery({
    queryKey: ["home-content", language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("page", "home")
        .eq("lang", language)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // CMS images for home page
  const { data: cmsHeroes } = useQuery({
    queryKey: ["home-heroes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_heroes")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Helper: get CMS text by section_key
  const cms = useMemo(() => {
    const map: Record<string, { title?: string | null; body?: string | null; link_text?: string | null; link_url?: string | null }> = {};
    (cmsContent || []).forEach((c) => {
      map[c.section_key] = { title: c.title, body: c.body, link_text: c.link_text, link_url: c.link_url };
    });
    return map;
  }, [cmsContent]);

  // Helper: get CMS image by page_key
  const heroImg = useCallback((key: string, fallback: string) => {
    const found = (cmsHeroes || []).find((h) => h.page_key === key);
    return found?.image_url || fallback;
  }, [cmsHeroes]);

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

  // CMS values with fallbacks
  const overlapTitle = cms["home_overlap"]?.title || "Persönliche Beratung — wir sind für Sie da.";
  const overlapBody = cms["home_overlap"]?.body || "Unverbindlich und kostenlos — vereinbaren Sie ein Erstgespräch.";
  const overlapCta = cms["home_overlap"]?.link_text || "Jetzt Kontakt aufnehmen";

  const whoLabel = cms["home_who"]?.link_text || "Über SSM Partner";
  const whoTitle = cms["home_who"]?.title || t("home.who.title");
  const whoBody = cms["home_who"]?.body || t("home.who.text");
  const whoCta = cms["home_who"]?.link_url ? cms["home_who"].link_url : "/ueber-uns";

  const servicesLabel = cms["home_services"]?.link_text || "Unsere Dienstleistungen";
  const servicesTitle = cms["home_services"]?.title || t("home.services.title");
  const service1Title = cms["home_service_1"]?.title || t("home.services.1.title");
  const service1Desc = cms["home_service_1"]?.body || t("home.services.1.desc");
  const service2Title = cms["home_service_2"]?.title || t("home.services.2.title");
  const service2Desc = cms["home_service_2"]?.body || t("home.services.2.desc");
  const service3Title = cms["home_service_3"]?.title || t("home.services.3.title");
  const service3Desc = cms["home_service_3"]?.body || t("home.services.3.desc");
  const serviceData = [
    { icon: serviceIcons[0], title: service1Title, desc: service1Desc },
    { icon: serviceIcons[1], title: service2Title, desc: service2Desc },
    { icon: serviceIcons[2], title: service3Title, desc: service3Desc },
  ];

  const trustQuote = cms["home_trust"]?.body || t("home.trust.quote");
  const trustAuthor = cms["home_trust"]?.title || t("home.trust.author");

  const agencyLabel = cms["home_agencies"]?.link_text || "Schweizweit für Sie da";
  const agencyTitle = cms["home_agencies"]?.title || "Unsere Standorte";

  const careerLabel = cms["home_career"]?.link_text || "Karriere";
  const careerTitle = cms["home_career"]?.title || "Werde Teil unseres Teams";
  const careerBody = cms["home_career"]?.body || "Entdecke spannende Karrieremöglichkeiten bei SSM Partner. Wir bieten dir ein inspirierendes Arbeitsumfeld, faire Vergütung und echte Entwicklungsperspektiven.";

  const phoneTitle = cms["home_phone"]?.title || t("home.phone.title");
  const phoneSub = cms["home_phone"]?.body || t("home.phone.sub");
  const phoneNumber = cms["home_phone"]?.link_text || "+41 41 220 20 50";

  const contactLabel = cms["home_contact"]?.link_text || "Kontakt";
  const contactTitle = cms["home_contact"]?.title || "Lassen Sie uns ins Gespräch kommen";
  const contactBody = cms["home_contact"]?.body || "Ob Versicherungsfrage, Finanzplanung oder Karriereanfrage — wir sind persönlich für Sie da. Schreiben Sie uns oder besuchen Sie uns direkt.";

  const quickstart1Title = cms["home_quickstart_1"]?.title || "Karriere starten";
  const quickstart1Desc = cms["home_quickstart_1"]?.body || "Entdecke offene Stellen bei SSM";
  const quickstart2Title = cms["home_quickstart_2"]?.title || "Unsere Agenturen";
  const quickstart2Desc = cms["home_quickstart_2"]?.body || "Finde deinen Standort in der Nähe";

  return (
    <main>
      {/* Hero Slider — 85vh with floating cards */}
      <section className="relative w-full overflow-hidden" style={{ height: "85vh" }}>
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
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url(${ssmPattern})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.18, mixBlendMode: "overlay" }} />
            {(slide.headline || slide.subline) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pb-32">
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

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
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

        {/* Floating Quickstart Cards */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-6 hidden sm:grid grid-cols-2 gap-4">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Link
              to="/karriere"
              className="group flex items-center gap-4 bg-transparent backdrop-blur-sm border-2 border-white/80 rounded-2xl p-4 pr-6 transition-all hover:bg-white/10 hover:border-white"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/40">
                <img
                  src={heroImg("home_quickstart_1", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&q=80")}
                  alt="Karriere"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm font-bold text-white">{quickstart1Title}</p>
                <p className="font-body text-xs text-white/70 mt-0.5">{quickstart1Desc}</p>
              </div>
              <ArrowRight size={18} className="text-white shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Link
              to="/agenturen"
              className="group flex items-center gap-4 bg-transparent backdrop-blur-sm border-2 border-white/80 rounded-2xl p-4 pr-6 transition-all hover:bg-white/10 hover:border-white"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/40">
                <img
                  src={heroImg("home_quickstart_2", "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&q=80")}
                  alt="Agenturen"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm font-bold text-white">{quickstart2Title}</p>
                <p className="font-body text-xs text-white/70 mt-0.5">{quickstart2Desc}</p>
              </div>
              <ArrowRight size={18} className="text-white shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Mobile: stacked cards below dots */}
        <div className="absolute bottom-20 left-0 right-0 z-20 px-4 sm:hidden flex flex-col gap-3">
          <Link
            to="/karriere"
            className="flex items-center gap-3 bg-transparent backdrop-blur-sm border-2 border-white/80 rounded-xl p-3 pr-4"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/40">
              <img
                src={heroImg("home_quickstart_1", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&q=80")}
                alt="Karriere"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-heading text-xs font-bold text-white flex-1">{quickstart1Title}</p>
            <ArrowRight size={14} className="text-white" />
          </Link>
          <Link
            to="/agenturen"
            className="flex items-center gap-3 bg-transparent backdrop-blur-sm border-2 border-white/80 rounded-xl p-3 pr-4"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/40">
              <img
                src={heroImg("home_quickstart_2", "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&q=80")}
                alt="Agenturen"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-heading text-xs font-bold text-white flex-1">{quickstart2Title}</p>
            <ArrowRight size={14} className="text-white" />
          </Link>
        </div>
      </section>

      {/* Overlap CTA Bar */}
      <div className="relative z-20 -mt-12 px-6 lg:px-8">
        <div
          className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 px-10 lg:px-14 py-7"
          style={{
            backgroundColor: "#B3B69C",
            borderRadius: "18px",
            boxShadow: "0 8px 32px rgba(36,62,58,0.18), 0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div>
            <p className="font-heading text-lg sm:text-xl font-semibold text-white text-center sm:text-left">
              {overlapTitle}
            </p>
            <p className="font-body text-sm text-white/70 text-center sm:text-left mt-1">
              {overlapBody}
            </p>
          </div>
          <Link
            to="/kontakt"
            className="shrink-0 font-body text-sm font-semibold px-8 py-3.5 rounded-xl transition-all hover:opacity-90 uppercase tracking-wider"
            style={{ backgroundColor: "#243e3a", color: "#ffffff" }}
          >
            {overlapCta}
          </Link>
        </div>
      </div>

      {/* Wer wir sind */}
      <section className="py-24 lg:py-32 bg-card">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <p className="font-body text-sm font-medium text-primary uppercase tracking-wider mb-3">{whoLabel}</p>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
                {whoTitle}
              </h2>
              <div className="w-16 h-1 rounded-full mt-4" style={{ backgroundColor: "#B3B69C" }} />
              <p className="font-body text-base text-muted-foreground mt-6 leading-relaxed">
                {whoBody}
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  to={whoCta}
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
                    <img
                      src={heroImg("home_who_1", "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80")}
                      alt="Team"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden aspect-[3/4]" style={{ boxShadow: "0 8px 32px rgba(36,62,58,0.12)" }}>
                    <img
                      src={heroImg("home_who_2", "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80")}
                      alt="Beratung"
                      className="w-full h-full object-cover"
                    />
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
              <p className="font-body text-sm font-medium text-primary uppercase tracking-wider mb-3">{servicesLabel}</p>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
                {servicesTitle}
              </h2>
              <div className="w-16 h-1 rounded-full mt-4 mx-auto" style={{ backgroundColor: "#B3B69C" }} />
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8">
            {serviceData.map((service, i) => {
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
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
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
            src={heroImg("home_trust_bg", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80")}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="relative container mx-auto px-6 lg:px-8 max-w-3xl text-center">
          <AnimatedSection>
            <Star size={32} className="mx-auto mb-6" style={{ color: "#B3B69C" }} />
            <blockquote className="font-heading text-2xl lg:text-3xl font-medium text-white leading-relaxed">
              {trustQuote}
            </blockquote>
            <p className="font-body text-sm mt-6" style={{ color: "rgba(255,255,255,0.6)" }}>
              {trustAuthor}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Agenturen Teaser */}
      {agencies && agencies.length > 0 && (
        <section className="py-24 lg:py-32 bg-card relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url(${ssmPattern})`, backgroundSize: "900px auto", backgroundPosition: "left center", backgroundRepeat: "no-repeat", opacity: 0.07, mixBlendMode: "multiply" }} />
          <div className="container mx-auto px-6 lg:px-8 max-w-5xl relative z-10">
            <AnimatedSection>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-14">
                <div>
                  <p className="font-body text-sm font-medium text-primary uppercase tracking-wider mb-3">{agencyLabel}</p>
                  <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">{agencyTitle}</h2>
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
                  src={heroImg("home_career", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80")}
                  alt="Karriere bei SSM"
                  className="w-full h-full object-cover"
                />
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.15}>
              <p className="font-body text-sm font-medium text-primary uppercase tracking-wider mb-3">{careerLabel}</p>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
                {careerTitle}
              </h2>
              <div className="w-16 h-1 rounded-full mt-4" style={{ backgroundColor: "#B3B69C" }} />
              <p className="font-body text-base text-muted-foreground mt-6 leading-relaxed">
                {careerBody}
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
              {phoneTitle}
            </h3>
            <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              {phoneSub}
            </p>
          </div>
          <a
            href={`tel:${phoneNumber.replace(/\s/g, "")}`}
            className="font-heading text-2xl lg:text-3xl font-bold text-white hover:opacity-80 transition-opacity whitespace-nowrap flex items-center gap-3"
          >
            <Phone size={24} />
            {phoneNumber}
          </a>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 lg:py-32 bg-card">
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center">
          <AnimatedSection>
            <p className="font-body text-sm font-medium text-primary uppercase tracking-wider mb-3">{contactLabel}</p>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
              {contactTitle}
            </h2>
            <div className="w-16 h-1 rounded-full mt-4 mx-auto" style={{ backgroundColor: "#B3B69C" }} />
            <p className="font-body text-base text-muted-foreground mt-6 leading-relaxed max-w-xl mx-auto">
              {contactBody}
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
