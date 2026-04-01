import ssmPattern from "@/assets/ssm-structure-pattern.png";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import { Download, ExternalLink } from "lucide-react";

const downloadItems = [
  {
    lang: "Deutsch",
    description: "Informationen gemäss Art. 45 Versicherungsaufsichtsgesetz",
    url: "https://ssmpartner.ch/assets/25-07-10_Artikel_VAG45_D_5.1.pdf",
  },
  {
    lang: "Français",
    description: "Informations selon l'art. 45 de la loi sur la surveillance des assurances",
    url: "https://ssmpartner.ch/assets/25-07-10_Artikel_VAG45_F_5.1.pdf",
  },
  {
    lang: "Italiano",
    description: "Informazioni ai sensi dell'art 45 della Legge sulla sorveglianza degli assicuratori",
    url: "https://ssmpartner.ch/assets/25-07-10_Artikel_VAG45_I_5.1.pdf",
  },
];

type Partner = {
  branch: string;
  category: string;
  company: string;
  address: string;
  contactEmail: string;
  privacyUrl: string;
};

const lifeInsurance: Partner[] = [
  {
    branch: "Kollektivlebensversicherung im Rahmen der beruflichen Vorsorge",
    category: "FINMA-Kategorie A1",
    company: "Allianz Suisse Lebensversicherungs-Gesellschaft AG",
    address: "Richtiplatz 1, 8304 Wallisellen",
    contactEmail: "feedback@allianz-suisse.ch",
    privacyUrl: "https://www.allianz.ch/de/informationen/datenschutz.html",
  },
  {
    branch: "Anteilsgebundene Lebensversicherung",
    category: "FINMA-Kategorie A2",
    company: "Lichtenstein Life Assurance AG",
    address: "Industriering 37, 9491 Ruggell",
    contactEmail: "info@lichtensteinlife.com",
    privacyUrl: "https://liechtensteinlife.com/de-DE/markets/de/datenschutz",
  },
  {
    branch: "Sonstige Lebensversicherung",
    category: "FINMA-Kategorie A3",
    company: "Visana Versicherungen AG",
    address: "Weltpoststrasse 19, 3015 Bern",
    contactEmail: "info@visana.ch",
    privacyUrl: "https://www.visana.ch/de/visana/rechtliches/datenschutz",
  },
];

const damageInsurance: Partner[] = [
  {
    branch: "Unfall- und Kranken-Zusatzversicherung",
    category: "FINMA-Kategorie B1, B2",
    company: "Visana Versicherungen AG",
    address: "Weltpoststrasse 19, 3015 Bern",
    contactEmail: "info@visana.ch",
    privacyUrl: "https://www.visana.ch/de/visana/rechtliches/datenschutz",
  },
  {
    branch: "Motorfahrzeugversicherung (Kategorie M) + N",
    category: "FINMA-Kategorie B3, B10",
    company: "TSM Compagnie d'assurance, Société coopérative",
    address: "Rue Jaquet-Droz 43b, 2300 La Chaux-de-Fonds",
    contactEmail: "info@tsm.ch",
    privacyUrl: "https://tsm.ch/datenschutzrichtlinie-und-datenverarbeitung/?l=de",
  },
  {
    branch: "Motorfahrzeugversicherung (Kategorie L, T, G, R)",
    category: "FINMA-Kategorie B3, B10",
    company: "Allianz Suisse Lebensversicherungs-Gesellschaft AG",
    address: "Richtiplatz 1, 8304 Wallisellen",
    contactEmail: "feedback@allianz-suisse.ch",
    privacyUrl: "https://www.allianz.ch/de/informationen/datenschutz.html",
  },
  {
    branch: "Luftfahrtversicherung",
    category: "FINMA-Kategorie B5",
    company: "Allianz Suisse Lebensversicherungs-Gesellschaft AG",
    address: "Richtiplatz 1, 8304 Wallisellen",
    contactEmail: "feedback@allianz-suisse.ch",
    privacyUrl: "https://www.allianz.ch/de/informationen/datenschutz.html",
  },
  {
    branch: "Bootversicherung",
    category: "FINMA-Kategorie B6, B12",
    company: "Allianz Suisse Lebensversicherungs-Gesellschaft AG",
    address: "Richtiplatz 1, 8304 Wallisellen",
    contactEmail: "feedback@allianz-suisse.ch",
    privacyUrl: "https://www.allianz.ch/de/informationen/datenschutz.html",
  },
  {
    branch: "Hausrat- und Gebäudeversicherung",
    category: "FINMA-Kategorie B8, B9",
    company: "Visana Allgemeine Versicherungen AG",
    address: "Weltpoststrasse 19, 3015 Bern",
    contactEmail: "info@visana.ch",
    privacyUrl: "https://www.visana.ch/de/visana/rechtliches/datenschutz",
  },
  {
    branch: "Haftpflichtversicherung (Privatkunden)",
    category: "FINMA-Kategorie B13",
    company: "Visana Allgemeine Versicherungen AG",
    address: "Weltpoststrasse 19, 3015 Bern",
    contactEmail: "info@visana.ch",
    privacyUrl: "https://www.visana.ch/de/visana/rechtliches/datenschutz",
  },
  {
    branch: "Haftpflichtversicherung (Unternehmenskunden)",
    category: "FINMA-Kategorie B13",
    company: "Allianz Suisse Lebensversicherungs-Gesellschaft AG",
    address: "Richtiplatz 1, 8304 Wallisellen",
    contactEmail: "feedback@allianz-suisse.ch",
    privacyUrl: "https://www.allianz.ch/de/informationen/datenschutz.html",
  },
  {
    branch: "Kautionsversicherung",
    category: "FINMA-Kategorie B15",
    company: "Allianz Suisse Lebensversicherungs-Gesellschaft AG",
    address: "Richtiplatz 1, 8304 Wallisellen",
    contactEmail: "feedback@allianz-suisse.ch",
    privacyUrl: "https://www.allianz.ch/de/informationen/datenschutz.html",
  },
  {
    branch: "Rechtsschutzversicherung",
    category: "FINMA-Kategorie B17",
    company: "CAP Rechtsschutz-Versicherungsgesellschaft AG",
    address: "Neue Winterthurerstrasse 88, 8304 Wallisellen",
    contactEmail: "feedback@allianz-suisse.ch",
    privacyUrl: "https://www.allianz.ch/de/informationen/datenschutz.html",
  },
  {
    branch: "Touristische Beistandsleistung",
    category: "FINMA-Kategorie B18",
    company: "Allianz Suisse Lebensversicherungs-Gesellschaft AG",
    address: "Richtiplatz 1, 8304 Wallisellen",
    contactEmail: "feedback@allianz-suisse.ch",
    privacyUrl: "https://www.allianz.ch/de/informationen/datenschutz.html",
  },
];

const PartnerRow = ({ partner }: { partner: Partner }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-6 border-b border-border last:border-b-0">
    <div>
      <p className="font-body text-sm font-semibold text-foreground">{partner.branch}</p>
      <p className="font-body text-xs text-muted-foreground mt-1">({partner.category})</p>
    </div>
    <div>
      <p className="font-body text-sm font-semibold text-foreground">{partner.company}</p>
      <p className="font-body text-xs text-muted-foreground mt-1">{partner.address}</p>
      <div className="flex items-center gap-4 mt-2">
        <a
          href={`mailto:${partner.contactEmail}`}
          className="font-body text-xs text-primary hover:underline transition-colors"
        >
          Kontakt
        </a>
        <a
          href={partner.privacyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-xs text-primary hover:underline transition-colors inline-flex items-center gap-1"
        >
          Datenschutz <ExternalLink size={10} />
        </a>
      </div>
    </div>
  </div>
);

const Vag45 = () => {
  return (
    <main>
      <PageHero pageKey="vag45" fallbackImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80" />

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
              <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground">
                VAG 45
              </h1>
              <div className="brand-rule mt-4 mx-auto" />
              <p className="font-body text-base text-muted-foreground mt-8 leading-relaxed">
                Am 1. Januar 2024 ist das revidierte Versicherungsaufsichtsgesetz (VAG) und die revidierte Aufsichtsverordnung (AVO) in Kraft getreten.
              </p>
              <p className="font-body text-sm text-muted-foreground mt-4">
                Laden Sie jeweils in der entsprechenden Sprache das Informationsblatt herunter.
              </p>
            </div>
          </AnimatedSection>

          {/* Download cards */}
          <AnimatedSection delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              {downloadItems.map((item) => (
                <div
                  key={item.lang}
                  className="bg-card border border-border rounded-2xl p-8 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">{item.lang}</h3>
                    <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-body text-sm font-medium text-primary hover:underline mt-6 transition-colors"
                  >
                    <Download size={16} />
                    Download
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
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
                Versicherungspartner
              </h2>
              <div className="brand-rule mt-4 mx-auto" />
              <p className="font-body text-base text-muted-foreground mt-8 leading-relaxed">
                Die SSM Partner AG und die SSM Life AG sind Unternehmen der VISANA-Gruppe und als solche gebundene Versicherungsvermittlerin gemäss VAG. In den untenstehenden Versicherungszweigen erfolgt die Versicherungsvermittlung ausschliesslich im Auftrag einer der folgenden Gesellschaften:
              </p>
            </div>
          </AnimatedSection>

          {/* Rubrik A */}
          <AnimatedSection delay={0.1}>
            <div className="bg-card border border-border rounded-2xl p-8 lg:p-10 mb-8">
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                Rubrik Lebensversicherung (A)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-3 mb-2 border-b border-border">
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Versicherungszweig
                </p>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Versicherungspartner / Risikoträger
                </p>
              </div>
              {lifeInsurance.map((p, i) => (
                <PartnerRow key={i} partner={p} />
              ))}
            </div>
          </AnimatedSection>

          {/* Rubrik B */}
          <AnimatedSection delay={0.15}>
            <div className="bg-card border border-border rounded-2xl p-8 lg:p-10">
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                Rubrik Schadenversicherung (B)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-3 mb-2 border-b border-border">
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Versicherungszweig
                </p>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Versicherungspartner / Risikoträger
                </p>
              </div>
              {damageInsurance.map((p, i) => (
                <PartnerRow key={i} partner={p} />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Vag45;
