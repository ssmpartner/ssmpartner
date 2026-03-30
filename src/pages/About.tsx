import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";

const About = () => {
  const { lang, t } = useLanguage();

  const values = [
    { title: t("about.values.1.title"), desc: t("about.values.1.desc") },
    { title: t("about.values.2.title"), desc: t("about.values.2.desc") },
    { title: t("about.values.3.title"), desc: t("about.values.3.desc") },
  ];

  const { data: aboutImage } = useQuery({
    queryKey: ["page-hero", "about-intro"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_heroes")
        .select("*")
        .eq("page_key", "about-intro")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: members } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const getRole = (member: any) => {
    const key = `role_${lang}` as string;
    return member[key] || member.role_de || "";
  };

  const geschaeftsleitung = members?.filter((m) => m.category === "geschaeftsleitung") || [];
  const fachfuehrung = members?.filter((m) => m.category === "fachfuehrung") || [];
  const erweitertesTeam = members?.filter((m) => m.category === "erweitertes_team") || [];

  const introImageUrl = aboutImage?.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80";

  const TeamCard = ({ member, delay, size = "lg" }: { member: any; delay: number; size?: "lg" | "sm" }) => {
    const isSmall = size === "sm";
    return (
      <AnimatedSection delay={delay}>
        <div className="group relative flex flex-col items-center text-center">
          <div
            className={`${isSmall ? "w-full aspect-[3/4]" : "w-full aspect-[3/4]"} rounded-2xl overflow-hidden bg-muted relative`}
            style={{
              boxShadow: "0 4px 24px rgba(36,62,58,0.12), 0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {member.image_url ? (
              <img
                src={member.image_url}
                alt={member.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-muted-foreground font-heading ${isSmall ? "text-2xl" : "text-4xl"}`}>
                {member.name.charAt(0)}
              </div>
            )}
            {/* Hover overlay with email icon */}
            <div className="absolute inset-0 bg-[#243e3a]/0 group-hover:bg-[#243e3a]/70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Mail className="text-white" size={isSmall ? 18 : 22} />
              </div>
            </div>
          </div>
          <h3 className={`font-heading font-semibold text-foreground ${isSmall ? "text-sm mt-3" : "text-base mt-4"}`}>{member.name}</h3>
          <p className={`font-body text-muted-foreground ${isSmall ? "text-xs mt-0.5" : "text-sm mt-1"}`}>{getRole(member)}</p>
        </div>
      </AnimatedSection>
    );
  };

  const PlaceholderCard = ({ delay }: { delay: number }) => (
    <AnimatedSection delay={delay}>
      <div className="flex flex-col items-center text-center">
        <div
          className="w-full aspect-[3/4] rounded-2xl bg-muted"
          style={{ boxShadow: "0 4px 24px rgba(36,62,58,0.12), 0 2px 8px rgba(0,0,0,0.04)" }}
        />
        <p className="font-body text-sm text-muted-foreground mt-4">Wird ergänzt</p>
      </div>
    </AnimatedSection>
  );

  return (
    <main>
      <PageHero pageKey="about" fallbackImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80" />

      {/* Intro */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl">
          <AnimatedSection>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground">{t("about.title")}</h1>
            <div className="brand-rule mt-4" />
            <p className="font-body text-base text-muted-foreground mt-8 leading-relaxed">{t("about.text")}</p>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div
              className="w-full aspect-[4/3] rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 8px 32px rgba(36,62,58,0.15), 0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <img src={introImageUrl} alt={aboutImage?.alt_text || "Über uns"} className="w-full h-full object-cover" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 border-t bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">{t("about.values.title")}</h2>
            <div className="brand-rule mt-4" />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-10 lg:gap-14 mt-14">
            {values.map((v, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="w-10 h-1 rounded-full gradient-accent mb-4" />
                <h3 className="font-heading text-base font-semibold text-foreground">{v.title}</h3>
                <p className="font-body text-sm text-muted-foreground mt-3 leading-relaxed">{v.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Geschäftsleitung */}
      <section className="py-20 lg:py-28 border-t">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground text-center">Geschäftsleitung</h2>
            <div className="brand-rule mt-4 mx-auto" />
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 mt-14">
            {geschaeftsleitung.length > 0
              ? geschaeftsleitung.map((member, i) => (
                  <TeamCard key={member.id} member={member} delay={i * 0.1} />
                ))
              : [1, 2, 3, 4].map((_, i) => <PlaceholderCard key={i} delay={i * 0.1} />)}
          </div>
        </div>
      </section>

      {/* Fachführung */}
      <section className="py-20 lg:py-28 border-t bg-card">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground text-center">Fachführung</h2>
            <div className="brand-rule mt-4 mx-auto" />
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 mt-14">
            {fachfuehrung.length > 0
              ? fachfuehrung.map((member, i) => (
                  <TeamCard key={member.id} member={member} delay={i * 0.1} />
                ))
              : [1, 2, 3, 4].map((_, i) => <PlaceholderCard key={i} delay={i * 0.1} />)}
          </div>
        </div>
      </section>

      {/* Erweitertes Team */}
      {erweitertesTeam.length > 0 && (
        <section className="py-20 lg:py-28 border-t">
          <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
            <AnimatedSection>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground text-center">Erweitertes Team</h2>
              <div className="brand-rule mt-4 mx-auto" />
            </AnimatedSection>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 lg:gap-6 mt-14">
              {erweitertesTeam.map((member, i) => (
                <TeamCard key={member.id} member={member} delay={i * 0.05} size="sm" />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default About;
