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
import { useLanguage } from "@/i18n/LanguageContext";

const AgencyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
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

  const localized = (obj: any, base: string) => obj?.[`${base}_${lang}`] || obj?.[`${base}_de`] || "";

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast.error(t("agency.form.required"));
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
      toast.success(t("agency.form.success"));
      setContactForm({ name: "", email: "", phone: "", message: "", recipient: "" });
    } catch {
      toast.error(t("agency.form.error"));
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground">{t("agency.loading")}</p>
      </main>
    );
  }

  if (!agency) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-body text-sm text-muted-foreground">{t("agency.notFound")}</p>
        <button onClick={() => navigate("/agenturen")} className="text-primary font-body text-sm underline">
          {t("agency.back")}
        </button>
      </main>
    );
  }

  return (
    <main>
      <PageHero pageKey={`agency-${slug}`} fallbackImage={agency?.image_url || undefined} />

      {/* Back + Title */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <AnimatedSection>
            <button
              onClick={() => navigate("/agenturen")}
              className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              {t("agency.back")}
            </button>
            <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-foreground">
              {t("agency.titlePrefix")} {agency.name}
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

              {localized(agency, "description") && (
                <AnimatedSection delay={0.1}>
                  <p className="font-body text-base text-muted-foreground leading-relaxed">
                    {localized(agency, "description")}
                  </p>
                </AnimatedSection>
              )}

              {/* Agenturleiter – prominent */}
              {(() => {
                const leader = teamMembers?.find((tm: any) => tm.is_agency_leader);
                const leaderName = leader?.name || agency.leader_name;
                const leaderRole = (leader && localized(leader, "role")) || agency.leader_role;
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
                        <p className="font-body text-xs font-medium text-primary uppercase tracking-wider mb-1">{t("agency.leadership")}</p>
                        <h3 className="font-heading text-xl lg:text-2xl font-semibold text-foreground">{leaderName}</h3>
                        {leaderRole && (
                          <p className="font-body text-sm text-muted-foreground mt-1">{leaderRole}</p>
                        )}
                        {agency.email && (
                          <a
                            href={`mailto:${agency.email}`}
                            className="inline-flex items-center gap-2 font-body text-sm text-primary hover:underline mt-3"
                          >
                            <Mail size={14} />
                            {t("agency.contact.cta")}
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
                  <h3 className="font-heading text-lg font-semibold text-foreground">{t("agency.contact.title")}</h3>
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
                        <p className="font-body text-xs font-medium text-foreground mb-1">{t("agency.contact.hours")}</p>
                        <p className="font-body text-sm text-muted-foreground whitespace-pre-line">{agency.opening_hours}</p>
                      </div>
                    )}
                  </div>

                  {!agency.address && !agency.phone && !agency.email && (
                    <p className="font-body text-sm text-muted-foreground mt-6 italic">
                      {t("agency.contact.empty")}
                    </p>
                  )}

                  {/* Mini Contact Form */}
                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-heading text-sm font-semibold text-foreground mb-4">{t("agency.form.title")}</h4>
                    <form onSubmit={handleContactSubmit} className="space-y-3">
                      {/* Recipient selector */}
                      {(() => {
                        const people: { name: string; label: string }[] = [];
                        const leader = teamMembers?.find((tm: any) => tm.is_agency_leader);
                        if (leader) people.push({ name: leader.name, label: `${leader.name} (${t("agency.recipientLeadershipSuffix")})` });
                        teamMembers?.filter((tm: any) => !tm.is_agency_leader).forEach(tm => {
                          const r = localized(tm, "role");
                          people.push({ name: tm.name, label: `${tm.name}${r ? ` – ${r}` : ""}` });
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
                            <option value="">{t("agency.form.recipient")}</option>
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
                        placeholder={t("agency.form.name")}
                        required
                        maxLength={100}
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm font-body bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder={t("agency.form.email")}
                        required
                        maxLength={255}
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm font-body bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder={t("agency.form.phone")}
                        maxLength={30}
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm font-body bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder={t("agency.form.message")}
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
                        {sending ? t("agency.form.sending") : t("agency.form.submit")}
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
              <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-foreground text-center">
                {t("agency.team.title")} {agency.name}
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
                const badgeMaps: Record<string, Record<string, string>> = {
                  de: { verkaufsleiter: "Verkaufsleiter", teamleiter: "Teamleiter", finanzexperte: "Finanzexperte", finanzcoach: "Finanzcoach", finanzcoach_in_ausbildung: "Finanzcoach in Ausbildung", finanzcoach_vbv: "Finanzcoach VBV", finanzcoach_ssm: "Finanzcoach SSM", vermoegensberater: "Vermögensberater", vermoegensberater_iaf: "Vermögensberater IAF", dipl_finanzberater_iaf: "Dipl. Finanzberater IAF", agenturleiter: "Agenturleiter", trainee: "Trainee" },
                  fr: { verkaufsleiter: "Directeur des ventes", teamleiter: "Chef d'équipe", finanzexperte: "Expert financier", finanzcoach: "Coach financier", finanzcoach_in_ausbildung: "Coach financier en formation", finanzcoach_vbv: "Coach financier VBV", finanzcoach_ssm: "Coach financier SSM", vermoegensberater: "Conseiller en patrimoine", vermoegensberater_iaf: "Conseiller en patrimoine IAF", dipl_finanzberater_iaf: "Conseiller financier dipl. IAF", agenturleiter: "Directeur d'agence", trainee: "Stagiaire" },
                  it: { verkaufsleiter: "Direttore vendite", teamleiter: "Caposquadra", finanzexperte: "Esperto finanziario", finanzcoach: "Coach finanziario", finanzcoach_in_ausbildung: "Coach finanziario in formazione", finanzcoach_vbv: "Coach finanziario VBV", finanzcoach_ssm: "Coach finanziario SSM", vermoegensberater: "Consulente patrimoniale", vermoegensberater_iaf: "Consulente patrimoniale IAF", dipl_finanzberater_iaf: "Consulente finanziario dipl. IAF", agenturleiter: "Direttore d'agenzia", trainee: "Tirocinante" },
                  en: { verkaufsleiter: "Sales manager", teamleiter: "Team leader", finanzexperte: "Financial expert", finanzcoach: "Financial coach", finanzcoach_in_ausbildung: "Financial coach in training", finanzcoach_vbv: "Financial coach VBV", finanzcoach_ssm: "Financial coach SSM", vermoegensberater: "Wealth advisor", vermoegensberater_iaf: "Wealth advisor IAF", dipl_finanzberater_iaf: "Cert. financial advisor IAF", agenturleiter: "Agency manager", trainee: "Trainee" },
                };
                const badgeMap = badgeMaps[lang] || badgeMaps.de;
                const badgeLabel = badgeMap[(member as any).badge] || null;
                const roleLocalized = localized(member, "role");
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
                    {roleLocalized && <p className="font-body text-sm text-muted-foreground mt-1">{roleLocalized}</p>}
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
              <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-foreground text-center">{t("agency.location")}</h2>
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
              <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-foreground text-center">
                {t("agency.reviews.title")}
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
