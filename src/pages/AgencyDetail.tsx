import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail, ArrowLeft, Star, Building2 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import SwissMap from "@/components/SwissMap";

const AgencyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: agency, isLoading } = useQuery({
    queryKey: ["agency", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: members } = useQuery({
    queryKey: ["agency-members", agency?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agency_members")
        .select("*")
        .eq("agency_id", agency!.id)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!agency?.id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["agency-reviews", agency?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agency_reviews")
        .select("*")
        .eq("agency_id", agency!.id)
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!agency?.id,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground">Laden...</p>
      </main>
    );
  }

  if (!agency) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-body text-sm text-muted-foreground">Agentur nicht gefunden.</p>
        <button onClick={() => navigate("/agenturen")} className="text-primary font-body text-sm underline">
          Zurück zu Agenturen
        </button>
      </main>
    );
  }

  return (
    <main>
      <PageHero pageKey="team" fallbackImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80" />

      {/* Back + Title */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <AnimatedSection>
            <button
              onClick={() => navigate("/agenturen")}
              className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Alle Agenturen
            </button>

            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground">
              Agentur {agency.name}
            </h1>
            <div className="brand-rule mt-4" />
          </AnimatedSection>

          {/* Main layout */}
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 mt-14">
            {/* Left: Image + Map */}
            <div className="lg:col-span-3 space-y-6">
              <AnimatedSection>
                <div
                  className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-muted"
                  style={{ boxShadow: "0 4px 24px rgba(36,62,58,0.12)" }}
                >
                  {agency.image_url ? (
                    <img src={agency.image_url} alt={agency.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Building2 size={48} className="text-primary/20" />
                    </div>
                  )}
                </div>
              </AnimatedSection>

              {agency.description_de && (
                <AnimatedSection delay={0.1}>
                  <p className="font-body text-base text-muted-foreground leading-relaxed">
                    {agency.description_de}
                  </p>
                </AnimatedSection>
              )}

              {/* Map */}
              {agency.map_lat && agency.map_lng && (
                <AnimatedSection delay={0.2}>
                  <div
                    className="w-full aspect-[16/9] rounded-2xl overflow-hidden"
                    style={{ boxShadow: "0 4px 24px rgba(36,62,58,0.12)" }}
                  >
                    <SwissMap agencies={[agency]} />
                  </div>
                </AnimatedSection>
              )}
            </div>

            {/* Right: Contact card */}
            <div className="lg:col-span-2">
              <AnimatedSection delay={0.1}>
                <div
                  className="bg-card border rounded-2xl p-6 lg:p-8 sticky top-32"
                  style={{ boxShadow: "0 4px 24px rgba(36,62,58,0.08)" }}
                >
                  <h3 className="font-heading text-lg font-semibold text-foreground">Kontakt</h3>
                  <div className="brand-rule mt-2" />

                  <div className="mt-6 space-y-4">
                    {agency.address && (
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                        <p className="font-body text-sm text-muted-foreground whitespace-pre-line">{agency.address}</p>
                      </div>
                    )}
                    {agency.phone && (
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-primary shrink-0" />
                        <a href={`tel:${agency.phone}`} className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
                          {agency.phone}
                        </a>
                      </div>
                    )}
                    {agency.email && (
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-primary shrink-0" />
                        <a href={`mailto:${agency.email}`} className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
                          {agency.email}
                        </a>
                      </div>
                    )}
                    {agency.opening_hours && (
                      <div className="pt-2 border-t">
                        <p className="font-body text-xs font-medium text-foreground mb-1">Öffnungszeiten</p>
                        <p className="font-body text-sm text-muted-foreground whitespace-pre-line">{agency.opening_hours}</p>
                      </div>
                    )}
                  </div>

                  {/* Agency leader */}
                  {agency.leader_name && (
                    <div className="mt-8 pt-6 border-t">
                      <p className="font-body text-xs font-medium text-foreground mb-3">Agenturleitung</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0">
                          {agency.leader_image_url ? (
                            <img src={agency.leader_image_url} alt={agency.leader_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-heading text-lg">
                              {agency.leader_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-heading text-sm font-semibold text-foreground">{agency.leader_name}</p>
                          {agency.leader_role && (
                            <p className="font-body text-xs text-muted-foreground">{agency.leader_role}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!agency.address && !agency.phone && !agency.email && !agency.leader_name && (
                    <p className="font-body text-sm text-muted-foreground mt-6 italic">
                      Kontaktdaten werden in Kürze ergänzt.
                    </p>
                  )}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members */}
      {members && members.length > 0 && (
        <section className="py-20 lg:py-28 border-t bg-card">
          <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
            <AnimatedSection>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground text-center">
                Unser Team in {agency.name}
              </h2>
              <div className="brand-rule mt-4 mx-auto" />
            </AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 mt-14">
              {members.map((member, i) => (
                <AnimatedSection key={member.id} delay={i * 0.05}>
                  <div className="group relative flex flex-col items-center text-center">
                    <div
                      className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-muted relative"
                      style={{ boxShadow: "0 4px 24px rgba(36,62,58,0.12)" }}
                    >
                      {member.image_url ? (
                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground font-heading text-3xl">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      {member.email && (
                        <div className="absolute inset-0 bg-[#243e3a]/0 group-hover:bg-[#243e3a]/70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <a
                            href={`mailto:${member.email}`}
                            className="bg-white/20 backdrop-blur-sm rounded-full p-3"
                          >
                            <Mail className="text-white" size={20} />
                          </a>
                        </div>
                      )}
                    </div>
                    <h3 className="font-heading text-base font-semibold text-foreground mt-4">{member.name}</h3>
                    {member.role && <p className="font-body text-sm text-muted-foreground mt-1">{member.role}</p>}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <section className="py-20 lg:py-28 border-t">
          <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
            <AnimatedSection>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground text-center">
                Das sagen unsere Kunden
              </h2>
              <div className="brand-rule mt-4 mx-auto" />
            </AnimatedSection>
            <div className="grid md:grid-cols-2 gap-6 mt-14">
              {reviews.map((review, i) => (
                <AnimatedSection key={review.id} delay={i * 0.05}>
                  <div
                    className="bg-card border rounded-2xl p-6"
                    style={{ boxShadow: "0 2px 12px rgba(36,62,58,0.06)" }}
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: review.rating }).map((_, si) => (
                        <Star key={si} size={14} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    {review.text && (
                      <p className="font-body text-sm text-muted-foreground leading-relaxed italic">
                        «{review.text}»
                      </p>
                    )}
                    <p className="font-heading text-sm font-semibold text-foreground mt-4">{review.author_name}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default AgencyDetail;
