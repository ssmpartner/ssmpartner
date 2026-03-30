import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";

const Agencies = () => {
  const { lang } = useLanguage();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

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

  // Set first agency as default once loaded
  const currentSlug = activeSlug || agencies?.[0]?.slug || null;
  const currentAgency = agencies?.find((a) => a.slug === currentSlug);

  const getDescription = (agency: any) => {
    const key = `description_${lang}` as string;
    return agency[key] || agency.description_de || "";
  };

  return (
    <main>
      <PageHero pageKey="team" fallbackImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80" />

      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <AnimatedSection>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground">Agenturen</h1>
            <div className="brand-rule mt-4" />
          </AnimatedSection>

          {isLoading ? (
            <p className="font-body text-sm text-muted-foreground mt-12">Laden...</p>
          ) : (
            <>
              {/* Tabs */}
              <div className="mt-12 flex flex-wrap gap-2">
                {agencies?.map((agency) => (
                  <button
                    key={agency.slug}
                    onClick={() => setActiveSlug(agency.slug)}
                    className={`font-body text-sm px-5 py-2.5 rounded-xl transition-all duration-200 ${
                      currentSlug === agency.slug
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {agency.name}
                  </button>
                ))}
              </div>

              {/* Agency Profile */}
              {currentAgency && (
                <AnimatedSection key={currentAgency.id}>
                  <div className="mt-14 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                    {/* Image */}
                    <div
                      className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-muted"
                      style={{
                        boxShadow: "0 4px 24px rgba(36,62,58,0.12), 0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      {currentAgency.image_url ? (
                        <img
                          src={currentAgency.image_url}
                          alt={currentAgency.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <MapPin size={48} strokeWidth={1} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h2 className="font-heading text-2xl lg:text-3xl font-bold text-foreground">
                        Agentur {currentAgency.name}
                      </h2>
                      <div className="brand-rule mt-3" />

                      <div className="mt-8 space-y-4">
                        {currentAgency.address && (
                          <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                            <p className="font-body text-sm text-muted-foreground whitespace-pre-line">
                              {currentAgency.address}
                            </p>
                          </div>
                        )}
                        {currentAgency.phone && (
                          <div className="flex items-center gap-3">
                            <Phone size={18} className="text-primary shrink-0" />
                            <a
                              href={`tel:${currentAgency.phone}`}
                              className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              {currentAgency.phone}
                            </a>
                          </div>
                        )}
                        {currentAgency.email && (
                          <div className="flex items-center gap-3">
                            <Mail size={18} className="text-primary shrink-0" />
                            <a
                              href={`mailto:${currentAgency.email}`}
                              className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              {currentAgency.email}
                            </a>
                          </div>
                        )}
                      </div>

                      {getDescription(currentAgency) && (
                        <p className="font-body text-sm text-muted-foreground mt-8 leading-relaxed">
                          {getDescription(currentAgency)}
                        </p>
                      )}

                      {!currentAgency.address && !currentAgency.phone && !currentAgency.email && !getDescription(currentAgency) && (
                        <p className="font-body text-sm text-muted-foreground mt-8 italic">
                          Agenturprofil wird in Kürze ergänzt.
                        </p>
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Agencies;
