import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail, ArrowLeft, Star, Building2, Send } from "lucide-react";
import { toast } from "sonner";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import SwissMap from "@/components/SwissMap";
import { ContactCardModal } from "@/components/ContactCardModal";

const AgencyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "", recipient: "" });
  const [sending, setSending] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);

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

  const { data: teamMembers } = useQuery({
    queryKey: ["agency-team-members", agency?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("agency_id", agency!.id)
        .eq("active", true)
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }
    setSending(true);
    try {
      // Save to inquiries table
      const { error } = await supabase.from("inquiries").insert({
        source: "agency",
        agency_id: agency?.id,
        agency_name: agency?.name,
        recipient_name: contactForm.recipient || null,
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone || null,
        message: contactForm.message,
      });
      if (error) throw error;
      toast.success("Vielen Dank für Ihre Anfrage!");
      setContactForm({ name: "", email: "", phone: "", message: "", recipient: "" });
    } catch {
      toast.error("Ein Fehler ist aufgetreten.");
    } finally {
      setSending(false);
    }
  };

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
      <PageHero pageKey={`agency-${slug}`} fallbackImage={agency?.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"} />

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
            {/* Left: Image + Description */}
            <div className="lg:col-span-3 space-y-8">
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

              {/* Agenturleiter – prominent */}
              {(() => {
                const leader = teamMembers?.find((tm: any) => tm.is_agency_leader);
                const leaderName = leader?.name || agency.leader_name;
                const leaderRole = leader?.role_de || agency.leader_role;
                const leaderImage = leader?.image_url || agency.leader_image_url;
                if (!leaderName) return null;
                return (
                  <AnimatedSection delay={0.15}>
                    <div
                      className="bg-card border rounded-2xl p-6 lg:p-8 flex items-center gap-6"
                      style={{ boxShadow: "0 4px 24px rgba(36,62,58,0.08)" }}
                    >
                      <div
                        className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-muted shrink-0"
                        style={{ boxShadow: "0 4px 16px rgba(36,62,58,0.15)" }}
                      >
                        {leaderImage ? (
                          <img src={leaderImage} alt={leaderName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-heading text-3xl">
                            {leaderName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-body text-xs font-medium text-primary uppercase tracking-wider mb-1">Agenturleitung</p>
                        <h3 className="font-heading text-xl lg:text-2xl font-bold text-foreground">{leaderName}</h3>
                        {leaderRole && (
                          <p className="font-body text-sm text-muted-foreground mt-1">{leaderRole}</p>
                        )}
                        {agency.email && (
                          <a
                            href={`mailto:${agency.email}`}
                            className="inline-flex items-center gap-2 font-body text-sm text-primary hover:underline mt-3"
                          >
                            <Mail size={14} />
                            Kontakt aufnehmen
                          </a>
                        )}
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })()}
            </div>

            {/* Right: Contact sidebar */}
            <div className="lg:col-span-2 space-y-6">
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

                  {!agency.address && !agency.phone && !agency.email && (
                    <p className="font-body text-sm text-muted-foreground mt-6 italic">
                      Kontaktdaten werden in Kürze ergänzt.
                    </p>
                  )}

                  {/* Mini Contact Form */}
                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-heading text-sm font-semibold text-foreground mb-4">Schnellanfrage</h4>
                    <form onSubmit={handleContactSubmit} className="space-y-3">
                      {/* Recipient selector */}
                      {(() => {
                        const people: { name: string; label: string }[] = [];
                        const leader = teamMembers?.find((tm: any) => tm.is_agency_leader);
                        if (leader) people.push({ name: leader.name, label: `${leader.name} (Agenturleitung)` });
                        teamMembers?.filter((tm: any) => !tm.is_agency_leader).forEach(tm => {
                          people.push({ name: tm.name, label: `${tm.name}${tm.role_de ? ` – ${tm.role_de}` : ""}` });
                        });
                        members?.forEach(m => {
                          if (!people.some(p => p.name === m.name)) {
                            people.push({ name: m.name, label: `${m.name}${m.role ? ` – ${m.role}` : ""}` });
                          }
                        });
                        if (people.length === 0) return null;
                        return (
                          <select
                            value={contactForm.recipient}
                            onChange={(e) => setContactForm({ ...contactForm, recipient: e.target.value })}
                            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm font-body bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          >
                            <option value="">Ansprechperson wählen (optional)</option>
                            {people.map(p => (
                              <option key={p.name} value={p.name}>{p.label}</option>
                            ))}
                          </select>
                        );
                      })()}
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Ihr Name *"
                        required
                        maxLength={100}
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm font-body bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="E-Mail *"
                        required
                        maxLength={255}
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm font-body bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="Telefon (optional)"
                        maxLength={30}
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm font-body bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Ihre Nachricht *"
                        required
                        maxLength={1000}
                        rows={3}
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm font-body bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                      />
                      <button
                        type="submit"
                        disabled={sending}
                        className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body text-sm font-medium px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        <Send size={14} />
                        {sending ? "Wird gesendet..." : "Anfrage senden"}
                      </button>
                    </form>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members */}
      {((members && members.length > 0) || (teamMembers && teamMembers.length > 0)) && (
        <section className="py-20 lg:py-28 border-t bg-card">
          <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
            <AnimatedSection>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground text-center">
                Unser Team in {agency.name}
              </h2>
              <div className="brand-rule mt-4 mx-auto" />
            </AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 mt-14">
              {members?.map((member, i) => {
                const hasContact = member.email || member.phone;
                return (
                <AnimatedSection key={member.id} delay={i * 0.05}>
                  <div
                    className={`group relative flex flex-col items-center text-center ${hasContact ? "cursor-pointer" : ""}`}
                    onClick={() => hasContact && setSelectedContact({ ...member, role_de: member.role, agency_name: agency.name, agency_address: agency.address })}
                  >
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
                      {hasContact && (
                        <div className="absolute inset-0 bg-[#243e3a]/0 group-hover:bg-[#243e3a]/70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                            <Mail className="text-white" size={20} />
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="font-heading text-base font-semibold text-foreground mt-4">{member.name}</h3>
                    {member.role && <p className="font-body text-sm text-muted-foreground mt-1">{member.role}</p>}
                  </div>
                </AnimatedSection>
                );
              })}
              {teamMembers?.filter((tm: any) => !tm.is_agency_leader).map((member, i) => {
                const hasContact = (member as any).email || (member as any).phone;
                const badgeMap: Record<string, string> = { verkaufsleiter: "Verkaufsleiter", teamleiter: "Teamleiter", finanzexperte: "Finanzexperte", finanzcoach: "Finanzcoach", finanzcoach_vbv: "Finanzcoach VBV", trainee: "Trainee" };
                const badgeLabel = badgeMap[(member as any).badge] || null;
                return (
                <AnimatedSection key={member.id} delay={(members?.length || 0 + i) * 0.05}>
                  <div
                    className={`group relative flex flex-col items-center text-center ${hasContact ? "cursor-pointer" : ""}`}
                    onClick={() => hasContact && setSelectedContact({ ...member, agency_name: agency.name, agency_address: agency.address })}
                  >
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
                      {badgeLabel && (
                        <span className="absolute top-2 left-2 text-white font-body text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-lg" style={{ background: "#B3B69C" }}>
                          {badgeLabel}
                        </span>
                      )}
                      {hasContact && (
                        <div className="absolute inset-0 bg-[#243e3a]/0 group-hover:bg-[#243e3a]/70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                            <Mail className="text-white" size={20} />
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="font-heading text-base font-semibold text-foreground mt-4">{member.name}</h3>
                    {member.role_de && <p className="font-body text-sm text-muted-foreground mt-1">{member.role_de}</p>}
                  </div>
                </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Map */}
      {agency.map_lat && agency.map_lng && (
        <section className="py-20 lg:py-28 border-t">
          <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
            <AnimatedSection>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground text-center">Standort</h2>
              <div className="brand-rule mt-4 mx-auto" />
            </AnimatedSection>
            <div className="mt-14">
              <div
                className="w-full aspect-[21/9] rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 4px 24px rgba(36,62,58,0.12)" }}
              >
                <SwissMap agencies={[agency]} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <section className="py-20 lg:py-28 border-t bg-card">
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
                    className="bg-background border rounded-2xl p-6"
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
      <ContactCardModal
        member={selectedContact || { name: "" }}
        open={!!selectedContact}
        onClose={() => setSelectedContact(null)}
      />
    </main>
  );
};

export default AgencyDetail;
