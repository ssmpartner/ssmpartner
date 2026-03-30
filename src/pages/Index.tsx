import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import AnimatedSection from "@/components/AnimatedSection";
import CountUp from "@/components/CountUp";
import { Shield, TrendingUp, Building2 } from "lucide-react";

const Index = () => {
  const { t } = useLanguage();

  const services = [
    { icon: Shield, title: t("home.services.1.title"), desc: t("home.services.1.desc") },
    { icon: TrendingUp, title: t("home.services.2.title"), desc: t("home.services.2.desc") },
    { icon: Building2, title: t("home.services.3.title"), desc: t("home.services.3.desc") },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center pt-20">
          <AnimatedSection>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] text-foreground text-balance">
              {t("home.hero.title")}
            </h1>
            <p className="font-body text-base lg:text-lg text-muted-foreground mt-6 max-w-lg font-light leading-relaxed">
              {t("home.hero.sub")}
            </p>
            <Link
              to="/kontakt"
              className="inline-block mt-8 font-body text-sm text-accent hover:text-accent/80 transition-colors"
            >
              {t("home.hero.cta")}
            </Link>
          </AnimatedSection>
          <AnimatedSection delay={0.2} className="hidden lg:flex justify-end">
            <div className="w-80 h-96 bg-secondary ml-12 mt-12" />
          </AnimatedSection>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y">
        <div className="container mx-auto px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <CountUp end={100} suffix="+" />
            <p className="font-body text-sm text-muted-foreground mt-2">{t("home.stats.coaches")}</p>
          </div>
          <div className="md:border-x">
            <CountUp end={10000} prefix="" suffix="+" />
            <p className="font-body text-sm text-muted-foreground mt-2">{t("home.stats.consultations")}</p>
          </div>
          <div>
            <CountUp end={15} suffix="+" />
            <p className="font-body text-sm text-muted-foreground mt-2">{t("home.stats.years")}</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl text-foreground">{t("home.services.title")}</h2>
            <div className="gold-rule mt-4" />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16 mt-16">
            {services.map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <s.icon size={24} strokeWidth={1.5} className="text-foreground" />
                <h3 className="font-heading text-xl mt-4 text-foreground">{s.title}</h3>
                <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed font-light">{s.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-24 lg:py-32 border-t">
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center">
          <AnimatedSection>
            <blockquote className="font-heading text-2xl lg:text-3xl text-foreground italic leading-relaxed">
              {t("home.trust.quote")}
            </blockquote>
            <p className="font-body text-sm text-muted-foreground mt-6">{t("home.trust.author")}</p>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Index;
