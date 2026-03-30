import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";

const About = () => {
  const { lang, t } = useLanguage();

  const values = [
    { title: t("about.values.1.title"), desc: t("about.values.1.desc") },
    { title: t("about.values.2.title"), desc: t("about.values.2.desc") },
    { title: t("about.values.3.title"), desc: t("about.values.3.desc") },
  ];

  // Fetch about page image from page_heroes
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

  // Fetch team members by category
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

  const introImageUrl = aboutImage?.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80";

  const TeamCard = ({ member, delay }: { member: any; delay: number }) => (
    <AnimatedSection delay={delay}>
      <div className="flex flex-col items-center text-center">
        <div
          className="w-40 h-40 lg:w-44 lg:h-44 rounded-full overflow-hidden bg-muted"
          style={{
            boxShadow: "0 8px 32px rgba(36,62,58,0.18), 0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {member.image_url ? (
            <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-heading text-3xl">
              {member.name.charAt(0)}
            </div>
          )}
        </div>
        <h3 className="font-heading text-base font-semibold text-foreground mt-5">{member.name}</h3>
        <p className="font-body text-sm text-muted-foreground mt-1">{getRole(member)}</p>
      </div>
    </AnimatedSection>
  );

  return (
    <main>
      <PageHero pageKey="about" fallbackImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80" />

      {/* Intro with side image */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl">
          <AnimatedSection>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground">{t("about.title")}</h1>
            <div className="brand-rule mt-4" />
            <p className="font-body text-base text-muted-foreground mt-8 leading-relaxed">
              {t("about.text")}
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div
              className="w-full aspect-[4/3] rounded-2xl overflow-hidden"
              style={{
                boxShadow: "0 8px 32px rgba(36,62,58,0.15), 0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <img
                src={introImageUrl}
                alt={aboutImage?.alt_text || "Über uns"}
                className="w-full h-full object-cover"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 lg:py-32 border-t bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">{t("about.values.title")}</h2>
            <div className="brand-rule mt-4" />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16 mt-16">
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
      <section className="py-24 lg:py-32 border-t">
        <div className="container mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">Geschäftsleitung</h2>
            <div className="brand-rule mt-4" />
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-14 mt-16">
            {geschaeftsleitung.length > 0 ? (
              geschaeftsleitung.map((member, i) => (
                <TeamCard key={member.id} member={member} delay={i * 0.1} />
              ))
            ) : (
              [1, 2, 3, 4].map((_, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="w-40 h-40 lg:w-44 lg:h-44 rounded-full bg-muted"
                      style={{ boxShadow: "0 8px 32px rgba(36,62,58,0.18), 0 2px 8px rgba(0,0,0,0.06)" }}
                    />
                    <p className="font-body text-sm text-muted-foreground mt-5">Wird ergänzt</p>
                  </div>
                </AnimatedSection>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Fachführung */}
      <section className="py-24 lg:py-32 border-t bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">Fachführung</h2>
            <div className="brand-rule mt-4" />
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-14 mt-16">
            {fachfuehrung.length > 0 ? (
              fachfuehrung.map((member, i) => (
                <TeamCard key={member.id} member={member} delay={i * 0.1} />
              ))
            ) : (
              [1, 2, 3, 4].map((_, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="w-40 h-40 lg:w-44 lg:h-44 rounded-full bg-muted"
                      style={{ boxShadow: "0 8px 32px rgba(36,62,58,0.18), 0 2px 8px rgba(0,0,0,0.06)" }}
                    />
                    <p className="font-body text-sm text-muted-foreground mt-5">Wird ergänzt</p>
                  </div>
                </AnimatedSection>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
