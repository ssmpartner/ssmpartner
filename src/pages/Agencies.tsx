import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, ArrowRight, Building2, Users, Phone, X } from "lucide-react";
import ssmPattern from "@/assets/ssm-structure-pattern.png";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import SwissMap from "@/components/SwissMap";

const hqImageKeys = ["hq-1", "hq-2", "hq-3", "hq-4", "hq-5"];

const Agencies = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const { data: agencies, isLoading } = useQuery({
    queryKey: ["agencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const getDescription = (agency: any) => {
    const key = `description_${lang}` as string;
    return agency[key] || agency.description_de || "";
  };

  return (
    <main>
      <PageHero pageKey="team" />

      {/* Intro Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url(${ssmPattern})`, backgroundSize: "900px auto", backgroundPosition: "right bottom", backgroundRepeat: "no-repeat", opacity: 0.07, mixBlendMode: "multiply", transform: "scaleY(-1)" }} />
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimatedSection>
              <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground">
                Unsere Agenturen
              </h1>
              <div className="brand-rule mt-4" />
              <p className="font-body text-base text-muted-foreground mt-8 leading-relaxed">
                Entdecken Sie die Agenturen der SSM Partner AG und finden Sie die richtigen Ansprechpersonen
                in Ihrer Nähe. Mit {agencies?.length || 7} Standorten in der ganzen Schweiz sind wir immer für Sie da.
              </p>
              <p className="font-body text-base text-muted-foreground mt-4 leading-relaxed">
                Unsere modernen Büroräumlichkeiten bieten Ihnen eine professionelle und angenehme
                Atmosphäre für persönliche Beratungsgespräche.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-2 bg-card border rounded-xl px-4 py-3">
                  <Building2 size={18} className="text-primary" />
                  <span className="font-body text-sm text-foreground font-medium">{agencies?.length || 7} Standorte</span>
                </div>
                <div className="flex items-center gap-2 bg-card border rounded-xl px-4 py-3">
                  <Users size={18} className="text-primary" />
                  <span className="font-body text-sm text-foreground font-medium">Lokale Teams</span>
                </div>
                <div className="flex items-center gap-2 bg-card border rounded-xl px-4 py-3">
                  <Phone size={18} className="text-primary" />
                  <span className="font-body text-sm text-foreground font-medium">Persönliche Beratung</span>
                </div>
              </div>
            </AnimatedSection>

            {/* Map */}
            <AnimatedSection delay={0.2}>
              <div
                className="w-full aspect-[4/3] rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 4px 24px rgba(36,62,58,0.12), 0 2px 8px rgba(0,0,0,0.04)" }}
              >
                {agencies && agencies.length > 0 && (
                  <SwissMap
                    agencies={agencies}
                    onAgencyClick={(slug) => navigate(`/agenturen/${slug}`)}
                  />
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl text-center">
          <AnimatedSection>
            <h2 className="font-heading text-2xl lg:text-3xl font-bold text-primary-foreground">
              Moderne Büroräumlichkeiten. Persönliche Beratung.
            </h2>
            <p className="font-body text-sm text-primary-foreground/70 mt-4 max-w-2xl mx-auto leading-relaxed">
              Jede unserer Agenturen ist mit modernsten Arbeitsplätzen und Besprechungsräumen ausgestattet —
              für Beratungen auf höchstem Niveau.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Agency Grid */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground text-center">
              Finden Sie Ihre Agentur
            </h2>
            <div className="brand-rule mt-4 mx-auto" />
          </AnimatedSection>

          {isLoading ? (
            <p className="font-body text-sm text-muted-foreground mt-12 text-center">Laden...</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
              {agencies?.map((agency, i) => (
                <AnimatedSection key={agency.id} delay={i * 0.05}>
                  <button
                    onClick={() => navigate(`/agenturen/${agency.slug}`)}
                    className="group w-full text-left bg-background border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    style={{ boxShadow: "0 2px 12px rgba(36,62,58,0.06)" }}
                  >
                    {/* Agency image */}
                    <div className="w-full aspect-[16/9] bg-muted overflow-hidden">
                      {agency.image_url ? (
                        <img
                          src={agency.image_url}
                          alt={agency.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <MapPin size={32} className="text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading text-lg font-semibold text-foreground">
                          {agency.name}
                        </h3>
                        <ArrowRight
                          size={18}
                          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                        />
                      </div>
                      {agency.address && (
                        <p className="font-body text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
                          <MapPin size={12} className="mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{agency.address}</span>
                        </p>
                      )}
                      {!agency.address && (
                        <p className="font-body text-xs text-muted-foreground mt-2">Agenturprofil ansehen →</p>
                      )}
                    </div>
                  </button>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HQ Gallery */}
      <HQGallerySection onImageClick={setLightboxImg} />

      {/* Bottom CTA */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl text-center">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
              Bereit für ein persönliches Gespräch?
            </h2>
            <p className="font-body text-base text-muted-foreground mt-4 leading-relaxed">
              Kontaktieren Sie die Agentur in Ihrer Nähe oder besuchen Sie uns direkt — wir freuen uns auf Sie.
            </p>
            <button
              onClick={() => navigate("/kontakt")}
              className="mt-8 inline-flex items-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Kontakt aufnehmen
              <ArrowRight size={16} />
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
          <img
            src={lightboxImg}
            alt="HQ Ansicht"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
};

/* ---------- HQ Gallery Sub-component ---------- */
const HQGallerySection = ({ onImageClick }: { onImageClick: (url: string) => void }) => {
  const { data: heroes } = useQuery({
    queryKey: ["hq-gallery-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_heroes")
        .select("*")
        .in("page_key", hqImageKeys);
      if (error) throw error;
      return data;
    },
  });

  const getImg = (key: string) => heroes?.find((h) => h.page_key === key)?.image_url;

  const fallbacks: Record<string, string> = {
    "hq-1": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    "hq-2": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    "hq-3": "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80",
    "hq-4": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
    "hq-5": "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80",
  };

  const img = (key: string) => getImg(key) || fallbacks[key];

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
              Entdecke unser HQ
            </h2>
            <div className="brand-rule mt-4 mx-auto" />
            <p className="font-body text-base text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
              Werfen Sie einen Blick hinter die Kulissen unseres Hauptsitzes — moderne Räumlichkeiten,
              in denen Teamgeist und Innovation zu Hause sind.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div className="grid grid-cols-4 grid-rows-2 gap-3 lg:gap-4" style={{ height: "clamp(320px, 50vw, 520px)" }}>
            {/* Large hero image — spans 2 cols, 2 rows */}
            <button
              onClick={() => onImageClick(img("hq-1"))}
              className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group"
            >
              <img src={img("hq-1")} alt="Hauptsitz" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            {/* Top-right pair */}
            <button
              onClick={() => onImageClick(img("hq-2"))}
              className="relative rounded-2xl overflow-hidden group"
            >
              <img src={img("hq-2")} alt="HQ Ansicht" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={() => onImageClick(img("hq-3"))}
              className="relative rounded-2xl overflow-hidden group"
            >
              <img src={img("hq-3")} alt="HQ Ansicht" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            {/* Bottom-right pair */}
            <button
              onClick={() => onImageClick(img("hq-4"))}
              className="relative rounded-2xl overflow-hidden group"
            >
              <img src={img("hq-4")} alt="HQ Ansicht" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={() => onImageClick(img("hq-5"))}
              className="relative rounded-2xl overflow-hidden group"
            >
              <img src={img("hq-5")} alt="HQ Ansicht" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Agencies;
