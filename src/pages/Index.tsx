import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import AnimatedSection from "@/components/AnimatedSection";
import { Phone, Send, ChevronLeft, ChevronRight } from "lucide-react";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
    title: "Ihr Partner für Finanzen",
    subtitle: "Massgeschneiderte Lösungen für Versicherung, Vorsorge und Finanzierung.",
  },
  {
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1920&q=80",
    title: "Transparenz & Vertrauen",
    subtitle: "Wir bringen Klarheit in den Finanz- und Versicherungsmarkt.",
  },
  {
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80",
    title: "Technologie trifft Beratung",
    subtitle: "Innovation und persönliche Betreuung — das Beste aus beiden Welten.",
  },
];

const Index = () => {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const newErrors: Record<string, boolean> = {};
    if (!data.get("name")) newErrors.name = true;
    if (!data.get("email")) newErrors.email = true;
    if (!data.get("message")) newErrors.message = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  const inputClass = (field: string) =>
    `w-full bg-white border ${errors[field] ? "border-destructive" : "border-border"} px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-lg transition-all`;

  return (
    <main>
      {/* Hero Slider — 100vh */}
      <section className="relative w-full h-screen overflow-hidden">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
            {/* Dark overlay */}
            <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.35)" }} />
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <h1
                className="font-heading text-white leading-tight max-w-3xl"
                style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 500 }}
              >
                {slide.title}
              </h1>
              <p
                className="mt-4 max-w-xl"
                style={{ fontSize: "clamp(14px, 1.5vw, 18px)", color: "rgba(255,255,255,0.8)" }}
              >
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Arrow navigation */}
        <button
          onClick={prev}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dot navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className="w-2.5 h-2.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === current ? "#ffffff" : "rgba(255,255,255,0.4)",
                transform: i === current ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </section>

      {/* Wer wir sind */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: "#f5f7f5" }}>
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center">
          <AnimatedSection>
            <h2 className="font-heading text-3xl lg:text-4xl font-semibold text-foreground">
              {t("home.who.title")}
            </h2>
            <p className="font-body text-base lg:text-lg text-muted-foreground mt-8 leading-relaxed">
              {t("home.who.text")}
            </p>
            <Link
              to="/ueber-uns"
              className="inline-block mt-10 font-body text-sm font-medium tracking-wider rounded-full px-8 py-3 transition-all duration-300 uppercase hover:opacity-90"
              style={{ backgroundColor: "#243e3a", color: "#ffffff" }}
            >
              {t("home.who.cta")}
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Phone CTA */}
      <section className="py-16" style={{ backgroundColor: "#243e3a" }}>
        <div className="container mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl">
          <div>
            <h3 className="font-heading text-lg font-semibold text-white">
              {t("home.phone.title")}
            </h3>
            <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              {t("home.phone.sub")}
            </p>
          </div>
          <a
            href="tel:+41412202050"
            className="font-heading text-2xl lg:text-3xl font-bold text-white hover:opacity-80 transition-opacity whitespace-nowrap flex items-center gap-3"
          >
            <Phone size={24} />
            +41 41 220 20 50
          </a>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: "#f5f7f5" }}>
        <div className="container mx-auto px-6 lg:px-8 max-w-lg text-center">
          <AnimatedSection>
            <h3 className="font-heading text-2xl lg:text-3xl text-foreground">
              <span className="font-bold">{t("home.hq.title")}</span>{" "}
              <span className="font-normal text-muted-foreground">{t("home.hq.sub")}</span>
            </h3>

            {submitted ? (
              <div className="mt-10 p-6 bg-white rounded-2xl border inline-block">
                <p className="font-body text-base text-foreground">✓ Nachricht gesendet</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-10 space-y-4 text-left" noValidate>
                <div>
                  <input name="name" type="text" placeholder={t("contact.form.name")} className={inputClass("name")} />
                  {errors.name && <span className="font-body text-xs text-destructive mt-1 block">{t("contact.form.required")}</span>}
                </div>
                <div>
                  <input name="email" type="email" placeholder={t("contact.form.email")} className={inputClass("email")} />
                  {errors.email && <span className="font-body text-xs text-destructive mt-1 block">{t("contact.form.required")}</span>}
                </div>
                <div>
                  <textarea name="message" rows={4} placeholder={t("contact.form.message")} className={`${inputClass("message")} resize-none`} />
                  {errors.message && <span className="font-body text-xs text-destructive mt-1 block">{t("contact.form.required")}</span>}
                </div>
                <button
                  type="submit"
                  className="w-full font-body text-sm font-semibold py-3.5 rounded-full hover:opacity-90 transition-opacity uppercase tracking-wider flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#243e3a", color: "#ffffff" }}
                >
                  <Send size={16} />
                  {t("contact.form.submit")}
                </button>
              </form>
            )}
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Index;
