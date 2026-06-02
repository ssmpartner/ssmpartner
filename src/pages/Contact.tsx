import { useState, useEffect, useRef, FormEvent } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Clock } from "lucide-react";

const MAPBOX_TOKEN = "pk.eyJ1Ijoic3NtcGFydG5lciIsImEiOiJjbW40bDI4engwMWg3MnFzbnp4emJua2hhIn0.5u0JuVsRDe6DSNBOEpSh1A";
import { toast } from "sonner";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useSocialLinks } from "@/hooks/useSocialLinks";

const ContactMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [8.2683, 47.0933],
      zoom: 14,
      attributionControl: false,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    const el = document.createElement("div");
    el.innerHTML = `<div style="width:40px;height:40px;background:#243e3a;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(36,62,58,0.35);cursor:pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`;

    new mapboxgl.Marker({ element: el })
      .setLngLat([8.2683, 47.0933])
      .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`<div style="padding:4px 0"><strong style="font-size:14px;color:#243e3a">SSM Partner AG</strong><p style="font-size:12px;margin:2px 0 0;color:#666">Stationsstrasse 92, 6023 Rothenburg</p></div>`))
      .addTo(mapRef.current);

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  return (
    <section className="w-full h-[400px] lg:h-[500px]">
      <div ref={mapContainer} className="w-full h-full" />
    </section>
  );
};

const Contact = () => {
  const { t } = useLanguage();
  const { cmsTitle, cmsBody } = useCmsContent("contact");
  const social = useSocialLinks();
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
      toast.success(t("contact.toast.success"));
    } catch {
      toast.error(t("contact.toast.error"));
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
            <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-foreground">{cmsTitle("contact_title", t("contact.title"))}</h1>
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
                  {sending ? t("contact.form.sending") : t("contact.form.submit")}
                </button>
              </form>
            )}
          </AnimatedSection>

          {/* Info */}
          <AnimatedSection delay={0.15} className="lg:pt-16 space-y-6">
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
                {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                )}
                {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                )}
                {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                </a>
                )}
                {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                )}
              </div>
            </div>

            {/* Öffnungszeiten */}
            <div className="bg-card border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">{cmsTitle("contact_hours", t("contact.hours.title"))}</h3>
              </div>
              <div className="font-body text-sm text-muted-foreground space-y-2">
                <div className="flex justify-between">
                  <span>{t("contact.hours.weekdays")}</span>
                  <span className="font-medium text-foreground">08:00 – 12:00 / 13:30 – 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("contact.hours.weekend")}</span>
                  <span className="font-medium text-foreground">{t("contact.hours.closed")}</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Mapbox Map */}
      <ContactMap />
    </main>
  );
};

export default Contact;
