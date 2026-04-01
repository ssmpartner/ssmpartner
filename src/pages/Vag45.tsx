import ssmPattern from "@/assets/ssm-structure-pattern.png";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";

const Vag45 = () => {
  return (
    <main>
      <PageHero pageKey="vag45" fallbackImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80" />

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
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground">
              VAG45
            </h1>
            <div className="brand-rule mt-4" />
            <p className="font-body text-base text-muted-foreground mt-8 leading-relaxed">
              Inhalt folgt in Kürze.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Vag45;
