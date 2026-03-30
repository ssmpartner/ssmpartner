import { useLanguage } from "@/i18n/LanguageContext";
import AnimatedSection from "@/components/AnimatedSection";

const About = () => {
  const { t } = useLanguage();

  const values = [
    { title: t("about.values.1.title"), desc: t("about.values.1.desc") },
    { title: t("about.values.2.title"), desc: t("about.values.2.desc") },
    { title: t("about.values.3.title"), desc: t("about.values.3.desc") },
  ];

  const team = [
    { name: "Martin Killer", role: "CEO" },
    { name: "Oliver Felder", role: "CIO & CRO" },
    { name: "—", role: t("about.team.member") },
  ];

  return (
    <main className="pt-20 lg:pt-24">
      {/* Intro */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8 grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          <AnimatedSection className="lg:col-span-3">
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground">{t("about.title")}</h1>
            <div className="brand-rule mt-4" />
            <p className="font-body text-base text-muted-foreground mt-8 leading-relaxed max-w-2xl">
              {t("about.text")}
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.2} className="lg:col-span-2">
            <div className="w-full aspect-[4/5] bg-muted rounded-2xl" />
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

      {/* Team */}
      <section className="py-24 lg:py-32 border-t">
        <div className="container mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">{t("about.team.title")}</h2>
            <div className="brand-rule mt-4" />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16 mt-16">
            {team.map((member, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="w-full aspect-square bg-muted rounded-2xl" />
                <h3 className="font-heading text-base font-semibold text-foreground mt-4">{member.name}</h3>
                <p className="font-body text-sm text-muted-foreground">{member.role}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
