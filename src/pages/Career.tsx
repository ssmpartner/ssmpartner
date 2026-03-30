import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import AnimatedSection from "@/components/AnimatedSection";

const Career = () => {
  const { t } = useLanguage();

  const reasons = [
    { num: "01", title: t("career.why.1.title"), desc: t("career.why.1.desc") },
    { num: "02", title: t("career.why.2.title"), desc: t("career.why.2.desc") },
    { num: "03", title: t("career.why.3.title"), desc: t("career.why.3.desc") },
  ];

  const positions = [
    { role: "Finanzcoach (Aussendienst)", location: "Rothenburg / Schweizweit", workload: "80–100%" },
    { role: "Key Account Manager", location: "Rothenburg", workload: "100%" },
    { role: "Teamleiter/in", location: "Rothenburg", workload: "100%" },
  ];

  const steps = [
    { title: t("career.onboarding.1.title"), desc: t("career.onboarding.1.desc") },
    { title: t("career.onboarding.2.title"), desc: t("career.onboarding.2.desc") },
    { title: t("career.onboarding.3.title"), desc: t("career.onboarding.3.desc") },
    { title: t("career.onboarding.4.title"), desc: t("career.onboarding.4.desc") },
  ];

  return (
    <main className="pt-20 lg:pt-24">
      {/* Hero */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl relative">
          <AnimatedSection>
            <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
              {t("career.hero.title")}
            </h1>
            <p className="font-body text-base text-muted-foreground mt-6 leading-relaxed">
              {t("career.hero.sub")}
            </p>
            <Link to="/kontakt" className="inline-block mt-6 font-body text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              {t("career.hero.cta")}
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Why SSM */}
      <section className="py-24 lg:py-32 border-t bg-card">
        <div className="container mx-auto px-6 lg:px-8 grid md:grid-cols-3 gap-12 lg:gap-16">
          {reasons.map((r, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <span className="font-heading text-5xl font-bold text-primary/20">{r.num}</span>
              <h3 className="font-heading text-base font-semibold text-foreground mt-3">{r.title}</h3>
              <p className="font-body text-sm text-muted-foreground mt-3 leading-relaxed">{r.desc}</p>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-24 lg:py-32 border-t">
        <div className="container mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">{t("career.positions.title")}</h2>
            <div className="brand-rule mt-4" />
          </AnimatedSection>

          <div className="mt-12">
            <div className="hidden md:grid grid-cols-4 gap-4 pb-3 border-b text-xs font-body text-muted-foreground uppercase tracking-widest">
              <span>{t("career.positions.role")}</span>
              <span>{t("career.positions.location")}</span>
              <span>{t("career.positions.workload")}</span>
              <span />
            </div>
            {positions.map((p, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div className="grid md:grid-cols-4 gap-2 md:gap-4 py-5 border-b items-center hover:bg-muted/50 transition-colors px-2 -mx-2 rounded-lg">
                  <span className="font-body text-sm font-medium text-foreground">{p.role}</span>
                  <span className="font-body text-sm text-muted-foreground">{p.location}</span>
                  <span className="font-body text-sm text-muted-foreground">{p.workload}</span>
                  <Link to="/kontakt" className="font-body text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    {t("career.positions.more")}
                  </Link>
                </div>
              </AnimatedSection>
            ))}
            <AnimatedSection className="mt-6">
              <Link to="/kontakt" className="font-body text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                {t("career.positions.spontaneous")}
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Onboarding */}
      <section className="py-24 lg:py-32 border-t bg-card">
        <div className="container mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">{t("career.onboarding.title")}</h2>
            <div className="brand-rule mt-4" />
          </AnimatedSection>
          <div className="grid md:grid-cols-4 gap-8 lg:gap-12 mt-16">
            {steps.map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center font-heading text-sm font-bold text-primary-foreground">{i + 1}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <h3 className="font-heading text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Career;
