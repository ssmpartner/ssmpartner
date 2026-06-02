import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ssmPattern from "@/assets/ssm-structure-pattern.png";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import { Download, ExternalLink } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

type DlItem = { id: string; lang: string; description: string; url: string; sort_order: number };
type Partner = { id: string; section: string; branch: string; category: string; company: string; address: string; contact_email: string; privacy_url: string; sort_order: number };

const PartnerRow = ({ partner, t }: { partner: Partner; t: (k: string) => string }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-6 border-b border-border last:border-b-0">
    <div>
      <p className="font-body text-sm font-semibold text-foreground">{partner.branch}</p>
      <p className="font-body text-xs text-muted-foreground mt-1">({partner.category})</p>
    </div>
    <div>
      <p className="font-body text-sm font-semibold text-foreground">{partner.company}</p>
      <p className="font-body text-xs text-muted-foreground mt-1">{partner.address}</p>
      <div className="flex items-center gap-4 mt-2">
        <a href={`mailto:${partner.contact_email}`} className="font-body text-xs text-primary hover:underline transition-colors">{t("vag45.partner.contact")}</a>
        <a href={partner.privacy_url} target="_blank" rel="noopener noreferrer" className="font-body text-xs text-primary hover:underline transition-colors inline-flex items-center gap-1">
          {t("vag45.partner.privacy")} <ExternalLink size={10} />
        </a>
      </div>
    </div>
  </div>
);

const Vag45 = () => {
  const { t } = useLanguage();
  const { data: downloads = [] } = useQuery({
    queryKey: ["vag45_downloads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vag45_downloads").select("*").eq("active", true).order("sort_order");
      if (error) throw error;
      return data as DlItem[];
    },
  });

  const { data: partners = [] } = useQuery({
    queryKey: ["vag45_partners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vag45_partners").select("*").eq("active", true).order("sort_order");
      if (error) throw error;
      return data as Partner[];
    },
  });

  const lifeInsurance = partners.filter((p) => p.section === "life");
  const damageInsurance = partners.filter((p) => p.section === "damage");

  return (
    <main>
      <PageHero pageKey="vag45" />

      {/* VAG 45 Info + Downloads */}
      <section className="py-24 lg:py-32 relative overflow-hidden bg-background">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${ssmPattern})`,
            backgroundSize: "900px auto",
            backgroundPosition: "right bottom",
            backgroundRepeat: "no-repeat",
            opacity: 0.07,
            mixBlendMode: "multiply",
            transform: "scaleY(-1)",
          }}
        />
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-foreground">{t("vag45.title")}</h1>
              <div className="brand-rule mt-4 mx-auto" />
              <p className="font-body text-base text-muted-foreground mt-8 leading-relaxed">
                {t("vag45.intro")}
              </p>
              <p className="font-body text-sm text-muted-foreground mt-4">
                {t("vag45.download.hint")}
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              {downloads.map((item) => (
                <div key={item.id} className="bg-card border border-border rounded-2xl p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">{item.lang}</h3>
                    <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{item.description}</p>
                  </div>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-body text-sm font-medium text-primary hover:underline mt-6 transition-colors">
                    <Download size={16} /> {t("vag45.download.cta")}
                  </a>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Versicherungspartner */}
      <section className="py-24 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-foreground">{t("vag45.partners.title")}</h2>
              <div className="brand-rule mt-4 mx-auto" />
              <p className="font-body text-base text-muted-foreground mt-8 leading-relaxed">
                {t("vag45.partners.intro")}
              </p>
            </div>
          </AnimatedSection>

          {lifeInsurance.length > 0 && (
            <AnimatedSection delay={0.1}>
              <div className="bg-card border border-border rounded-2xl p-8 lg:p-10 mb-8">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{t("vag45.section.life")}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-3 mb-2 border-b border-border">
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("vag45.col.branch")}</p>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("vag45.col.partner")}</p>
                </div>
                {lifeInsurance.map((p) => <PartnerRow key={p.id} partner={p} t={t} />)}
              </div>
            </AnimatedSection>
          )}

          {damageInsurance.length > 0 && (
            <AnimatedSection delay={0.15}>
              <div className="bg-card border border-border rounded-2xl p-8 lg:p-10">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{t("vag45.section.damage")}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-3 mb-2 border-b border-border">
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("vag45.col.branch")}</p>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("vag45.col.partner")}</p>
                </div>
                {damageInsurance.map((p) => <PartnerRow key={p.id} partner={p} t={t} />)}
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </main>
  );
};

export default Vag45;
