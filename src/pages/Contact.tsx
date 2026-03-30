import { useState, FormEvent } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";

const Contact = () => {
  const { t } = useLanguage();
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const newErrors: Record<string, boolean> = {};

    if (!data.get("name")) newErrors.name = true;
    if (!data.get("email")) newErrors.email = true;
    if (!data.get("subject")) newErrors.subject = true;
    if (!data.get("message")) newErrors.message = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSending(true);
    try {
      const { error } = await supabase.from("inquiries").insert({
        source: "contact",
        name: data.get("name") as string,
        email: data.get("email") as string,
        phone: (data.get("phone") as string) || null,
        subject: data.get("subject") as string,
        message: data.get("message") as string,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Anfrage wurde gesendet!");
    } catch {
      toast.error("Ein Fehler ist aufgetreten.");
    } finally {
      setSending(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full bg-card border ${errors[field] ? "border-destructive" : "border-border"} px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent rounded-lg transition-all`;

  return (
    <main>
      <PageHero pageKey="contact" fallbackImage="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80" />
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Form */}
          <AnimatedSection>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground">{t("contact.title")}</h1>
            <div className="brand-rule mt-4" />

            {submitted ? (
              <div className="mt-12 p-6 bg-card rounded-2xl border">
                <p className="font-body text-base text-foreground">
                  ✓ {t("contact.form.submit")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-12 space-y-5" noValidate>
                <div>
                  <input name="name" type="text" placeholder={t("contact.form.name")} className={inputClass("name")} />
                  {errors.name && <span className="font-body text-xs text-destructive mt-1 block">{t("contact.form.required")}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <input name="email" type="email" placeholder={t("contact.form.email")} className={inputClass("email")} />
                    {errors.email && <span className="font-body text-xs text-destructive mt-1 block">{t("contact.form.required")}</span>}
                  </div>
                  <input name="phone" type="tel" placeholder={t("contact.form.phone")} className={inputClass("phone")} />
                </div>

                <div>
                  <select name="subject" defaultValue="" className={`${inputClass("subject")} appearance-none`}>
                    <option value="" disabled>{t("contact.form.subject")}</option>
                    <option value="private">{t("contact.form.subject.private")}</option>
                    <option value="corporate">{t("contact.form.subject.corporate")}</option>
                    <option value="career">{t("contact.form.subject.career")}</option>
                    <option value="other">{t("contact.form.subject.other")}</option>
                  </select>
                  {errors.subject && <span className="font-body text-xs text-destructive mt-1 block">{t("contact.form.required")}</span>}
                </div>

                <div>
                  <textarea name="message" rows={5} placeholder={t("contact.form.message")} className={`${inputClass("message")} resize-none`} />
                  {errors.message && <span className="font-body text-xs text-destructive mt-1 block">{t("contact.form.required")}</span>}
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full gradient-primary text-primary-foreground font-body text-sm font-medium py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {sending ? "Wird gesendet..." : t("contact.form.submit")}
                </button>
              </form>
            )}
          </AnimatedSection>

          {/* Info */}
          <AnimatedSection delay={0.15} className="lg:pt-16">
            <div className="bg-card border rounded-2xl p-8">
              <div className="font-body text-sm text-foreground space-y-1">
                <p className="font-semibold">SSM Partner AG</p>
                <p className="text-muted-foreground">Stationsstrasse 92</p>
                <p className="text-muted-foreground">CH-6023 Rothenburg</p>
              </div>

              <div className="h-px bg-border my-6" />

              <div className="font-body text-sm text-muted-foreground space-y-1">
                <p>041 220 20 50</p>
                <p>info@ssmpartner.ch</p>
              </div>

              <div className="flex items-center gap-4 mt-8">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Map */}
      <section className="w-full h-[400px] lg:h-[500px]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2718.5!2d8.2683!3d47.0933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478ffd43d4e5b8ed%3A0x0!2sStationsstrasse%2092%2C%206023%20Rothenburg!5e0!3m2!1sde!2sch!4v1700000000000"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="SSM Partner AG Standort"
        />
      </section>
    </main>
  );
};

export default Contact;
