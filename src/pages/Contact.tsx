import { useState, FormEvent } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import AnimatedSection from "@/components/AnimatedSection";

const Contact = () => {
  const { t } = useLanguage();
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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
    setSubmitted(true);
  };

  const inputClass = (field: string) =>
    `w-full bg-transparent border ${errors[field] ? "border-destructive" : "border-border"} px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors`;

  return (
    <main className="pt-20 lg:pt-24">
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Form */}
          <AnimatedSection>
            <h1 className="font-heading text-4xl lg:text-5xl text-foreground">{t("contact.title")}</h1>
            <div className="gold-rule mt-4" />

            {submitted ? (
              <div className="mt-12">
                <p className="font-body text-base text-foreground">
                  {t("contact.title")} ✓
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
                  className="w-full bg-foreground text-background font-body text-sm py-4 hover:bg-foreground/90 transition-colors"
                >
                  {t("contact.form.submit")}
                </button>
              </form>
            )}
          </AnimatedSection>

          {/* Info */}
          <AnimatedSection delay={0.15} className="lg:pt-16">
            <div className="font-body text-sm text-foreground space-y-1">
              <p className="font-medium">SSM Partner AG</p>
              <p className="text-muted-foreground">Riedmattstrasse 12</p>
              <p className="text-muted-foreground">6032 Ebikon, Schweiz</p>
            </div>

            <div className="h-px bg-border my-6" />

            <div className="font-body text-sm text-muted-foreground space-y-1">
              <p>+41 41 000 00 00</p>
              <p>info@ssmpartner.ch</p>
            </div>

            <div className="flex items-center gap-4 mt-8">
              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Contact;
