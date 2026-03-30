import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import AnimatedSection from "@/components/AnimatedSection";
import { Phone, Send } from "lucide-react";
import heroOffice from "@/assets/hero-office.jpg";
import heroOffice2 from "@/assets/hero-office-2.jpg";
import heroOffice3 from "@/assets/hero-office-3.jpg";

const slides = [heroOffice, heroOffice2, heroOffice3];

const Index = () => {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
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
    `w-full bg-card border ${errors[field] ? "border-destructive" : "border-border"} px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-lg transition-all`;

  return (
    <main>
      {/* Hero Slider - Full width */}
      <section className="relative w-full h-[60vh] lg:h-[75vh] overflow-hidden">
        {slides.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`SSM Partner AG Office ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
            width={1920}
            height={960}
          />
        ))}
        {/* Slider dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`w-3 h-3 rounded-full transition-all ${
                i === current ? "bg-primary-foreground scale-110" : "bg-primary-foreground/50"
              }`}
            />
          ))}
        </div>

        {/* Phone CTA Bar - overlapping bottom of hero */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="bg-primary rounded-t-2xl px-8 py-6 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-semibold text-primary-foreground">
                {t("home.phone.title")}
              </h3>
              <p className="font-body text-sm text-primary-foreground/80">
                {t("home.phone.sub")}
              </p>
            </div>
            <a
              href="tel:+41412202050"
              className="font-heading text-2xl lg:text-3xl font-bold text-primary-foreground hover:text-accent transition-colors whitespace-nowrap"
            >
              +41 41 220 20 50
            </a>
          </div>
        </div>
      </section>

      {/* Wer wir sind */}
      <section className="py-20 lg:py-28">
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
              className="inline-block mt-10 font-body text-sm font-medium tracking-wider border border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase"
            >
              {t("home.who.cta")}
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Headquarter / Contact */}
      <section className="py-20 lg:py-28 bg-card border-t">
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center">
          <AnimatedSection>
            <h3 className="font-heading text-2xl lg:text-3xl text-foreground">
              <span className="font-bold">{t("home.hq.title")}</span>{" "}
              <span className="font-normal text-muted-foreground">{t("home.hq.sub")}</span>
            </h3>

            {submitted ? (
              <div className="mt-10 p-6 bg-background rounded-2xl border inline-block">
                <p className="font-body text-base text-foreground">✓ Nachricht gesendet</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-10 space-y-4 max-w-md mx-auto text-left" noValidate>
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
                  className="w-full gradient-primary text-primary-foreground font-body text-sm font-semibold py-3.5 rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider flex items-center justify-center gap-2"
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
